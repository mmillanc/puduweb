export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+?56)?9\d{8}$/.test(cleaned);
}

export function isValidWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^\+?\d{8,15}$/.test(cleaned);
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidInstagram(handle: string): boolean {
  const cleaned = handle.replace("@", "").trim();
  return /^[a-zA-Z0-9._]{1,30}$/.test(cleaned);
}

export function passwordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: "Mínimo 8 caracteres", passed: password.length >= 8 },
    { label: "Una mayúscula", passed: /[A-Z]/.test(password) },
    { label: "Una minúscula", passed: /[a-z]/.test(password) },
    { label: "Un número", passed: /\d/.test(password) },
    { label: "Un carácter especial", passed: /[^a-zA-Z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.passed).length;

  const labels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte", "Muy fuerte"];
  const colors = [
    "bg-red-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    checks,
  };
}

export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    "mailinator.com",
    "tempmail.com",
    "temp-mail.org",
    "guerrillamail.com",
    "10minutemail.com",
    "throwaway.email",
    "fakeinbox.com",
    "sharklasers.com",
    "yopmail.com",
    "getnada.com",
    "tempmailo.com",
    "emailondeck.com",
    "trashmail.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

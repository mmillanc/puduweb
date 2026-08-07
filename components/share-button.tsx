"use client";

import { useState } from "react";
import { Share2, Copy, Check, Users, Hash, MessageCircle } from "lucide-react";

interface ShareButtonProps {
  profileName: string;
}

export function ShareButton({ profileName }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Mira el perfil de ${profileName} en PuduWeb`;

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        title="Compartir"
      >
        <Share2 size={16} />
        Compartir
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border bg-card p-2 shadow-lg">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setShowMenu(false)}
            >
              <MessageCircle size={16} className="text-green-500" />
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setShowMenu(false)}
            >
              <Users size={16} className="text-blue-600" />
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setShowMenu(false)}
            >
              <Hash size={16} />
              Twitter / X
            </a>
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copiar enlace
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

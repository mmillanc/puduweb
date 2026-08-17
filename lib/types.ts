export type ProfileType = "profesional" | "pyme" | "vendedor";
export type RoleType = "admin" | "negocio" | "usuario";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  seo_title: string | null;
  seo_description: string | null;
  intro_text: string | null;
}

export interface Profile {
  id: string;
  name: string;
  slug: string;
  type: ProfileType;
  category_id: string | null;
  tagline: string | null;
  description: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  services: string | null;
  hours: string | null;
  gallery_urls: string[] | null;
  is_published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface ProfileInput {
  name: string;
  slug: string;
  type: ProfileType;
  category_id: string | null;
  tagline: string | null;
  description: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  linkedin: string | null;
  twitter: string | null;
  tiktok: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  services: string | null;
  hours: string | null;
  gallery_urls: string[] | null;
  is_published: boolean;
  featured: boolean;
}

export interface Review {
  id: string;
  profile_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  profile_id: string;
  user_id: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleType;
  created_at: string;
}

export interface ProfileOwner {
  id: string;
  profile_id: string;
  user_id: string;
  created_at: string;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  viewer_id: string | null;
  viewed_at: string;
}

export interface ContactMessage {
  id: string;
  profile_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

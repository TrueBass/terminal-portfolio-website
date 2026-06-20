// Single source of truth for scalar personal info, read from .env (VITE_* vars).
// Edit values in `.env`, never here. Empty values are handled gracefully by the UI.

const env = import.meta.env;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export const config = {
  name: str(env.VITE_NAME) || "Your Name",
  logo: str(env.VITE_LOGO) || str(env.VITE_NAME) || "~/portfolio",
  role: str(env.VITE_ROLE),
  bio: str(env.VITE_BIO),
  location: str(env.VITE_LOCATION),
  photo: str(env.VITE_PHOTO), // "" => card shows initials fallback
  email: str(env.VITE_EMAIL),
  socials: {
    github: str(env.VITE_GITHUB),
    linkedin: str(env.VITE_LINKEDIN),
    instagram: str(env.VITE_INSTAGRAM),
  },
} as const;

/** Initials derived from the name, for the photo fallback. */
export const initials = config.name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0]?.toUpperCase() ?? "")
  .join("");

export type Config = typeof config;

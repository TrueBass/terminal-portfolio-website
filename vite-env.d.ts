/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAME: string;
  readonly VITE_LOGO: string;
  readonly VITE_ROLE: string;
  readonly VITE_BIO: string;
  readonly VITE_LOCATION: string;
  readonly VITE_PHOTO: string;
  readonly VITE_EMAIL: string;
  readonly VITE_GITHUB: string;
  readonly VITE_LINKEDIN: string;
  readonly VITE_INSTAGRAM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { Github, Linkedin, Instagram, Mail } from "lucide-react";
import { config } from "../config";

const links = [
  config.socials.github && { label: "GitHub", href: config.socials.github, Icon: Github },
  config.socials.linkedin && { label: "LinkedIn", href: config.socials.linkedin, Icon: Linkedin },
  config.socials.instagram && { label: "Instagram", href: config.socials.instagram, Icon: Instagram },
  config.email && { label: "Email", href: `mailto:${config.email}`, Icon: Mail },
].filter(Boolean) as { label: string; href: string; Icon: typeof Github }[];

export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-5 py-3.5 sm:px-8">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {config.name}
        </span>
        <span
          className="accent-flow rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-bg"
          title="Work in progress — more coming soon"
        >
          MVP
        </span>
      </div>
      <nav className="flex items-center gap-1">
        {links.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="rounded-md p-2 text-muted transition-colors hover:bg-elevated hover:text-accent focus:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-2"
          >
            <Icon size={18} strokeWidth={1.75} />
          </a>
        ))}
      </nav>
    </footer>
  );
}

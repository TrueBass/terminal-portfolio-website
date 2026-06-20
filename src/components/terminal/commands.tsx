import type { ReactNode } from "react";
import { config } from "../../config";
import { projects, education, courses, facts } from "../../data/content";
import { themes, applyTheme, currentThemeName, defaultThemeName } from "../../theme";

export type Tone = "default" | "accent" | "muted" | "error";

export type CommandResult =
  | { type: "text"; text: string; tone?: Tone; animate?: boolean }
  | { type: "node"; node: ReactNode }
  | { type: "clear" }
  | { type: "none" };

export interface Command {
  name: string;
  description: string;
  run: (args: string[]) => CommandResult;
}

const text = (
  body: string,
  opts: { tone?: Tone; animate?: boolean } = {},
): CommandResult => ({ type: "text", text: body, animate: true, ...opts });

// Ordered command list (also drives `help` and Tab autocomplete).
export const commandList: Command[] = [
  {
    name: "help",
    description: "list available commands",
    run: () => ({
      type: "node",
      node: (
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {commandList.map((c) => (
            <div key={c.name} className="contents">
              <span className="text-accent">{c.name}</span>
              <span className="text-muted">{c.description}</span>
            </div>
          ))}
        </div>
      ),
    }),
  },
  {
    name: "about",
    description: "who am I",
    run: () => {
      const lines = [
        config.bio || "Add your bio in .env (VITE_BIO).",
        "",
        config.role ? `role     ${config.role}` : "",
        config.location ? `location ${config.location}` : "",
      ].filter((l) => l !== "" || true);
      return text(lines.join("\n").trim());
    },
  },
  {
    name: "whoami",
    description: "print my name",
    run: () => text(config.name),
  },
  {
    name: "projects",
    description: "things I've built",
    run: () => {
      if (!projects.length) return text("No projects listed yet.", { tone: "muted" });
      const body = projects
        .map((p, i) => {
          const head = `${i + 1}. ${p.name}`;
          const desc = `   ${p.desc}`;
          const tech = p.tech.length ? `   ${p.tech.join(" · ")}` : "";
          const link = p.link ? `   ${p.link}` : "";
          return [head, desc, tech, link].filter(Boolean).join("\n");
        })
        .join("\n\n");
      return text(body);
    },
  },
  {
    name: "education",
    description: "where I studied",
    run: () => {
      if (!education.length) return text("No education listed yet.", { tone: "muted" });
      const body = education
        .map((e) => {
          const head = `${e.qualification} — ${e.school}`;
          const period = `   ${e.period}`;
          const detail = e.detail ? `   ${e.detail}` : "";
          return [head, period, detail].filter(Boolean).join("\n");
        })
        .join("\n\n");
      return text(body);
    },
  },
  {
    name: "courses",
    description: "courses & certifications",
    run: () => {
      if (!courses.length) return text("No courses listed yet.", { tone: "muted" });
      const body = courses
        .map((c) => `• ${c.name} — ${c.provider}${c.year ? ` (${c.year})` : ""}`)
        .join("\n");
      return text(body);
    },
  },
  {
    name: "facts",
    description: "a random fun fact",
    run: () => {
      if (!facts.length) return text("No facts yet.", { tone: "muted" });
      const fact = facts[Math.floor(Math.random() * facts.length)];
      return text(fact, { tone: "accent" });
    },
  },
  {
    name: "fun",
    description: "all the fun facts",
    run: () => {
      if (!facts.length) return text("No facts yet.", { tone: "muted" });
      return text(facts.map((f) => `• ${f}`).join("\n"));
    },
  },
  {
    name: "contact",
    description: "how to reach me",
    run: () => {
      const links: { label: string; href: string }[] = [
        config.email && { label: "email", href: `mailto:${config.email}` },
        config.socials.github && { label: "github", href: config.socials.github },
        config.socials.linkedin && { label: "linkedin", href: config.socials.linkedin },
        config.socials.instagram && { label: "instagram", href: config.socials.instagram },
      ].filter(Boolean) as { label: string; href: string }[];

      if (!links.length)
        return text("No contact details set yet (add them in .env).", { tone: "muted" });

      return {
        type: "node",
        node: (
          <div className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1">
            {links.map((l) => (
              <div key={l.label} className="contents">
                <span className="text-muted">{l.label}</span>
                <a
                  href={l.href}
                  target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="text-accent underline-offset-4 hover:underline focus:underline focus:outline-none"
                >
                  {l.href.replace(/^mailto:/, "")}
                </a>
              </div>
            ))}
          </div>
        ),
      };
    },
  },
  {
    name: "theme",
    description: "switch accent colors",
    run: (args) => {
      const sub = (args[0] ?? "").toLowerCase();

      if (!sub) {
        return text(
          "theme: missing operand\nTry 'theme --help' for more information.",
          { tone: "error", animate: false },
        );
      }

      if (sub === "--help" || sub === "-h") {
        const current = currentThemeName();
        const lines = [
          "Usage: theme <name>",
          "Switch the site's accent colors.",
          "",
          "Themes:",
          ...Object.entries(themes).map(
            ([key, t]) => `  ${key.padEnd(8)}${t.label}${key === current ? "  ← active" : ""}`,
          ),
          "",
          "  theme reset     restore the default theme",
          "  theme --help    display this help and exit",
        ];
        return text(lines.join("\n"), { animate: false });
      }

      const name = sub === "reset" || sub === "default" ? defaultThemeName : sub;
      if (!applyTheme(name)) {
        return text(
          `theme: unknown theme '${sub}'\nTry 'theme --help' for more information.`,
          { tone: "error", animate: false },
        );
      }
      return text(`theme set → ${themes[name].label}`, { tone: "accent" });
    },
  },
  {
    name: "clear",
    description: "clear the screen",
    run: () => ({ type: "clear" }),
  },
];

export const commands: Record<string, Command> = Object.fromEntries(
  commandList.map((c) => [c.name, c]),
);

// A couple of convenience aliases.
const aliases: Record<string, string> = { ls: "help", "?": "help", cls: "clear" };

export function runCommand(input: string): { echo: string; result: CommandResult } {
  const trimmed = input.trim();
  if (!trimmed) return { echo: input, result: { type: "none" } };

  const [rawName, ...args] = trimmed.split(/\s+/);
  const name = aliases[rawName] ?? rawName;
  const command = commands[name];

  if (!command) {
    return {
      echo: input,
      result: text(`command not found: ${rawName} — type 'help' to see options.`, {
        tone: "error",
        animate: false,
      }),
    };
  }
  return { echo: input, result: command.run(args) };
}

export const commandNames = commandList.map((c) => c.name);

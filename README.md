# terminal://portfolio

A personal "about me" site styled as a minimalistic, futuristic terminal.
Split layout: an interactive **3D lanyard badge** on real rope physics on one
side, and a **typed-command terminal** on the other.

Built with React + TypeScript + Vite, Tailwind CSS v4, and
react-three-fiber / drei / rapier for the badge.

## Features

- **Interactive terminal** — typed commands with letter-by-letter output,
  command history (↑/↓), Tab autocomplete, and real cursor navigation
  (arrows, Ctrl+←/→ word jump, Home/End).
- **3D lanyard badge** — a modeled card on a physically-simulated strap you can
  grab, swing, and spin. Your photo is composited onto the badge face, with a
  graceful initials fallback when no photo is set.
- **Runtime theming** — the `theme` command swaps the accent palette live
  (and the badge strap follows along); the choice persists across reloads.
- **Config-driven** — all personal info comes from `.env`; list content lives in
  `src/data/content.ts`. Empty fields degrade gracefully.
- **Responsive & accessible** — terminal-first on mobile; animations respect
  `prefers-reduced-motion`.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your details
npm run dev
```

> Vite reads `.env` at startup — restart the dev server after editing it.

### Add your photo

Drop an image into `public/assets/` and point `VITE_PHOTO` at it
(e.g. `VITE_PHOTO="/assets/me.jpg"`). Photos in `public/assets/` are
git-ignored, so your image stays out of the repo — the badge shows an initials
fallback wherever the file isn't present.

## Terminal commands

| command | description |
| --- | --- |
| `help` | list available commands |
| `about` | who I am |
| `whoami` | print my name |
| `projects` | things I've built |
| `education` | where I studied |
| `courses` | courses & certifications |
| `facts` / `fun` | fun facts |
| `contact` | how to reach me |
| `theme <name>` | switch accent colors (`theme --help` for options) |
| `clear` | clear the screen |

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run preview    # serve the production build locally
npm run typecheck  # type-check only
```

## Tech stack

- [Vite](https://vite.dev) + React 18 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [react-three-fiber](https://r3f.docs.pmnd.rs) · [drei](https://github.com/pmndrs/drei) · [rapier](https://github.com/pmndrs/react-three-rapier) · [meshline](https://github.com/pmndrs/meshline)

## Credits

The 3D badge is adapted from the
[reactbits.dev Lanyard](https://reactbits.dev/components/lanyard) component.

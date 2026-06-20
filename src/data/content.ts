// ─────────────────────────────────────────────────────────────────────────
// List-type content shown by terminal commands.
// This is the ONE place to edit projects / education / courses / facts.
// (Scalar info like name/bio/socials lives in `.env` instead — see src/config.ts)
// Everything below is placeholder data; replace it with your own.
// ─────────────────────────────────────────────────────────────────────────

export interface Project {
  name: string;
  desc: string;
  tech: string[];
  link?: string;
}

export interface EducationEntry {
  school: string;
  qualification: string;
  period: string;
  detail?: string;
}

export interface Course {
  name: string;
  provider: string;
  year?: string;
}

export const projects: Project[] = [
  {
    name: "Music Sharing Platform",
    desc: "Diploma project — a platform for beginner artists to share songs and beats; listeners upload tracks, build playlists, search, and like. Includes a statistics page (top 5 songs, most popular song & playlist, biggest playlist).",
    tech: ["Spring Boot", "React", "Java"],
    link: "",
  },
  {
    name: "Shared Shopping List",
    desc: "Cross-platform mobile app (iOS & Android) for families and dorm neighbours: add friends, create groups, and share shopping lists. Items sync in real time over WebSockets — everyone sees what's checked off and what's left to buy. Includes JWT auth with persistent 'remember me'. The idea: kill chat-message clutter — make a group instead of texting 100 people about groceries.",
    tech: ["React Native", "Spring Boot", "PostgreSQL", "WebSockets", "JWT"],
    link: "",
  },
  {
    name: "ESP32 Bus Schedule Display",
    desc: "Hobby IoT — an ESP32 device that shows the closest upcoming buses for nearby stops, pulling live schedule data via API calls.",
    tech: ["ESP32", "C++", "REST API"],
    link: "",
  },
  {
    name: "ESP Mini Smart Home",
    desc: "Hobby IoT — an ESP8266 web server that hosts a control page and drives a servo to toggle my room light, and can push a radio-stream URL to a paired ESP32 running an internet radio.",
    tech: ["ESP8266", "ESP32", "C++", "Servo", "Web Server"],
    link: "",
  },
  {
    name: "Terminal Portfolio",
    desc: "This very site — a 3D physics rope card + an interactive terminal.",
    tech: ["React", "TypeScript", "three.js", "Tailwind"],
    link: "",
  },
];

export const education: EducationEntry[] = [
  {
    school: "University of Łódź",
    qualification: "M.Sc. — Physics & Applied Informatics",
    period: "2026 — present", // TODO: adjust start year if needed
    detail: "Faculty of Physics and Applied Informatics (just starting)",
  },
  {
    school: "University of Łódź",
    qualification: "B.Sc. — Computer Science",
    period: "2023 — 2026", // TODO: adjust to your real years
    detail: "Faculty of Mathematics and Computer Science",
  },
];

export const courses: Course[] = [
  { name: "Some Great Course", provider: "Provider", year: "2024" },
  { name: "Another Course", provider: "Provider", year: "2023" },
];

/** Random fun/interesting facts — `facts` picks one, `fun` lists them. */
export const facts: string[] = [
  "Off the keyboard you'll find me at the gym, on a bike, or playing team sports.",
  "Strategy and strings: I play chess and the guitar.",
  "I love to travel — always up for somewhere new.",
  "For fun I tinker with microcontrollers — ESP32/ESP8266 gadgets for my room.",
  "Bachelor's in Maths & CS; now starting a master's in Physics & Applied Informatics.",
];

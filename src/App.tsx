import { lazy, Suspense } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Terminal } from "./components/terminal/Terminal";

// The 3D rope pulls in three.js + rapier — load it as a separate chunk so it
// never blocks the terminal (the priority experience, esp. on mobile).
const RopeCard = lazy(() =>
  import("./components/rope/RopeCard").then((m) => ({ default: m.RopeCard })),
);

export default function App() {
  return (
    <div className="flex h-full flex-col bg-bg">
      <Header />

      <main className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 p-4 sm:p-6 lg:grid-cols-2 lg:grid-rows-1 lg:gap-6 lg:p-8">
        {/* Card — second on mobile (terminal-first), left on desktop */}
        <section className="order-2 min-h-[220px] lg:order-1 lg:min-h-0">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[220px] items-center justify-center font-mono text-xs text-muted/50">
                loading…
              </div>
            }
          >
            <RopeCard />
          </Suspense>
        </section>

        {/* Terminal — first on mobile, right on desktop */}
        <section className="order-1 min-h-[60vh] lg:order-2 lg:min-h-0">
          <Terminal />
        </section>
      </main>

      <Footer />
    </div>
  );
}

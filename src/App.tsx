import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Terminal } from "./components/terminal/Terminal";

// The 3D rope pulls in three.js + rapier — load it as a separate chunk so it
// never blocks the terminal (the priority experience, esp. on mobile).
const RopeCard = lazy(() =>
  import("./components/rope/RopeCard").then((m) => ({ default: m.RopeCard })),
);

// Desktop layout starts at Tailwind's `lg` breakpoint (1024px). Below that we
// render a phone layout: header + full-screen terminal, no badge, no footer.
function useIsDesktop() {
  const query = "(min-width: 1024px)";
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export default function App() {
  const isDesktop = useIsDesktop();

  return (
    <div className="flex h-full flex-col bg-bg">
      <Header />

      <main className="grid min-h-0 flex-1 grid-rows-1 gap-4 p-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8">
        {/* Card — desktop only; never mounted on phones (skips loading three.js) */}
        {isDesktop && (
          <section className="order-1 min-h-0">
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
        )}

        {/* Terminal — fills the screen on phones, right column on desktop */}
        <section className="order-2 min-h-0">
          <Terminal />
        </section>
      </main>

      {/* Footer — desktop only for now; phones get header + terminal only */}
      {isDesktop && <Footer />}
    </div>
  );
}

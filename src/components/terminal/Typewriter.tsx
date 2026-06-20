import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface TypewriterProps {
  text: string;
  /** ms per character */
  speed?: number;
  className?: string;
  onUpdate?: () => void;
  onDone?: () => void;
  /** Increment this number from a parent to instantly finish typing. */
  skipSignal?: number;
}

/** Prints `text` character-by-character, like an AI chat response. */
export function Typewriter({
  text,
  speed = 14,
  className,
  onUpdate,
  onDone,
  skipSignal,
}: TypewriterProps) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setCount(text.length);
    onDone?.();
  };

  // Typing loop.
  useEffect(() => {
    doneRef.current = false;
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    setCount(0);
    // Speed up very long blocks so they don't drag.
    const step = text.length > 400 ? 4 : speed;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      onUpdate?.();
      if (i >= text.length) {
        window.clearInterval(id);
        finish();
      }
    }, step);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  // Skip-to-end when the parent bumps skipSignal (ignore the initial mount value).
  const firstSkip = useRef(true);
  useEffect(() => {
    if (firstSkip.current) {
      firstSkip.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipSignal]);

  const typing = count < text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {typing && (
        <span
          aria-hidden
          className="caret-blink ml-px inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] bg-accent-2/80"
        />
      )}
    </span>
  );
}

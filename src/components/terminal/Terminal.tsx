import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { config } from "../../config";
import { Typewriter } from "./Typewriter";
import {
  runCommand,
  commandNames,
  type CommandResult,
  type Tone,
} from "./commands";

let nextId = 1;

type Entry =
  | { id: number; role: "input"; value: string }
  | { id: number; role: "output"; result: CommandResult };

const toneClass: Record<Tone, string> = {
  default: "text-text",
  accent: "text-accent",
  muted: "text-muted",
  error: "text-accent-2",
};

const promptUser = "guest";

function PromptSymbol() {
  return (
    <span className="shrink-0 select-none whitespace-pre">
      <span className="text-accent-2">{promptUser}</span>
      <span className="text-muted">@</span>
      <span className="text-accent">{config.logo}</span>
      <span className="text-muted"> ❯ </span>
    </span>
  );
}

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(true);
  const [skipSignal, setSkipSignal] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const history = useRef<string[]>([]);
  const historyIdx = useRef<number>(-1); // -1 = current (not browsing)

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Keep pinned to bottom while content grows (typewriter, new lines).
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const ro = new ResizeObserver(scrollToBottom);
    ro.observe(content);
    return () => ro.disconnect();
  }, [scrollToBottom]);

  // Boot greeting.
  useEffect(() => {
    setEntries([
      {
        id: nextId++,
        role: "output",
        result: {
          type: "text",
          text: `Welcome to ${config.name}'s terminal.\nType 'help' to see what I can do.`,
          tone: "default",
          animate: true,
        },
      },
    ]);
  }, []);

  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart ?? el.value.length);
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(() => {
    const value = input;
    const { result } = runCommand(value);

    if (value.trim()) {
      history.current.push(value);
      if (history.current.length > 200) history.current.shift();
    }
    historyIdx.current = -1;

    if (result.type === "clear") {
      setEntries([]);
      setInput("");
      setCaret(0);
      return;
    }

    setEntries((prev) => {
      const next: Entry[] = [...prev, { id: nextId++, role: "input", value }];
      if (result.type !== "none") {
        next.push({ id: nextId++, role: "output", result });
      }
      return next;
    });
    setInput("");
    setCaret(0);
  }, [input]);

  const browseHistory = useCallback(
    (dir: "prev" | "next") => {
      const h = history.current;
      if (!h.length) return;
      if (historyIdx.current === -1) historyIdx.current = h.length;
      let i = historyIdx.current + (dir === "prev" ? -1 : 1);
      i = Math.max(0, Math.min(h.length, i));
      historyIdx.current = i;
      const value = i === h.length ? "" : h[i];
      setInput(value);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.selectionStart = el.selectionEnd = value.length;
          setCaret(value.length);
        }
      });
    },
    [],
  );

  const autocomplete = useCallback(() => {
    const token = input.trimStart();
    if (!token || token.includes(" ")) return;
    const matches = commandNames.filter((n) => n.startsWith(token));
    if (matches.length === 1) {
      const value = matches[0] + " ";
      setInput(value);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) el.selectionStart = el.selectionEnd = value.length;
        setCaret(value.length);
      });
    } else if (matches.length > 1) {
      setEntries((prev) => [
        ...prev,
        { id: nextId++, role: "input", value: input },
        {
          id: nextId++,
          role: "output",
          result: { type: "text", text: matches.join("   "), tone: "muted", animate: false },
        },
      ]);
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      browseHistory("prev");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      browseHistory("next");
    } else if (e.key === "Tab") {
      e.preventDefault();
      autocomplete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
    // Left/Right/Ctrl+Left/Ctrl+Right/Home/End/Backspace use native input behavior.
    requestAnimationFrame(syncCaret);
  };

  const before = input.slice(0, caret);
  const under = input.slice(caret, caret + 1) || " ";
  const after = input.slice(caret + 1);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface/60 backdrop-blur-sm"
      onMouseDown={() => setSkipSignal((s) => s + 1)}
      onClick={focusInput}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-xs text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-2/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 select-none tracking-wide">{promptUser}@{config.logo}: ~</span>
      </div>

      {/* scrollback */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed">
        <div ref={contentRef} className="space-y-1.5">
          {entries.map((entry) =>
            entry.role === "input" ? (
              <div key={entry.id} className="flex flex-wrap">
                <PromptSymbol />
                <span className="whitespace-pre-wrap break-words text-text">{entry.value}</span>
              </div>
            ) : (
              <OutputBlock key={entry.id} result={entry.result} skipSignal={skipSignal} onUpdate={scrollToBottom} />
            ),
          )}

          {/* live prompt */}
          <div className="flex flex-wrap">
            <PromptSymbol />
            <span className="relative inline-block min-w-[1ch] whitespace-pre-wrap break-words">
              <span className="text-text">{before}</span>
              <span
                className={
                  focused
                    ? "caret-block bg-accent-2 text-bg"
                    : "text-text ring-1 ring-inset ring-accent-2/60"
                }
              >
                {under}
              </span>
              <span className="text-text">{after}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  requestAnimationFrame(syncCaret);
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={syncCaret}
                onSelect={syncCaret}
                onClick={syncCaret}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                aria-label="terminal input"
                autoFocus
                className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputBlock({
  result,
  skipSignal,
  onUpdate,
}: {
  result: CommandResult;
  skipSignal: number;
  onUpdate: () => void;
}) {
  if (result.type === "node") {
    return <div className="py-0.5">{result.node}</div>;
  }
  if (result.type === "text") {
    const cls = toneClass[result.tone ?? "default"];
    if (result.animate === false) {
      return <pre className={`whitespace-pre-wrap break-words font-mono ${cls}`}>{result.text}</pre>;
    }
    return (
      <pre className={`whitespace-pre-wrap break-words font-mono ${cls}`}>
        <Typewriter text={result.text} skipSignal={skipSignal} onUpdate={onUpdate} />
      </pre>
    );
  }
  return null;
}

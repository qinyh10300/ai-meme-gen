"use client";

import { Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildJokeDeck,
  chooseNextJoke,
  createFeedbackMemory,
  recordFeedback,
  sanitizeFeedbackMemory,
  type FeedbackMemory,
  type JokeVote
} from "../../src/web/joke-engine";

const FEEDBACK_STORAGE_KEY = "memepop-feedback-v2";

type TransitionPhase = "idle" | "leaving" | "loading" | "entering";

export function MemeMachine() {
  const deck = useMemo(() => buildJokeDeck(), []);
  const [current, setCurrent] = useState(deck[0]);
  const [memory, setMemory] = useState<FeedbackMemory>(createFeedbackMemory);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [lastVote, setLastVote] = useState<JokeVote | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (stored) {
        setMemory(sanitizeFeedbackMemory(JSON.parse(stored)));
      }
    } catch {
      setMemory(createFeedbackMemory());
    }

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const vote = useCallback(
    (nextVote: JokeVote) => {
      if (phase !== "idle") {
        return;
      }

      const nextMemory = recordFeedback(memory, current, nextVote);
      const nextJoke = chooseNextJoke(deck, current, nextMemory);

      setMemory(nextMemory);
      setLastVote(nextVote);
      setPhase("leaving");

      try {
        window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextMemory));
      } catch {
        // Feedback still works for this session when storage is unavailable.
      }

      timers.current.push(
        window.setTimeout(() => setPhase("loading"), 150),
        window.setTimeout(() => {
          setCurrent(nextJoke);
          setPhase("entering");
        }, 390),
        window.setTimeout(() => {
          setPhase("idle");
          setLastVote(null);
        }, 690)
      );
    },
    [current, deck, memory, phase]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        vote("not_funny");
      }
      if (event.key === "ArrowRight") {
        vote("funny");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [vote]);

  const hitRate = memory.total === 0 ? 0 : Math.round((memory.funny / memory.total) * 100);
  const sequenceNumber = String(memory.total + 1).padStart(2, "0");
  const isBusy = phase !== "idle";

  return (
    <div className="meme-page" data-palette={current.palette} data-format={current.format}>
      <div className="accent-block" aria-hidden="true" />

      <header className="topbar">
        <div className="brand" aria-label="MemePop">
          <span className="brand-mark">M</span>
          <span>MemePop</span>
        </div>

        <div className="ai-status">
          <Sparkles aria-hidden="true" size={18} strokeWidth={2.4} />
          <span>中文笑点训练中</span>
        </div>
      </header>

      <main className="joke-stage">
        <div className="joke-meta">
          <span>NO. {sequenceNumber}</span>
          <span className="meta-divider" aria-hidden="true" />
          <span>{current.label}</span>
        </div>

        <div className={`joke-content phase-${phase}`} aria-live="polite" aria-atomic="true">
          {phase === "loading" ? (
            <div className="thinking-state" role="status">
              <span className="thinking-word">正在捞下一个笑点</span>
              <span className="thinking-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : (
            <article className="joke-copy">
              <div className="joke-setup">
                {current.setup.map((line) => (
                  <p className="setup-line" key={line}>
                    {line}
                  </p>
                ))}
              </div>
              <h1 className="joke-punchline">{current.punchline}</h1>
              {current.tag ? <p className="joke-tag">{current.tag}</p> : null}
              <span className="joke-emoji" aria-hidden="true">
                {current.emoji}
              </span>
            </article>
          )}
        </div>

        <div className={`vote-response ${lastVote ? "is-visible" : ""}`} aria-hidden="true">
          {lastVote === "funny" ? "记住了，你吃这个拐法" : "收到，下一条换个脑回路"}
        </div>
      </main>

      <section className="feedback-panel" aria-label="评价这条笑话">
        <p className="feedback-question">这条打中了吗？</p>
        <div className="feedback-buttons">
          <button
            className="vote-button vote-button-bad"
            type="button"
            onClick={() => vote("not_funny")}
            disabled={isBusy}
          >
            <ThumbsDown aria-hidden="true" size={28} strokeWidth={2.4} />
            <span>不好笑，下一个</span>
          </button>
          <button
            className="vote-button vote-button-good"
            type="button"
            onClick={() => vote("funny")}
            disabled={isBusy}
          >
            <ThumbsUp aria-hidden="true" size={28} strokeWidth={2.4} />
            <span>好笑，下一个</span>
          </button>
        </div>
      </section>

      <footer className="session-footer">
        <span>已试笑 {memory.total} 条</span>
        <span aria-hidden="true">·</span>
        <span>命中率 {hitRate}%</span>
      </footer>
    </div>
  );
}

"use client";

import {
  Check,
  Copy,
  FlaskConical,
  LoaderCircle,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { CultureJoke } from "../../src/humor/types";
import {
  audienceOptions,
  feedbackReasonOptions,
  toneOptions,
  type FeedbackReasonCode,
  type FeedNextResponse,
  type GeneratedJokeCandidate,
  type GenerateJokeResponse,
  type JokeAudience,
  type JokeTone
} from "../../src/platform/contracts";
import { createClientEventId, getOrCreateClientSession } from "../../src/web/client-session";
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
type AppMode = "feed" | "studio";

interface PendingReason {
  eventId: string;
  jokeId: string;
  vote: JokeVote;
  dwellMs: number;
}

export function MemeMachine() {
  const deck = useMemo(() => buildJokeDeck(), []);
  const [mode, setMode] = useState<AppMode>("feed");
  const [sessionId, setSessionId] = useState("");
  const [current, setCurrent] = useState(deck[0]);
  const [memory, setMemory] = useState<FeedbackMemory>(createFeedbackMemory);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [pendingReason, setPendingReason] = useState<PendingReason | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState("审核内容池");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    let active = true;
    let restoredMemory = createFeedbackMemory();

    try {
      const stored = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (stored) restoredMemory = sanitizeFeedbackMemory(JSON.parse(stored));
      const nextSessionId = getOrCreateClientSession(
        window.localStorage,
        () => crypto.randomUUID()
      );
      setMemory(restoredMemory);
      setSessionId(nextSessionId);
      setMode(new URLSearchParams(window.location.search).get("mode") === "studio" ? "studio" : "feed");

      void requestJson<FeedNextResponse>("/api/feed/next", {
        method: "POST",
        body: JSON.stringify({
          sessionId: nextSessionId,
          currentId: deck[0].id,
          seenIds: restoredMemory.seenIds.slice(-20)
        })
      })
        .then((response) => {
          if (!active) return;
          setCurrent(response.joke);
          setSourceLabel(selectionLabel(response.selection));
          shownAt.current = performance.now();
        })
        .catch(() => {
          if (!active) return;
          setSourceLabel("本地审核池");
          setNotice("候选池暂时没连上，已切换到本地审核内容。你的选择仍会保留在本机。");
          shownAt.current = performance.now();
        });
    } catch {
      setMemory(createFeedbackMemory());
      setSourceLabel("本地审核池");
      setNotice("浏览器存储不可用，本次会话仍可正常刷梗。关闭页面后偏好不会保留。");
    }

    shownAt.current = performance.now();
    return () => {
      active = false;
    };
  }, [deck]);

  const vote = useCallback(
    async (nextVote: JokeVote) => {
      if (phase !== "idle") return;

      const dwellMs = Math.max(0, Math.round(performance.now() - shownAt.current));
      const eventId = createClientEventId("feedback");
      const nextMemory = recordFeedback(memory, current, nextVote);
      setMemory(nextMemory);
      setPendingReason({ eventId, jokeId: current.id, vote: nextVote, dwellMs });
      setPhase("leaving");

      try {
        window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(nextMemory));
      } catch {
        setNotice("这次偏好只会保留到页面关闭。笑话还是照常供应。");
      }

      await delay(150);
      setPhase("loading");

      let feedbackSaved = false;
      if (sessionId) {
        feedbackSaved = await postFeedback({
          eventId,
          sessionId,
          jokeId: current.id,
          vote: nextVote,
          dwellMs
        });
      }

      let nextJoke: CultureJoke;
      if (sessionId) {
        try {
          const response = await requestJson<FeedNextResponse>("/api/feed/next", {
            method: "POST",
            body: JSON.stringify({
              sessionId,
              currentId: current.id,
              seenIds: nextMemory.seenIds.slice(-20)
            })
          });
          nextJoke = response.joke;
          setSourceLabel(selectionLabel(response.selection));
          if (feedbackSaved) setNotice(null);
        } catch {
          nextJoke = chooseNextJoke(deck, current, nextMemory);
          setSourceLabel("本地审核池");
          setNotice("网络刚才打了个盹，下一条已从本地审核池补上。");
        }
      } else {
        nextJoke = chooseNextJoke(deck, current, nextMemory);
      }

      if (!feedbackSaved && sessionId) {
        setNotice("这次反馈暂未同步到服务器，本地偏好已经记住了。");
      }

      setCurrent(nextJoke);
      setPhase("entering");
      shownAt.current = performance.now();
      await delay(280);
      setPhase("idle");
    },
    [current, deck, memory, phase, sessionId]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (mode !== "feed" || target?.closest("input, textarea, select, button, a")) return;
      if (event.key === "ArrowLeft") void vote("not_funny");
      if (event.key === "ArrowRight") void vote("funny");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, vote]);

  const submitReason = async (reasonCode: FeedbackReasonCode) => {
    if (!pendingReason || !sessionId) {
      setPendingReason(null);
      return;
    }
    const saved = await postFeedback({ ...pendingReason, sessionId, reasonCode });
    setPendingReason(null);
    if (!saved) setNotice("原因标签暂时没同步上，主反馈仍保留在本机。");
  };

  const copyJoke = async (joke: CultureJoke) => {
    const copied = await copyText(formatJoke(joke));
    if (!copied) {
      setNotice("浏览器没有开放剪贴板权限。");
      return;
    }
    setCopiedId(joke.id);
    window.setTimeout(() => setCopiedId((id) => (id === joke.id ? null : id)), 1_500);
  };

  const shareJoke = async (joke: CultureJoke) => {
    const text = formatJoke(joke);
    if (navigator.share) {
      try {
        await navigator.share({ title: "MemePop", text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyJoke(joke);
  };

  const hitRate = memory.total === 0 ? 0 : Math.round((memory.funny / memory.total) * 100);
  const sequenceNumber = String(memory.total + 1).padStart(2, "0");

  return (
    <div className="app-shell" data-palette={current.palette} data-format={current.format}>
      <div className="accent-rail" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="MemePop 首页">
          <span className="brand-mark">M</span>
          <span>MemePop</span>
        </a>

        <nav className="mode-nav" aria-label="主要页面">
          <button
            className={mode === "feed" ? "is-active" : ""}
            type="button"
            onClick={() => setMode("feed")}
            aria-current={mode === "feed" ? "page" : undefined}
          >
            刷梗
          </button>
          <button
            className={mode === "studio" ? "is-active" : ""}
            type="button"
            onClick={() => setMode("studio")}
            aria-current={mode === "studio" ? "page" : undefined}
          >
            我的场景
          </button>
          <a href="/lab">
            <FlaskConical aria-hidden="true" size={16} />
            实验室
          </a>
        </nav>

        <div className="ai-status" title="当前内容来源">
          <Sparkles aria-hidden="true" size={17} strokeWidth={2.4} />
          <span>{mode === "feed" ? sourceLabel : "结构化写作组"}</span>
        </div>
      </header>

      {mode === "feed" ? (
        <FeedView
          current={current}
          sequenceNumber={sequenceNumber}
          phase={phase}
          pendingReason={pendingReason}
          notice={notice}
          copied={copiedId === current.id}
          onVote={vote}
          onReason={submitReason}
          onSkipReason={() => setPendingReason(null)}
          onCopy={() => void copyJoke(current)}
          onShare={() => void shareJoke(current)}
        />
      ) : (
        <StudioView
          sessionId={sessionId}
          onNotice={setNotice}
          onCopy={copyJoke}
          onShare={shareJoke}
          copiedId={copiedId}
        />
      )}

      <footer className="session-footer">
        <span>已试笑 {memory.total} 条</span>
        <span aria-hidden="true">·</span>
        <span>命中率 {hitRate}%</span>
        {notice ? <span className="footer-notice">{notice}</span> : null}
      </footer>
    </div>
  );
}

function FeedView(props: {
  current: CultureJoke;
  sequenceNumber: string;
  phase: TransitionPhase;
  pendingReason: PendingReason | null;
  notice: string | null;
  copied: boolean;
  onVote(vote: JokeVote): Promise<void>;
  onReason(code: FeedbackReasonCode): Promise<void>;
  onSkipReason(): void;
  onCopy(): void;
  onShare(): void;
}) {
  const isBusy = props.phase !== "idle";
  const fullLength = [...formatJoke(props.current)].length;

  return (
    <main className="feed-view">
      <section className="joke-stage" aria-label="当前笑话">
        <div className="joke-heading-row">
          <div className="joke-meta">
            <span>NO. {props.sequenceNumber}</span>
            <span className="meta-divider" aria-hidden="true" />
            <span>{props.current.label}</span>
          </div>
          <div className="joke-tools" aria-label="笑话操作">
            <button className="icon-button" type="button" onClick={props.onCopy} title="复制笑话" aria-label="复制笑话">
              {props.copied ? <Check aria-hidden="true" size={19} /> : <Copy aria-hidden="true" size={19} />}
            </button>
            <button className="icon-button" type="button" onClick={props.onShare} title="分享笑话" aria-label="分享笑话">
              <Share2 aria-hidden="true" size={19} />
            </button>
          </div>
        </div>

        <div
          className={`joke-content phase-${props.phase} ${fullLength > 125 ? "is-long" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {props.phase === "loading" ? (
            <div className="thinking-state" role="status">
              <span>正在捞下一个笑点</span>
              <span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span>
            </div>
          ) : (
            <article className="joke-copy">
              <div className="joke-setup">
                {props.current.setup.map((line, index) => (
                  <p className="setup-line" key={`${index}-${line}`}>{line}</p>
                ))}
              </div>
              <h1 className="joke-punchline">{props.current.punchline}</h1>
              {props.current.tag ? <p className="joke-tag">{props.current.tag}</p> : null}
              <span className="joke-emoji" aria-hidden="true">{props.current.emoji}</span>
            </article>
          )}
        </div>
      </section>

      <section className="feedback-panel" aria-label="评价这条笑话">
        <p className="feedback-question">这条打中了吗？</p>
        <div className="feedback-buttons">
          <button
            className="vote-button vote-button-bad"
            type="button"
            onClick={() => void props.onVote("not_funny")}
            disabled={isBusy}
          >
            <ThumbsDown aria-hidden="true" size={27} strokeWidth={2.4} />
            <span>不好笑，下一个</span>
          </button>
          <button
            className="vote-button vote-button-good"
            type="button"
            onClick={() => void props.onVote("funny")}
            disabled={isBusy}
          >
            <ThumbsUp aria-hidden="true" size={27} strokeWidth={2.4} />
            <span>好笑，下一个</span>
          </button>
        </div>

        <div className="reason-slot" aria-live="polite">
          {props.pendingReason ? (
            <div className="reason-panel">
              <span className="reason-title">
                {props.pendingReason.vote === "funny" ? "打中在哪？" : "差在哪？"}
              </span>
              <div className="reason-options">
                {feedbackReasonOptions[props.pendingReason.vote].map((reason) => (
                  <button type="button" key={reason.code} onClick={() => void props.onReason(reason.code)}>
                    {reason.label}
                  </button>
                ))}
              </div>
              <button className="icon-button reason-skip" type="button" onClick={props.onSkipReason} title="跳过原因" aria-label="跳过原因">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
          ) : props.notice ? (
            <p className="inline-notice" role="status">{props.notice}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function StudioView(props: {
  sessionId: string;
  copiedId: string | null;
  onNotice(message: string | null): void;
  onCopy(joke: CultureJoke): Promise<void>;
  onShare(joke: CultureJoke): Promise<void>;
}) {
  const [scene, setScene] = useState("");
  const [audience, setAudience] = useState<JokeAudience>("通用");
  const [tone, setTone] = useState<JokeTone>("生活流");
  const [result, setResult] = useState<GenerateJokeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, JokeVote>>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!props.sessionId || scene.trim().length < 4 || loading) return;
    setLoading(true);
    setError(null);
    props.onNotice(null);

    try {
      const response = await requestJson<GenerateJokeResponse>("/api/generate/joke", {
        method: "POST",
        body: JSON.stringify({ sessionId: props.sessionId, scene: scene.trim(), audience, tone })
      });
      setResult(response);
      if (response.notice) props.onNotice(response.notice);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "这轮没生成出来，请再试一次。");
    } finally {
      setLoading(false);
    }
  };

  const voteCandidate = async (candidate: GeneratedJokeCandidate, vote: JokeVote) => {
    if (!props.sessionId) return;
    const eventId = createClientEventId("feedback");
    const saved = await postFeedback({
      eventId,
      sessionId: props.sessionId,
      jokeId: candidate.joke.id,
      vote,
      dwellMs: 0
    });
    if (saved) setVotes((current) => ({ ...current, [candidate.joke.id]: vote }));
    else props.onNotice("这条评价暂时没同步上，请稍后再试。");
  };

  return (
    <main className="studio-view">
      <section className="studio-form-band" aria-labelledby="studio-title">
        <div className="section-kicker">SCENE TO PUNCHLINE</div>
        <h1 id="studio-title">我的场景</h1>
        <form className="studio-form" onSubmit={submit}>
          <label htmlFor="scene-input">刚刚发生了什么？</label>
          <textarea
            id="scene-input"
            value={scene}
            onChange={(event) => setScene(event.target.value)}
            placeholder="比如：把吐槽老板的话发错工作群了"
            minLength={4}
            maxLength={500}
            rows={6}
            required
          />
          <div className="character-count">{scene.length}/500</div>

          <div className="studio-control-row">
            <label htmlFor="audience-select">给谁看</label>
            <select id="audience-select" value={audience} onChange={(event) => setAudience(event.target.value as JokeAudience)}>
              {audienceOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <fieldset className="tone-fieldset">
            <legend>语气</legend>
            <div className="segmented-control">
              {toneOptions.map((option) => (
                <button
                  className={tone === option ? "is-active" : ""}
                  type="button"
                  key={option}
                  onClick={() => setTone(option)}
                  aria-pressed={tone === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="generate-button" type="submit" disabled={loading || !props.sessionId || scene.trim().length < 4}>
            {loading ? <LoaderCircle className="spin" aria-hidden="true" size={21} /> : <Sparkles aria-hidden="true" size={21} />}
            <span>{loading ? "正在写这一轮" : "生成一轮"}</span>
          </button>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </form>
      </section>

      <section className="studio-results" aria-label="生成候选" aria-live="polite">
        <div className="results-heading">
          <div>
            <span className="section-kicker">CANDIDATES</span>
            <h2>候选</h2>
          </div>
          {result ? (
            <span className="provider-readout">
              {result.provider === "openai" ? result.model : "本地规则"} · 拒绝 {result.rejectedCount}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="studio-loading" role="status">
            <LoaderCircle className="spin" aria-hidden="true" size={27} />
            <span>场景建模、分角度写作、独立审稿中</span>
          </div>
        ) : result?.candidates.length ? (
          <div className="candidate-grid">
            {result.candidates.map((candidate, index) => (
              <article className="candidate-card" key={candidate.joke.id}>
                <div className="candidate-meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{candidate.joke.label}</span>
                  <span>{candidate.review.overall} 分</span>
                </div>
                <div className="candidate-copy">
                  {candidate.joke.setup.map((line, lineIndex) => <p key={`${lineIndex}-${line}`}>{line}</p>)}
                  <h3>{candidate.joke.punchline} <span aria-hidden="true">{candidate.joke.emoji}</span></h3>
                  {candidate.joke.tag ? <p className="candidate-tag">{candidate.joke.tag}</p> : null}
                </div>
                <div className="candidate-actions">
                  <button className={`icon-button ${votes[candidate.joke.id] === "not_funny" ? "is-selected" : ""}`} type="button" onClick={() => void voteCandidate(candidate, "not_funny")} title="这条不好笑" aria-label="这条不好笑">
                    <ThumbsDown aria-hidden="true" size={18} />
                  </button>
                  <button className={`icon-button ${votes[candidate.joke.id] === "funny" ? "is-selected" : ""}`} type="button" onClick={() => void voteCandidate(candidate, "funny")} title="这条好笑" aria-label="这条好笑">
                    <ThumbsUp aria-hidden="true" size={18} />
                  </button>
                  <span className="action-spacer" />
                  <button className="icon-button" type="button" onClick={() => void props.onCopy(candidate.joke)} title="复制候选" aria-label="复制候选">
                    {props.copiedId === candidate.joke.id ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
                  </button>
                  <button className="icon-button" type="button" onClick={() => void props.onShare(candidate.joke)} title="分享候选" aria-label="分享候选">
                    <Share2 aria-hidden="true" size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="studio-empty"><span>等你这件事。</span></div>
        )}
      </section>
    </main>
  );
}

async function postFeedback(input: {
  eventId: string;
  sessionId: string;
  jokeId: string;
  vote: JokeVote;
  reasonCode?: FeedbackReasonCode;
  dwellMs: number;
}): Promise<boolean> {
  try {
    await requestJson("/api/feedback", { method: "POST", body: JSON.stringify(input) });
    return true;
  } catch {
    return false;
  }
}

async function requestJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    throw new Error((body as { error?: string } | null)?.error ?? `请求失败 (${response.status})`);
  }
  return body as T;
}

function formatJoke(joke: CultureJoke): string {
  return [...joke.setup, joke.punchline, joke.tag ?? ""].filter(Boolean).join("\n") + ` ${joke.emoji}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function selectionLabel(selection: FeedNextResponse["selection"]): string {
  if (selection === "personalized") return "偏好排序中";
  if (selection === "explore") return "换个脑回路";
  if (selection === "fallback") return "审核内容池";
  return "质量优先";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

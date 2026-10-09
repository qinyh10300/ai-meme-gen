import Taro, { useLoad, useShareAppMessage } from "@tarojs/taro";
import { Button, Text, View } from "@tarojs/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "../../components/AppHeader";
import { AuthGate } from "../../components/AuthGate";
import { BottomNav } from "../../components/BottomNav";
import { authModeLabel, toRequestIdentity } from "../../lib/auth";
import { useAuth } from "../../lib/auth-context";
import { createClientId } from "../../lib/id";
import { compactShareTitle, formatJoke } from "../../lib/joke-text";
import { getNextJoke, saveFeedback } from "../../services/meme-api";
import { fallbackJokes } from "../../shared/fallback-jokes";
import {
  feedbackReasonOptions,
  type CultureJoke,
  type FeedbackReasonCode,
  type FeedSessionSummary,
  type JokeVote
} from "../../shared/contracts";
import "./index.css";

type TransitionPhase = "idle" | "leaving" | "loading" | "entering";

interface PendingReason {
  eventId: string;
  jokeId: string;
  vote: JokeVote;
  dwellMs: number;
}

const emptySummary: FeedSessionSummary = { total: 0, funny: 0, funnyRate: 0 };

export default function FeedPage() {
  const auth = useAuth();
  const [shareJoke, setShareJoke] = useState<CultureJoke>(fallbackJokes[0]);

  useLoad(() => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      void Taro.showShareMenu({ withShareTicket: true }).catch(() => undefined);
    }
  });

  if (process.env.TARO_ENV === "weapp") {
    useShareAppMessage(() => ({
      title: compactShareTitle(shareJoke),
      path: "/pages/feed/index"
    }));
  }

  return (
    <View className="page-shell feed-page">
      <AppHeader kicker="MEMEPOP" title="今天刷点真的" status={authModeLabel(auth.session)} />
      <AuthGate><FeedExperience onShareJokeChange={setShareJoke} /></AuthGate>
      <BottomNav active="feed" />
    </View>
  );
}

function FeedExperience({ onShareJokeChange }: { onShareJokeChange(joke: CultureJoke): void }) {
  const auth = useAuth();
  const session = auth.session!;
  const identity = toRequestIdentity(session);
  const [current, setCurrent] = useState<CultureJoke>(fallbackJokes[0]);
  const [summary, setSummary] = useState<FeedSessionSummary>(emptySummary);
  const [sourceLabel, setSourceLabel] = useState("审核内容池");
  const [phase, setPhase] = useState<TransitionPhase>("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingReason, setPendingReason] = useState<PendingReason | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const shownAt = useRef(Date.now());
  const initializedFor = useRef<string | null>(null);

  const sessionKey = session.mode === "wechat" ? session.token.slice(-12) : session.sessionId;

  useEffect(() => {
    onShareJokeChange(current);
  }, [current, onShareJokeChange]);

  const loadInitial = useCallback(async () => {
    if (initializedFor.current === sessionKey) return;
    initializedFor.current = sessionKey;
    setPhase("loading");
    try {
      const response = await getNextJoke(identity, { seenIds: [] });
      setCurrent(response.joke);
      setSummary(response.session);
      setSourceLabel(selectionLabel(response.selection));
      setNotice(null);
    } catch {
      setCurrent(fallbackJokes[0]);
      setSourceLabel("本地精选");
      setNotice("暂时没连上内容池，先给你一条本地精选。网络恢复后会自动续上。");
    } finally {
      shownAt.current = Date.now();
      setPhase("entering");
      setTimeout(() => setPhase("idle"), 260);
    }
  }, [identity, sessionKey]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const vote = async (nextVote: JokeVote) => {
    if (phase !== "idle") return;
    const votedJoke = current;
    const eventId = createClientId("feedback");
    const dwellMs = Math.max(0, Date.now() - shownAt.current);
    const nextSeenIds = [...seenIds, votedJoke.id].slice(-20);
    const optimisticTotal = summary.total + 1;
    const optimisticFunny = summary.funny + (nextVote === "funny" ? 1 : 0);

    setPendingReason({ eventId, jokeId: votedJoke.id, vote: nextVote, dwellMs });
    setSummary({
      total: optimisticTotal,
      funny: optimisticFunny,
      funnyRate: Math.round((optimisticFunny / optimisticTotal) * 100)
    });
    setSeenIds(nextSeenIds);
    setPhase("leaving");
    await delay(140);
    setPhase("loading");

    let feedbackSaved = true;
    try {
      await saveFeedback(identity, {
        eventId,
        jokeId: votedJoke.id,
        vote: nextVote,
        dwellMs
      });
    } catch {
      feedbackSaved = false;
    }

    try {
      const response = await getNextJoke(identity, {
        currentId: votedJoke.id,
        seenIds: nextSeenIds
      });
      setCurrent(response.joke);
      setSourceLabel(selectionLabel(response.selection));
      setNotice(feedbackSaved ? null : "下一条到了，但刚才的评价还没同步成功。");
    } catch {
      setCurrent(pickFallback(votedJoke.id, nextSeenIds));
      setSourceLabel("本地精选");
      setNotice(feedbackSaved ? "网络打了个盹，先从本地精选补一条。" : "网络暂时不可用，反馈和下一条都未同步。");
    }

    shownAt.current = Date.now();
    setPhase("entering");
    await delay(260);
    setPhase("idle");
  };

  const submitReason = async (reasonCode: FeedbackReasonCode) => {
    if (!pendingReason) return;
    const reason = pendingReason;
    setPendingReason(null);
    try {
      await saveFeedback(identity, { ...reason, reasonCode });
      void Taro.showToast({ title: "收到，偏好更准了", icon: "none" });
    } catch {
      setNotice("原因标签暂时没同步上，主评价仍然有效。");
    }
  };

  const copyCurrent = async () => {
    try {
      await Taro.setClipboardData({ data: formatJoke(current) });
    } catch {
      void Taro.showToast({ title: "复制失败，请稍后再试", icon: "none" });
    }
  };

  const isBusy = phase !== "idle";
  const sequence = String(summary.total + 1).padStart(2, "0");

  return (
    <View className="feed-content page-content">
      <View className="feed-overview">
        <View>
          <Text className="eyebrow">YOUR HUMOR SIGNAL</Text>
          <Text className="feed-overview__title">越刷，越懂你的笑点</Text>
        </View>
        <View className="feed-overview__score">
          <Text>{summary.funnyRate}%</Text>
          <Text>命中率</Text>
        </View>
      </View>

      {notice ? (
        <View className="feed-notice">
          <View className="feed-notice__dot" />
          <Text>{notice}</Text>
          <Text className="feed-notice__close" onClick={() => setNotice(null)}>×</Text>
        </View>
      ) : null}

      <View className={`joke-card palette-${current.palette} phase-${phase}`}>
        <View className="joke-card__accent" />
        <View className="joke-card__head">
          <View className="joke-card__meta">
            <Text>NO. {sequence}</Text>
            <View />
            <Text>{current.label}</Text>
          </View>
          <View className="joke-card__source">{sourceLabel}</View>
        </View>

        <View className="joke-card__body">
          {phase === "loading" ? (
            <View className="joke-loading">
              <Text>正在捞下一个笑点</Text>
              <View className="joke-loading__dots"><View /><View /><View /></View>
            </View>
          ) : (
            <>
              <View className="joke-card__setup">
                {current.setup.map((line) => <Text key={line}>{line}</Text>)}
              </View>
              <Text className="joke-card__punchline">{current.punchline}</Text>
              {current.tag ? <Text className="joke-card__tag">{current.tag}</Text> : null}
              <Text className="joke-card__emoji">{current.emoji}</Text>
            </>
          )}
        </View>

        <View className="joke-card__tools">
          <Button className="joke-tool tap-scale" onClick={() => void copyCurrent()}>
            <Text className="joke-tool__glyph">□</Text><Text>复制</Text>
          </Button>
          <Button className="joke-tool tap-scale" openType="share">
            <Text className="joke-tool__glyph">↗</Text><Text>分享</Text>
          </Button>
        </View>
      </View>

      <View className="vote-panel">
        <View className="vote-panel__heading">
          <Text>这条打中了吗？</Text>
          <Text>已试笑 {summary.total} 条</Text>
        </View>
        <View className="vote-panel__actions">
          <Button
            className={`vote-button vote-button--no tap-scale${isBusy ? " is-disabled" : ""}`}
            disabled={isBusy}
            onClick={() => void vote("not_funny")}
          >
            <Text className="vote-button__emoji">👎</Text>
            <View><Text>没打中</Text><Text>换个脑回路</Text></View>
          </Button>
          <Button
            className={`vote-button vote-button--yes tap-scale${isBusy ? " is-disabled" : ""}`}
            disabled={isBusy}
            onClick={() => void vote("funny")}
          >
            <Text className="vote-button__emoji">👍</Text>
            <View><Text>打中了</Text><Text>再来一个</Text></View>
          </Button>
        </View>
      </View>

      {pendingReason ? (
        <View className="reason-sheet-mask" onClick={() => setPendingReason(null)}>
          <View className="reason-sheet" onClick={(event) => event.stopPropagation()}>
            <View className="reason-sheet__handle" />
            <View className="reason-sheet__head">
              <View>
                <Text className="eyebrow">ONE MORE SIGNAL</Text>
                <Text className="reason-sheet__title">
                  {pendingReason.vote === "funny" ? "打中在哪？" : "差在哪？"}
                </Text>
              </View>
              <Text className="reason-sheet__skip" onClick={() => setPendingReason(null)}>跳过</Text>
            </View>
            <View className="reason-sheet__options">
              {feedbackReasonOptions[pendingReason.vote].map((reason) => (
                <Button
                  className="reason-option tap-scale"
                  key={reason.code}
                  onClick={() => void submitReason(reason.code)}
                >
                  {reason.label}
                </Button>
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function selectionLabel(selection: "quality" | "personalized" | "explore" | "fallback"): string {
  if (selection === "personalized") return "偏好排序";
  if (selection === "explore") return "换个脑回路";
  if (selection === "fallback") return "审核内容池";
  return "质量优先";
}

function pickFallback(currentId: string, seenIds: string[]): CultureJoke {
  const unseen = fallbackJokes.find((joke) => joke.id !== currentId && !seenIds.includes(joke.id));
  return unseen ?? fallbackJokes.find((joke) => joke.id !== currentId) ?? fallbackJokes[0];
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

import Taro, { useLoad, useShareAppMessage } from "@tarojs/taro";
import { Button, Picker, Text, Textarea, View } from "@tarojs/components";
import { useEffect, useState } from "react";
import { AppHeader } from "../../components/AppHeader";
import { AuthGate } from "../../components/AuthGate";
import { BottomNav } from "../../components/BottomNav";
import { authModeLabel, toRequestIdentity } from "../../lib/auth";
import { useAuth } from "../../lib/auth-context";
import { createClientId } from "../../lib/id";
import { compactShareTitle, formatJoke } from "../../lib/joke-text";
import { generateJokes, saveFeedback } from "../../services/meme-api";
import {
  audienceOptions,
  toneOptions,
  type CultureJoke,
  type GeneratedJokeCandidate,
  type GenerateJokeResponse,
  type JokeAudience,
  type JokeTone,
  type JokeVote
} from "../../shared/contracts";
import "./index.css";

const progressMessages = [
  "正在拆解场景里的关系与情绪",
  "八种笑点机制同时试写",
  "独立审稿，淘汰硬拗和 AI 味",
  "检查原创性与表达安全"
];

export default function StudioPage() {
  const auth = useAuth();
  const [shareJoke, setShareJoke] = useState<CultureJoke | null>(null);

  useLoad(() => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      void Taro.showShareMenu({ withShareTicket: true }).catch(() => undefined);
    }
  });

  if (process.env.TARO_ENV === "weapp") {
    useShareAppMessage(() => ({
      title: shareJoke ? compactShareTitle(shareJoke) : "把生活里的尴尬，写成一个笑点",
      path: "/pages/studio/index"
    }));
  }

  return (
    <View className="page-shell studio-page">
      <AppHeader kicker="MEMEPOP STUDIO" title="把这事写成梗" status={authModeLabel(auth.session)} />
      <AuthGate><StudioExperience onShareJokeChange={setShareJoke} /></AuthGate>
      <BottomNav active="studio" />
    </View>
  );
}

function StudioExperience({ onShareJokeChange }: { onShareJokeChange(joke: CultureJoke): void }) {
  const auth = useAuth();
  const session = auth.session!;
  const identity = toRequestIdentity(session);
  const [scene, setScene] = useState("");
  const [audience, setAudience] = useState<JokeAudience>("通用");
  const [tone, setTone] = useState<JokeTone>("生活流");
  const [result, setResult] = useState<GenerateJokeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, JokeVote>>({});

  useEffect(() => {
    if (!loading) {
      setProgressIndex(0);
      return;
    }
    const timer = setInterval(
      () => setProgressIndex((index) => Math.min(index + 1, progressMessages.length - 1)),
      4200
    );
    return () => clearInterval(timer);
  }, [loading]);

  const submit = async () => {
    const cleanScene = scene.trim();
    if (loading || cleanScene.length < 4) return;
    setLoading(true);
    setError(null);
    setVotes({});

    try {
      const response = await generateJokes(identity, { scene: cleanScene, audience, tone });
      setResult(response);
      if (response.notice) {
        void Taro.showToast({ title: response.notice, icon: "none", duration: 3200 });
      }
      setTimeout(() => {
        void Taro.pageScrollTo({ selector: "#studio-results", duration: 320 });
      }, 100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "这轮没有生成出来，请再试一次。");
    } finally {
      setLoading(false);
    }
  };

  const voteCandidate = async (candidate: GeneratedJokeCandidate, vote: JokeVote) => {
    setVotes((current) => ({ ...current, [candidate.joke.id]: vote }));
    try {
      await saveFeedback(identity, {
        eventId: createClientId("feedback"),
        jokeId: candidate.joke.id,
        vote,
        dwellMs: 0
      });
    } catch {
      setVotes((current) => {
        const next = { ...current };
        delete next[candidate.joke.id];
        return next;
      });
      void Taro.showToast({ title: "评价暂时没同步上", icon: "none" });
    }
  };

  const copyCandidate = async (joke: CultureJoke) => {
    try {
      await Taro.setClipboardData({ data: formatJoke(joke) });
    } catch {
      void Taro.showToast({ title: "复制失败，请稍后再试", icon: "none" });
    }
  };

  return (
    <View className="studio-content page-content">
      <View className="studio-intro">
        <Text className="eyebrow">SCENE TO PUNCHLINE</Text>
        <Text className="studio-intro__title">刚刚发生了什么？</Text>
        <Text className="studio-intro__subtitle">不用想笑点，只说真实发生的那件小事。</Text>
      </View>

      <View className="studio-form surface-card">
        <View className="studio-field">
          <View className="studio-field__label-row">
            <Text className="studio-field__label">你的场景</Text>
            <Text className={`studio-field__count ${scene.length > 450 ? "is-near-limit" : ""}`}>
              {scene.length}/500
            </Text>
          </View>
          <Textarea
            className="studio-textarea"
            value={scene}
            maxlength={500}
            placeholder="比如：把吐槽老板的话发错工作群了……"
            placeholderClass="studio-textarea__placeholder"
            autoHeight={false}
            cursorSpacing={160}
            onInput={(event) => setScene(event.detail.value)}
          />
        </View>

        <View className="studio-form__divider" />

        <View className="studio-control-row">
          <View>
            <Text className="studio-field__label">给谁看</Text>
            <Text className="studio-control-row__hint">调整共同语境</Text>
          </View>
          <Picker
            mode="selector"
            range={audienceOptions as unknown as string[]}
            value={audienceOptions.indexOf(audience)}
            onChange={(event) => setAudience(audienceOptions[Number(event.detail.value)] ?? "通用")}
          >
            <View className="studio-picker tap-scale">
              <Text>{audience}</Text><Text>⌄</Text>
            </View>
          </Picker>
        </View>

        <View className="studio-field studio-tone-field">
          <Text className="studio-field__label">想要的语气</Text>
          <View className="tone-options">
            {toneOptions.map((option) => (
              <Button
                key={option}
                className={`tone-option tap-scale ${tone === option ? "is-active" : ""}`}
                onClick={() => setTone(option)}
              >
                {option}
              </Button>
            ))}
          </View>
        </View>

        <Button
          className={`studio-submit tap-scale${loading || scene.trim().length < 4 ? " is-disabled" : ""}`}
          disabled={loading || scene.trim().length < 4}
          onClick={() => void submit()}
        >
          <Text className="studio-submit__spark">✦</Text>
          <View>
            <Text>{loading ? "这一轮正在写" : "生成一轮"}</Text>
            <Text>{loading ? progressMessages[progressIndex] : "通常会给你 4–6 个通过审稿的候选"}</Text>
          </View>
          <Text className="studio-submit__arrow">→</Text>
        </Button>

        {error ? (
          <View className="studio-error">
            <Text>{error}</Text>
            <Text onClick={() => void submit()}>重试</Text>
          </View>
        ) : null}
      </View>

      <View className="studio-results" id="studio-results">
        <View className="studio-results__head">
          <View>
            <Text className="eyebrow">CANDIDATES</Text>
            <Text className="studio-results__title">这一轮候选</Text>
          </View>
          {result ? (
            <View className="studio-results__provider">
              <Text>{result.provider === "openai" ? "AI 写作组" : "本地规则"}</Text>
              <Text>拒绝 {result.rejectedCount}</Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View className="studio-progress surface-card">
            <View className="studio-progress__spinner">✦</View>
            <Text className="studio-progress__title">{progressMessages[progressIndex]}</Text>
            <View className="studio-progress__track">
              <View style={{ width: `${((progressIndex + 1) / progressMessages.length) * 100}%` }} />
            </View>
            <Text className="studio-progress__note">好笑比快更重要，这里会多审几遍。</Text>
          </View>
        ) : result?.candidates.length ? (
          <View className="candidate-list">
            {result.candidates.map((candidate, index) => (
              <View className={`candidate-card palette-${candidate.joke.palette}`} key={candidate.joke.id}>
                <View className="candidate-card__head">
                  <View className="candidate-card__number">{String(index + 1).padStart(2, "0")}</View>
                  <View className="candidate-card__meta">
                    <Text>{candidate.joke.label}</Text>
                    <Text>{candidate.review.overall} 分</Text>
                  </View>
                </View>
                <View className="candidate-card__body">
                  {candidate.joke.setup.map((line) => <Text className="candidate-card__setup" key={line}>{line}</Text>)}
                  <Text className="candidate-card__punchline">
                    {candidate.joke.punchline} {candidate.joke.emoji}
                  </Text>
                  {candidate.joke.tag ? <Text className="candidate-card__tag">{candidate.joke.tag}</Text> : null}
                </View>
                <View className="candidate-card__actions">
                  <Button
                    className={`candidate-action tap-scale ${votes[candidate.joke.id] === "not_funny" ? "is-selected" : ""}`}
                    onClick={() => void voteCandidate(candidate, "not_funny")}
                  >👎</Button>
                  <Button
                    className={`candidate-action tap-scale ${votes[candidate.joke.id] === "funny" ? "is-selected is-funny" : ""}`}
                    onClick={() => void voteCandidate(candidate, "funny")}
                  >👍</Button>
                  <View className="candidate-card__spacer" />
                  <Button className="candidate-action candidate-action--text tap-scale" onClick={() => void copyCandidate(candidate.joke)}>
                    复制
                  </Button>
                  <Button
                    className="candidate-action candidate-action--text tap-scale"
                    openType="share"
                    onClick={() => onShareJokeChange(candidate.joke)}
                  >
                    分享
                  </Button>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="studio-empty">
            <Text className="studio-empty__glyph">“</Text>
            <Text>你的生活先发生，笑点随后就到。</Text>
          </View>
        )}
      </View>
    </View>
  );
}

"use client";

import { ArrowLeft, FlaskConical, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  feedbackReasonOptions,
  type ComparisonPair,
  type FeedbackReasonCode,
  type HumorLabMetrics
} from "../../src/platform/contracts";
import { getOrCreateClientSession } from "../../src/web/client-session";

type LabPair = ComparisonPair;

export function HumorLab() {
  const [sessionId, setSessionId] = useState("");
  const [metrics, setMetrics] = useState<HumorLabMetrics | null>(null);
  const [pair, setPair] = useState<LabPair | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingPair, setLoadingPair] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      setMetrics(await requestJson<HumorLabMetrics>("/api/lab/metrics"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "实验数据暂时不可用。");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const loadPair = useCallback(async (nextSessionId: string) => {
    setLoadingPair(true);
    try {
      setPair(await requestJson<LabPair>(`/api/compare?sessionId=${encodeURIComponent(nextSessionId)}`));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "盲选题暂时不可用。");
    } finally {
      setLoadingPair(false);
    }
  }, []);

  useEffect(() => {
    try {
      const nextSessionId = getOrCreateClientSession(window.localStorage, () => crypto.randomUUID());
      setSessionId(nextSessionId);
      void loadPair(nextSessionId);
    } catch {
      setError("浏览器存储不可用，暂时无法记录盲选。聚合数据仍可查看。");
      setLoadingPair(false);
    }
    void loadMetrics();
  }, [loadMetrics, loadPair]);

  const selectWinner = async (winnerId: string) => {
    if (!pair || !sessionId || loadingPair) return;
    setLoadingPair(true);
    setError(null);
    try {
      await requestJson("/api/compare", {
        method: "POST",
        body: JSON.stringify({
          comparisonId: pair.comparisonId,
          sessionId,
          jokeAId: pair.jokeA.id,
          jokeBId: pair.jokeB.id,
          winnerId
        })
      });
      await Promise.all([loadPair(sessionId), loadMetrics()]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "这次盲选没有保存成功。");
      setLoadingPair(false);
    }
  };

  const reasonLabels = buildReasonLabels();

  return (
    <div className="lab-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="MemePop 首页">
          <span className="brand-mark">M</span>
          <span>MemePop</span>
        </a>
        <nav className="mode-nav" aria-label="主要页面">
          <a href="/"><ArrowLeft aria-hidden="true" size={16} />刷梗</a>
          <a href="/?mode=studio">我的场景</a>
          <a className="is-active" href="/lab" aria-current="page">
            <FlaskConical aria-hidden="true" size={16} />实验室
          </a>
        </nav>
        <div className="ai-status">
          <Sparkles aria-hidden="true" size={17} />
          <span>只看聚合数据</span>
        </div>
      </header>

      <main className="lab-main">
        <section className="lab-title-band">
          <div>
            <span className="section-kicker">HUMOR LAB</span>
            <h1>笑点实验室</h1>
          </div>
          <button className="icon-button" type="button" onClick={() => void loadMetrics()} disabled={loadingMetrics} title="刷新数据" aria-label="刷新数据">
            <RefreshCw className={loadingMetrics ? "spin" : ""} aria-hidden="true" size={20} />
          </button>
        </section>

        {error ? <p className="lab-error" role="alert">{error}</p> : null}

        <section className="metric-strip" aria-label="核心指标">
          <Metric value={metrics?.overview.impressions ?? 0} label="曝光" loading={loadingMetrics} />
          <Metric value={metrics?.overview.feedback ?? 0} label="有效反馈" loading={loadingMetrics} />
          <Metric value={`${metrics?.overview.funnyRate ?? 0}%`} label="好笑率" loading={loadingMetrics} accent="coral" />
          <Metric value={metrics?.overview.comparisons ?? 0} label="盲选" loading={loadingMetrics} accent="blue" />
          <Metric value={metrics?.pool.published ?? 0} label="公开候选" loading={loadingMetrics} accent="lime" />
        </section>

        <section className="comparison-band" aria-labelledby="comparison-title">
          <div className="band-heading">
            <div>
              <span className="section-kicker">BLIND TEST</span>
              <h2 id="comparison-title">二选一</h2>
            </div>
            <span className="band-stat">累计 {metrics?.overview.comparisons ?? 0} 票</span>
          </div>

          {loadingPair ? (
            <div className="comparison-loading" role="status">
              <LoaderCircle className="spin" aria-hidden="true" size={26} />
              <span>正在换一组</span>
            </div>
          ) : pair ? (
            <div className="comparison-grid">
              <ComparisonOption label="A" joke={pair.jokeA} onSelect={() => void selectWinner(pair.jokeA.id)} />
              <ComparisonOption label="B" joke={pair.jokeB} onSelect={() => void selectWinner(pair.jokeB.id)} />
            </div>
          ) : null}
        </section>

        <section className="lab-data-grid">
          <div className="mechanism-table-wrap">
            <div className="band-heading">
              <div>
                <span className="section-kicker">MECHANISMS</span>
                <h2>机制表现</h2>
              </div>
              <span className="band-stat">池均分 {metrics?.pool.averagePublishedScore ?? 0}</span>
            </div>
            <div className="mechanism-table" role="table" aria-label="笑点机制表现">
              <div className="mechanism-row mechanism-head" role="row">
                <span role="columnheader">机制</span><span role="columnheader">反馈</span><span role="columnheader">命中</span><span role="columnheader">质量</span>
              </div>
              {(metrics?.mechanisms ?? []).map((mechanism) => (
                <div className="mechanism-row" role="row" key={mechanism.mechanismId}>
                  <span role="cell">{mechanism.label}</span>
                  <span role="cell">{mechanism.feedback}</span>
                  <span role="cell">{mechanism.funnyRate}%</span>
                  <span role="cell">{mechanism.averageQuality}</span>
                </div>
              ))}
              {!loadingMetrics && !metrics?.mechanisms.length ? <p className="data-empty">还没有机制数据。</p> : null}
            </div>
          </div>

          <div className="reason-breakdown">
            <div className="band-heading">
              <div>
                <span className="section-kicker">WHY</span>
                <h2>反馈原因</h2>
              </div>
            </div>
            <div className="reason-bars">
              {(metrics?.feedbackReasons ?? []).map((reason, index) => {
                const maximum = Math.max(1, ...(metrics?.feedbackReasons.map((item) => item.count) ?? [1]));
                return (
                  <div className="reason-bar-row" key={reason.reasonCode}>
                    <div className="reason-bar-label"><span>{reasonLabels[reason.reasonCode]}</span><strong>{reason.count}</strong></div>
                    <div className="reason-track"><i style={{ width: `${Math.max(5, (reason.count / maximum) * 100)}%` }} data-color={index % 4} /></div>
                  </div>
                );
              })}
              {!loadingMetrics && !metrics?.feedbackReasons.length ? <p className="data-empty">原因标签还在等第一票。</p> : null}
            </div>

            <div className="generation-readout">
              <span>生成运行 <strong>{metrics?.generation.runs ?? 0}</strong></span>
              <span>成功率 <strong>{metrics?.generation.successRate ?? 0}%</strong></span>
              <span>平均耗时 <strong>{formatDuration(metrics?.generation.averageDurationMs ?? 0)}</strong></span>
              <span>候选通过 <strong>{metrics?.generation.acceptedRate ?? 0}%</strong></span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric(props: { value: string | number; label: string; loading: boolean; accent?: string }) {
  return (
    <article className="metric-item" data-accent={props.accent ?? "yellow"}>
      <strong>{props.loading ? "…" : props.value}</strong>
      <span>{props.label}</span>
    </article>
  );
}

function ComparisonOption(props: {
  label: "A" | "B";
  joke: LabPair["jokeA"];
  onSelect(): void;
}) {
  return (
    <article className="comparison-card">
      <div className="comparison-label">{props.label}</div>
      <div className="comparison-copy">
        {props.joke.setup.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
        <h3>{props.joke.punchline} <span aria-hidden="true">{props.joke.emoji}</span></h3>
        {props.joke.tag ? <p className="candidate-tag">{props.joke.tag}</p> : null}
      </div>
      <button className="comparison-select" type="button" onClick={props.onSelect}>选 {props.label}</button>
    </article>
  );
}

function buildReasonLabels(): Record<FeedbackReasonCode, string> {
  return Object.fromEntries(
    Object.values(feedbackReasonOptions).flat().map((item) => [item.code, item.label])
  ) as Record<FeedbackReasonCode, string>;
}

async function requestJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  const body = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) throw new Error((body as { error?: string } | null)?.error ?? `请求失败 (${response.status})`);
  return body as T;
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) return `${milliseconds}ms`;
  return `${(milliseconds / 1_000).toFixed(1)}s`;
}

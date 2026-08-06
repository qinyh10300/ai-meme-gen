# MemePop

MemePop is an AI-assisted workflow for generating Chinese internet-style memes from everyday life scenes.

The first MVP focuses on the part that matters most: turning a subtle human situation into a sharp punchline.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. The web experience presents one joke at a time and learns a lightweight local preference signal from the two feedback buttons.

## CLI

The original punchline workflow is still available from the terminal:

```bash
npm run meme -- "第一次和喜欢的人吃饭，把饮料洒了"
npm run meme -- "把吐槽老板的话发错工作群了" --platform wechat --tone awkward
npm run meme -- "老板临下班改需求" --platform weibo --tone workplace
npm run meme -- "周一早上上班" --json
```

## Current Pipeline

```text
life scene
-> scene analysis
-> Chinese internet emotion signals
-> punchline operators
-> humor critic ranking
-> emoji decoration
-> preference-aware joke feed
-> meme format suggestions
```

The current version runs without an API key. Its feedback memory stays in the browser, and the generation pipeline remains deterministic so it is easy to test before adding a live LLM provider.

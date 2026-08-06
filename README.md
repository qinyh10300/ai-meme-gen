# MemePop

MemePop is an AI-assisted workflow for generating Chinese internet-style memes from everyday life scenes.

The current MVP focuses on the part that matters most: turning a believable Chinese life situation into a setup that can be re-read after a sharp final punchline.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. The web experience presents one joke at a time and learns a lightweight local preference signal from the two feedback buttons.

Run the editorial gate separately:

```bash
npm run jokes:audit
```

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
public Chinese internet signals (mechanisms only)
-> original setup and punchline corpus
-> structure quality controller
-> near-duplicate originality guard
-> emoji decoration
-> mechanism / format / topic preference learning
-> joke feed
```

The current version runs without an API key. Its feedback memory stays in the browser, and the production corpus is deterministic so every candidate can be audited before adding a live model writer. Research notes and content boundaries are documented in `research/chinese-humor-method.md`.

# MemePop Chinese Humor Method

## Goal

Build a high-quality Chinese joke feed without republishing platform content. Public material is used to identify mechanisms, evaluation signals, and common model failures. The production corpus contains newly written jokes only.

## Source Signals

- [弱智吧 2025 年度佳贴评选](https://tieba.baidu.com/p/10354221105): large-scale native-speaker voting and explicit originality checks suggest that novelty and collective judgment should be separate quality gates.
- [微博神评标准](https://weibointl.api.weibo.cn/static/shenping_detail.html): a strong comment adds a new angle or a precise summary; repetition, identity attacks, and empty approval are failure modes.
- [Telling the Whole Story](https://aclanthology.org/D19-1673/): Chinese humor evaluation benefits from scene, relationship, trigger, mechanism, and funniness annotations rather than a single score.
- [Chumor 2.0](https://aclanthology.org/2025.findings-acl.1122/): culturally grounded and situational jokes are central to Chinese humor, while cultural unawareness, pun misreading, and over-explanation remain common LLM failures.
- [OpenMic](https://arxiv.org/abs/2601.08288): creative retrieval should distill raw material into writing signals before generation; a separate quality controller should request targeted rewrites rather than regenerate everything.

## Content Boundary

1. Do not store scraped joke text in the product repository.
2. Do not perform synonym replacement on a source joke.
3. Store only mechanism-level observations and public source URLs.
4. Every production joke must contain a new setting, wording, and punchline path.
5. Reject identity attacks, regional stereotypes, sexualized minors, and shock content that has no comic reasoning.

## Agent Pipeline

```text
public platform signals
-> mechanism distiller
-> original setup/punchline writer
-> structure quality controller
-> near-duplicate guard
-> preference-aware feed selector
-> funny / not funny feedback
```

The browser only receives jokes that pass both the quality threshold and the similarity gate. Feedback changes the probability of mechanisms, formats, and life topics instead of blindly repeating a liked sentence.

## Quality Rubric

- Setup trust: the first reading must feel natural enough for the reader to commit to it.
- Reversal: the final line must force a quick reinterpretation, not merely add randomness.
- Clarity: the reader should reconstruct the hidden connection without an explanation.
- Rhythm: the shortest decisive phrase belongs at the end.
- Specificity: prefer concrete objects, roles, and social situations over generic emotions.
- Safety: make institutions, logic, and the narrator the main targets; avoid attacking identities.
- Originality: reject exact copies and high n-gram overlap within the production corpus.

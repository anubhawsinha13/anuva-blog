# Content Roadmap

Interactive post ideas for anuva.blog — each paired with a specific live simulation.

## Published

| Post | Simulation | Date |
|------|-----------|------|
| [How Text Becomes Tokens](/content/posts/how-text-becomes-tokens.mdx) | Live BPE tokenizer — type text, watch token blocks appear with IDs | Mar 13, 2026 |
| [Why Your LLM Forgets Things](/content/posts/why-your-llm-forgets.mdx) | Context window bar — drag slider to fill it up, watch oldest messages truncate | Mar 16, 2026 |

---

## Backlog (suggested build order)

### 1. How Temperature Changes Everything
**Demo:** Two side-by-side token probability bars. Same prompt, same model — but one at temperature 0, one at 1.0. Watch the distribution flatten or sharpen as you drag a slider. Tap "Sample" repeatedly to see how randomness plays out.
**Core concept:** Softmax temperature, greedy vs. sampled decoding.

### 2. What a Tool Call Actually Looks Like
**Demo:** An agent scratchpad that animates in real time — user message → model thinks → emits JSON tool call → tool returns result → model resumes. Step through it manually or let it run.
**Core concept:** Function calling, structured outputs, agentic loops.

### 3. How an Agent Thinks (ReAct Loop)
**Demo:** A visual flowchart that animates each step of the ReAct loop (Reason → Act → Observe → Reason...). User picks a task; the agent "runs" through several iterations visually, showing what changes at each node.
**Core concept:** ReAct pattern, chain-of-thought, tool use in agents.

### 4. Why RAG Beats Fine-Tuning for Most Problems
**Demo:** A split-screen: left is pure LLM (hallucinating on a domain-specific question), right is RAG (retrieves a relevant chunk and grounds the answer). User can type questions and see which chunks get retrieved.
**Core concept:** Embeddings, cosine similarity, retrieval-augmented generation vs. fine-tuning trade-offs.

### 5. How Embeddings Measure Meaning
**Demo:** A 2D vector space with ~20 pre-embedded words plotted as dots. User types a word; the nearest neighbours light up. Drag two words together to see cosine similarity score update live.
**Core concept:** Semantic similarity, vector search, embedding space geometry.

### 6. Why Prompt Order Matters (Lost in the Middle)
**Demo:** A long context window visualiser with the "important instruction" placed at different positions. A simulated attention heatmap shows how attention weights drop for content buried in the middle.
**Core concept:** Positional bias, attention, long-context limitations.

### 7. How Fine-Tuning Changes a Model's Voice
**Demo:** Before/after sliders on several prompts. Left: base model output. Right: fine-tuned model output. User can adjust a "fine-tuning intensity" knob to see style shift gradually.
**Core concept:** RLHF, instruction tuning, LoRA.

### 8. The Anatomy of a System Prompt
**Demo:** An annotated system prompt dissected into labelled sections (persona, constraints, output format, examples). Each section is toggleable — turn one off and watch the model output change.
**Core concept:** Prompt engineering, system prompt design, few-shot examples.

### 9. How Streaming Works (and Why It Feels Fast)
**Demo:** A live streaming text visualiser. Toggle between "buffered" (waits for full response) and "streamed" (tokens arrive one by one). Show the time-to-first-token vs. total latency tradeoff.
**Core concept:** Server-sent events, streaming APIs, perceived performance.

### 10. What Happens When You Chain Two Agents
**Demo:** A two-node pipeline: Planner agent → Executor agent. User submits a goal; watch the planner break it into steps, pass them to the executor, and see results flow back. Animate the message passing between agents.
**Core concept:** Multi-agent architecture, message passing, orchestration vs. execution split.

---

## Notes
- All demos should work with zero backend — pure client-side React/TypeScript.
- Aim for one interactive component per post, embedded inline in the prose.
- Each post ~800–1200 words; the simulation should be reachable within the first scroll.

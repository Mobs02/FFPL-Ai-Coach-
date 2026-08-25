@AGENTS.md

## graphify

This repo has a graphify knowledge graph in `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html).

- **Codebase questions first**: before grepping or reading files broadly to answer "how does X work," "what calls Y," "what connects to Z," run `graphify query "<question>"` first. Use `graphify path "A" "B"` for a shortest path between two concepts, and `graphify explain "<symbol>"` for a plain-language node summary. Fall back to grep/Read for exact string matches or when the graph doesn't have the answer.
- **Keep it current**: a git post-commit hook (installed via `graphify hook install`) automatically rebuilds the graph after every commit for code changes — no manual step needed for those. Doc/image changes (e.g. editing this file, or `AGENTS.md`) are NOT covered by that hook — after editing a doc/image file, run `graphify update .` manually so the graph doesn't drift.
- No API key is needed for either — see `~/.claude/skills/graphify/SKILL.md` if extraction subagents are ever required again (doc/image files only).

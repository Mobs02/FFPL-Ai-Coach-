@AGENTS.md

## graphify

This repo has a graphify knowledge graph in `graphify-out/` (graph.json, GRAPH_REPORT.md, graph.html).

- **Codebase questions first**: before grepping or reading files broadly to answer "how does X work," "what calls Y," "what connects to Z," run `graphify query "<question>"` first. Use `graphify path "A" "B"` for a shortest path between two concepts, and `graphify explain "<symbol>"` for a plain-language node summary. Fall back to grep/Read for exact string matches or when the graph doesn't have the answer.
- **Keep it current**: after making code edits (new files, renamed functions, structural changes), run `graphify update .` so the graph doesn't drift from the code. This only re-extracts changed files - it's cheap.
- No API key is needed for either — see `~/.claude/skills/graphify/SKILL.md` if extraction subagents are ever required again (doc/image files only).

#!/bin/bash
# Nudges toward the graphify knowledge graph (graphify-out/graph.json) instead of
# raw grep/read exploration, when the graph exists and can answer faster.
# Never blocks - it only adds context; the tool call always proceeds.

INPUT=$(cat)

if [ ! -f "graphify-out/graph.json" ]; then
  exit 0
fi

TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

case "$TOOL_NAME" in
  Grep)
    MSG="A graphify knowledge graph exists at graphify-out/graph.json. For questions about relationships, callers, architecture, or 'what connects to X', prefer 'graphify query \"<question>\"', 'graphify path \"A\" \"B\"', or 'graphify explain \"<symbol>\"' over grep - it's usually faster and gives you the audit trail (EXTRACTED/INFERRED). Plain text search is still fine for exact string matches."
    ;;
  Bash)
    CMD=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1)
    case "$CMD" in
      *grep*|*"rg "*|*ripgrep*)
        MSG="A graphify knowledge graph exists at graphify-out/graph.json. For codebase relationship questions (callers, dependencies, architecture), 'graphify query'/'path'/'explain' may answer this faster than grep."
        ;;
      *)
        exit 0
        ;;
    esac
    ;;
  Read|Glob)
    MSG="A graphify knowledge graph exists at graphify-out/graph.json. If this read is open-ended exploration (not a known specific file), 'graphify query \"<question>\"' or 'graphify explain \"<symbol>\"' can often answer directly from the graph instead."
    ;;
  *)
    exit 0
    ;;
esac

python3 -c "import json,sys; print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'additionalContext': sys.argv[1]}}))" "$MSG"
exit 0

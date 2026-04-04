#!/bin/bash
# 危険なコマンドをブロックするファイアウォール

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# ブロック対象パターン
dangerous_patterns=(
  "rm -rf /"
  "DROP TABLE"
  "DROP DATABASE"
  "git push --force origin main"
  "git push --force origin master"
)

for pattern in "${dangerous_patterns[@]}"; do
  if echo "$command" | grep -qi "$pattern"; then
    echo "🚫 ブロック：危険なコマンドを検出しました: $pattern" >&2
    exit 2
  fi
done

exit 0
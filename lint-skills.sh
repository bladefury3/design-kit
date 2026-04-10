#!/usr/bin/env bash
# lint-skills.sh — Validate all SKILL.md files for correctness and consistency.
# Usage: ./lint-skills.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

PASS=0
FAIL=0
TOTAL_SKILLS=0

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

pass() {
  printf "  ${GREEN}PASS${RESET}  %s — %s\n" "$1" "$2"
  PASS=$((PASS + 1))
}

fail() {
  printf "  ${RED}FAIL${RESET}  %s — %s\n" "$1" "$2"
  FAIL=$((FAIL + 1))
}

# Collect all SKILL.md files
SKILL_FILES=$(find . -maxdepth 2 -name 'SKILL.md' -not -path './shared/*' | sort)

if [ -z "$SKILL_FILES" ]; then
  echo "No SKILL.md files found."
  exit 1
fi

for skill_file in $SKILL_FILES; do
  skill_dir=$(dirname "$skill_file" | sed 's|^\./||')
  TOTAL_SKILLS=$((TOTAL_SKILLS + 1))

  printf "\n${BOLD}%s${RESET}\n" "$skill_dir"

  # --- Extract frontmatter (lines between first --- and second ---) ---
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file" | sed '1d;$d')

  if [ -z "$frontmatter" ]; then
    fail "$skill_dir" "No YAML frontmatter found"
    continue
  fi

  # --- Check required fields ---
  for field in name description allowed-tools; do
    if echo "$frontmatter" | grep -q "^${field}:"; then
      pass "$skill_dir" "has '$field'"
    else
      fail "$skill_dir" "missing required field '$field'"
    fi
  done

  # --- Check allowed-tools entries are valid ---
  # Extract tool names: lines starting with "  - " directly under "allowed-tools:"
  # Stop at any line that doesn't start with whitespace+dash (next YAML key or end)
  tools=$(echo "$frontmatter" | awk '/^allowed-tools:/{found=1; next} found && /^[[:space:]]+-/{sub(/^[[:space:]]+-[[:space:]]*/, ""); print} found && !/^[[:space:]]+-/{found=0}')

  if [ -z "$tools" ]; then
    fail "$skill_dir" "allowed-tools list is empty"
  else
    bad_tools=""
    while IFS= read -r tool; do
      # Skip empty lines
      [ -z "$tool" ] && continue
      case "$tool" in
        mcp__figma-console__figma_*|mcp__figma-console__figjam_*) ;;
        Read|Write|Edit|Bash|AskUserQuestion|Agent) ;;
        *) bad_tools="${bad_tools}${tool}, " ;;
      esac
    done <<< "$tools"

    if [ -z "$bad_tools" ]; then
      pass "$skill_dir" "all tool references valid"
    else
      fail "$skill_dir" "invalid tools: ${bad_tools%, }"
    fi
  fi

  # --- Check shared/ references point to existing files ---
  shared_refs=$(grep -oE 'shared/[a-zA-Z0-9_-]+\.md' "$skill_file" | sort -u || true)

  if [ -n "$shared_refs" ]; then
    missing=""
    while IFS= read -r ref; do
      if [ ! -f "$ref" ]; then
        missing="${missing}${ref}, "
      fi
    done <<< "$shared_refs"

    if [ -z "$missing" ]; then
      pass "$skill_dir" "all shared/ references exist"
    else
      fail "$skill_dir" "missing shared files: ${missing%, }"
    fi
  fi

  # --- Check for heading after frontmatter ---
  body=$(sed -n '/^---$/,/^---$/!p' "$skill_file" | sed '/^$/d')
  first_line=$(echo "$body" | head -1)

  if echo "$first_line" | grep -q '^# '; then
    pass "$skill_dir" "has heading after frontmatter"
  else
    fail "$skill_dir" "no heading (# ) after frontmatter"
  fi

  # --- Check for Definition of Done or Tone section ---
  if grep -qE '^## (Definition of Done|Tone)' "$skill_file"; then
    pass "$skill_dir" "has Definition of Done or Tone section"
  else
    fail "$skill_dir" "missing Definition of Done / Tone section"
  fi
done

# --- Summary ---
printf "\n${BOLD}---${RESET}\n"
if [ "$FAIL" -eq 0 ]; then
  printf "${GREEN}All checks passed.${RESET} "
else
  printf "${RED}Some checks failed.${RESET} "
fi
printf "%d skills checked, %d checks passed, %d checks failed\n" "$TOTAL_SKILLS" "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

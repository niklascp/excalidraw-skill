# Excalidraw skill

Create and render editable Excalidraw diagrams from Claude Code or GitHub
Copilot CLI. The skill uses the real Excalidraw engine in headless Chromium,
so rendered PNG and SVG output matches the hand-drawn editor style.

## What it provides

- Authoring guidance for `.excalidraw` JSON files
- `render.mjs` for PNG and SVG output
- `fit.mjs` for tightening oversized text boxes
- `list.mjs` for inspecting scene elements

## Requirements

- Node.js and npm
- GitHub CLI (`gh`) authenticated to the account that can access this private
  repository

Check authentication before installing:

```bash
gh auth status
```

If you use more than one GitHub account, switch to the account that owns this
repository:

```bash
gh auth switch --hostname github.com --user niklascp
```

## Install in Claude Code

Install the skill for all Claude Code projects on the machine:

```bash
gh skill install niklascp/excalidraw-skill SKILL.md \
  --agent claude-code --scope user

cd ~/.claude/skills/excalidraw
npm install
npx puppeteer browsers install chrome
```

Start a new Claude Code session. Invoke the skill explicitly with:

```text
/excalidraw
```

You can also ask Claude to create or render an Excalidraw diagram; it will
load the skill automatically when the request matches its description.

## Install in GitHub Copilot CLI

Install the skill for all Copilot CLI projects on the machine:

```bash
gh skill install niklascp/excalidraw-skill SKILL.md \
  --agent github-copilot --scope user

cd ~/.copilot/skills/excalidraw
npm install
npx puppeteer browsers install chrome
```

If Copilot CLI is already running, reload skills:

```text
/skills reload
```

Verify the installation:

```text
/skills info excalidraw
```

Invoke it directly with:

```text
/excalidraw
```

The explicit `SKILL.md` argument is intentional: this repository keeps the
skill at its root rather than under a `skills/<name>/` directory.

## Basic usage

Run commands from the installed skill directory:

```bash
node render.mjs diagram.excalidraw
node render.mjs diagram.excalidraw --svg
node fit.mjs diagram.excalidraw
node list.mjs diagram.excalidraw
```

For a complete authoring reference, see [`SKILL.md`](SKILL.md).

## Updating

Re-run the relevant `gh skill install` command with `--force`, then reinstall
dependencies if `package.json` changed:

```bash
gh skill install niklascp/excalidraw-skill SKILL.md \
  --agent github-copilot --scope user --force
```

## Official documentation

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [`gh skill install` reference](https://cli.github.com/manual/gh_skill_install)

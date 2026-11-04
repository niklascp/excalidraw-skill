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
- `npx` (included with npm)

## Install with `npx skills`

The `skills` CLI registers the skill with supported agents. It creates
symlinks by default, so one managed copy can be shared. Add `--copy` if you
want independent copies instead.

Because this repository has `SKILL.md` at its root, pass the repository
directly:

```bash
npx skills add niklascp/excalidraw-skill \
  --agent claude-code --global --yes

npx skills add niklascp/excalidraw-skill \
  --agent github-copilot --global --yes
```

The `--global` flag makes the skill available across projects. Omit it for a
project-local installation.

The JavaScript helpers also need their npm dependencies and Chromium. Find the
managed `excalidraw` directory with `npx skills list --global`, then run:

```bash
npm install
npx puppeteer browsers install chrome
```

## Claude Code

Start a new Claude Code session. Invoke the skill explicitly with:

```text
/excalidraw
```

You can also ask Claude to create or render an Excalidraw diagram; it will
load the skill automatically when the request matches its description.

## GitHub Copilot CLI

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

The repository keeps the skill at its root rather than under a
`skills/<name>/` directory.

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

Update the installed skill with:

```bash
npx skills update excalidraw --global
```

Re-run `npm install` if `package.json` changed.

## Official documentation

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Adding agent skills for GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [`gh skill install` reference](https://cli.github.com/manual/gh_skill_install)
- [`skills` CLI documentation](https://skills.sh/docs)

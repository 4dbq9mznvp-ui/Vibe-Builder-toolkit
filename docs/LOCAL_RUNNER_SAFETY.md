# Local Runner Safety Model

Last updated: 2026-06-04

## Purpose

Local runners are the future Level 2 capability layer. They may execute third-party tools such as document converters, parsers, code indexers, or UI/copy review helpers on the user's machine.

This document defines the safety contract before any third-party runner adapter is implemented. As of v0.8.0, `agentsmd capabilities run` can preview a runner plan and write first-party Codex handoff files, but actual third-party execution is still disabled.

## Baseline Rules

### No auto-install

`agentsmd` must not install third-party packages automatically.

Allowed:

- show install instructions
- print the package/tool name and source URL
- ask the user to install it manually
- later, run an explicit `--install` flow only after separate design and approval

Not allowed:

- running `npm install`, `pip install`, `uv tool install`, `brew install`, `curl | sh`, or similar commands as a side effect of `agentsmd capabilities demo`
- installing tools during `agentsmd gen`, `plan`, `run`, `status`, or any `agentsmd capabilities ...` command, including `capabilities run`

### No shell by default

Runner execution must not build shell command strings.

Preferred Node APIs:

- `spawn(file, args, { shell: false })`
- `execFile(file, args, { shell: false })`

Avoid:

- `exec(commandString)`
- `spawn(commandString, { shell: true })`
- string-concatenated command arguments
- unreviewed command separators such as `&&`, `||`, `;`, pipes, and redirects

If a tool truly requires a shell, the runner must document why and require a separate review before implementation.

### Explicit consent

Every runner must require clear user intent.

Required consent shape:

```bash
agentsmd capabilities run <id> --input <path> --yes
```

The command must print, before execution:

- capability id
- tool name and source URL
- input path
- output directory
- whether network access may occur
- whether secrets or environment variables may be read
- exact command and arguments, rendered as an argv list

Without `--yes`, the runner must preview the plan and exit without executing.

### Predictable output directory

Every runner must write into a predictable project-local directory:

```text
.agentsmd/runs/<capability-id>/<timestamp>/
```

Runner output must not overwrite source files by default.

Runner output should include:

- `input-manifest.json`
- `command.json`
- `stdout.txt`
- `stderr.txt`
- generated files
- `RUN.md` summary

### No untrusted input by default

Runners must treat user-provided files, URLs, archives, PDFs, Office files, and repo paths as potentially unsafe.

Default behavior:

- local file input only
- no remote URL fetching unless a runner explicitly supports and warns about it
- no archive extraction unless path traversal and size controls are implemented
- no sensitive document processing without warning
- no private, loopback, link-local, or metadata-service URL access from document converters

Document and parser runners must warn that conversion tools can perform I/O with the privileges of the current process.

### Tool availability check first

Before running a tool, the runner must check whether the command exists.

If missing, the runner should print:

- expected command name
- source URL
- manual install hint
- no automatic install

### Bounded execution

Every runner must define:

- timeout
- maximum input size
- maximum captured stdout/stderr size
- output directory cleanup guidance
- supported platforms if not cross-platform

### Source attribution

Every runner must preserve source attribution:

- tool name
- source URL
- license field from the capability card
- version output when available

### No benchmark claims

Runner output must not claim accuracy, speed, recall, or ranking quality unless the repo contains a reproducible benchmark and the command has run it.

## Runner readiness checklist

A runner is not ready until all items are true:

- [ ] Capability card has source URL, license, risks, and verification notes.
- [ ] Level 1 fixture demo exists and passes tests.
- [ ] Runner command is opt-in and requires `--yes` for execution.
- [ ] Runner never auto-installs dependencies.
- [ ] Runner uses argv arrays, not shell command strings.
- [ ] Runner defaults to `shell: false`.
- [ ] Runner writes only to `.agentsmd/runs/<capability-id>/<timestamp>/`.
- [ ] Runner records command, stdout, stderr, and generated outputs.
- [ ] Runner handles missing tools without failing unclearly.
- [ ] Runner has timeout and output-size limits.
- [ ] Runner warns before processing sensitive or untrusted input.
- [ ] Runner tests cover preview mode, missing tool, output path, and refusal without consent.

## First Runner Candidate

The first runner should be low-risk and local-only.

Recommended candidate:

`ai-writing-humanizer`

Reason:

- uses small text input
- can be implemented as a local transform or prompt export first
- does not need binary document parsing
- avoids network, archive, and file-format risk

Do not start with:

- `layout-aware-pdf-parse`: cloud parsing, document sensitivity, and file-size concerns
- `pdf-to-markdown`: untrusted document conversion risk
- `codebase-knowledge-graph` or `local-code-index`: larger install/runtime surface

## References

- Node.js `child_process` documentation: https://nodejs.org/api/child_process.html
- OWASP OS Command Injection Defense Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html
- Microsoft MarkItDown security considerations: https://github.com/microsoft/markitdown/blob/main/README.md
- npm scripts documentation: https://docs.npmjs.com/cli/using-npm/scripts/
- npm install documentation: https://docs.npmjs.com/cli/install/

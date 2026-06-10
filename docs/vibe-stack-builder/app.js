"use strict";

// Tool data comes from data.js (generated from /capabilities/*.json).
// CURATED_TOOLS are project pieces that are not capability cards (the CLI itself).
const CURATED_TOOLS = {
  agentsmd: {
    id: "agentsmd",
    title: "agentsmd",
    family: "agent-ops",
    goal: "Generate AGENTS.md, CLAUDE.md, Cursor rules, and .mcp.json from one project profile, then conduct trackable multi-step builds.",
    whenToUse: [
      "You use Codex, Claude Code, or Cursor on the same project and the instruction files drift.",
      "You want a reviewable build loop: prompt, verify, advance.",
    ],
    whenNotToUse: ["A throwaway script no agent will touch again."],
    risks: ["Generated files derive from agentsmd.config.json; never hand-edit them."],
    primaryTools: [
      {
        name: "agentsmd",
        url: "https://github.com/4dbq9mznvp-ui/Vibe-Builder-toolkit",
        license: "MIT",
        role: "This toolkit's first CLI",
      },
    ],
    searchTerms: ["agents.md", "에이전트 설정", "codex", "claude", "cursor", "mcp"],
    codexPrompt: "Use agentsmd to keep AGENTS.md/CLAUDE.md/Cursor/MCP config in sync from agentsmd.config.json, then plan and verify each build step.",
    verification: ["node --test passes", "agentsmd gen reproduces all four targets"],
    sources: ["https://github.com/4dbq9mznvp-ui/Vibe-Builder-toolkit"],
  },
};

const TOOLS = Object.assign({}, (window.VBT && window.VBT.tools) || {}, CURATED_TOOLS);

const FAMILY_LABEL = {
  documents: "문서",
  codebase: "코드베이스",
  "design-copy": "디자인·카피",
  "agent-ops": "에이전트",
  general: "일반",
};

const PROBLEMS = [
  { id: "codebase", label: "코드베이스 이해", tools: ["local-code-index", "codebase-knowledge-graph"], recipe: "repo-handoff" },
  { id: "documents", label: "문서 / PDF 처리", tools: ["pdf-to-markdown", "layout-aware-pdf-parse"], recipe: "document-content" },
  { id: "design", label: "디자인 감각 주입", tools: ["ui-taste-review"], recipe: "portfolio-site" },
  { id: "prompts", label: "프롬프트 / 스킬 관리", tools: ["agentsmd", "ai-writing-humanizer"], recipe: "copy-cleanup" },
  { id: "agent-flow", label: "AI 에이전트 워크플로우", tools: ["agentsmd"], recipe: "repo-handoff" },
  { id: "local-models", label: "로컬 / 오픈소스 모델", tools: [], planned: true },
  { id: "cost", label: "비용 / 토큰 절감", tools: [], planned: true },
  { id: "testing", label: "테스트 / 리팩토링 자동화", tools: [], planned: true },
];

const RECIPES = {
  "document-content": {
    id: "document-content",
    title: "문서에서 콘텐츠로",
    confidence: "High fit",
    reason: "문서 정리, Markdown 변환, 콘텐츠 재작성 신호가 감지됐습니다.",
    keywords: ["pdf", "문서", "자료", "콘텐츠", "markdown", "정리", "보고서", "논문", "요약"],
    stack: ["pdf-to-markdown", "layout-aware-pdf-parse", "ai-writing-humanizer"],
    stages: [
      {
        id: "input",
        label: "Input",
        role: "Bring in the source document and decide what must be preserved.",
        defaultOption: "source-document",
        options: [
          {
            id: "source-document",
            label: "PDF or document",
            status: "supported",
            tag: "input",
            prompt: "Treat the source document as the factual boundary for the task.",
            checks: ["Do not add facts that are not present in the source material."],
          },
        ],
      },
      {
        id: "parse",
        label: "Parse",
        role: "Turn the document into AI-readable Markdown.",
        defaultOption: "pdf-to-markdown",
        options: [
          {
            id: "pdf-to-markdown",
            label: "Markdown parser",
            tool: "pdf-to-markdown",
            status: "supported",
            tag: "lightweight",
            prompt: "Convert the supplied document into clean Markdown.",
            command: "agentsmd capabilities show pdf-to-markdown",
            checks: ["Preserve headings and lists."],
          },
          {
            id: "layout-aware-pdf-parse",
            label: "Layout-aware parse",
            tool: "layout-aware-pdf-parse",
            status: "supported",
            tag: "layout",
            prompt: "Use layout-aware parsing where tables, citations, or page positions matter.",
            command: "agentsmd capabilities demo layout-aware-pdf-parse",
            checks: ["Flag uncertain tables, citations, and page positions for manual review."],
          },
        ],
      },
      {
        id: "rewrite",
        label: "Rewrite",
        role: "Turn the parsed notes into builder-facing content.",
        defaultOption: "ai-writing-humanizer",
        options: [
          {
            id: "ai-writing-humanizer",
            label: "Humanized rewrite",
            tool: "ai-writing-humanizer",
            status: "supported",
            tag: "copy",
            prompt: "Rewrite the parsed document into concise builder-facing content without adding new facts.",
            command: "agentsmd capabilities prompt ai-writing-humanizer",
            checks: ["Cut generic AI phrasing while preserving factual claims."],
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        role: "Produce the prompt, commands, and checks for the next agent.",
        defaultOption: "codex-handoff",
        options: [
          {
            id: "codex-handoff",
            label: "Codex-ready handoff",
            status: "supported",
            tag: "handoff",
            prompt: "Package the workflow as an agent prompt with commands and verification checks.",
            checks: ["Keep private documents and user data out of public handoffs."],
          },
        ],
      },
    ],
    workflow: [
      "문서를 Markdown으로 변환해 AI가 읽을 수 있는 입력을 만든다.",
      "표, 인용, 레이아웃이 중요하면 layout-aware 파서를 보조로 쓴다.",
      "초안을 콘텐츠 톤으로 다시 정리하고 새 사실은 추가하지 않는다.",
    ],
    prompt: "Convert the supplied document into clean Markdown, preserve headings and lists, flag uncertain tables or citations, then rewrite the result into concise builder-facing content without adding new facts.",
    commands: [
      "agentsmd capabilities show pdf-to-markdown",
      "agentsmd capabilities demo layout-aware-pdf-parse",
      "agentsmd capabilities run ai-writing-humanizer --input draft.md",
    ],
    checks: [
      "원문에 없는 주장이나 수치를 추가하지 않았는지 확인",
      "표, 인용, 페이지 위치가 중요한 부분은 수동 검토 표시",
      "최종 결과가 Markdown 또는 콘텐츠 초안으로 바로 재사용 가능한지 확인",
    ],
  },
  "portfolio-site": {
    id: "portfolio-site",
    title: "포트폴리오 사이트 제작",
    confidence: "Strong starter",
    reason: "사이트 제작, 포트폴리오, 브랜드/소개 페이지 의도가 감지됐습니다.",
    keywords: ["포트폴리오", "사이트", "랜딩", "웹", "페이지", "소개", "브랜드", "홈페이지"],
    stack: ["ui-taste-review", "ai-writing-humanizer", "agentsmd"],
    stages: [
      {
        id: "intent",
        label: "Intent",
        role: "Fix who the builder is and what the site must prove.",
        defaultOption: "builder-intent",
        options: [
          {
            id: "builder-intent",
            label: "One-line intent",
            status: "supported",
            tag: "input",
            prompt: "State in one sentence who the builder is and what the site must prove.",
            checks: ["Keep the hero copy aligned with the one-line intent."],
          },
        ],
      },
      {
        id: "structure",
        label: "Structure",
        role: "Lock shared agent instructions before building pages.",
        defaultOption: "agent-instructions",
        options: [
          {
            id: "agent-instructions",
            label: "Agent instructions",
            tool: "agentsmd",
            status: "supported",
            tag: "setup",
            prompt: "Generate agent instruction files so Codex, Claude Code, and Cursor share the same project rules.",
            command: "agentsmd gen",
            checks: ["Generated files stay in sync with agentsmd.config.json."],
          },
        ],
      },
      {
        id: "copy",
        label: "Copy",
        role: "Write copy around concrete work, not generic AI hype.",
        defaultOption: "humanized-copy",
        options: [
          {
            id: "humanized-copy",
            label: "Humanized copy",
            tool: "ai-writing-humanizer",
            status: "supported",
            tag: "copy",
            prompt: "Rewrite site copy around concrete work and results, without generic AI hype.",
            command: "agentsmd capabilities prompt ai-writing-humanizer",
            checks: ["No invented metrics or claims in the copy."],
          },
        ],
      },
      {
        id: "ui-review",
        label: "UI Review",
        role: "Review visual taste before calling the site done.",
        defaultOption: "ui-taste-review",
        options: [
          {
            id: "ui-taste-review",
            label: "UI taste review",
            tool: "ui-taste-review",
            status: "supported",
            tag: "review",
            prompt: "Run a UI taste review pass before calling the site done.",
            command: "agentsmd capabilities prompt ui-taste-review",
            checks: ["Mobile layout has no overlapping buttons, cards, or text."],
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        role: "Produce the prompt, commands, and checks for the next agent.",
        defaultOption: "codex-handoff",
        options: [
          {
            id: "codex-handoff",
            label: "Codex-ready handoff",
            status: "supported",
            tag: "handoff",
            prompt: "Package the workflow as an agent prompt with commands and verification checks.",
            checks: ["Keep private documents and user data out of public handoffs."],
          },
        ],
      },
    ],
    workflow: [
      "첫 화면에서 무엇을 만드는 사람인지 바로 보이게 구성한다.",
      "카피는 구체적인 작업과 결과 중심으로 줄인다.",
      "Codex/Cursor가 읽을 프로젝트 지침을 생성하고 UI 리뷰 체크를 돌린다.",
    ],
    prompt: "Build a focused portfolio site for an AI-native builder. Start with the actual portfolio experience, keep copy specific, avoid generic AI hype, and run a UI taste review before calling it done.",
    commands: [
      "agentsmd gen",
      "agentsmd capabilities prompt ui-taste-review",
      "agentsmd capabilities run ai-writing-humanizer --input portfolio-copy.md --yes",
    ],
    checks: [
      "첫 화면에 정체성과 작업물이 바로 보이는지 확인",
      "영웅 문구가 과장된 생산성 문구로 흐르지 않는지 확인",
      "모바일에서 버튼/카드/문장이 겹치지 않는지 확인",
    ],
  },
  "repo-handoff": {
    id: "repo-handoff",
    title: "기존 레포를 에이전트에게 맡기기",
    confidence: "High fit",
    reason: "Codex, Claude, Cursor, repo handoff, 코드 이해 신호가 감지됐습니다.",
    keywords: ["레포", "repo", "codex", "claude", "cursor", "코드", "맡기", "분석", "온보딩"],
    stack: ["agentsmd", "local-code-index", "codebase-knowledge-graph"],
    stages: [
      {
        id: "fetch",
        label: "Fetch",
        role: "Sync the shared repository state before any agent work.",
        defaultOption: "git-fetch",
        options: [
          {
            id: "git-fetch",
            label: "git fetch",
            status: "supported",
            tag: "sync",
            prompt: "Sync the shared repository state before any agent work.",
            command: "git fetch",
            checks: ["Local branch matches the shared remote before editing."],
          },
        ],
      },
      {
        id: "instructions",
        label: "Instructions",
        role: "Pin project rules into generated agent instruction files.",
        defaultOption: "agent-instructions",
        options: [
          {
            id: "agent-instructions",
            label: "Agent instructions",
            tool: "agentsmd",
            status: "supported",
            tag: "setup",
            prompt: "Generate agent instruction files so every coding agent reads the same project rules.",
            command: "agentsmd gen",
            checks: ["Generated files stay in sync with agentsmd.config.json."],
          },
        ],
      },
      {
        id: "index",
        label: "Index",
        role: "Read the repo structure before editing anything.",
        defaultOption: "local-code-index",
        options: [
          {
            id: "local-code-index",
            label: "Local code index",
            tool: "local-code-index",
            status: "supported",
            tag: "lightweight",
            prompt: "Use a local code index to find related code and likely impact before editing.",
            command: "agentsmd capabilities show local-code-index",
            checks: ["Impact queries run before broad refactors."],
          },
          {
            id: "codebase-knowledge-graph",
            label: "Knowledge graph",
            tool: "codebase-knowledge-graph",
            status: "supported",
            tag: "structure",
            prompt: "Map module relationships before planning changes.",
            command: "agentsmd capabilities show codebase-knowledge-graph",
            checks: ["Graph output is treated as a map, not as verified behavior."],
          },
        ],
      },
      {
        id: "plan",
        label: "Plan",
        role: "Split the work into small, verifiable steps.",
        defaultOption: "build-plan",
        options: [
          {
            id: "build-plan",
            label: "Tracked plan",
            tool: "agentsmd",
            status: "supported",
            tag: "plan",
            prompt: "Split the work into small plan steps, each with a verification command.",
            command: 'agentsmd plan "repo handoff"',
            checks: ["Each step has a check command and done criterion."],
          },
        ],
      },
      {
        id: "verify",
        label: "Verify",
        role: "Run the documented check before advancing each step.",
        defaultOption: "step-verify",
        options: [
          {
            id: "step-verify",
            label: "Step verification",
            status: "supported",
            tag: "review",
            prompt: "Verify each step with the documented check command before advancing.",
            checks: ["The documented test command passes before reporting completion."],
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        role: "Produce the prompt, commands, and checks for the next agent.",
        defaultOption: "codex-handoff",
        options: [
          {
            id: "codex-handoff",
            label: "Codex-ready handoff",
            status: "supported",
            tag: "handoff",
            prompt: "Package the workflow as an agent prompt with commands and verification checks.",
            checks: ["Keep private documents and user data out of public handoffs."],
          },
        ],
      },
    ],
    workflow: [
      "작업 전 git fetch로 공유 repo 상태를 맞춘다.",
      "프로젝트 지침과 검증 명령을 generated agent files에 고정한다.",
      "코드 색인이나 지식 그래프로 구조를 먼저 읽고 작은 계획으로 진행한다.",
    ],
    prompt: "Read the generated agent instructions first, map the repo before editing, keep changes scoped to the requested task, and verify with the documented test command before reporting completion.",
    commands: [
      "git fetch",
      "agentsmd gen",
      "agentsmd capabilities show local-code-index",
      'agentsmd plan "repo handoff"',
    ],
    checks: [
      "agent instruction files가 최신인지 확인",
      "테스트 명령과 done criteria가 명확한지 확인",
      "큰 리팩터링보다 작은 plan step으로 나눴는지 확인",
    ],
  },
  "copy-cleanup": {
    id: "copy-cleanup",
    title: "AI 티 줄이는 카피 정리",
    confidence: "Exact match",
    reason: "카피, 문장, AI 티 제거, humanizer 신호가 감지됐습니다.",
    keywords: ["카피", "글", "문장", "ai 티", "human", "humanizer", "슬롭", "소개", "릴리즈"],
    stack: ["ai-writing-humanizer", "ui-taste-review", "agentsmd"],
    stages: [
      {
        id: "source",
        label: "Source",
        role: "Treat the provided text as the factual boundary.",
        defaultOption: "source-text",
        options: [
          {
            id: "source-text",
            label: "Source text",
            status: "supported",
            tag: "input",
            prompt: "Treat the provided text as the factual boundary; do not import outside claims.",
            checks: ["No new facts, metrics, or anecdotes are introduced."],
          },
        ],
      },
      {
        id: "meaning-lock",
        label: "Meaning Lock",
        role: "List the claims that must survive editing.",
        defaultOption: "claim-list",
        options: [
          {
            id: "claim-list",
            label: "Claim list",
            status: "supported",
            tag: "lock",
            prompt: "List the factual claims that must survive editing before rewriting anything.",
            checks: ["Every original claim survives or is explicitly flagged."],
          },
        ],
      },
      {
        id: "rewrite",
        label: "Rewrite",
        role: "Remove AI patterns while preserving meaning.",
        defaultOption: "ai-writing-humanizer",
        options: [
          {
            id: "ai-writing-humanizer",
            label: "Humanized rewrite",
            tool: "ai-writing-humanizer",
            status: "supported",
            tag: "copy",
            prompt: "Remove generic AI patterns while preserving meaning and factual claims.",
            command: "agentsmd capabilities prompt ai-writing-humanizer",
            checks: ["Repeated structures and empty adjectives are reduced."],
          },
        ],
      },
      {
        id: "ui-review",
        label: "UI Context Review",
        role: "Check copy in its real UI context where relevant.",
        defaultOption: "ui-context-review",
        options: [
          {
            id: "ui-context-review",
            label: "UI context review",
            tool: "ui-taste-review",
            status: "supported",
            tag: "review",
            prompt: "Check button, heading, and section copy in UI context where relevant.",
            command: "agentsmd capabilities prompt ui-taste-review",
            checks: ["UI copy reads naturally at its actual size and placement."],
          },
        ],
      },
      {
        id: "handoff",
        label: "Handoff",
        role: "Produce the prompt, commands, and checks for the next agent.",
        defaultOption: "codex-handoff",
        options: [
          {
            id: "codex-handoff",
            label: "Codex-ready handoff",
            status: "supported",
            tag: "handoff",
            prompt: "Package the workflow as an agent prompt with commands and verification checks.",
            checks: ["Keep private documents and user data out of public handoffs."],
          },
        ],
      },
    ],
    workflow: [
      "먼저 사실과 주장 범위를 고정한다.",
      "반복 구조, 과장, 빈 수식어를 제거한다.",
      "필요하면 UI 문맥에서 버튼, 헤딩, 섹션 카피까지 같이 점검한다.",
    ],
    prompt: "Edit this writing to remove generic AI patterns while preserving meaning and factual claims. Cut filler, repeated structures, vague hype, and obvious template phrasing.",
    commands: [
      "agentsmd capabilities demo ai-writing-humanizer",
      "agentsmd capabilities run ai-writing-humanizer --input draft.md --yes",
      "agentsmd capabilities prompt ui-taste-review",
    ],
    checks: [
      "새로운 사실, 지표, 경험담을 추가하지 않았는지 확인",
      "반복되는 문장 구조와 빈 형용사를 줄였는지 확인",
      "최종 톤이 실제 빌더가 설명하는 말투인지 확인",
    ],
  },
};

const FALLBACK = {
  id: "general-builder",
  title: "일반 AI 빌더 작업",
  confidence: "Needs detail",
  reason: "정확한 route가 잡히지 않아 기본 빌더 workflow를 제안합니다. 목표를 더 구체적으로 적으면 추천이 좋아집니다.",
  stack: ["agentsmd", "ui-taste-review", "ai-writing-humanizer"],
  stages: [
    {
      id: "goal",
      label: "Goal",
      role: "Fix the goal and the output format in one sentence.",
      defaultOption: "goal",
      options: [
        {
          id: "goal",
          label: "One-line goal",
          status: "supported",
          tag: "input",
          prompt: "Fix the goal and the output format in one sentence.",
          checks: ["The goal names a concrete deliverable."],
        },
      ],
    },
    {
      id: "instructions",
      label: "Instructions",
      role: "Align every coding agent on the same project rules.",
      defaultOption: "agent-instructions",
      options: [
        {
          id: "agent-instructions",
          label: "Agent instructions",
          tool: "agentsmd",
          status: "supported",
          tag: "setup",
          prompt: "Generate agent instruction files so every coding agent reads the same project rules.",
          command: "agentsmd gen",
          checks: ["Generated files stay in sync with agentsmd.config.json."],
        },
      ],
    },
    {
      id: "review",
      label: "Review",
      role: "Check card risks and verification notes before relying on output.",
      defaultOption: "card-review",
      options: [
        {
          id: "card-review",
          label: "Card review",
          status: "supported",
          tag: "review",
          prompt: "Check the public capability card risks and verification notes before relying on output.",
          checks: ["Risks and verification notes were read before use."],
        },
      ],
    },
    {
      id: "handoff",
      label: "Handoff",
      role: "Produce the prompt, commands, and checks for the next agent.",
      defaultOption: "codex-handoff",
      options: [
        {
          id: "codex-handoff",
          label: "Codex-ready handoff",
          status: "supported",
          tag: "handoff",
          prompt: "Package the workflow as an agent prompt with commands and verification checks.",
          checks: ["Keep private documents and user data out of public handoffs."],
        },
      ],
    },
  ],
  workflow: [
    "목표를 한 문장으로 고정하고, 산출물 형태를 정한다.",
    "agent files를 생성해 Codex, Claude Code, Cursor의 작업 기준을 맞춘다.",
    "결과물의 UI/카피 품질을 capability card로 검토한다.",
  ],
  prompt: "Turn the user's goal into a small build plan. Pick the minimum useful tool stack, produce Codex-ready instructions, and define a verification check before implementation.",
  commands: ["agentsmd gen", 'agentsmd capabilities search "builder workflow"', 'agentsmd plan "<goal>"'],
  checks: [
    "목표와 산출물 형태를 더 구체적으로 적으면 추천 품질이 올라갑니다.",
    "실행 전 공개 capability card의 risks와 verification을 확인하세요.",
    "private 문서나 사용자 데이터는 public handoff에 넣지 마세요.",
  ],
};

const EXAMPLES = [
  "PDF 자료 정리해서 콘텐츠로 바꾸고 싶어",
  "포트폴리오 사이트 만들고 싶어",
  "Claude와 Codex에게 기존 레포를 맡기고 싶어",
  "AI 티 안 나는 카피로 바꾸고 싶어",
];

const state = { mode: "explore", problem: PROBLEMS[0].id, tool: null, items: [], index: 0, stageOptions: {} };

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
};
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const famLabel = (f) => FAMILY_LABEL[f] || f;

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._id);
  toast._id = setTimeout(() => t.classList.remove("show"), 1500);
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast("복사했습니다");
  } catch {
    toast("복사 실패 — 직접 선택해 주세요");
  }
}

// ---- sidebar ----
function renderProblemNav() {
  const nav = $("#problem-nav");
  nav.innerHTML = "";
  PROBLEMS.forEach((p) => {
    const b = el("button", "problem" + (p.planned ? " is-planned" : ""));
    b.type = "button";
    b.setAttribute("aria-current", String(p.id === state.problem && state.mode === "explore"));
    const right = p.planned ? '<span class="tag-planned">준비 중</span>' : `<span class="count">${p.tools.length}</span>`;
    b.innerHTML = `<span>${esc(p.label)}</span>${right}`;
    b.addEventListener("click", () => selectProblem(p.id));
    nav.append(b);
  });
}

function selectProblem(id) {
  state.problem = id;
  state.mode = "explore";
  syncMode();
  renderProblemNav();
  renderExplore();
}

// ---- explore ----
function renderExplore() {
  const p = PROBLEMS.find((x) => x.id === state.problem) || PROBLEMS[0];
  $("#explore-title").textContent = p.label;
  const list = $("#tool-list");
  list.innerHTML = "";
  if (p.planned || !p.tools.length) {
    $("#explore-sub").textContent = "아직 공개 카드가 없는 영역입니다.";
    const e = el("div", "empty");
    e.innerHTML =
      '<p><span class="tag-planned">준비 중</span></p><p>이 문제 영역의 공개 capability card는 아직 없습니다. 로드맵에는 있지만, 데모는 실제 존재하는 카드만 보여줍니다.</p>';
    list.append(e);
    return;
  }
  $("#explore-sub").textContent = "카드를 선택하면 오른쪽에 판단 정보와 적용 방법이 나옵니다.";
  p.tools.forEach((tid) => {
    const t = TOOLS[tid];
    if (!t) return;
    const row = el("button", "tool-row");
    row.type = "button";
    row.dataset.tool = tid;
    row.setAttribute("aria-current", String(tid === state.tool));
    row.innerHTML = `<span class="fam">${esc(famLabel(t.family))}</span><span class="t-main"><span class="t-title">${esc(t.title)}</span><span class="t-goal">${esc(t.goal)}</span></span><span class="chev">&rsaquo;</span>`;
    row.addEventListener("click", () => selectTool(tid));
    list.append(row);
  });
  if (!state.tool || !p.tools.includes(state.tool)) selectTool(p.tools[0]);
  else markToolActive();
}

function markToolActive() {
  document.querySelectorAll(".tool-row").forEach((r) => r.setAttribute("aria-current", String(r.dataset.tool === state.tool)));
}

// ---- inspector ----
function selectTool(id) {
  state.tool = id;
  markToolActive();
  renderInspector(id);
}

function sectionList(title, items, warn) {
  if (!items || !items.length) return "";
  return `<div class="insp-section${warn ? " warn" : ""}"><h4>${esc(title)}</h4><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
}

function renderInspector(id) {
  const t = TOOLS[id];
  const empty = $("#insp-empty");
  const content = $("#insp-content");
  if (!t) {
    empty.hidden = false;
    content.hidden = true;
    return;
  }
  empty.hidden = true;
  content.hidden = false;
  const gh = (t.primaryTools && t.primaryTools[0] && t.primaryTools[0].url) || (t.sources && t.sources[0]) || "";
  const showCmd = `agentsmd capabilities show ${id}`;
  const connected = (t.primaryTools || [])
    .map(
      (pt) =>
        `<a class="tool-link" href="${esc(pt.url)}" target="_blank" rel="noopener"><span>${esc(pt.name)}${pt.license ? " · " + esc(pt.license) : ""}</span><span class="chev">&#8599;</span></a>`
    )
    .join("");
  content.innerHTML = `
    <div class="insp-head">
      <span class="fam">${esc(famLabel(t.family))}</span>
      <h3 class="insp-title">${esc(t.title)}</h3>
      <p class="insp-goal">${esc(t.goal)}</p>
    </div>
    <div class="insp-body">
      <div class="insp-actions">
        ${t.codexPrompt ? '<button class="btn" data-act="copy-codex" type="button">Copy Codex prompt</button>' : ""}
        <button class="btn" data-act="copy-show" type="button">Copy command</button>
        ${gh ? `<a class="btn" href="${esc(gh)}" target="_blank" rel="noopener">Open GitHub</a>` : ""}
      </div>
      ${sectionList("쓰는 상황", t.whenToUse)}
      ${sectionList("피해야 할 상황", t.whenNotToUse)}
      ${sectionList("리스크", t.risks, true)}
      ${connected ? `<div class="insp-section"><h4>연결 대상 (오픈소스)</h4>${connected}</div>` : ""}
      ${t.codexPrompt ? `<div class="insp-section"><h4>AI 작업 지시문</h4><pre class="code">${esc(t.codexPrompt)}</pre></div>` : ""}
      ${sectionList("검증", t.verification)}
    </div>`;
  const cc = content.querySelector('[data-act="copy-codex"]');
  if (cc) cc.addEventListener("click", () => copyText(t.codexPrompt));
  content.querySelector('[data-act="copy-show"]').addEventListener("click", () => copyText(showCmd));
}

// ---- recipes ----
function renderExamples() {
  const wrap = $("#examples");
  wrap.innerHTML = "";
  EXAMPLES.forEach((exmpl) => {
    const c = el("button", "chip");
    c.type = "button";
    c.textContent = exmpl.length > 18 ? exmpl.slice(0, 16) + "…" : exmpl;
    c.title = exmpl;
    c.addEventListener("click", () => {
      $("#goal-input").value = exmpl;
      compose();
    });
    wrap.append(c);
  });
}

function scoreRoute(route, text) {
  const n = text.toLowerCase();
  return (route.keywords || []).reduce((s, k) => (n.includes(k.toLowerCase()) ? s + 1 : s), 0);
}

function pickRoute(text) {
  if (!text) return FALLBACK;
  const arr = Object.values(RECIPES)
    .map((r) => ({ r, s: scoreRoute(r, text) }))
    .sort((a, b) => b.s - a.s || a.r.title.localeCompare(b.r.title));
  return arr[0] && arr[0].s > 0 ? arr[0].r : FALLBACK;
}

function block(label, innerHtml, withCopy) {
  const copy = withCopy ? '<button class="copy" type="button">Copy</button>' : "";
  return `<div class="block"><div class="block-head"><span class="label">${esc(label)}</span>${copy}</div><div class="block-body">${innerHtml}</div></div>`;
}

function uniqueStrings(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const value = String(item || "").trim();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function stageOption(stage, selectedId) {
  const options = stage.options || [];
  return options.find((o) => o.id === selectedId) || options.find((o) => o.id === stage.defaultOption) || options[0] || null;
}

function selectedStageOptions(route) {
  const saved = state.stageOptions[route.id] || {};
  return (route.stages || []).map((stage) => ({ stage, option: stageOption(stage, saved[stage.id]) })).filter((item) => item.option);
}

function composeRouteOutput(route) {
  const selected = selectedStageOptions(route);
  const stagePrompts = selected.map(({ stage, option }) => option.prompt && `${stage.label}: ${option.prompt}`).filter(Boolean);
  const optionCommands = selected
    .filter(({ option }) => option.status !== "planned")
    .map(({ option }) => option.command)
    .filter(Boolean);
  const optionChecks = selected.flatMap(({ option }) => option.checks || []);
  const prompt = stagePrompts.length
    ? `${route.prompt || ""}\n\nStage addendum:\n${stagePrompts.map((p) => `- ${p}`).join("\n")}`.trim()
    : route.prompt || "";
  return {
    workflow: route.workflow || [],
    prompt,
    commands: uniqueStrings([...(route.commands || []), ...optionCommands]),
    checks: uniqueStrings([...(route.checks || []), ...optionChecks]),
    selected,
  };
}

function validateRailTools(route) {
  return (route.stages || []).flatMap((stage) =>
    (stage.options || [])
      .filter((option) => option.status !== "planned" && option.tool && !TOOLS[option.tool])
      .map((option) => `${route.id}/${stage.id}/${option.id} -> ${option.tool}`)
  );
}

function renderRail(route) {
  if (!route.stages || !route.stages.length) return "";
  const saved = state.stageOptions[route.id] || {};
  const cars = route.stages
    .map((stage, idx) => {
      const selected = stageOption(stage, saved[stage.id]);
      const opts = (stage.options || [])
        .map((option) => {
          const active = selected && option.id === selected.id;
          const planned = option.status === "planned";
          return `<button class="rail-option" type="button" data-stage="${esc(stage.id)}" data-option="${esc(option.id)}" aria-pressed="${active}"><span>${esc(option.label)}</span><small>${esc(option.supportLabel || option.tag || (planned ? "planned" : "supported"))}</small></button>`;
        })
        .join("");
      const inspect =
        selected && selected.tool && TOOLS[selected.tool]
          ? `<button class="rail-inspect" type="button" data-tool="${esc(selected.tool)}">Inspect tool</button>`
          : "";
      return `<div class="rail-car">
        <div class="rail-step">${idx + 1}</div>
        <div class="rail-main">
          <div class="rail-label">${esc(stage.label)}</div>
          <p>${esc(stage.role)}</p>
          <div class="rail-options">${opts}</div>
          ${inspect}
        </div>
      </div>`;
    })
    .join("");
  const invalid = validateRailTools(route);
  const warning = invalid.length ? `<p class="rail-warning">Invalid public tool references: ${esc(invalid.join(", "))}</p>` : "";
  return `<div class="rail">${cars}</div>${warning}`;
}

function renderRecipe(route) {
  const r = $("#recipe");
  const stack = (route.stack || [])
    .map((tid, i) => {
      const t = TOOLS[tid];
      const name = t ? t.title : tid;
      return `<button class="stack-chip" type="button" data-tool="${esc(tid)}"><span class="n">${i + 1}</span><span>${esc(name)}</span></button>`;
    })
    .join("");
  const output = composeRouteOutput(route);
  const rail = renderRail(route);
  const wf = `<ol>${(output.workflow || []).map((w) => `<li>${esc(w)}</li>`).join("")}</ol>`;
  const checks = `<ul>${(output.checks || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`;
  const promptText = output.prompt || "";
  const cmdText = (output.commands || []).join("\n");
  r.innerHTML = `
    <div class="recipe-head"><h3>${esc(route.title)}</h3><span class="conf">${esc(route.confidence || "")}</span></div>
    <p class="insp-goal">${esc(route.reason || "")}</p>
    ${rail ? block("Workflow Rail", rail, false) : `<div class="stack-row">${stack}</div>`}
    ${block("Workflow", wf, false)}
    ${block("Agent Prompt", `<pre class="code" data-text>${esc(promptText)}</pre>`, true)}
    ${block("Next Commands", `<pre class="code" data-text>${esc(cmdText)}</pre>`, true)}
    ${block("Checks", checks, false)}`;
  r.querySelectorAll(".stack-chip").forEach((c) => c.addEventListener("click", () => selectTool(c.dataset.tool)));
  r.querySelectorAll(".rail-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.stageOptions[route.id] = Object.assign({}, state.stageOptions[route.id], { [btn.dataset.stage]: btn.dataset.option });
      renderRecipe(route);
    })
  );
  r.querySelectorAll(".rail-inspect").forEach((btn) => btn.addEventListener("click", () => selectTool(btn.dataset.tool)));
  r.querySelectorAll(".block").forEach((b) => {
    const btn = b.querySelector(".copy");
    const pre = b.querySelector("[data-text]");
    if (btn && pre) btn.addEventListener("click", () => copyText(pre.textContent));
  });
}

function compose() {
  renderRecipe(pickRoute($("#goal-input").value.trim()));
}

// ---- modes ----
function syncMode() {
  document.querySelectorAll(".mode-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === state.mode)));
  $("#view-explore").hidden = state.mode !== "explore";
  $("#view-recipes").hidden = state.mode !== "recipes";
}

function switchMode(mode) {
  state.mode = mode;
  syncMode();
  renderProblemNav();
  if (mode === "recipes" && !$("#recipe").children.length) compose();
}

// ---- command palette ----
function paletteData() {
  const items = [];
  Object.values(TOOLS).forEach((t) => items.push({ kind: "tool", id: t.id, label: t.title, terms: (t.searchTerms || []).join(" ") + " " + t.family + " " + t.goal }));
  PROBLEMS.forEach((p) => items.push({ kind: "problem", id: p.id, label: p.label, terms: p.label }));
  Object.values(RECIPES).forEach((rc) => items.push({ kind: "recipe", id: rc.id, label: rc.title, terms: (rc.keywords || []).join(" ") }));
  return items;
}

function openPalette() {
  $("#palette").hidden = false;
  const i = $("#palette-input");
  i.value = "";
  filterPalette("");
  i.focus();
}

function closePalette() {
  $("#palette").hidden = true;
}

function filterPalette(q) {
  const ql = q.toLowerCase().trim();
  const items = paletteData()
    .filter((it) => !ql || (it.label + " " + it.terms).toLowerCase().includes(ql))
    .slice(0, 12);
  state.items = items;
  state.index = 0;
  renderPalette();
}

function renderPalette() {
  const box = $("#palette-results");
  box.innerHTML = "";
  state.items.forEach((it, idx) => {
    const d = el("div", "p-item" + (idx === state.index ? " sel" : ""));
    d.innerHTML = `<span class="kind">${esc(it.kind)}</span><strong>${esc(it.label)}</strong>`;
    d.addEventListener("click", () => runPalette(it));
    box.append(d);
  });
}

function runPalette(it) {
  closePalette();
  if (it.kind === "tool") {
    const p = PROBLEMS.find((x) => x.tools.includes(it.id));
    if (p) state.problem = p.id;
    state.mode = "explore";
    syncMode();
    renderProblemNav();
    renderExplore();
    selectTool(it.id);
  } else if (it.kind === "problem") {
    selectProblem(it.id);
  } else if (it.kind === "recipe") {
    switchMode("recipes");
    renderRecipe(RECIPES[it.id]);
  }
}

// ---- events ----
document.querySelectorAll(".mode-tab").forEach((t) => t.addEventListener("click", () => switchMode(t.dataset.mode)));
$("#cmdk-open").addEventListener("click", openPalette);
$("#compose-btn").addEventListener("click", compose);
$("#goal-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") compose();
});
$("#palette-input").addEventListener("input", (e) => filterPalette(e.target.value));
$("#palette").addEventListener("click", (e) => {
  if (e.target.id === "palette") closePalette();
});

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    if ($("#palette").hidden) openPalette();
    else closePalette();
    return;
  }
  if ($("#palette").hidden) return;
  if (e.key === "Escape") closePalette();
  else if (e.key === "ArrowDown") {
    e.preventDefault();
    state.index = Math.min(state.index + 1, state.items.length - 1);
    renderPalette();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.index = Math.max(state.index - 1, 0);
    renderPalette();
  } else if (e.key === "Enter") {
    const it = state.items[state.index];
    if (it) runPalette(it);
  }
});

// ---- init ----
renderProblemNav();
renderExamples();
syncMode();
renderExplore();

const capabilities = {
  "pdf-to-markdown": {
    title: "PDF / Office to Markdown",
    family: "documents",
    summary: "문서를 AI가 읽기 쉬운 Markdown으로 바꿉니다.",
  },
  "layout-aware-pdf-parse": {
    title: "Layout-Aware PDF Parse",
    family: "documents",
    summary: "표, 다단, 인용 위치처럼 레이아웃이 중요한 PDF를 더 조심스럽게 다룹니다.",
  },
  "ai-writing-humanizer": {
    title: "AI Writing Humanizer",
    family: "design-copy",
    summary: "AI 티가 나는 문장을 줄이고 실제 빌더가 쓴 톤으로 다듬습니다.",
  },
  "ui-taste-review": {
    title: "UI Taste Review",
    family: "design-copy",
    summary: "뻔한 AI UI 느낌을 줄이도록 레이아웃, 위계, 간격, 카피를 점검합니다.",
  },
  "local-code-index": {
    title: "Local Code Index",
    family: "codebase",
    summary: "기존 레포를 더 적은 탐색으로 이해하도록 로컬 코드 색인을 준비합니다.",
  },
  "codebase-knowledge-graph": {
    title: "Codebase Knowledge Graph",
    family: "codebase",
    summary: "큰 코드베이스의 구조와 영향 범위를 그래프 관점으로 파악합니다.",
  },
  "agentsmd": {
    title: "agentsmd",
    family: "agent-ops",
    summary: "AGENTS.md, CLAUDE.md, Cursor rules, MCP 설정을 한 프로필에서 맞춥니다.",
  },
};

const routes = [
  {
    id: "document-content",
    title: "문서에서 콘텐츠로",
    confidence: "High fit",
    keywords: ["pdf", "문서", "자료", "콘텐츠", "markdown", "정리", "보고서", "논문"],
    stack: ["pdf-to-markdown", "layout-aware-pdf-parse", "ai-writing-humanizer"],
    workflow: [
      "문서를 Markdown으로 변환해 AI가 읽을 수 있는 입력을 만든다.",
      "표, 인용, 레이아웃이 중요하면 layout-aware 파서를 보조로 쓴다.",
      "초안을 콘텐츠 톤으로 다시 정리하고 새 사실은 추가하지 않는다.",
    ],
    prompt:
      "Convert the supplied document into clean Markdown, preserve headings and lists, flag uncertain tables or citations, then rewrite the result into concise builder-facing content without adding new facts.",
    commands: [
      "agentsmd capabilities show pdf-to-markdown",
      "agentsmd capabilities demo layout-aware-pdf-parse",
      "agentsmd capabilities run ai-writing-humanizer --input draft.md",
    ],
  },
  {
    id: "portfolio-site",
    title: "포트폴리오 사이트 제작",
    confidence: "Strong starter",
    keywords: ["포트폴리오", "사이트", "랜딩", "웹", "페이지", "소개", "브랜드"],
    stack: ["ui-taste-review", "ai-writing-humanizer", "agentsmd"],
    workflow: [
      "첫 화면에서 무엇을 만드는 사람인지 바로 보이게 구성한다.",
      "카피는 구체적인 작업과 결과 중심으로 줄인다.",
      "Codex/Cursor가 읽을 프로젝트 지침을 생성하고 UI 리뷰 체크를 돌린다.",
    ],
    prompt:
      "Build a focused portfolio site for an AI-native builder. Start with the actual portfolio experience, keep copy specific, avoid generic AI hype, and run a UI taste review before calling it done.",
    commands: [
      "agentsmd gen",
      "agentsmd capabilities prompt ui-taste-review",
      "agentsmd capabilities run ai-writing-humanizer --input portfolio-copy.md --yes",
    ],
  },
  {
    id: "repo-handoff",
    title: "기존 레포를 에이전트에게 맡기기",
    confidence: "High fit",
    keywords: ["레포", "repo", "codex", "claude", "cursor", "코드", "맡기", "분석", "온보딩"],
    stack: ["agentsmd", "local-code-index", "codebase-knowledge-graph"],
    workflow: [
      "작업 전 git fetch로 공유 repo 상태를 맞춘다.",
      "프로젝트 지침과 검증 명령을 generated agent files에 고정한다.",
      "코드 색인이나 지식 그래프로 구조를 먼저 읽고 작은 계획으로 진행한다.",
    ],
    prompt:
      "Read the generated agent instructions first, map the repo before editing, keep changes scoped to the requested task, and verify with the documented test command before reporting completion.",
    commands: [
      "git fetch",
      "agentsmd gen",
      "agentsmd capabilities show local-code-index",
      "agentsmd plan \"repo handoff\"",
    ],
  },
  {
    id: "copy-cleanup",
    title: "AI 티 줄이는 카피 정리",
    confidence: "Exact match",
    keywords: ["카피", "글", "문장", "ai 티", "human", "humanizer", "슬롭", "소개", "릴리즈"],
    stack: ["ai-writing-humanizer", "ui-taste-review", "agentsmd"],
    workflow: [
      "먼저 사실과 주장 범위를 고정한다.",
      "반복 구조, 과장, 빈 수식어를 제거한다.",
      "필요하면 UI 문맥에서 버튼, 헤딩, 섹션 카피까지 같이 점검한다.",
    ],
    prompt:
      "Edit this writing to remove generic AI patterns while preserving meaning and factual claims. Cut filler, repeated structures, vague hype, and obvious template phrasing.",
    commands: [
      "agentsmd capabilities demo ai-writing-humanizer",
      "agentsmd capabilities run ai-writing-humanizer --input draft.md --yes",
      "agentsmd capabilities prompt ui-taste-review",
    ],
  },
];

const fallbackRoute = {
  id: "general-builder",
  title: "일반 AI 빌더 작업",
  confidence: "Needs detail",
  stack: ["agentsmd", "ui-taste-review", "ai-writing-humanizer"],
  workflow: [
    "목표를 한 문장으로 고정하고, 산출물 형태를 정한다.",
    "agent files를 생성해 Codex, Claude Code, Cursor의 작업 기준을 맞춘다.",
    "결과물의 UI/카피 품질을 capability card로 검토한다.",
  ],
  prompt:
    "Turn the user's goal into a small build plan. Pick the minimum useful tool stack, produce Codex-ready instructions, and define a verification check before implementation.",
  commands: [
    "agentsmd gen",
    "agentsmd capabilities search \"builder workflow\"",
    "agentsmd plan \"<goal>\"",
  ],
};

const input = document.querySelector("#goal-input");
const button = document.querySelector("#compose-button");
const title = document.querySelector("#result-title");
const badge = document.querySelector("#confidence-badge");
const stackList = document.querySelector("#stack-list");
const workflowList = document.querySelector("#workflow-list");
const promptOutput = document.querySelector("#prompt-output");
const commandOutput = document.querySelector("#command-output");

function scoreRoute(route, text) {
  const normalized = text.toLowerCase();
  return route.keywords.reduce((score, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

function pickRoute(text) {
  const scored = routes
    .map((route) => ({ route, score: scoreRoute(route, text) }))
    .sort((a, b) => b.score - a.score);

  return scored[0].score > 0 ? scored[0].route : fallbackRoute;
}

function render(route) {
  title.textContent = route.title;
  badge.textContent = route.confidence;

  stackList.innerHTML = "";
  route.stack.forEach((id) => {
    const item = capabilities[id];
    const card = document.createElement("article");
    card.className = "stack-card";
    card.innerHTML = `
      <span class="family">${item.family}</span>
      <strong>${item.title}</strong>
      <p>${item.summary}</p>
    `;
    stackList.append(card);
  });

  workflowList.innerHTML = "";
  route.workflow.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    workflowList.append(li);
  });

  promptOutput.textContent = route.prompt;
  commandOutput.textContent = route.commands.join("\n");
}

button.addEventListener("click", () => {
  render(pickRoute(input.value.trim()));
});

document.querySelectorAll("[data-example]").forEach((exampleButton) => {
  exampleButton.addEventListener("click", () => {
    input.value = exampleButton.dataset.example;
    render(pickRoute(input.value));
  });
});

input.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    render(pickRoute(input.value.trim()));
  }
});

input.value = "PDF 자료 정리해서 콘텐츠로 바꾸고 싶어";
render(pickRoute(input.value));

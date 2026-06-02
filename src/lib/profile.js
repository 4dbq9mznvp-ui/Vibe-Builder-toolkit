import { join } from 'node:path';
import { readJSON, exists } from './util.js';

export const STARTER_PROFILE = {
  name: 'My Project',
  oneLiner: '한 줄 설명을 적으세요 (Korean is fine).',
  stack: ['Next.js', 'TypeScript', 'Supabase', 'Vercel'],
  packageManager: 'pnpm',
  commands: {
    install: 'pnpm install',
    dev: 'pnpm dev',
    test: 'pnpm test',
    lint: 'pnpm lint',
    typecheck: 'pnpm typecheck',
    build: 'pnpm build',
  },
  conventions: [
    '서버/클라이언트 컴포넌트 역할을 분리한다.',
    '데이터 접근은 서버에서 처리한다.',
  ],
  doNot: [
    '시크릿이나 .env 파일을 커밋하지 않는다.',
    'any 타입을 남용하지 않는다.',
    '검증되지 않은 사용자 입력을 신뢰하지 않는다.',
  ],
  security: [
    'Supabase Row Level Security(RLS)를 적용한다.',
    '모든 사용자 입력을 검증한다.',
    'API 라우트에 rate limit을 둔다.',
  ],
  reviewCriteria: [
    '타입체크와 린트를 통과한다.',
    '새 로직에는 테스트를 추가한다.',
    '에러 처리를 빠뜨리지 않는다.',
  ],
  priorities: ['인증 흐름 안정화', '핵심 도메인 모델 구현'],
  mcp: ['github', 'supabase'],
  outputLang: 'en',
};

export function loadProfile(cwd) {
  const p = join(cwd, 'agentsmd.config.json');
  if (!exists(p)) {
    throw new Error('No agentsmd.config.json found. Run `agentsmd init` first (or pass --out <dir>).');
  }
  const profile = readJSON(p);
  if (!profile.name) profile.name = 'My Project';
  return profile;
}

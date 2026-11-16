/* Mission content only (no logic). Engine: missions.js. Review table: build-mission-review.cjs → docs/missions-review.md.
 * targets / owner / rnr keys are existing organization, work-area or position IDs from company-data.js. */
(function (root) {
  'use strict';
  const data = {
    version: 1,
    roles: ['기획', '프로그래밍', '아트', 'QA', '사업·마케팅'],
    // The player's own unit per role. A role's targets never point inside its own unit.
    homeUnits: {
      기획: ['org-plan'],
      프로그래밍: ['org-program'],
      아트: ['org-art'],
      QA: ['org-devsupport'],
      '사업·마케팅': ['org-biz'],
    },
    defaults: { deadlineTurns: 6, overreachPenalty: { trust: -2 } },
    // What each unit is responsible for. Spoken by that unit when the player comes to the wrong desk.
    rnr: {
      'org-dev': { summary: '개발본부는 기획·개발·아트·개발지원 팀이 한 방향으로 게임을 만들도록 본부 차원의 방향과 우선순위를 잡아요.' },
      'org-plan': { summary: '기획팀은 게임의 규칙·콘텐츠·밸런스·레벨을 설계하고, 무엇이 재미있어야 하는지 정의해요.' },
      'org-plan-scenario': { summary: '시나리오파트는 세계관, 이야기, 대사를 써요.' },
      'org-plan-content': { summary: '컨텐츠파트는 퀘스트·이벤트처럼 플레이어가 즐길 거리를 기획해요.' },
      'org-plan-system': { summary: '시스템파트는 게임의 규칙과 동작 방식(조작, 성장, 경제 등)을 설계해요.' },
      'org-plan-balance': { summary: '밸런스파트는 난이도·수치·보상이 공정하고 재미있게 맞물리도록 조정해요.' },
      'org-plan-level': { summary: '레벨파트는 지형과 맵, 플레이어가 지나갈 동선과 목표 배치를 설계해요.' },
      'org-program': { summary: '개발팀은 기획을 실제로 동작하는 게임으로 구현하고, 기술적인 문제를 해결해요.' },
      'org-program-program': { summary: '프로그램파트는 게임 화면·조작·규칙을 코드로 구현해요.' },
      'org-program-server': { summary: '서버파트는 접속, 네트워크, 서버 안정성을 맡아요.' },
      'org-program-db': { summary: 'DB파트는 저장 데이터의 구조와 보관, 복구를 맡아요.' },
      'org-art': { summary: '아트팀은 게임의 시각적인 모든 것, 캐릭터·배경·UI 그림을 만들어요.' },
      'org-art-concept': { summary: '원화파트는 캐릭터와 세계의 첫 그림(콘셉트)을 그려 시각 방향을 정해요.' },
      'org-art-model': { summary: '모델링파트는 원화를 게임에 들어갈 2D·3D 형태로 만들어요.' },
      'org-art-background': { summary: '배경파트는 맵과 공간의 그림을 그려요.' },
      'org-art-ui': { summary: 'UI파트는 메뉴·버튼·아이콘처럼 화면 위 정보를 보기 쉽게 디자인해요.' },
      'org-devsupport': { summary: '개발지원팀은 개발이 잘 굴러가도록 품질 검증 같은 지원 업무를 맡아요.' },
      'org-devsupport-qa': { summary: 'QA파트는 게임을 직접 플레이하며 문제를 찾아 재현 조건과 영향 범위를 정리해 넘겨요.' },
      'org-pmo': { summary: 'PMO는 일정·범위·리스크를 관리하고, 여러 팀이 같은 목표로 움직이도록 조율해요.' },
      'org-publishing': { summary: '퍼블리싱본부는 웹 화면의 마크업·접근성·디자인 시스템을 맡아요.' },
      'area-pub-architecture': { summary: '기술 및 아키텍처 영역은 웹 화면의 구조와 컴포넌트를 만들어요.' },
      'area-pub-standards': { summary: '표준 및 접근성 영역은 누구나, 어떤 브라우저에서도 쓸 수 있게 화면을 점검해요.' },
      'area-pub-systems': { summary: '협업 및 시스템 구축 영역은 디자인 시스템과 작업 가이드 문서를 관리해요.' },
      'org-webservice': { summary: '웹서비스팀은 자사 게임의 공식 홈페이지·사전예약·업데이트 소개·이벤트 페이지를 기획·디자인·구현하고 운영해요. 웹 PM이 요청과 일정을, 웹 디자이너가 화면을, 웹 개발자가 구현과 유지보수를 맡아요. 로그인·예약 같은 서버 연동은 서버파트와, 웹 표준·접근성은 퍼블리싱본부와 함께해요.' },
      'org-biz': { summary: '사업본부는 게임이 시장과 유저를 만나는 방법, 사업과 마케팅을 맡아요.' },
      'org-biz-business': { summary: '사업팀은 출시 플랫폼, 제휴, 수익 구조 같은 사업 계획을 맡아요.' },
      'org-biz-marketing': { summary: '마케팅팀은 타깃 유저를 정하고, 게임을 알리는 메시지와 홍보를 맡아요.' },
      'org-support': { summary: '경영지원실은 회사 운영을 받쳐 주는 기획·인사·재무·총무·법무 업무를 맡아요.' },
      'org-support-strategy': { summary: '경영기획·전략팀은 회사의 사업 계획과 목표를 세워요.' },
      'org-support-hr': { summary: '인사(HR)·노무팀은 채용, 근무 제도, 노무 관리를 맡아요.' },
      'org-support-finance': { summary: '재무·회계·자금팀은 예산과 비용, 회사 자금을 관리해요.' },
      'org-support-facilities': { summary: '총무·관재팀은 사무 공간, 장비, 자산을 관리해요.' },
      'org-support-legal': { summary: '법무·홍보·구매팀은 계약·라이선스 검토, 대외 홍보, 외부 구매를 맡아요.' },
      'position-ceo': { summary: '대표는 회사의 방향과 최종 의사결정을 책임져요.' },
      'position-cbo': { summary: 'CBO는 회사 사업 전반의 방향을 책임지는 임원 직책이에요.' },
      'position-cfo': { summary: 'CFO는 회사 재무를 책임지는 임원 직책이에요.' },
      'position-cmo': { summary: 'CMO는 회사 마케팅 전반을 책임지는 임원 직책이에요.' },
      'position-cpo': { summary: 'CPO는 회사가 만드는 제품 전반을 책임지는 임원 직책이에요.' },
      'position-chro': { summary: 'CHRO는 회사의 사람과 조직 문화를 책임지는 임원 직책이에요.' },
      'position-publishing-head': { summary: '퍼블리싱본부장은 퍼블리싱본부의 업무를 이끌어요.' },
    },
    scenarios: [
      {
        id: 'proto-fun-not-landing',
        stage: 0,
        scope: 'cross',
        initiator: 'event',
        title: '테스터에게 핵심 재미가 전달되지 않아요',
        situation:
          '첫 사내 플레이테스트 결과가 나왔어요. 테스터 8명 중 6명이 10분 동안 "무엇을 해야 재미있는지 모르겠다"고 답했어요. 편지를 배달하는 순간까지 가 본 사람은 2명뿐이에요.',
        sources: [
          { title: 'Valve, GDC 2006 — Half-Life 2 디자인 프로세스(플레이테스트를 반복 실험으로 다루기)', url: 'https://cdn.fastly.steamstatic.com/apps/valve/2006/GDC2006_HL2DesignProcess.pdf' },
          { title: 'Brian Cronin, GDC 2026 — Playtesting Process for Ultra Small Teams', url: 'https://media.gdcvault.com/gdc2026/Slides/Cronin_Brian_PlaytestingProcessForUltraSmallTeams.pdf' },
          { title: 'Game Developer — 핵심 루프와 초기 프로토타이핑이 중요한 이유', url: 'https://www.gamasutra.com/design/how-supporting-core-loops-and-early-prototyping-are-key-to-your-game-s-success' },
        ],
        neglect: { delta: { quality: -4, trust: -4 }, log: '플레이테스트 결과를 방치했다. 무엇이 재미없는지 모른 채 제작이 이어졌다.' },
        byRole: {
          기획: {
            targets: ['org-devsupport-qa'],
            wrongHint: '테스터가 어디서 멈췄는지 관찰 기록을 가진 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 테스터별로 멈춘 지점을 정리해 왔어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '관찰 기록을 바탕으로 첫 3분 안에 배달의 재미를 겪도록 첫 플레이 동선을 다시 설계한다', effect: { cost: 2, delta: { quality: 8, stability: 2, fatigue: 10, xp: 8 } }, result: '첫 배달까지 걸리는 시간이 짧아졌다. 재미의 핵심을 앞에 두는 것이 기획의 일이라는 걸 확인했다.', next: null },
                  { kind: 'mine', label: '규칙을 하나만 남긴 작은 프로토타입으로 핵심 재미부터 다시 검증한다', effect: { cost: 2, delta: { quality: 5, trust: 4, fatigue: 8, xp: 8 } }, result: '군더더기를 걷어 내자 "배달 경로를 고르는 재미"가 살아났다. 다음 테스트에서 확인할 가설이 생겼다.', next: null },
                  { kind: 'mine', label: '튜토리얼 안내 문구만 우선 보강한다', effect: { cost: 1, delta: { quality: 3, fatigue: 4, xp: 3 } }, result: '안내는 늘었지만 재미 자체가 바뀌진 않았다. 문구로 설명해야 하는 재미는 아직 약하다는 신호다.', next: null },
                  { kind: 'other', owner: 'org-program-program', label: '조작감이 문제라고 보고 입력 처리 코드를 직접 고친다', feedback: '코드 수정은 프로그램파트의 일이에요. 기획은 "어떤 조작감이어야 하는지"를 기준으로 정리해 요청해요.' },
                  { kind: 'other', owner: 'org-pmo', label: '추가 테스트 일정과 인원을 직접 확정해 공지한다', feedback: '여러 팀의 일정과 자원을 맞추는 건 PMO의 일이에요. 기획은 필요한 테스트 내용과 이유를 PMO에 전달해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-plan'],
            wrongHint: '"무엇이 재미있어야 하는지" 의도를 설계한 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '기획팀이 "배달 경로를 고르는 순간"이 핵심 재미라고 설명해 줬어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '기획이 직접 수치와 규칙을 바꿔 볼 수 있게 설정 값을 데이터로 빼 준다', effect: { cost: 2, delta: { quality: 6, stability: 4, trust: 4, fatigue: 9, xp: 8 } }, result: '기획이 빌드를 기다리지 않고 여러 안을 시험할 수 있게 됐다. 반복 속도가 빨라졌다.', next: null },
                  { kind: 'mine', label: '조작 반응 지연을 측정해 체감을 해치는 지연부터 없앤다', effect: { cost: 1, delta: { quality: 4, stability: 3, fatigue: 6, xp: 4 } }, result: '입력이 0.2초 늦던 구간을 고쳤다. 재미 판단을 흐리던 기술적 잡음이 줄었다.', next: null },
                  { kind: 'mine', label: '다음 테스트 빌드에 테스터가 멈춘 위치와 시간을 기록하는 로그를 넣는다', effect: { cost: 1, delta: { stability: 4, trust: 3, fatigue: 5, xp: 4 } }, result: '다음 테스트부터는 감이 아니라 기록으로 문제 구간을 볼 수 있다.', next: null },
                  { kind: 'other', owner: 'org-plan-system', label: '핵심 규칙이 재미없다고 보고 규칙 자체를 직접 바꿔 구현한다', feedback: '게임 규칙을 정하는 건 기획팀 시스템파트의 일이에요. 프로그래머는 기술적으로 가능한 대안을 제안할 수 있어요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '테스트 결과 보고서를 직접 작성해 팀에 배포한다', feedback: '테스트 관찰과 결과 정리는 QA파트의 일이에요. 프로그래머는 재현에 필요한 기술 정보를 보태요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-plan-level'],
            wrongHint: '플레이어가 걸어갈 길과 목표를 어디에 둘지 설계한 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '레벨파트가 "테스터가 우체통을 못 찾고 헤맸다"고 알려 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '우체통과 편지의 실루엣·색 대비를 높여 화면에서 먼저 눈에 띄게 한다', effect: { cost: 2, delta: { quality: 7, fatigue: 9, xp: 8 } }, result: '배경에 묻히던 목표물이 한눈에 보인다. 시선을 이끄는 것도 아트의 책임이다.', next: null },
                  { kind: 'mine', label: '배달에 성공하는 순간의 이펙트를 더해 보상감을 키운다', effect: { cost: 1, delta: { quality: 4, fatigue: 5, xp: 4 } }, result: '성공했다는 느낌이 분명해졌다. 다만 목표를 찾는 문제는 그대로 남았다.', next: null },
                  { kind: 'mine', label: '아트를 뺀 회색 화면으로도 재미가 전달되는지 기획과 함께 확인한다', effect: { cost: 1, delta: { quality: 3, trust: 5, fatigue: 4, xp: 4 } }, result: '그림 문제인지 설계 문제인지 나눠 볼 수 있게 됐다. 작업 낭비를 줄였다.', next: null },
                  { kind: 'other', owner: 'org-plan-level', label: '맵 동선을 직접 바꿔 우체통 위치를 옮긴다', feedback: '맵 동선과 목표 배치는 레벨파트의 일이에요. 아트는 "어디가 잘 안 보이는지"를 근거로 제안해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '목표를 가리키는 화살표 기능을 직접 코드로 만든다', feedback: '기능 구현은 프로그램파트의 일이에요. 아트는 화살표가 어떻게 보여야 하는지 그림으로 준비해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-plan'],
            wrongHint: '테스트 결과를 받아 설계를 바꿀 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '기획팀이 "어디서, 왜 멈췄는지" 자세히 알고 싶어 해요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '테스터별로 멈춘 지점과 시간, 했던 말을 표로 정리해 전달한다', effect: { cost: 1, delta: { quality: 4, trust: 5, fatigue: 5, xp: 4 } }, result: '6명 중 5명이 같은 갈림길에서 멈췄다는 사실이 드러났다. 기획이 고칠 곳이 분명해졌다.', next: null },
                  { kind: 'mine', label: '수정본이 나오면 같은 조건으로 다시 테스트할 계획을 세운다', effect: { cost: 2, delta: { stability: 6, trust: 4, fatigue: 8, xp: 8 } }, result: '같은 조건으로 비교할 수 있어서 개선이 진짜인지 확인할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '설문 문항을 "무엇이 재미있었나" 중심으로 다시 짠다', effect: { cost: 1, delta: { quality: 3, stability: 2, fatigue: 4, xp: 4 } }, result: '불편한 점뿐 아니라 재미있던 순간도 모이기 시작했다.', next: null },
                  { kind: 'other', owner: 'org-plan-level', label: '테스터가 헤매던 구간의 레벨 배치를 직접 바꿔 다시 테스트한다', feedback: '레벨 배치는 레벨파트의 일이에요. QA는 문제와 근거를 넘기고, 고친 결과를 검증해요.' },
                  { kind: 'other', owner: 'org-pmo', label: '결과가 나쁘니 데모 공개 일정을 미루자고 직접 결정한다', feedback: '일정과 범위 조정은 PMO가 리더들과 함께 정해요. QA는 판단에 필요한 품질 근거를 제공해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-plan'],
            wrongHint: '이 게임의 핵심 재미를 정의한 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '기획팀과 테스트 결과를 함께 봤어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '타깃 유저 설문으로 이 장르에서 기대하는 재미가 무엇인지 확인한다', effect: { cost: 2, delta: { quality: 4, trust: 5, fatigue: 8, xp: 8 } }, result: '타깃 유저는 "느긋한 탐험"을 기대한다는 걸 알았다. 기획에 줄 시장 근거가 생겼다.', next: null },
                  { kind: 'mine', label: '비슷한 게임들의 첫 10분 경험을 비교한 자료를 만든다', effect: { cost: 1, delta: { quality: 3, trust: 3, fatigue: 5, xp: 4 } }, result: '다른 게임들은 5분 안에 핵심 행동을 경험시킨다는 비교 자료가 나왔다.', next: null },
                  { kind: 'mine', label: '핵심 재미가 정리될 때까지 홍보 메시지 확정을 미루자고 공유한다', effect: { cost: 1, delta: { stability: 3, trust: 4, fatigue: 2, xp: 3 } }, result: '아직 검증되지 않은 재미를 약속하는 홍보를 피했다.', next: null },
                  { kind: 'other', owner: 'org-plan', label: '핵심 재미를 설명하는 문장을 직접 고쳐 기획서에 반영한다', feedback: '기획서의 핵심 재미 정의는 기획팀의 일이에요. 마케팅은 유저 반응과 시장 근거를 전달해요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '테스터를 직접 모집해 테스트를 진행한다', feedback: '플레이테스트 진행과 관찰은 QA파트의 일이에요. 마케팅은 타깃에 맞는 테스터 조건을 제안할 수 있어요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'proto-scope-creep',
        stage: 0,
        scope: 'cross',
        initiator: 'event',
        title: '프로토타입에 넣을 기능이 계속 늘어나요',
        situation:
          '프로토타입 제작 2주차예요. 회의 때마다 "이것도 있으면 좋겠다"는 요청이 쌓여 기능 목록이 처음 5개에서 14개로 늘었어요. 정작 검증하려던 "배달 경로 고르기"는 절반만 만들어졌어요.',
        sources: [
          { title: 'Washburn 외, ICSE 2016 — "What Went Right and What Went Wrong": 게임 개발 포스트모템 155개 분석', url: 'https://www.microsoft.com/en-us/research/?p=238008' },
          { title: 'Game Developer — Dissecting the Postmortem(범위·기능 추가·자원 문제가 제작 문제의 약 23%)', url: 'https://www.gamedeveloper.com/audio/dissecting-the-postmortem-lessons-learned-from-two-years-of-game-development-self-reportage' },
        ],
        neglect: { delta: { quality: -3, stability: -5 }, log: '늘어난 기능 목록을 그대로 뒀다. 무엇 하나 끝나지 않은 채 일정이 밀렸다.' },
        byRole: {
          기획: {
            targets: ['org-pmo'],
            wrongHint: '여러 팀의 일정과 범위를 한꺼번에 보고 조율하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 기능 목록과 남은 일정을 펼쳐 보였어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '핵심 재미 검증에 꼭 필요한 기능만 남기고 나머지는 "나중에" 목록으로 옮긴다', effect: { cost: 2, delta: { quality: 6, stability: 5, fatigue: 8, xp: 8 } }, result: '기능이 14개에서 6개로 줄었다. 무엇을 뺄지 근거를 대는 것이 기획의 일이라는 걸 확인했다.', next: null },
                  { kind: 'mine', label: '새 요청마다 "검증하려는 질문에 답하는 기능인가"를 적는 기준표를 만든다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 5, xp: 4 } }, result: '요청이 들어와도 같은 기준으로 판단할 수 있게 됐다. 회의가 짧아졌다.', next: null },
                  { kind: 'mine', label: '들어온 요청을 모두 받아 기획서에 반영한다', effect: { cost: 2, delta: { quality: 2, stability: -4, fatigue: 12, xp: 3 } }, result: '기획서는 두꺼워졌지만 핵심 기능 구현은 더 늦어졌다. 모두를 만족시키는 범위는 없었다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '전체 일정을 2주 늘리기로 직접 정하고 공지한다', feedback: '일정 변경은 PMO가 각 팀 리더와 함께 정해요. 기획은 범위를 줄일지 늘릴지 판단할 근거를 줘요.' },
                  { kind: 'other', owner: 'org-program-program', label: '기능별 구현 기간을 직접 추정해 확정한다', feedback: '구현 기간 추정은 개발팀이 해요. 기획은 기능의 우선순위와 의도를 설명해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-pmo'],
            wrongHint: '늘어난 일과 남은 일정을 맞춰 범위를 조정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO와 남은 기능과 일정을 맞춰 봤어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '기능별 구현 기간과 기술 위험을 추정해 PMO에 전달한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 5, xp: 4 } }, result: '기능 3개가 남은 일정의 절반을 차지한다는 게 드러났다. 범위를 줄일 근거가 생겼다.', next: null },
                  { kind: 'mine', label: '프로토타입 코드는 버릴 코드로 보고 핵심 기능만 빠르게 만든다', effect: { cost: 2, delta: { quality: 6, stability: -2, fatigue: 9, xp: 8 } }, result: '핵심 재미를 빨리 시험할 수 있게 됐다. 다만 본 제작 때는 다시 짜야 한다.', next: null },
                  { kind: 'mine', label: '요청 들어온 기능을 모두 조금씩 동시에 만든다', effect: { cost: 2, delta: { quality: 2, stability: -3, fatigue: 12, xp: 3 } }, result: '손댄 기능은 많은데 끝난 기능은 없다. 검증할 수 있는 상태가 아니다.', next: null },
                  { kind: 'other', owner: 'org-plan', label: '구현이 어려운 기능은 직접 목록에서 지운다', feedback: '어떤 기능이 핵심인지는 기획팀이, 범위 조정은 PMO가 정해요. 개발은 비용과 위험을 알려 판단을 도와요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '남은 기능의 테스트 계획을 직접 짠다', feedback: '테스트 계획은 QA파트의 일이에요. 개발은 기능별로 확인해야 할 기술 조건을 알려 줘요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-pmo'],
            wrongHint: '작업량과 일정을 보고 무엇을 먼저 할지 조율하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "지금 기능 목록이면 아트 작업량이 일정을 넘는다"고 알려 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '프로토타입은 단순한 도형과 임시 그림으로 가고, 완성 그림은 검증 뒤로 미룬다', effect: { cost: 1, delta: { quality: 3, stability: 5, fatigue: 3, xp: 4 } }, result: '아트 작업 2주를 아꼈다. 재미가 검증되기 전에 완성 그림에 시간을 쓰지 않게 됐다.', next: null },
                  { kind: 'mine', label: '기능별로 필요한 그림 목록과 작업 시간을 정리해 PMO와 우선순위를 맞춘다', effect: { cost: 1, delta: { stability: 4, trust: 5, fatigue: 5, xp: 4 } }, result: '그림이 가장 많이 드는 기능이 어디인지 모두가 알게 됐다.', next: null },
                  { kind: 'mine', label: '요청된 화면의 완성 그림을 밤새 모두 그린다', effect: { cost: 2, delta: { quality: 4, stability: -2, fatigue: 16, xp: 3 } }, result: '그림은 늘었지만 지쳤다. 나중에 빠질 기능의 그림도 섞여 있었다.', next: null },
                  { kind: 'other', owner: 'org-plan', label: '그림이 많이 드는 기능을 직접 기능 목록에서 뺀다', feedback: '기능을 뺄지는 기획팀과 PMO가 정해요. 아트는 그림 작업량이라는 근거를 줘요.' },
                  { kind: 'other', owner: 'org-support-hr', label: '추가 아티스트를 직접 채용한다', feedback: '채용은 인사(HR)·노무팀의 일이에요. 아트는 필요한 인원과 실력 조건을 정리해 요청해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-pmo'],
            wrongHint: '범위를 줄일지 일정을 늘릴지 판단을 모으는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 범위를 줄이는 중이에요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '프로토타입이 답해야 할 질문 기준으로 꼭 테스트할 항목만 추린다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 4, xp: 4 } }, result: '테스트 계획이 절반으로 줄었다. 중요한 질문에 집중할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '기능이 하나 늘 때마다 테스트에 드는 시간을 PMO에 알린다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 5, xp: 4 } }, result: '테스트 시간이 숨은 비용이었다는 게 드러났다. 범위 판단이 정확해졌다.', next: null },
                  { kind: 'mine', label: '늘어난 기능 전부를 꼼꼼히 테스트하는 계획을 그대로 진행한다', effect: { cost: 2, delta: { quality: 1, stability: 3, fatigue: 12, xp: 3 } }, result: '빠짐없이 봤지만, 빠질 기능까지 시험하느라 시간이 많이 들었다.', next: null },
                  { kind: 'other', owner: 'org-plan', label: '테스트하기 어려운 기능을 직접 기획서에서 뺀다', feedback: '기획서 수정은 기획팀의 일이에요. QA는 "이 기능은 검증 비용이 크다"는 근거를 전달해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '버그가 많은 기능을 직접 고친다', feedback: '버그 수정은 개발팀의 일이에요. QA는 재현 방법과 영향 범위를 정리해 넘겨요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-plan'],
            wrongHint: '내가 요청한 기능이 지금 검증할 재미와 맞는지 판단할 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '기획팀이 "마케팅에서 요청한 공유 기능은 지금 검증할 질문과 거리가 멀다"고 설명했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '공유 기능 요청을 거두고, 마케팅에 꼭 필요한 시점을 기록해 둔다', effect: { cost: 1, delta: { stability: 4, trust: 5, fatigue: 2, xp: 4 } }, result: '프로토타입 범위가 가벼워졌다. 공유 기능은 공개 데모 계획에 다시 올리기로 했다.', next: null },
                  { kind: 'mine', label: '타깃 유저가 공유 기능을 정말 원하는지 설문으로 근거를 모은다', effect: { cost: 2, delta: { quality: 2, trust: 4, fatigue: 7, xp: 8 } }, result: '공유보다 "친구 기록 보기"를 원한다는 답이 많았다. 요청 내용 자체가 바뀌었다.', next: null },
                  { kind: 'mine', label: '마케팅 일정상 꼭 필요하다며 요청을 유지한다', effect: { cost: 1, delta: { stability: -3, trust: -2, fatigue: 3, xp: 2 } }, result: '요청은 남았지만 핵심 검증이 그만큼 늦어졌다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '기능 우선순위표를 직접 고쳐 공유 기능을 위로 올린다', feedback: '우선순위표와 범위는 PMO가 관리해요. 마케팅은 요청의 이유와 필요한 시점을 전달해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '친한 개발자에게 공유 버튼만 먼저 만들어 달라고 따로 부탁한다', feedback: '구현은 개발팀이 정해진 우선순위대로 해요. 따로 하는 부탁은 계획을 흔들어요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'proto-art-too-heavy',
        stage: 0,
        scope: 'cross',
        initiator: 'event',
        title: '캐릭터 그림이 너무 무거워 게임이 끊겨요',
        situation:
          '원화 콘셉트대로 만든 캐릭터를 시험용 보급형 휴대폰에 올렸더니 초당 프레임이 20까지 떨어지고 기기가 뜨거워졌어요. 목표는 초당 30프레임 이상이에요.',
        sources: [
          { title: 'Unity Blog — 모바일 게임을 위한 아티스트 모범 사례(폴리곤·텍스처 예산)', url: 'https://blog.unity.com/pt/technology/artists-best-practices-for-mobile-game-development' },
          { title: 'Meta for Developers — Art and performance(아트 제작 단계의 성능 예산)', url: 'https://developers.meta.com/horizon/design/art-and-performance/' },
        ],
        neglect: { delta: { quality: -2, stability: -6 }, log: '성능 문제를 뒤로 미뤘다. 그림은 계속 늘었고, 고칠 양도 함께 늘었다.' },
        byRole: {
          기획: {
            targets: ['org-program'],
            wrongHint: '프레임이 왜 떨어지는지 측정하고 기술적으로 판단할 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '개발팀이 측정 결과를 보여 줬어요. 캐릭터 그림이 성능의 대부분을 쓰고 있어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '한 화면에 동시에 나오는 캐릭터 수를 줄이는 쪽으로 레벨과 연출 기획을 바꾼다', effect: { cost: 2, delta: { quality: 3, stability: 6, fatigue: 8, xp: 8 } }, result: '복잡한 장면이 줄어 프레임이 안정됐다. 연출 의도는 다른 방법으로 살렸다.', next: null },
                  { kind: 'mine', label: '꼭 보여 줘야 하는 연출과 줄여도 되는 연출을 우선순위로 정리해 전달한다', effect: { cost: 1, delta: { quality: 2, stability: 4, trust: 4, fatigue: 4, xp: 4 } }, result: '아트와 개발이 무엇을 지키고 무엇을 덜어낼지 같은 기준으로 판단하게 됐다.', next: null },
                  { kind: 'mine', label: '성능은 나중에 최적화하면 된다며 기획을 그대로 둔다', effect: { cost: 1, delta: { quality: 1, stability: -4, fatigue: 2, xp: 2 } }, result: '당장은 편했지만, 나중에 고칠 그림과 장면이 계속 쌓였다.', next: null },
                  { kind: 'other', owner: 'org-art-model', label: '캐릭터 폴리곤 수를 직접 정해 줄이라고 지시한다', feedback: '그림에 쓸 수 있는 예산과 줄이는 방법은 모델링파트와 개발팀이 함께 정해요. 기획은 화면에서 무엇이 중요한지 알려요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '목표 기기를 고사양 휴대폰으로 바꾸자고 직접 정한다', feedback: '어떤 기기와 플랫폼을 노릴지는 사업팀이 시장을 보고 정해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-art-model'],
            wrongHint: '캐릭터를 게임에 들어갈 형태로 만드는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '모델링파트와 캐릭터 데이터를 함께 열어 봤어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '목표 기기가 버틸 수 있는 폴리곤·텍스처 예산을 수치로 정해 아트팀과 공유한다', effect: { cost: 1, delta: { stability: 6, trust: 5, fatigue: 5, xp: 4 } }, result: '아트팀이 "어디까지 그려도 되는지"를 숫자로 알게 됐다.', next: null },
                  { kind: 'mine', label: '멀리 있는 캐릭터는 단순한 모델로 바꿔 그리는 기능(LOD)을 만든다', effect: { cost: 2, delta: { quality: 4, stability: 5, fatigue: 9, xp: 8 } }, result: '가까이 있는 캐릭터의 품질은 지키면서 프레임을 되찾았다.', next: null },
                  { kind: 'mine', label: '프레임 제한을 걸어 수치만 맞춘다', effect: { cost: 1, delta: { quality: -2, stability: 2, fatigue: 3, xp: 2 } }, result: '숫자는 맞췄지만 화면이 뚝뚝 끊겨 보인다. 원인은 그대로 남았다.', next: null },
                  { kind: 'other', owner: 'org-art-model', label: '캐릭터 모델을 직접 열어 폴리곤을 줄인다', feedback: '모델 수정은 모델링파트의 일이에요. 개발은 예산 수치와 측정 도구를 제공해요.' },
                  { kind: 'other', owner: 'org-art-concept', label: '콘셉트를 단순한 그림체로 바꾸자고 직접 정한다', feedback: '그림체와 시각 방향은 원화파트가 정해요. 개발은 기술적 제약을 알려요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-program'],
            wrongHint: '기기에서 무엇이 성능을 잡아먹는지 측정할 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '개발팀이 기기별 측정 결과와 가장 무거운 부분을 보여 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '정해진 예산 안에서 실루엣은 지키고, 세부 묘사는 텍스처로 옮긴다', effect: { cost: 2, delta: { quality: 6, stability: 5, fatigue: 10, xp: 8 } }, result: '보기에는 거의 그대로인데 훨씬 가벼워졌다.', next: null },
                  { kind: 'mine', label: '원화 단계부터 예산을 반영한 스타일 가이드를 만든다', effect: { cost: 2, delta: { quality: 3, stability: 6, trust: 3, fatigue: 8, xp: 8 } }, result: '앞으로 그릴 캐릭터는 처음부터 기기에 맞게 나온다.', next: null },
                  { kind: 'mine', label: '고사양 기기용 그림은 그대로 두고 저사양 대응은 나중에 하자고 한다', effect: { cost: 1, delta: { stability: -4, fatigue: 2, xp: 2 } }, result: '지금은 손이 덜 가지만, 대응할 그림이 계속 늘어난다.', next: null },
                  { kind: 'other', owner: 'org-program-program', label: '렌더링 코드를 직접 고쳐 가볍게 만든다', feedback: '렌더링 코드는 개발팀 프로그램파트가 맡아요. 아트는 어떤 표현을 지켜야 하는지 알려요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '지원 기기 목록에서 저사양 휴대폰을 빼자고 직접 정한다', feedback: '지원 기기 결정은 사업팀이 시장 규모를 보고 해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-program'],
            wrongHint: '측정한 성능 문제를 받아 원인을 고칠 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '개발팀이 재현 조건을 더 알고 싶어 해요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '기기별·장면별 프레임과 발열을 같은 조건으로 측정해 표로 넘긴다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 5, xp: 4 } }, result: '캐릭터가 5명 넘게 모이는 장면에서만 급격히 떨어진다는 게 드러났다.', next: null },
                  { kind: 'mine', label: '목표 기기 목록을 받아 저사양 기기 테스트 일정을 따로 잡는다', effect: { cost: 2, delta: { stability: 6, trust: 3, fatigue: 8, xp: 8 } }, result: '저사양 기기 문제를 매번 같은 방식으로 잡아낼 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '"느리다"는 느낌만 적어 버그로 올린다', effect: { cost: 1, delta: { stability: 1, trust: -2, fatigue: 2, xp: 2 } }, result: '개발팀이 재현하지 못해 다시 물어 왔다. 수치가 없으면 고칠 곳을 찾기 어렵다.', next: null },
                  { kind: 'other', owner: 'org-art-model', label: '가장 무거운 캐릭터를 직접 단순한 모델로 바꿔 본다', feedback: '모델 수정은 모델링파트의 일이에요. QA는 바꾼 결과가 나아졌는지 검증해요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '저사양 기기는 지원하지 않는다고 직접 결론 낸다', feedback: '지원 기기 결정은 사업팀의 일이에요. QA는 기기별 품질 근거를 제공해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-program'],
            wrongHint: '어떤 기기에서 게임이 제대로 돌아갈지 기술적으로 답해 줄 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '개발팀이 "보급형 휴대폰에서는 지금 그림이 무겁다"고 설명했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '타깃 유저가 실제로 쓰는 기기 분포를 조사해 개발팀과 목표 기기를 다시 맞춘다', effect: { cost: 2, delta: { quality: 2, stability: 5, trust: 5, fatigue: 7, xp: 8 } }, result: '타깃 유저의 절반이 보급형 휴대폰을 쓴다는 근거로 목표를 확정했다.', next: null },
                  { kind: 'mine', label: '홍보 영상은 목표 기기에서 실제로 보이는 화면으로 만들기로 한다', effect: { cost: 1, delta: { stability: 2, trust: 5, fatigue: 3, xp: 4 } }, result: '실제와 다른 화면을 약속하는 홍보 위험을 피했다.', next: null },
                  { kind: 'mine', label: '고사양 기기만 지원하고 마케팅도 그쪽에 맞춘다', effect: { cost: 1, delta: { stability: 2, trust: -3, fatigue: 2, xp: 3 } }, result: '제작은 편해졌지만 만날 수 있는 유저가 크게 줄었다.', next: null },
                  { kind: 'other', owner: 'org-art-concept', label: '그림체를 더 단순하게 바꾸라고 직접 요청서를 쓴다', feedback: '그림체 결정은 아트팀 원화파트의 일이에요. 사업·마케팅은 시장과 유저 근거를 전달해요.' },
                  { kind: 'other', owner: 'org-pmo', label: '최적화 작업 일정을 직접 정해 개발팀에 내려보낸다', feedback: '팀 간 일정 조율은 PMO가 해요. 사업·마케팅은 언제까지 무엇이 필요한지 알려요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'proto-asset-license',
        stage: 0,
        scope: 'cross',
        initiator: 'event',
        title: '출처를 모르는 폰트와 효과음이 들어 있어요',
        situation:
          '다음 주에 외부 퍼블리셔 앞에서 프로토타입을 시연해요. 그런데 빌드에 들어간 무료 폰트 1개와 효과음 6개를 어디서 받았는지, 상업용으로 써도 되는지 아무도 몰라요.',
        sources: [
          { title: 'SIL — OFL FAQ(오픈 폰트 라이선스: 게임에 함께 배포할 때의 조건)', url: 'https://openfontlicense.org/ofl-faq/' },
          { title: 'Unity — Asset Store 이용 약관과 EULA(에셋 사용·배포 범위)', url: 'https://unity.com/legal/as-terms' },
        ],
        neglect: { delta: { stability: -3, trust: -6 }, log: '출처 확인을 미룬 채 시연했다. 퍼블리셔가 에셋 권리를 물었을 때 답하지 못했다.' },
        byRole: {
          기획: {
            targets: ['org-support-legal'],
            wrongHint: '계약과 라이선스를 검토하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "출처와 라이선스를 모르는 에셋은 외부 시연에 쓸 수 없다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: 'UI와 대사에 쓰인 폰트·텍스트 에셋 목록을 출처와 함께 정리해 넘긴다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 5, xp: 4 } }, result: '법무팀이 확인해야 할 대상이 분명해졌다.', next: null },
                  { kind: 'mine', label: '시연 범위를 라이선스가 확인된 콘텐츠만으로 다시 구성한다', effect: { cost: 2, delta: { quality: -1, stability: 6, trust: 4, fatigue: 8, xp: 8 } }, result: '보여 줄 장면은 조금 줄었지만, 시연에서 권리 문제가 생길 일은 없어졌다.', next: null },
                  { kind: 'mine', label: '프로토타입은 내부용이라 괜찮다며 그대로 시연을 준비한다', effect: { cost: 1, delta: { stability: -5, trust: -4, fatigue: 1, xp: 1 } }, result: '외부 시연은 내부용이 아니다. 위험을 그대로 안고 가게 됐다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '라이선스 문서를 직접 해석해 써도 된다고 결론 낸다', feedback: '라이선스의 법적 판단은 법무팀의 일이에요. 기획은 어디에 어떻게 쓰는지 정보를 줘요.' },
                  { kind: 'other', owner: 'org-art-ui', label: '대체 폰트를 직접 골라 UI에 적용한다', feedback: '화면 폰트 선택은 아트팀 UI파트가 맡아요. 기획은 글자 크기·가독성 같은 조건을 전달해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-support-legal'],
            wrongHint: '외부 자료를 써도 되는지 권리를 확인하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "빌드에 무엇이 들어 있는지부터 알아야 한다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '빌드에 포함된 폰트·사운드·라이브러리 파일 목록을 자동으로 뽑아 넘긴다', effect: { cost: 1, delta: { stability: 6, trust: 5, fatigue: 5, xp: 4 } }, result: '빠진 파일 없이 전체 목록이 나왔다. 다음 빌드부터는 매번 자동으로 나온다.', next: null },
                  { kind: 'mine', label: '출처 불명 파일을 빼고 기본 리소스로 대체해도 동작하게 만든다', effect: { cost: 2, delta: { quality: -1, stability: 5, fatigue: 8, xp: 8 } }, result: '문제가 된 파일 없이도 빌드가 돌아간다. 시연 일정을 지킬 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '오픈소스 라이브러리의 라이선스 파일을 빌드에 함께 넣는다', effect: { cost: 1, delta: { stability: 3, trust: 3, fatigue: 3, xp: 4 } }, result: '라이브러리 고지 조건은 챙겼다. 폰트와 효과음 확인은 아직 남았다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '문제없어 보이는 파일은 직접 판단해 남긴다', feedback: '써도 되는지에 대한 판단은 법무팀이 해요. 개발은 파일 목록과 사용 위치를 정확히 알려요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '유료 폰트 라이선스를 직접 결제해 산다', feedback: '외부 구매는 법무·홍보·구매팀이 계약 조건과 함께 처리해요. 개발은 필요한 파일 형식과 사용 범위를 알려요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-support-legal'],
            wrongHint: '그림이나 소리의 사용 권리를 검토하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "직접 만든 것과 받아 온 것을 먼저 나눠 달라"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '직접 만든 그림과 외부에서 받은 그림을 구분해 출처 목록을 만든다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 5, xp: 4 } }, result: '확인할 대상이 7개에서 2개로 줄었다.', next: null },
                  { kind: 'mine', label: '출처 불명 그림과 효과를 직접 만든 임시 그림으로 바꾼다', effect: { cost: 2, delta: { quality: 2, stability: 5, fatigue: 10, xp: 8 } }, result: '시연 빌드에서 권리 걱정이 사라졌다. 우리 게임만의 느낌도 조금 더 살았다.', next: null },
                  { kind: 'mine', label: '비슷해 보이게 살짝 고쳐서 계속 쓴다', effect: { cost: 1, delta: { stability: -5, trust: -4, fatigue: 3, xp: 1 } }, result: '고쳐도 원본의 권리는 남는다. 문제를 숨긴 셈이 됐다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '에셋 판매 사이트의 약관을 직접 해석해 써도 된다고 결론 낸다', feedback: '약관 해석과 사용 가능 여부 판단은 법무팀의 일이에요. 아트는 어디에 어떻게 썼는지 정보를 줘요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '퍼블리셔에게 시연을 미루자고 직접 연락한다', feedback: '퍼블리셔 같은 외부 파트너와의 연락 창구는 사업팀이에요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-support-legal'],
            wrongHint: '외부에 보여 줘도 되는지 권리 면에서 판단할 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 확인 절차를 설명해 줬어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '공개 전 점검표에 "에셋 출처·라이선스 확인" 항목을 추가한다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: 4, xp: 4 } }, result: '다음 시연부터는 같은 문제가 점검 단계에서 걸러진다.', next: null },
                  { kind: 'mine', label: '에셋을 바꾼 빌드를 다시 돌려 빠진 파일이나 깨진 화면이 없는지 확인한다', effect: { cost: 2, delta: { quality: 3, stability: 6, fatigue: 8, xp: 8 } }, result: '폰트를 바꾼 뒤 잘린 글자 3곳을 찾아 넘겼다.', next: null },
                  { kind: 'mine', label: '라이선스는 QA 담당이 아니라며 테스트만 계속한다', effect: { cost: 1, delta: { stability: -3, trust: -3, fatigue: 1, xp: 1 } }, result: '내 일은 했지만, 공개 전 점검이라는 QA의 역할을 놓쳤다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '문제 소지가 있는 파일에 "사용 가능" 판정을 직접 내린다', feedback: '사용 가능 판정은 법무팀이 해요. QA는 확인이 끝났는지 점검표로 추적해요.' },
                  { kind: 'other', owner: 'org-art-ui', label: '깨진 폰트를 직접 다른 폰트로 바꿔 넣는다', feedback: '폰트 교체는 아트팀 UI파트의 일이에요. QA는 깨진 위치와 화면을 정리해 넘겨요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-support-legal'],
            wrongHint: '계약과 라이선스를 검토하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "시연 자료와 홍보물도 같은 기준으로 봐야 한다"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '퍼블리셔에게 보낼 시연 자료와 영상에 들어간 음악·폰트부터 점검한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 5, xp: 4 } }, result: '소개 영상의 배경 음악도 출처가 불분명했다는 걸 미리 찾았다.', next: null },
                  { kind: 'mine', label: '시연 일정은 지키되, 확인이 끝난 빌드만 보여 주기로 퍼블리셔와 조율한다', effect: { cost: 1, delta: { stability: 3, trust: 6, fatigue: 4, xp: 4 } }, result: '퍼블리셔는 권리 관리를 챙기는 팀이라고 오히려 좋게 봤다.', next: null },
                  { kind: 'mine', label: '홍보 영상에 유명한 음악을 그대로 쓴다', effect: { cost: 1, delta: { stability: -4, trust: -4, fatigue: 1, xp: 1 } }, result: '영상은 멋졌지만, 음악 권리 때문에 공개할 수 없는 자료가 됐다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '에셋 제작자에게 보낼 라이선스 계약서를 직접 쓴다', feedback: '계약서 작성과 검토는 법무팀의 일이에요. 사업팀은 어떤 조건이 필요한지 요구 사항을 줘요.' },
                  { kind: 'other', owner: 'org-art', label: '출처 불명 그림을 대신할 그림을 직접 그려 넣는다', feedback: '게임에 들어갈 그림은 아트팀이 만들어요. 사업·마케팅은 필요한 자료와 일정을 알려요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'demo-bug-pileup',
        stage: 1,
        scope: 'cross',
        initiator: 'event',
        title: '버그가 128건 쌓였는데 무엇부터 고칠지 몰라요',
        situation:
          '사내 데모까지 2주 남았어요. 버그 목록에 128건이 쌓였는데 같은 버그가 여러 번 올라와 있고, 모두 "긴급"으로 적혀 있어요. 개발팀은 무엇부터 고쳐야 할지 모르겠다고 해요.',
        sources: [
          { title: 'HacknPlan — The bug triage process(심각도·우선순위를 나눠 정기적으로 분류하기)', url: 'https://hacknplan.com/the-bug-triage-process/' },
          { title: 'Packt, Game QA 도서 — Severity versus priority(우선순위 최종 결정은 QA가 아니라 프로듀서)', url: 'https://subscription.packtpub.com/book/game-development/9781803244402/10/ch10lvl1sec49/severity-versus-priority' },
        ],
        neglect: { delta: { quality: -2, stability: -6 }, log: '버그 목록을 분류하지 않고 뒀다. 쉬운 버그만 고쳐지고, 데모를 멈추는 버그는 남았다.' },
        byRole: {
          기획: {
            targets: ['org-devsupport-qa'],
            wrongHint: '버그를 재현해 보고 심각도를 매기는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 "중복을 합치면 71건, 데모를 멈추는 버그는 9건"이라고 정리해 줬어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모에서 꼭 보여 줄 흐름을 정해, 그 흐름을 막는 버그가 무엇인지 표시해 준다', effect: { cost: 1, delta: { quality: 4, stability: 5, fatigue: 5, xp: 4 } }, result: '같은 "중간" 버그라도 데모 동선 위에 있는 4건이 먼저라는 기준이 생겼다.', next: null },
                  { kind: 'mine', label: '기획 의도와 다르게 동작하는 버그마다 "원래 의도"를 적어 개발팀이 헷갈리지 않게 한다', effect: { cost: 2, delta: { quality: 6, stability: 3, fatigue: 8, xp: 8 } }, result: '버그인지 기획 변경인지 묻는 질문이 줄었다. 수정이 한 번에 끝나는 일이 늘었다.', next: null },
                  { kind: 'mine', label: '기획 관련 버그는 데모 뒤에 한꺼번에 보자고 미룬다', effect: { cost: 1, delta: { stability: -2, trust: -2, fatigue: 1, xp: 2 } }, result: '당장은 편했지만, 기획 의도를 몰라 잘못 고친 버그가 다시 올라왔다.', next: null },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '버그 목록의 심각도를 직접 다시 매긴다', feedback: '버그의 심각도 판정은 QA파트가 재현 결과를 근거로 해요. 기획은 기획 의도와 데모에서의 중요도를 알려 줘요.' },
                  { kind: 'other', owner: 'org-pmo', label: '이번 주에 고칠 버그를 직접 골라 개발자에게 배정한다', feedback: '고칠 순서와 담당 배정은 PMO가 개발 리더·QA와 함께 정해요. 기획은 우선순위 판단에 필요한 근거를 줘요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-devsupport-qa'],
            wrongHint: '같은 버그를 합치고 재현 방법을 정리해 주는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 재현 순서와 발생 빈도를 붙인 목록을 넘겨줬어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모를 멈추는 9건부터 원인을 찾고, 건마다 수정 예상 시간을 적어 공유한다', effect: { cost: 2, delta: { quality: 4, stability: 8, fatigue: 9, xp: 8 } }, result: '9건 중 6건이 같은 저장 처리 문제에서 나온다는 걸 찾았다. 한 번 고쳐서 여러 건이 사라졌다.', next: null },
                  { kind: 'mine', label: '고친 버그는 무엇을 바꿨는지 적어 QA가 다시 확인할 수 있게 넘긴다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 4, xp: 4 } }, result: '"고쳤다는데 그대로"인 버그가 줄었다. 수정과 확인이 맞물리기 시작했다.', next: null },
                  { kind: 'mine', label: '금방 고칠 수 있는 버그부터 많이 처리해 숫자를 줄인다', effect: { cost: 1, delta: { quality: 2, stability: -2, fatigue: 6, xp: 3 } }, result: '목록은 30건 줄었지만, 데모를 멈추는 버그는 그대로였다.', next: null },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '재현이 안 되는 버그는 직접 "문제 없음"으로 닫는다', feedback: '버그를 닫을지는 QA파트가 다시 확인한 뒤 정해요. 개발은 재현이 안 되는 조건을 적어 QA에 돌려줘요.' },
                  { kind: 'other', owner: 'org-pmo', label: '수정할 버그 범위와 마감일을 직접 정해 팀에 공지한다', feedback: '범위와 마감 결정은 PMO의 일이에요. 개발은 수정 비용과 위험을 알려 결정을 도와요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-devsupport-qa'],
            wrongHint: '어떤 버그가 얼마나 심각한지 분류하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 그래픽 버그 23건을 따로 묶어 보여 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모 화면에 바로 보이는 그래픽 버그부터 고치고, 나머지는 원인별로 묶는다', effect: { cost: 2, delta: { quality: 7, stability: 2, fatigue: 9, xp: 8 } }, result: '23건 중 11건이 같은 투명 처리 설정 문제였다. 설정 하나로 한꺼번에 해결됐다.', next: null },
                  { kind: 'mine', label: '버그처럼 보이지만 아직 임시 그림인 곳을 QA에 알려 목록에서 구분하게 한다', effect: { cost: 1, delta: { stability: 4, trust: 5, fatigue: 3, xp: 4 } }, result: '임시 그림 7건이 버그 목록에서 빠졌다. QA도 무엇을 봐야 할지 분명해졌다.', next: null },
                  { kind: 'mine', label: '그래픽 버그는 사소하다며 새 그림 작업을 먼저 한다', effect: { cost: 1, delta: { quality: 1, stability: -3, fatigue: 4, xp: 2 } }, result: '새 그림은 늘었지만, 데모 첫 화면에서 깨진 캐릭터가 그대로 보였다.', next: null },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '그래픽 버그의 심각도를 직접 낮춰 목록 아래로 내린다', feedback: '심각도는 QA파트가 유저에게 미치는 영향을 기준으로 매겨요. 아트는 원인과 수정 난이도를 알려 줘요.' },
                  { kind: 'other', owner: 'org-program-program', label: '그림이 깨지는 원인 코드를 직접 찾아 고친다', feedback: '그림을 그리는 코드 수정은 개발팀 프로그램파트의 일이에요. 아트는 어떤 그림이 어떻게 깨지는지 자료를 넘겨요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-pmo'],
            wrongHint: '어떤 버그를 언제까지 고칠지, 팀들과 순서를 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "고칠 순서를 정하는 회의를 열자"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '중복을 합치고 버그마다 재현 순서·빈도·심각도를 붙여 회의 자료로 낸다', effect: { cost: 2, delta: { quality: 3, stability: 7, trust: 4, fatigue: 9, xp: 8 } }, result: '128건이 71건으로 줄었다. 회의에서 "이게 같은 버그냐"는 질문이 사라졌다.', next: null },
                  { kind: 'mine', label: '심각도(얼마나 나쁜가)와 우선순위(언제 고칠까)를 나눠 적는 규칙을 제안한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 4, xp: 4 } }, result: '모두 "긴급"이던 목록이 나뉘었다. 순서는 PMO와 리더가 정하고, QA는 근거를 대는 구조가 됐다.', next: null },
                  { kind: 'mine', label: '새 버그를 찾는 데 집중하고 정리는 나중에 한다', effect: { cost: 1, delta: { quality: 1, stability: -3, fatigue: 5, xp: 2 } }, result: '버그는 더 쌓였고, 개발팀은 여전히 무엇부터 고칠지 몰랐다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '심각한 버그부터 개발자에게 직접 배정한다', feedback: '담당 배정과 순서 결정은 PMO가 리더들과 함께 해요. QA는 판단 근거가 될 재현 결과를 제공해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '간단한 버그는 직접 코드를 고쳐 닫는다', feedback: '코드 수정은 개발팀의 일이에요. QA는 수정된 버그를 다시 확인해 닫는 역할을 해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-devsupport-qa'],
            wrongHint: '지금 빌드에 어떤 문제가 있는지 가장 잘 아는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 "데모를 멈추는 버그가 9건"이라고 알려 줬어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '사내 데모에 초대할 사람과 보여 줄 장면을 미리 알려, 그 장면의 버그가 먼저 보이게 한다', effect: { cost: 1, delta: { quality: 3, stability: 4, trust: 4, fatigue: 4, xp: 4 } }, result: '어떤 장면이 사람들 앞에 나가는지 알게 되자, 고칠 순서를 정하기 쉬워졌다.', next: null },
                  { kind: 'mine', label: '알려진 버그 중 데모 참가자에게 미리 안내할 내용을 정리한다', effect: { cost: 1, delta: { stability: 2, trust: 6, fatigue: 3, xp: 4 } }, result: '참가자들이 이미 알려진 문제를 반복해 보고하는 일이 줄 것이다.', next: null },
                  { kind: 'mine', label: '버그는 개발 일이라며 데모 홍보 자료만 만든다', effect: { cost: 1, delta: { trust: -3, fatigue: 2, xp: 2 } }, result: '자료는 멋지게 나왔지만, 그 장면이 데모에서 멈춘다는 걸 몰랐다.', next: null },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '중요해 보이는 버그를 직접 "긴급"으로 바꿔 올린다', feedback: '심각도는 QA파트가 재현 결과로 매겨요. 사업·마케팅은 어떤 장면이 외부에 중요한지 정보를 줘요.' },
                  { kind: 'other', owner: 'org-pmo', label: '데모 날짜를 직접 일주일 미룬다', feedback: '일정 변경은 PMO가 리더들과 함께 정해요. 사업·마케팅은 일정이 바뀌면 생기는 영향을 알려요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'demo-too-hard-for-new',
        stage: 1,
        scope: 'cross',
        initiator: 'event',
        title: '개발팀은 쉽다는데 처음 해 본 사람은 못 깨요',
        situation:
          '사내 데모를 돌려 봤어요. 개발에 참여한 사람은 거의 다 첫 보스를 이겼는데, 처음 해 본 신규 입사자는 10명 중 2명만 이겼어요. 나머지는 세 번 진 뒤 그만뒀어요.',
        sources: [
          { title: 'Wired(2007) — Halo 3: How Microsoft Labs Invented a New Science of Play(처음 하는 사람의 플레이 기록으로 난이도 조정)', url: 'https://www.wired.com/2007/08/ff-halo/' },
          { title: 'Valve, GDC 2006 — Half-Life 2 디자인 프로세스(개발자가 아닌 사람의 플레이테스트를 반복)', url: 'https://cdn.fastly.steamstatic.com/apps/valve/2006/GDC2006_HL2DesignProcess.pdf' },
        ],
        neglect: { delta: { quality: -4, trust: -3 }, log: '난이도 차이를 그대로 뒀다. 익숙한 사람만 즐길 수 있는 데모가 됐다.' },
        byRole: {
          기획: {
            targets: ['org-devsupport-qa'],
            wrongHint: '처음 해 본 사람이 어디서, 몇 번 졌는지 관찰한 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 "신규 입사자는 보스의 두 번째 공격을 피하지 못했다"는 기록을 보여 줬어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '두 번째 공격 전에 알아챌 수 있는 예고 동작을 넣고, 피하는 방법을 앞 구간에서 미리 연습하게 한다', effect: { cost: 2, delta: { quality: 8, stability: 2, fatigue: 9, xp: 8 } }, result: '보스를 쉽게 만들지 않고도 배울 기회를 줬다. 재도전한 사람이 늘었다.', next: null },
                  { kind: 'mine', label: '보스 체력과 공격력을 낮춰 다시 테스트한다', effect: { cost: 1, delta: { quality: 3, fatigue: 4, xp: 4 } }, result: '이긴 사람은 늘었지만, 익숙한 사람에게는 싱거워졌다는 반응이 나왔다.', next: null },
                  { kind: 'mine', label: '개발팀은 깼으니 신규 입사자가 익숙해지면 괜찮을 거라고 본다', effect: { cost: 1, delta: { quality: -2, trust: -3, fatigue: 1, xp: 1 } }, result: '실제 유저는 우리 개발팀이 아니다. 문제를 놓쳤다.', next: null },
                  { kind: 'other', owner: 'org-program-program', label: '보스 공격 판정 코드를 직접 고쳐 피하기 쉽게 만든다', feedback: '판정 코드를 고치는 건 개발팀 프로그램파트의 일이에요. 기획은 "어느 정도 여유가 있어야 하는지"를 수치로 정해 요청해요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '신규 입사자를 직접 더 모아 테스트를 진행한다', feedback: '플레이테스트 진행과 관찰은 QA파트의 일이에요. 기획은 이번 테스트에서 확인하고 싶은 질문을 정해 전달해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-plan-balance'],
            wrongHint: '난이도와 수치가 공정하게 맞물리도록 조정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '밸런스파트가 "어디서 졌는지 숫자로 보고 싶다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '플레이어가 어떤 공격에, 몇 번째 시도에서 졌는지 기록하는 로그를 넣는다', effect: { cost: 2, delta: { quality: 4, stability: 4, trust: 4, fatigue: 8, xp: 8 } }, result: '진 원인의 70%가 같은 공격이라는 게 숫자로 나왔다. 감이 아니라 기록으로 조정할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '보스 수치를 코드가 아닌 설정 파일로 빼서 밸런스파트가 바로 바꿔 보게 한다', effect: { cost: 1, delta: { quality: 4, stability: 3, trust: 3, fatigue: 5, xp: 4 } }, result: '빌드를 다시 만들지 않고도 여러 난이도를 시험할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '판정이 화면보다 조금 크게 잡힌 곳이 있는지만 확인한다', effect: { cost: 1, delta: { quality: 2, stability: 2, fatigue: 3, xp: 3 } }, result: '판정 오차 하나를 찾아 고쳤다. 다만 어렵게 느끼는 이유 전체는 아니었다.', next: null },
                  { kind: 'other', owner: 'org-plan-balance', label: '보스 수치를 직접 절반으로 낮춰 빌드에 넣는다', feedback: '난이도 수치 결정은 기획팀 밸런스파트의 일이에요. 개발은 수치를 쉽게 바꿀 수 있는 구조를 만들어 줘요.' },
                  { kind: 'other', owner: 'org-plan', label: '처음 하는 사람을 위한 쉬움 모드를 직접 설계한다', feedback: '난이도 모드처럼 게임 규칙을 바꾸는 설계는 기획팀의 일이에요. 개발은 구현 비용과 방법을 제안해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-plan-balance'],
            wrongHint: '난이도를 어떻게 맞출지 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '밸런스파트가 "공격이 오는 걸 알아채기 어렵다는 의견이 많다"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '보스가 공격하기 직전의 준비 동작을 더 크고 분명하게 그린다', effect: { cost: 2, delta: { quality: 7, fatigue: 9, xp: 8 } }, result: '수치를 바꾸지 않고도 피하는 사람이 늘었다. 읽히는 그림도 난이도의 일부다.', next: null },
                  { kind: 'mine', label: '공격 범위를 바닥에 잠깐 표시하는 효과를 만든다', effect: { cost: 1, delta: { quality: 4, fatigue: 5, xp: 4 } }, result: '어디로 피해야 할지 보이게 됐다. 다만 화면이 조금 복잡해졌다.', next: null },
                  { kind: 'mine', label: '보스를 더 멋지게 보이게 하는 효과를 먼저 추가한다', effect: { cost: 1, delta: { quality: 1, stability: -1, fatigue: 5, xp: 2 } }, result: '멋있어졌지만 공격 예고는 효과에 더 묻혔다.', next: null },
                  { kind: 'other', owner: 'org-plan-balance', label: '보스 공격 속도를 직접 느리게 바꾼다', feedback: '공격 속도 같은 수치는 기획팀 밸런스파트가 정해요. 아트는 공격이 잘 읽히도록 그림으로 도와요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '신규 입사자를 직접 불러 다시 해 보게 하고 결과를 정리한다', feedback: '테스트 진행과 결과 정리는 QA파트의 일이에요. 아트는 바꾼 그림이 효과가 있었는지 결과를 함께 봐요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-plan-balance'],
            wrongHint: '테스트 결과를 받아 난이도 수치를 조정할 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '밸런스파트가 "개발 참여자와 처음 하는 사람을 나눠 보고 싶다"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '테스터를 개발 참여자와 처음 하는 사람으로 나눠, 시도 횟수와 진 위치를 따로 정리한다', effect: { cost: 2, delta: { quality: 4, stability: 3, trust: 5, fatigue: 8, xp: 8 } }, result: '두 집단의 차이가 한눈에 보였다. 개발팀의 감각을 기준으로 삼으면 안 된다는 근거가 생겼다.', next: null },
                  { kind: 'mine', label: '다음 테스트부터는 게임을 처음 보는 사람을 꼭 절반 이상 넣는다', effect: { cost: 1, delta: { quality: 2, stability: 3, trust: 3, fatigue: 4, xp: 4 } }, result: '익숙함에 가려지던 문제를 앞으로도 계속 볼 수 있게 됐다.', next: null },
                  { kind: 'mine', label: 'QA 팀원이 직접 여러 번 해 보고 "깰 만하다"고 결론 낸다', effect: { cost: 1, delta: { quality: -1, trust: -2, fatigue: 4, xp: 2 } }, result: 'QA도 이미 게임에 익숙하다. 처음 하는 사람의 경험은 확인하지 못했다.', next: null },
                  { kind: 'other', owner: 'org-plan-balance', label: '적당해 보이는 보스 체력 값을 직접 정해 기획에 통보한다', feedback: '수치 결정은 기획팀 밸런스파트의 일이에요. QA는 수치를 바꾼 뒤 결과가 좋아졌는지 검증해요.' },
                  { kind: 'other', owner: 'org-art', label: '공격 예고 그림이 잘 안 보인다며 직접 색을 바꾼다', feedback: '그림 수정은 아트팀의 일이에요. QA는 어느 장면에서 잘 안 보였는지 화면과 함께 전달해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-plan-balance'],
            wrongHint: '타깃 유저에게 맞는 난이도를 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '밸런스파트가 "우리 타깃 유저가 어느 정도 게임에 익숙한지 알려 달라"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '타깃 유저가 평소 즐기는 게임과 플레이 시간을 조사해 전달한다', effect: { cost: 2, delta: { quality: 4, trust: 5, fatigue: 7, xp: 8 } }, result: '타깃의 절반이 액션 게임을 거의 하지 않는다는 걸 알았다. 난이도 기준이 분명해졌다.', next: null },
                  { kind: 'mine', label: '비슷한 게임들의 리뷰에서 난이도 불만이 얼마나 나오는지 정리한다', effect: { cost: 1, delta: { quality: 2, trust: 4, fatigue: 4, xp: 4 } }, result: '"초반에 그만뒀다"는 리뷰가 많은 게임일수록 평점이 낮았다. 참고할 근거가 생겼다.', next: null },
                  { kind: 'mine', label: '"어려워야 도전 욕구가 생긴다"며 지금 난이도를 홍보 포인트로 잡는다', effect: { cost: 1, delta: { trust: -3, fatigue: 2, xp: 2 } }, result: '타깃과 맞지 않는 약속이 됐다. 처음 하는 사람의 이탈은 그대로다.', next: null },
                  { kind: 'other', owner: 'org-plan-balance', label: '보스를 없애고 쉬운 구간만 데모에 넣자고 직접 정한다', feedback: '데모에 들어갈 내용과 난이도는 기획팀이 정해요. 사업·마케팅은 타깃 유저 정보로 판단을 도와요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '지인들에게 데모를 직접 돌려 의견을 받는다', feedback: '테스터 모집과 관찰은 QA파트가 같은 조건으로 진행해요. 사업·마케팅은 타깃에 맞는 테스터 조건을 제안해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'demo-text-unreadable',
        stage: 1,
        scope: 'cross',
        initiator: 'event',
        title: '글씨가 작고 흐려서 안내를 못 읽어요',
        situation:
          '사내 데모 설문에서 "안내 글씨가 너무 작다", "배경과 색이 비슷해 안 보인다"는 답이 12명 중 7명에게서 나왔어요. 노트북 화면에서는 글씨가 11px까지 작아져요.',
        sources: [
          { title: 'W3C — WCAG 2.2 이해하기: 명도 대비 최소 기준(일반 글씨 4.5:1)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' },
          { title: 'Game Accessibility Guidelines — 글씨 크기·대비·자막 가이드', url: 'https://gameaccessibilityguidelines.com/' },
          { title: 'Microsoft — Xbox 접근성 가이드라인 101: 텍스트 표시', url: 'https://learn.microsoft.com/gaming/accessibility/xbox-accessibility-guidelines/101' },
        ],
        neglect: { delta: { quality: -3, trust: -4 }, log: '글씨 문제를 그대로 뒀다. 안내를 못 읽은 사람들이 무엇을 해야 할지 몰라 헤맸다.' },
        byRole: {
          기획: {
            targets: ['area-pub-standards'],
            wrongHint: '누구나 읽고 쓸 수 있게 화면을 점검하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '퍼블리싱본부 접근성 담당이 "지금 안내 문구는 대비가 2.8:1이라 기준보다 낮다"고 알려 줬어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '한 화면에 띄우는 안내 문구를 줄이고, 꼭 읽어야 하는 문장만 남긴다', effect: { cost: 1, delta: { quality: 5, stability: 2, fatigue: 5, xp: 4 } }, result: '문장이 짧아지자 같은 공간에 더 큰 글씨를 쓸 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '글씨 크기를 플레이어가 고를 수 있는 설정 항목을 기획서에 넣는다', effect: { cost: 2, delta: { quality: 6, trust: 4, fatigue: 8, xp: 8 } }, result: '눈이 피곤한 사람도, 작은 화면을 쓰는 사람도 스스로 맞출 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '안내는 그대로 두고 음성 설명을 덧붙이자고 한다', effect: { cost: 1, delta: { quality: 2, fatigue: 4, xp: 3 } }, result: '도움은 됐지만, 소리를 끄고 하는 사람에게는 여전히 안 보이는 글씨다.', next: null },
                  { kind: 'other', owner: 'org-art-ui', label: '글자 색과 폰트를 직접 바꿔 화면에 적용한다', feedback: '화면의 색과 폰트 디자인은 아트팀 UI파트가 맡아요. 기획은 꼭 읽혀야 할 정보와 우선순위를 정해요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '대비 기준을 통과했다고 직접 판정한다', feedback: '접근성 기준 점검은 퍼블리싱본부 표준 및 접근성 영역의 일이에요. 기획은 고친 화면을 다시 점검해 달라고 요청해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['area-pub-standards'],
            wrongHint: '어떤 화면과 브라우저에서도 읽히는지 기준을 갖고 점검하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '접근성 담당이 "화면이 작아질 때 글씨까지 같이 줄어드는 게 원인"이라고 짚었어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '화면이 작아져도 글씨는 최소 크기 아래로 줄지 않게 처리를 바꾼다', effect: { cost: 2, delta: { quality: 6, stability: 4, fatigue: 8, xp: 8 } }, result: '노트북에서도 안내 글씨가 16px 아래로 내려가지 않는다.', next: null },
                  { kind: 'mine', label: '글씨 크기 설정 값을 저장하고 모든 화면에 반영되는 구조를 만든다', effect: { cost: 2, delta: { quality: 5, stability: 3, trust: 3, fatigue: 9, xp: 8 } }, result: '설정 하나로 모든 안내 글씨가 함께 커진다.', next: null },
                  { kind: 'mine', label: '문제가 된 화면 두 곳만 글씨 크기 숫자를 직접 키운다', effect: { cost: 1, delta: { quality: 2, stability: -1, fatigue: 3, xp: 3 } }, result: '그 두 곳은 나아졌지만, 다른 화면에서 같은 문제가 또 나왔다.', next: null },
                  { kind: 'other', owner: 'org-art-ui', label: '글씨가 잘 보이게 배경 색을 직접 골라 바꾼다', feedback: '색 선택은 아트팀 UI파트가 디자인 일관성을 보며 정해요. 개발은 바뀐 색이 모든 화면에 적용되게 해요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '접근성 점검표를 직접 만들어 다른 팀에 배포한다', feedback: '접근성 점검 기준은 퍼블리싱본부 표준 및 접근성 영역이 관리해요. 개발은 그 기준에 맞게 구현해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['area-pub-standards'],
            wrongHint: '색 대비와 글씨 크기가 기준에 맞는지 측정해 주는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '접근성 담당이 화면마다 대비 값을 재서 보여 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '글씨 뒤에 반투명 바탕을 깔고, 대비가 4.5:1 이상 되는 색 조합으로 다시 정한다', effect: { cost: 2, delta: { quality: 7, stability: 2, fatigue: 8, xp: 8 } }, result: '배경 그림을 살리면서도 글씨가 또렷해졌다.', next: null },
                  { kind: 'mine', label: '색만이 아니라 아이콘과 모양으로도 정보가 구분되게 바꾼다', effect: { cost: 1, delta: { quality: 4, trust: 3, fatigue: 5, xp: 4 } }, result: '색을 구분하기 어려운 사람도 버튼의 뜻을 알 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '분위기가 깨진다며 지금 색감을 유지한다', effect: { cost: 1, delta: { quality: -1, trust: -3, fatigue: 1, xp: 1 } }, result: '분위기는 지켰지만 안내를 못 읽는 사람이 그대로 남았다.', next: null },
                  { kind: 'other', owner: 'area-pub-standards', label: '바꾼 색이 기준을 통과했다고 직접 결론 낸다', feedback: '기준 통과 여부는 퍼블리싱본부 표준 및 접근성 영역이 측정해 판단해요. 아트는 바꾼 시안을 넘겨 다시 점검을 받아요.' },
                  { kind: 'other', owner: 'org-plan', label: '안내 문장을 직접 짧게 고쳐 쓴다', feedback: '안내 문장의 내용은 기획팀이 정해요. 아트는 공간이 부족한 곳을 알려 문장을 줄여 달라고 요청해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['area-pub-standards'],
            wrongHint: '접근성 기준으로 화면을 점검하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '접근성 담당이 "기준은 우리가 정리할 테니 여러 기기에서 확인해 달라"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '노트북·태블릿·휴대폰과 여러 브라우저에서 글씨가 작아지는 화면을 모두 찾아 목록으로 낸다', effect: { cost: 2, delta: { quality: 4, stability: 6, fatigue: 9, xp: 8 } }, result: '휴대폰 가로 화면에서만 생기는 문제 3곳을 새로 찾았다.', next: null },
                  { kind: 'mine', label: '테스트 점검표에 "글씨 크기·대비 확인" 항목을 넣는다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 3, xp: 4 } }, result: '앞으로 새 화면이 나올 때마다 같은 기준으로 확인한다.', next: null },
                  { kind: 'mine', label: '내 모니터에서는 잘 보인다며 문제 없음으로 기록한다', effect: { cost: 1, delta: { stability: -3, trust: -3, fatigue: 1, xp: 1 } }, result: '모두가 같은 화면을 쓰지 않는다. 문제가 기록에서 사라졌을 뿐이다.', next: null },
                  { kind: 'other', owner: 'org-art-ui', label: '잘 안 보이는 글자 색을 직접 진하게 바꾼다', feedback: '글자 색은 아트팀 UI파트가 디자인으로 정해요. QA는 문제 화면과 기기 정보를 넘겨요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '접근성 기준 문서를 직접 새로 쓴다', feedback: '접근성 기준은 퍼블리싱본부 표준 및 접근성 영역이 관리해요. QA는 그 기준으로 실제 화면을 확인해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['area-pub-standards'],
            wrongHint: '누구나 쓸 수 있는 화면인지 점검하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '접근성 담당이 "홍보 페이지도 같은 문제가 있다"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모 안내 페이지와 홍보 이미지의 글씨도 같은 기준으로 다시 만든다', effect: { cost: 2, delta: { quality: 3, trust: 6, fatigue: 7, xp: 8 } }, result: '게임 밖에서 처음 만나는 화면부터 읽기 쉬워졌다.', next: null },
                  { kind: 'mine', label: '타깃 유저가 주로 어떤 기기와 화면 크기로 게임을 하는지 자료를 넘긴다', effect: { cost: 1, delta: { quality: 2, stability: 2, trust: 4, fatigue: 3, xp: 4 } }, result: '타깃의 40%가 노트북으로 한다는 걸 알았다. 점검할 기기 순서가 정해졌다.', next: null },
                  { kind: 'mine', label: '홍보 이미지는 멋이 중요하다며 작은 글씨를 그대로 쓴다', effect: { cost: 1, delta: { trust: -3, fatigue: 1, xp: 1 } }, result: '이미지는 예뻤지만, 휴대폰에서 날짜와 참여 방법을 읽을 수 없었다.', next: null },
                  { kind: 'other', owner: 'org-art-ui', label: '게임 안 메뉴 디자인을 직접 고쳐 달라고 외주에 맡긴다', feedback: '게임 화면 디자인은 아트팀 UI파트가 맡고, 외부 구매는 법무·홍보·구매팀을 거쳐요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '홍보 페이지가 접근성 기준을 통과했다고 직접 공지한다', feedback: '기준 통과 여부는 퍼블리싱본부 표준 및 접근성 영역이 점검해 판단해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'demo-overtime-plan',
        stage: 1,
        scope: 'cross',
        initiator: 'event',
        title: '데모 전 근무 계획이 주 58시간이 됐어요',
        situation:
          '사내 데모까지 3주 남았어요. 팀마다 올린 야근·주말 근무 계획을 합치니 다음 주에 한 사람당 58시간을 일하게 돼요. 지난주부터 피곤하다는 말이 부쩍 늘었어요.',
        sources: [
          { title: '국가법령정보센터 — 근로기준법 제50조·제53조(1주 40시간, 연장근로는 1주 12시간 한도)', url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B7%BC%EB%A1%9C%EA%B8%B0%EC%A4%80%EB%B2%95' },
          { title: 'IGDA — Developer Satisfaction Survey 2019 요약 보고서(응답자 41%가 크런치를 겪음)', url: 'https://igda.org/resources-archive/developer-satisfaction-survey-summary-report-2019/' },
        ],
        neglect: { delta: { stability: -4, trust: -4, fatigue: 8 }, log: '근무 계획을 그대로 진행했다. 피로가 쌓여 실수가 늘고, 법정 한도를 넘긴 근무가 생겼다.' },
        byRole: {
          기획: {
            targets: ['org-support-hr'],
            wrongHint: '근무 시간 제도와 노무 관리를 맡는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '인사·노무팀이 "1주 40시간에 연장근로 12시간까지가 한도라 58시간은 안 된다"고 설명했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모에 꼭 필요한 기획 작업만 남기고, 나머지는 데모 뒤로 옮기자고 PMO에 제안한다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: -6, xp: 4 } }, result: '기획 작업 4개를 데모 뒤로 옮겼다. 다른 팀이 기다리던 일이 줄었다.', next: null },
                  { kind: 'mine', label: '다른 팀이 기획을 기다리느라 멈추는 구간을 찾아 미리 자료를 넘긴다', effect: { cost: 2, delta: { quality: 3, stability: 4, fatigue: 4, xp: 8 } }, result: '기다리는 시간이 줄자, 같은 일을 더 짧은 시간에 끝낼 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '이번 한 번만이라며 주말에 나와 기획서를 끝낸다', effect: { cost: 2, delta: { quality: 2, stability: -2, fatigue: 14, xp: 3 } }, result: '기획서는 끝났지만 월요일에 실수가 두 군데 나왔다. 한 번이 반복되기 쉽다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '데모 날짜를 직접 미루겠다고 공지한다', feedback: '일정 변경은 PMO가 리더들과 함께 정해요. 기획은 범위를 줄일 수 있는 항목을 제안해요.' },
                  { kind: 'other', owner: 'org-support-hr', label: '팀원들의 주말 근무를 직접 승인한다', feedback: '근무 제도와 연장근로 관리는 인사·노무팀과 각 팀 리더가 절차대로 해요. 기획자가 혼자 승인할 일은 아니에요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-support-hr'],
            wrongHint: '일할 수 있는 시간의 한도를 관리하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '인사·노무팀이 근무 한도와 휴식 규정을 알려 줬어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '남은 개발 작업을 시간으로 다시 추정해, 한도 안에서 끝낼 수 있는 범위를 PMO에 알린다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: -4, xp: 4 } }, result: '한도 안에서는 작업 12개 중 9개가 가능하다는 게 드러났다. 무엇을 뺄지 이야기할 근거가 생겼다.', next: null },
                  { kind: 'mine', label: '매번 손으로 하던 빌드·배포 과정을 자동으로 돌게 만든다', effect: { cost: 2, delta: { stability: 5, quality: 2, fatigue: 2, xp: 8 } }, result: '하루 40분씩 들던 반복 작업이 사라졌다.', next: null },
                  { kind: 'mine', label: '밤을 새워서라도 계획한 기능을 다 끝낸다', effect: { cost: 2, delta: { quality: 2, stability: -4, fatigue: 16, xp: 3 } }, result: '기능은 다 들어갔지만, 피곤할 때 쓴 코드에서 버그가 쏟아졌다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '구현이 늦은 기능을 직접 데모에서 뺀다', feedback: '데모 범위 조정은 PMO가 기획·개발 리더와 함께 정해요. 개발은 남은 작업량과 위험을 알려요.' },
                  { kind: 'other', owner: 'org-support-hr', label: '야근한 시간을 휴가로 바꿔 주는 규칙을 직접 만든다', feedback: '근무·휴가 제도는 인사·노무팀이 만들고 운영해요. 개발자는 필요한 점을 건의할 수 있어요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-support-hr'],
            wrongHint: '근무 시간과 휴식 제도를 맡는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '인사·노무팀이 "아트팀 계획이 가장 길다"고 알려 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모 화면에 보이는 그림만 완성하고, 안 보이는 곳은 임시 그림으로 둔다', effect: { cost: 1, delta: { quality: 2, stability: 4, fatigue: -5, xp: 4 } }, result: '그림 작업이 3분의 1로 줄었다. 데모의 첫인상은 그대로 지켰다.', next: null },
                  { kind: 'mine', label: '비슷한 그림을 묶어 한 번에 만드는 방식으로 작업 순서를 바꾼다', effect: { cost: 2, delta: { quality: 4, stability: 3, fatigue: 3, xp: 8 } }, result: '같은 색과 형태를 반복해 쓰면서 작업 속도가 빨라졌다.', next: null },
                  { kind: 'mine', label: '계획대로 주말 이틀을 모두 나와 그린다', effect: { cost: 2, delta: { quality: 4, stability: -2, fatigue: 16, xp: 3 } }, result: '그림은 늘었지만 다음 주 내내 손이 느려졌다.', next: null },
                  { kind: 'other', owner: 'org-support-hr', label: '외주 아티스트를 직접 구해 일을 맡긴다', feedback: '외부 인력 계약은 인사·노무팀과 법무·홍보·구매팀이 절차대로 처리해요. 아트는 필요한 작업과 조건을 정리해요.' },
                  { kind: 'other', owner: 'org-plan', label: '그림이 많이 드는 장면을 직접 기획서에서 뺀다', feedback: '장면을 뺄지는 기획팀과 PMO가 정해요. 아트는 장면별 작업량을 근거로 알려요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-support-hr'],
            wrongHint: '근무 시간 한도를 넘지 않게 관리하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '인사·노무팀이 "QA는 개발이 끝난 뒤 몰아서 일하는 패턴이 반복된다"고 짚었어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '기능이 끝날 때마다 바로 테스트하도록 일정을 나눠, 마지막 주에 몰리지 않게 PMO와 맞춘다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: -5, xp: 4 } }, result: '마지막 주에 몰리던 테스트가 3주에 고르게 나뉘었다.', next: null },
                  { kind: 'mine', label: '매번 반복하는 기본 확인 항목을 자동으로 돌리는 테스트로 바꾼다', effect: { cost: 2, delta: { stability: 6, quality: 2, fatigue: 3, xp: 8 } }, result: '빌드마다 하던 기본 확인 30분이 자동으로 끝난다.', next: null },
                  { kind: 'mine', label: '데모 전날 밤까지 남아 전부 다시 테스트한다', effect: { cost: 2, delta: { stability: 2, fatigue: 16, xp: 3 } }, result: '빠짐없이 봤지만, 지쳐서 중요한 버그 하나를 놓쳤다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '개발팀에 기능 완료일을 직접 앞당기라고 요구한다', feedback: '팀 간 일정 조율은 PMO의 일이에요. QA는 테스트에 필요한 시간을 근거로 알려요.' },
                  { kind: 'other', owner: 'org-support-hr', label: 'QA 인원을 직접 늘려 달라고 채용 공고를 낸다', feedback: '채용은 인사·노무팀이 진행해요. QA는 필요한 인원과 이유를 정리해 요청해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-pmo'],
            wrongHint: '데모 일정과 범위를 팀들과 조율하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "외부에 이미 알린 날짜가 있어서 일정이 더 빠듯해졌다"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '외부에 약속한 것 중 꼭 지켜야 할 것과 바꿀 수 있는 것을 나눠 PMO에 알린다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: -3, xp: 4 } }, result: '공개 날짜는 지키되, 보여 줄 기능 수는 줄여도 된다는 걸 확인했다.', next: null },
                  { kind: 'mine', label: '앞으로는 개발 일정을 확인한 뒤에 외부 날짜를 발표하는 절차를 만든다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 2, xp: 4 } }, result: '다음 발표부터는 PMO 확인을 거친다. 같은 압박이 반복되지 않게 됐다.', next: null },
                  { kind: 'mine', label: '이미 알렸으니 일정과 범위 모두 그대로 가자고 한다', effect: { cost: 1, delta: { stability: -3, trust: -3, fatigue: 6, xp: 2 } }, result: '약속은 지켰지만 팀의 근무 시간이 더 늘어났다.', next: null },
                  { kind: 'other', owner: 'org-support-hr', label: '팀원들에게 주말 근무를 직접 요청한다', feedback: '근무 시간과 연장근로는 인사·노무팀의 제도와 각 팀 리더를 거쳐요. 다른 본부에서 직접 요청할 일이 아니에요.' },
                  { kind: 'other', owner: 'org-plan', label: '데모에 넣을 기능을 직접 골라 기획팀에 통보한다', feedback: '데모 기능 구성은 기획팀과 PMO가 정해요. 사업·마케팅은 외부에 중요한 기능이 무엇인지 알려요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'pubdemo-server-load',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '공개 데모 첫날 접속이 몰리면 서버가 버틸까요',
        situation:
          '공개 데모 사전 신청이 2만 명을 넘었어요. 그런데 서버는 지금까지 사내 테스트 30명이 동시에 들어온 것까지만 확인해 봤어요. 첫날 몇 명까지 버틸 수 있는지 아무도 몰라요.',
        sources: [
          { title: 'AWS for Games — 출시 단계 체크리스트(부하 테스트는 출시 준비의 핵심 단계)', url: 'https://aws.amazon.com/blogs/gametech/launch-phase-steps-for-successful-launches-on-amazon-gamelift-servers' },
          { title: 'AWS Well-Architected 게임 산업 렌즈 — 출시 전 부하 테스트로 위험을 줄이고 용량을 계획하기', url: 'https://docs.aws.amazon.com/wellarchitected/latest/games-industry-lens/gameops05-bp01.html' },
        ],
        neglect: { delta: { stability: -7, trust: -4 }, log: '부하를 확인하지 않고 공개했다. 첫날 접속이 몰리자 서버가 여러 번 멈췄다.' },
        byRole: {
          기획: {
            targets: ['org-program-server'],
            wrongHint: '접속과 네트워크, 서버 안정성을 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '서버파트가 "플레이어 한 명이 얼마나 자주 서버와 통신하는지가 관건"이라고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모에서 플레이어가 주로 하는 행동과 횟수를 정리해 서버파트의 테스트 시나리오로 넘긴다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: 5, xp: 4 } }, result: '실제 플레이와 비슷한 부하로 시험할 수 있게 됐다. 배달 완료 순간에 통신이 몰린다는 게 보였다.', next: null },
                  { kind: 'mine', label: '서버가 붐빌 때 기다리는 동안 볼 수 있는 대기 화면과 안내 문구를 설계한다', effect: { cost: 2, delta: { quality: 3, stability: 2, trust: 5, fatigue: 8, xp: 8 } }, result: '접속이 밀려도 "몇 분 뒤 입장"이 보이니 그냥 떠나는 사람이 줄 것이다.', next: null },
                  { kind: 'mine', label: '서버는 기술 문제라며 데모 콘텐츠 추가에만 집중한다', effect: { cost: 1, delta: { quality: 2, stability: -3, fatigue: 4, xp: 2 } }, result: '콘텐츠는 늘었지만, 그 콘텐츠를 볼 수 있을지는 여전히 모른다.', next: null },
                  { kind: 'other', owner: 'org-program-server', label: '서버 대수를 직접 정해 늘려 달라고 확정한다', feedback: '서버 규모와 구성은 개발팀 서버파트가 테스트 결과로 정해요. 기획은 플레이 패턴 정보를 줘요.' },
                  { kind: 'other', owner: 'org-support-finance', label: '서버 비용 예산을 직접 늘려 잡는다', feedback: '예산 편성과 집행은 재무·회계·자금팀이 맡아요. 필요한 비용 근거는 서버파트가 정리해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-biz-marketing'],
            wrongHint: '첫날 몇 명이 몰려올지 예상할 근거를 가진 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "사전 신청 2만 명, 첫날 저녁 8시 공개 방송 직후에 몰릴 것"이라고 알려 줬어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '예상 최대 동시 접속자의 두 배까지 서서히 늘려 가는 부하 테스트를 돌린다', effect: { cost: 2, delta: { stability: 9, trust: 3, fatigue: 9, xp: 8 } }, result: '1,800명에서 로그인 처리가 막힌다는 걸 공개 전에 찾았다.', next: null },
                  { kind: 'mine', label: '서버가 넘칠 때 대기열로 받아 순서대로 입장시키는 기능을 넣는다', effect: { cost: 2, delta: { stability: 6, trust: 4, fatigue: 8, xp: 8 } }, result: '한꺼번에 몰려도 서버가 쓰러지지 않고 기다리게 할 수 있다.', next: null },
                  { kind: 'mine', label: '사내 30명 테스트에서 문제없었으니 그대로 공개한다', effect: { cost: 1, delta: { stability: -5, trust: -3, fatigue: 1, xp: 1 } }, result: '30명과 2만 명은 다른 문제다. 확인하지 않은 위험이 그대로 남았다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '공개 방송 시간을 직접 새벽으로 옮겨 달라고 정한다', feedback: '홍보 일정은 마케팅팀이 정해요. 개발은 서버가 감당할 수 있는 숫자를 근거로 조정을 요청할 수 있어요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '부하 테스트 결과를 공개해도 된다고 직접 판정해 공지한다', feedback: '공개 전 품질 판정은 QA파트가 기준에 따라 정리하고, 최종 일정은 PMO가 정해요. 개발은 테스트 결과를 정확히 넘겨요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-program-server'],
            wrongHint: '많은 사람이 동시에 접속할 때를 대비하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '서버파트가 "처음 접속할 때 내려받는 그림 파일이 커서 서버에 부담이 된다"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '첫 화면에 꼭 필요한 그림만 먼저 받도록 묶음을 나누고, 이미지를 압축한다', effect: { cost: 2, delta: { quality: 2, stability: 7, fatigue: 8, xp: 8 } }, result: '첫 접속에 내려받는 용량이 절반으로 줄었다. 서버도 플레이어도 덜 기다린다.', next: null },
                  { kind: 'mine', label: '접속 대기 화면에 들어갈 그림을 만들어 기다리는 시간도 게임 분위기로 채운다', effect: { cost: 1, delta: { quality: 4, trust: 3, fatigue: 5, xp: 4 } }, result: '대기 화면에서 캐릭터가 편지를 정리한다. 기다림이 덜 지루해졌다.', next: null },
                  { kind: 'mine', label: '공개 데모니까 가장 고화질 그림을 그대로 넣는다', effect: { cost: 1, delta: { quality: 2, stability: -4, fatigue: 3, xp: 2 } }, result: '예쁘지만 무겁다. 접속이 몰리면 첫 화면부터 늦게 뜬다.', next: null },
                  { kind: 'other', owner: 'org-program-server', label: '그림 파일을 나눠 보내는 서버 설정을 직접 바꾼다', feedback: '서버 설정은 개발팀 서버파트의 일이에요. 아트는 그림 파일을 어떻게 나눌 수 있는지 정보를 줘요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '데모 참가 인원을 줄이자고 신청 페이지를 직접 닫는다', feedback: '신청 페이지와 참가 인원은 마케팅팀이 관리해요. 아트는 결정에 직접 손대지 않아요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-program-server'],
            wrongHint: '서버가 몇 명까지 버티는지 시험할 환경을 가진 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '서버파트가 부하 테스트를 준비하며 QA에 도움을 청했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '부하를 거는 동안 실제로 접속해 로그인·저장·배달 완료가 제대로 되는지 직접 확인한다', effect: { cost: 2, delta: { quality: 3, stability: 7, fatigue: 9, xp: 8 } }, result: '숫자로는 멀쩡했지만, 1,500명부터 저장이 10초씩 늦어진다는 걸 직접 겪어 찾았다.', next: null },
                  { kind: 'mine', label: '"동시 접속 몇 명에 오류율 몇 % 이하"처럼 통과 기준을 문서로 정해 공유한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 4, xp: 4 } }, result: '테스트가 끝났을 때 "괜찮은가"를 같은 기준으로 판단할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '평소처럼 혼자 접속해 기능만 확인한다', effect: { cost: 1, delta: { stability: -2, fatigue: 3, xp: 2 } }, result: '기능은 정상이었다. 하지만 많은 사람이 함께 들어올 때의 문제는 볼 수 없었다.', next: null },
                  { kind: 'other', owner: 'org-program-server', label: '서버 장비를 직접 더 빌려 붙인다', feedback: '서버 장비 구성은 개발팀 서버파트가 결정해요. QA는 테스트에서 드러난 한계를 근거로 전달해요.' },
                  { kind: 'other', owner: 'org-pmo', label: '테스트 결과가 나쁘니 공개를 미루겠다고 직접 발표한다', feedback: '공개 일정은 PMO가 리더들과 함께 정해요. QA는 판단에 필요한 품질 근거를 제공해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-program-server'],
            wrongHint: '홍보로 몰려올 사람들을 서버가 받아낼 수 있는지 아는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '서버파트가 "언제, 얼마나 몰릴지 알아야 준비할 수 있다"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '홍보 일정과 시간대별 예상 유입 숫자를 정리해 서버파트에 넘긴다', effect: { cost: 1, delta: { stability: 6, trust: 5, fatigue: 4, xp: 4 } }, result: '공개 방송 직후 30분이 가장 위험하다는 걸 모두가 알게 됐다.', next: null },
                  { kind: 'mine', label: '공개 시간을 지역·신청 순서별로 나눠 접속이 한 번에 몰리지 않게 한다', effect: { cost: 2, delta: { stability: 7, trust: 3, fatigue: 7, xp: 8 } }, result: '정점이 낮아졌다. 서버를 무리하게 늘리지 않아도 됐다.', next: null },
                  { kind: 'mine', label: '반응을 키우려고 공개 직전에 대형 광고를 추가로 집행한다', effect: { cost: 1, delta: { trust: 2, stability: -5, fatigue: 3, xp: 2 } }, result: '관심은 더 모였지만, 그만큼 서버가 버텨야 할 숫자도 커졌다.', next: null },
                  { kind: 'other', owner: 'org-program-server', label: '서버 업체와 직접 계약을 바꿔 서버를 늘린다', feedback: '서버 구성은 서버파트가 정하고, 외부 계약은 법무·홍보·구매팀을 거쳐요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '지인들을 모아 직접 동시 접속 테스트를 해 본다', feedback: '테스트 설계와 진행은 QA파트와 서버파트가 함께 해요. 사업·마케팅은 예상 유입 숫자를 제공해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'pubdemo-store-mismatch',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '스토어 페이지가 실제 게임과 달라 보여요',
        situation:
          '공개 데모용 스토어 페이지 초안이 나왔어요. 대표 이미지는 게임에 없는 영화 같은 장면이고, 소개 문구에는 "광활한 오픈월드"라고 적혀 있어요. 실제 데모에는 작은 마을 3개가 있어요.',
        sources: [
          { title: 'Steamworks 문서 — 스토어 그래픽 자산(스크린샷은 실제 게임플레이만 보여 줄 것)', url: 'https://partner.steamgames.com/doc/store/assets/standard' },
          { title: 'Steamworks 문서 — 그래픽 자산 규칙과 가이드라인', url: 'https://partner.steamgames.com/doc/store/assets/rules' },
        ],
        neglect: { delta: { quality: -1, trust: -7 }, log: '스토어 페이지를 그대로 공개했다. 데모를 해 본 사람들이 "광고와 다르다"는 후기를 남겼다.' },
        byRole: {
          기획: {
            targets: ['org-biz-marketing'],
            wrongHint: '스토어 페이지와 홍보 문구를 만드는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "게임의 매력을 한 문장으로 말해 줄 사람이 필요하다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모에서 실제로 겪을 수 있는 재미 세 가지를 장면과 함께 정리해 넘긴다', effect: { cost: 1, delta: { quality: 2, trust: 6, fatigue: 5, xp: 4 } }, result: '"오픈월드" 대신 "골목마다 다른 배달 경로"라는 문구가 나왔다. 사실이면서도 매력적이다.', next: null },
                  { kind: 'mine', label: '데모에 있는 것과 정식 출시에 들어갈 것을 구분한 표를 만들어 공유한다', effect: { cost: 2, delta: { stability: 3, trust: 6, fatigue: 7, xp: 8 } }, result: '홍보할 수 있는 것과 아직 약속하면 안 되는 것이 분명해졌다.', next: null },
                  { kind: 'mine', label: '홍보는 원래 과장하는 법이라며 넘어간다', effect: { cost: 1, delta: { trust: -4, fatigue: 1, xp: 1 } }, result: '기대와 실제의 차이는 결국 게임에 대한 실망으로 돌아온다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '스토어 소개 문구를 직접 고쳐 올린다', feedback: '스토어 페이지 문구는 마케팅팀이 써요. 기획은 게임이 실제로 무엇인지 정확한 정보를 줘요.' },
                  { kind: 'other', owner: 'org-art', label: '실제 게임 화면으로 대표 이미지를 직접 다시 만든다', feedback: '대표 이미지 제작은 아트팀이 마케팅팀과 함께 해요. 기획은 어떤 장면이 게임을 잘 보여 주는지 제안해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-biz-marketing'],
            wrongHint: '스토어에 올릴 이미지와 영상을 준비하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "실제 게임 화면으로 바꾸고 싶은데 깔끔하게 찍기가 어렵다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '화면 정보창을 숨기고 카메라를 자유롭게 움직일 수 있는 촬영 모드를 만들어 준다', effect: { cost: 2, delta: { quality: 4, trust: 5, fatigue: 8, xp: 8 } }, result: '실제 게임 화면만으로도 멋진 스크린샷을 찍을 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '원하는 장면으로 바로 이동하는 개발용 명령을 마케팅팀에 알려 준다', effect: { cost: 1, delta: { trust: 4, stability: 1, fatigue: 3, xp: 4 } }, result: '촬영 시간이 반으로 줄었다. 다만 개발용 명령이라 쓰는 법을 한 번 더 설명해야 했다.', next: null },
                  { kind: 'mine', label: '홍보 자료는 내 일이 아니라며 요청을 미룬다', effect: { cost: 1, delta: { trust: -3, fatigue: 1, xp: 1 } }, result: '마케팅팀은 결국 다시 게임에 없는 이미지를 쓰기로 했다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '스토어에 올릴 스크린샷을 직접 골라 등록한다', feedback: '스토어 자산 선택과 등록은 마케팅팀이 해요. 개발은 좋은 화면을 찍을 수 있는 도구를 도와요.' },
                  { kind: 'other', owner: 'org-plan', label: '"오픈월드"에 맞춰 맵을 직접 크게 넓힌다', feedback: '맵 규모와 콘텐츠 설계는 기획팀이 정해요. 홍보 문구에 맞춰 게임을 바꾸는 건 거꾸로예요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-biz-marketing'],
            wrongHint: '스토어 페이지에 어떤 그림을 쓸지 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "스크린샷은 실제 게임 화면만 써야 한다는 스토어 규칙이 있다"고 알려 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '실제 게임 장면 중 가장 매력적인 순간을 골라 조명과 배치를 다듬은 뒤 촬영을 돕는다', effect: { cost: 2, delta: { quality: 5, trust: 5, fatigue: 8, xp: 8 } }, result: '게임에 실제로 있는 장면인데도 충분히 눈길을 끈다.', next: null },
                  { kind: 'mine', label: '대표 일러스트는 "콘셉트 아트"라고 분명히 표시해 스크린샷과 구분해서 쓴다', effect: { cost: 1, delta: { trust: 5, fatigue: 3, xp: 4 } }, result: '그림의 매력은 살리면서 실제 화면과 헷갈리지 않게 됐다.', next: null },
                  { kind: 'mine', label: '스크린샷을 보정해 게임보다 훨씬 화려하게 만든다', effect: { cost: 1, delta: { quality: 1, trust: -5, fatigue: 4, xp: 1 } }, result: '눈에는 띄었지만, 실제 게임과의 차이가 더 커졌다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '스토어 페이지 소개 문구를 직접 고친다', feedback: '스토어 문구는 마케팅팀이 써요. 아트는 그림이 게임을 정확히 보여 주도록 도와요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '이 정도면 과장 광고가 아니라고 직접 판단한다', feedback: '광고 표현의 법적 위험 판단은 법무·홍보·구매팀이 해요. 아트는 그림이 실제 화면인지 정확히 알려요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-biz-marketing'],
            wrongHint: '스토어 페이지 내용을 책임지는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "페이지 내용이 실제 데모와 맞는지 확인해 달라"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '페이지의 문장과 이미지를 하나씩 데모 빌드와 대조해 다른 곳을 목록으로 넘긴다', effect: { cost: 2, delta: { stability: 3, trust: 7, fatigue: 8, xp: 8 } }, result: '문구 4곳과 이미지 2장이 데모에 없는 내용이었다. 공개 전에 모두 고쳤다.', next: null },
                  { kind: 'mine', label: '스토어에 적힌 권장 사양으로 실제로 데모가 잘 돌아가는지 확인한다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 4, xp: 4 } }, result: '적힌 최소 사양에서는 끊긴다는 걸 찾았다. 사양 표기를 바로잡았다.', next: null },
                  { kind: 'mine', label: '스토어 페이지는 게임이 아니라며 확인하지 않는다', effect: { cost: 1, delta: { trust: -3, fatigue: 1, xp: 1 } }, result: '유저가 처음 만나는 정보가 틀린 채로 남았다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '틀린 문구를 직접 고쳐 스토어에 다시 올린다', feedback: '스토어 수정은 마케팅팀이 해요. QA는 무엇이 실제와 다른지 근거와 함께 넘겨요.' },
                  { kind: 'other', owner: 'org-art', label: '틀린 스크린샷을 직접 다시 찍어 바꿔 넣는다', feedback: '스크린샷 제작은 아트팀과 마케팅팀이 함께 해요. QA는 어떤 이미지가 실제와 다른지 알려요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-plan'],
            wrongHint: '이 게임이 실제로 무엇인지, 어떤 재미가 있는지 정의한 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '기획팀이 "데모에 있는 것과 없는 것"을 정리해 보여 줬어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '대표 이미지와 스크린샷을 실제 게임 화면으로 바꾸고, 문구도 데모에 있는 재미 중심으로 고친다', effect: { cost: 2, delta: { trust: 8, fatigue: 8, xp: 8 } }, result: '"광고와 똑같다"는 후기가 나왔다. 기대와 실제가 맞으면 신뢰가 쌓인다.', next: null },
                  { kind: 'mine', label: '정식 출시에 들어갈 내용은 "출시 예정"으로 따로 표시한다', effect: { cost: 1, delta: { trust: 5, stability: 2, fatigue: 3, xp: 4 } }, result: '앞으로의 계획은 알리되, 데모에서 기대할 것과 섞이지 않게 됐다.', next: null },
                  { kind: 'mine', label: '클릭률이 높으니 지금 이미지와 문구를 그대로 둔다', effect: { cost: 1, delta: { trust: -5, fatigue: 1, xp: 1 } }, result: '페이지 방문은 늘었지만, 데모를 해 본 뒤 실망한 후기가 쌓였다.', next: null },
                  { kind: 'other', owner: 'org-plan', label: '홍보 문구에 맞춰 데모에 오픈월드 구역을 넣어 달라고 직접 정한다', feedback: '데모에 무엇을 넣을지는 기획팀과 PMO가 정해요. 홍보는 게임을 바꾸는 근거가 아니라 게임을 전하는 일이에요.' },
                  { kind: 'other', owner: 'org-art', label: '실제 화면처럼 보이는 그림을 직접 만들어 올린다', feedback: '그림 제작은 아트팀의 일이에요. 마케팅은 어떤 장면이 필요한지 요청해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'pubdemo-signup-privacy',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '데모 신청자 이메일 파일이 메신저로 돌아다녀요',
        situation:
          '공개 데모 신청자 3,000명의 이름과 이메일이 담긴 엑셀 파일이 업무 메신저 단체방 세 곳에 올라가 있어요. 누가 내려받았는지, 어디에 저장됐는지 아무도 몰라요.',
        sources: [
          { title: '국가법령정보센터 — 개인정보 보호법(제29조 안전조치의무)', url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95' },
          { title: '국가법령정보센터 — 개인정보의 안전성 확보조치 기준(접근 권한 관리·접속 기록·암호화)', url: 'https://www.law.go.kr/%ED%96%89%EC%A0%95%EA%B7%9C%EC%B9%99/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%9D%98%EC%95%88%EC%A0%84%EC%84%B1%ED%99%95%EB%B3%B4%EC%A1%B0%EC%B9%98%EA%B8%B0%EC%A4%80' },
        ],
        neglect: { delta: { stability: -4, trust: -7 }, log: '신청자 파일을 그대로 뒀다. 퇴사자의 개인 컴퓨터에도 사본이 남아 있었다는 사실이 나중에 드러났다.' },
        byRole: {
          기획: {
            targets: ['org-program-db'],
            wrongHint: '저장 데이터의 구조와 보관, 접근 권한을 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'DB파트가 "신청자 정보는 접근 권한이 있는 저장소 한 곳에만 두고, 누가 봤는지 기록해야 한다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '데모 운영에 정말 필요한 정보가 무엇인지 따져, 이름처럼 없어도 되는 항목은 신청서에서 뺀다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 4, xp: 4 } }, result: '처음부터 덜 모으니 지켜야 할 정보도 줄었다.', next: null },
                  { kind: 'mine', label: '기획팀이 받은 파일을 지우고, 앞으로는 숫자만 집계된 자료를 받기로 한다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 2, xp: 4 } }, result: '참가자 분석에는 이메일이 필요 없었다. 집계 자료로 충분했다.', next: null },
                  { kind: 'mine', label: '단체방이 회사 메신저니까 괜찮다며 그대로 둔다', effect: { cost: 1, delta: { stability: -3, trust: -5, fatigue: 1, xp: 1 } }, result: '회사 안이라도 필요 없는 사람이 볼 수 있으면 관리되지 않는 정보다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '신청자들에게 보낼 안내문을 직접 써서 발송한다', feedback: '정보 주체에게 보내는 공식 안내는 법무팀이 법적 요건을 확인한 뒤 진행해요. 기획은 필요한 사실을 정리해 전달해요.' },
                  { kind: 'other', owner: 'org-program-db', label: '공유 폴더 권한을 직접 바꿔 아무도 못 보게 막는다', feedback: '데이터 저장소와 접근 권한 관리는 개발팀 DB파트의 일이에요. 기획은 누가 어떤 정보가 필요한지 알려 줘요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-support-legal'],
            wrongHint: '개인정보를 법에 맞게 다루는지 검토하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "법은 개인정보에 접근할 수 있는 사람을 최소한으로 하고, 접속 기록을 남기도록 요구한다"고 설명했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '신청자 정보를 권한 있는 사람만 볼 수 있는 저장소로 옮기고, 조회 기록이 남게 만든다', effect: { cost: 2, delta: { stability: 8, trust: 5, fatigue: 9, xp: 8 } }, result: '이제 누가 언제 신청자 정보를 봤는지 확인할 수 있다.', next: null },
                  { kind: 'mine', label: '다른 팀에는 이메일 대신 가려진 값이나 집계 숫자만 내보내는 기능을 만든다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 5, xp: 4 } }, result: '각 팀이 필요한 숫자는 그대로 보면서, 원본은 한곳에만 남게 됐다.', next: null },
                  { kind: 'mine', label: '요청이 올 때마다 엑셀로 뽑아 보내 주던 방식을 계속한다', effect: { cost: 1, delta: { stability: -4, trust: -3, fatigue: 2, xp: 1 } }, result: '편했지만, 사본은 계속 늘고 있다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '유출로 볼지 말지 직접 판단해 신고 여부를 정한다', feedback: '유출 여부 판단과 신고는 법무팀이 법적 기준에 따라 해요. 개발은 접속 기록 같은 사실 자료를 줘요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '마케팅팀의 신청자 목록을 직접 지운다', feedback: '마케팅팀의 자료 정리는 그 팀이 법무팀 안내에 따라 해요. 개발은 안전한 보관 방법을 제공해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-program-db'],
            wrongHint: '데이터를 어디에, 누가 볼 수 있게 저장할지 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'DB파트가 "단체방에 파일을 받은 사람은 모두 지워 달라"고 요청했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '내 컴퓨터와 메신저에 받은 파일을 지우고, 지웠다고 DB파트에 알린다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 2, xp: 4 } }, result: '사본 하나가 확실히 사라졌다. 확인 목록에 내 이름이 지워졌다.', next: null },
                  { kind: 'mine', label: '신청 이벤트 그림에 신청자 이름을 넣으려던 계획을 이름 없는 디자인으로 바꾼다', effect: { cost: 2, delta: { quality: 2, stability: 3, trust: 4, fatigue: 7, xp: 8 } }, result: '개인정보 없이도 축하 분위기를 낼 수 있었다.', next: null },
                  { kind: 'mine', label: '나중에 쓸 수도 있으니 파일을 개인 폴더에 보관해 둔다', effect: { cost: 1, delta: { stability: -3, trust: -5, fatigue: 1, xp: 1 } }, result: '관리되지 않는 사본이 하나 더 생겼다.', next: null },
                  { kind: 'other', owner: 'org-program-db', label: '단체방의 파일을 직접 모두 삭제한다', feedback: '공용 자료와 접근 권한 정리는 DB파트가 절차대로 해요. 아트는 내가 가진 사본을 정리하고 알려요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '신청자들에게 사과 메일을 직접 보낸다', feedback: '정보 주체에게 보내는 공식 안내는 법무팀이 확인한 뒤 진행해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-program-db'],
            wrongHint: '개인정보가 저장된 곳과 접근 권한을 관리하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'DB파트가 새 저장소로 옮기는 중이에요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '권한이 없는 계정으로 접속해 신청자 정보가 정말 보이지 않는지 확인한다', effect: { cost: 2, delta: { stability: 7, trust: 4, fatigue: 8, xp: 8 } }, result: '관리 화면 한 곳에서 권한 없이도 이메일이 보인다는 걸 찾아 넘겼다.', next: null },
                  { kind: 'mine', label: '테스트에는 실제 신청자 대신 가짜 데이터를 쓰도록 테스트 절차를 바꾼다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 4, xp: 4 } }, result: '테스트하다가 실제 개인정보를 다룰 일이 사라졌다.', next: null },
                  { kind: 'mine', label: '테스트하려면 실제 데이터가 편하다며 사본을 받아 둔다', effect: { cost: 1, delta: { stability: -3, trust: -4, fatigue: 1, xp: 1 } }, result: '편했지만, 지켜야 할 사본이 QA에도 생겼다.', next: null },
                  { kind: 'other', owner: 'org-program-db', label: '새 저장소의 접근 권한 목록을 직접 정한다', feedback: '접근 권한 설계는 DB파트가 법무팀 기준에 맞춰 해요. QA는 그 권한이 실제로 지켜지는지 확인해요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '법적으로 문제없다고 직접 결론 내린다', feedback: '법적 판단은 법무팀의 일이에요. QA는 확인한 사실을 정리해 전달해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-program-db'],
            wrongHint: '신청자 정보를 안전하게 보관할 저장소를 만드는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'DB파트가 "마케팅팀이 받은 파일이 가장 많이 퍼졌다"고 알려 줬어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '팀원들이 받은 사본을 모두 지우게 하고, 앞으로는 DB파트의 저장소에서만 보기로 정한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 4, xp: 4 } }, result: '마케팅팀이 가진 사본이 모두 정리됐다.', next: null },
                  { kind: 'mine', label: '신청서에 수집 목적·보관 기간을 분명히 적도록 법무팀 검토를 받아 고친다', effect: { cost: 2, delta: { stability: 4, trust: 7, fatigue: 7, xp: 8 } }, result: '신청자는 무엇에 쓰이는지 알고 동의하게 됐다. 이벤트 뒤 정보를 지울 날짜도 정해졌다.', next: null },
                  { kind: 'mine', label: '이메일로 다음 홍보 메일도 보내려고 파일을 따로 모아 둔다', effect: { cost: 1, delta: { stability: -3, trust: -6, fatigue: 1, xp: 1 } }, result: '동의받지 않은 목적으로 쓰려는 정보가 됐다.', next: null },
                  { kind: 'other', owner: 'org-program-db', label: '신청자 목록을 직접 외부 클라우드로 옮긴다', feedback: '데이터를 어디에 저장할지는 DB파트가 보안 기준에 맞춰 정해요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '신청서 동의 문구를 직접 써서 바로 바꾼다', feedback: '동의 문구는 법무팀이 법적 요건에 맞게 검토해요. 마케팅은 어떤 목적으로 쓰려는지 알려요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'pubdemo-localization',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '영어판 데모에서 글자가 잘리고 번역이 어색해요',
        situation:
          '해외 유저를 위해 영어판 공개 데모를 만들었어요. 그런데 버튼 글자가 잘리고, 마을 이름이 화면마다 다르게 번역돼 있어요. 번역가는 "대사가 누구에게 하는 말인지 몰랐다"고 해요.',
        sources: [
          { title: 'Microsoft — 앱 국제화 가이드라인(번역된 글자 길이에 맞춰 화면이 늘어나게 설계)', url: 'https://learn.microsoft.com/windows/apps/design/globalizing/guidelines-and-checklist-for-globalizing-your-app' },
          { title: 'Microsoft — 국제화 체크리스트(번역 시 글자 길이 30% 이상 증가 대비)', url: 'https://learn.microsoft.com/windows/win32/intl/internationalization-checklist' },
        ],
        neglect: { delta: { quality: -4, trust: -3 }, log: '영어판을 그대로 공개했다. 해외 유저들이 잘린 버튼과 뒤죽박죽인 이름을 캡처해 올렸다.' },
        byRole: {
          기획: {
            targets: ['org-art-ui'],
            wrongHint: '버튼과 메뉴처럼 화면 위 글자가 들어갈 자리를 디자인하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'UI파트가 "한국어 길이에 딱 맞춰 버튼을 만들어서 영어가 들어갈 자리가 없다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '마을·아이템 이름의 공식 번역을 정한 용어집을 만들고 모든 문구에 적용하게 한다', effect: { cost: 2, delta: { quality: 6, stability: 3, fatigue: 8, xp: 8 } }, result: '같은 마을이 세 가지 이름으로 나오던 문제가 사라졌다.', next: null },
                  { kind: 'mine', label: '번역가가 볼 수 있게 대사마다 말하는 사람·듣는 사람·상황 설명을 붙인다', effect: { cost: 1, delta: { quality: 5, trust: 3, fatigue: 5, xp: 4 } }, result: '반말과 존댓말, 농담의 맥락이 영어에서도 살아났다.', next: null },
                  { kind: 'mine', label: '긴 영어 문장을 번역가에게 그냥 짧게 줄여 달라고만 한다', effect: { cost: 1, delta: { quality: 1, fatigue: 2, xp: 2 } }, result: '잘림은 줄었지만, 줄이면서 뜻이 빠진 문장이 생겼다.', next: null },
                  { kind: 'other', owner: 'org-art-ui', label: '버튼 크기를 직접 늘려 화면 배치를 바꾼다', feedback: '화면 배치와 버튼 디자인은 아트팀 UI파트가 맡아요. 기획은 어떤 정보가 꼭 보여야 하는지 알려요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '번역 업체를 직접 바꾸겠다고 계약을 끊는다', feedback: '외부 업체 선정과 계약은 사업팀과 법무·홍보·구매팀이 맡아요. 기획은 번역 품질 문제를 근거와 함께 전달해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-plan-scenario'],
            wrongHint: '게임 안의 문장과 대사를 쓰고 관리하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '시나리오파트가 "대사 일부가 코드 안에 직접 적혀 있어서 번역에서 빠졌다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '코드에 적힌 문장을 모두 언어 파일로 빼내, 언어만 바꾸면 화면 글자가 바뀌게 한다', effect: { cost: 2, delta: { quality: 4, stability: 6, fatigue: 9, xp: 8 } }, result: '빠진 문장 47개를 찾아냈다. 다음 언어를 추가하기도 쉬워졌다.', next: null },
                  { kind: 'mine', label: '글자가 길어지면 버튼과 글상자가 자동으로 늘어나게 화면 처리를 바꾼다', effect: { cost: 2, delta: { quality: 5, stability: 4, fatigue: 8, xp: 8 } }, result: '독일어처럼 더 긴 언어가 와도 글자가 잘리지 않는다.', next: null },
                  { kind: 'mine', label: '잘리는 곳만 글씨 크기를 작게 줄인다', effect: { cost: 1, delta: { quality: 1, stability: -1, fatigue: 3, xp: 2 } }, result: '잘림은 사라졌지만, 그 버튼만 글씨가 작아 읽기 어려워졌다.', next: null },
                  { kind: 'other', owner: 'org-plan-scenario', label: '어색한 영어 대사를 직접 고쳐 넣는다', feedback: '대사 내용은 시나리오파트가 번역가와 함께 다듬어요. 개발은 문장이 올바르게 들어가는 구조를 만들어요.' },
                  { kind: 'other', owner: 'org-art-ui', label: '영어용 메뉴 디자인을 직접 새로 짠다', feedback: '메뉴 디자인은 아트팀 UI파트의 일이에요. 개발은 디자인이 여러 길이의 글자를 담을 수 있게 구현해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-plan-scenario'],
            wrongHint: '번역할 원문과 대사의 맥락을 가진 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '시나리오파트가 "간판과 지도에 그려진 한글은 번역 목록에 없었다"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '그림 속 글자를 그림과 분리된 글자 층으로 바꿔, 언어별로 갈아 끼울 수 있게 한다', effect: { cost: 2, delta: { quality: 6, stability: 3, fatigue: 9, xp: 8 } }, result: '간판 12개가 영어로 바뀌었다. 다음 언어부터는 그림을 다시 그리지 않아도 된다.', next: null },
                  { kind: 'mine', label: '그림 속 글자가 들어간 곳의 목록을 만들어 시나리오파트의 번역 목록에 추가한다', effect: { cost: 1, delta: { quality: 3, stability: 2, trust: 3, fatigue: 4, xp: 4 } }, result: '번역이 빠지는 곳이 없게 됐다.', next: null },
                  { kind: 'mine', label: '한글 간판도 분위기라며 그대로 둔다', effect: { cost: 1, delta: { quality: -1, trust: -2, fatigue: 1, xp: 1 } }, result: '해외 유저는 어느 가게가 우체국인지 알아볼 수 없었다.', next: null },
                  { kind: 'other', owner: 'org-plan-scenario', label: '간판에 넣을 영어 이름을 직접 지어 그린다', feedback: '이름과 문구는 시나리오파트가 용어집 기준으로 정해요. 아트는 정해진 글자를 그림에 넣어요.' },
                  { kind: 'other', owner: 'org-program-program', label: '언어별로 그림을 바꿔 보여 주는 기능을 직접 코드로 만든다', feedback: '기능 구현은 개발팀 프로그램파트의 일이에요. 아트는 언어별 그림 자료를 준비해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-plan-scenario'],
            wrongHint: '어떤 문장이 원래 무슨 뜻인지 확인해 줄 수 있는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '시나리오파트가 "영어판을 처음부터 끝까지 봐 줄 사람이 필요하다"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '영어판을 끝까지 플레이하며 잘린 글자·번역 누락·이름 불일치를 화면과 함께 기록한다', effect: { cost: 2, delta: { quality: 5, stability: 5, fatigue: 9, xp: 8 } }, result: '잘림 18곳, 누락 9곳, 이름 불일치 6곳을 찾아 넘겼다.', next: null },
                  { kind: 'mine', label: '모든 글자를 일부러 길게 늘린 테스트용 언어로 화면을 미리 점검하자고 제안한다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 4, xp: 4 } }, result: '번역이 오기 전에도 어디가 잘릴지 미리 알 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '영어는 잘 모르니 화면이 깨지지 않는지만 본다', effect: { cost: 1, delta: { stability: 1, quality: -1, fatigue: 3, xp: 2 } }, result: '깨진 화면은 찾았지만, 뜻이 틀린 문장은 그대로 지나갔다.', next: null },
                  { kind: 'other', owner: 'org-plan-scenario', label: '어색한 번역을 직접 고쳐 문구 파일에 반영한다', feedback: '문구 수정은 시나리오파트가 번역가와 함께 해요. QA는 문제 위치와 원문을 정리해 넘겨요.' },
                  { kind: 'other', owner: 'org-art-ui', label: '잘리는 버튼의 디자인을 직접 고친다', feedback: '버튼 디자인은 아트팀 UI파트가 맡아요. QA는 잘린 위치를 화면과 함께 전달해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-plan-scenario'],
            wrongHint: '게임 속 이름과 문장을 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '시나리오파트가 "해외 홍보 자료와 게임 속 이름이 서로 달라졌다"고 짚었어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '시나리오파트의 용어집을 해외 홍보 자료와 스토어 페이지에도 똑같이 적용한다', effect: { cost: 1, delta: { quality: 2, trust: 6, fatigue: 4, xp: 4 } }, result: '광고에서 본 이름과 게임 속 이름이 같아졌다.', next: null },
                  { kind: 'mine', label: '공개 전에 영어권 유저 몇 명에게 먼저 보여 주고 어색한 표현을 모은다', effect: { cost: 2, delta: { quality: 4, trust: 5, fatigue: 7, xp: 8 } }, result: '"우체부" 번역이 영어권에서는 어린아이처럼 들린다는 의견을 미리 받았다.', next: null },
                  { kind: 'mine', label: '해외 홍보에는 자동 번역 문구를 그대로 쓴다', effect: { cost: 1, delta: { trust: -4, fatigue: 1, xp: 1 } }, result: '빠르게 올렸지만, 어색한 문장이 그대로 게임의 첫인상이 됐다.', next: null },
                  { kind: 'other', owner: 'org-plan-scenario', label: '해외에서 잘 먹힐 이름으로 캐릭터 이름을 직접 바꾼다', feedback: '캐릭터와 세계의 이름은 시나리오파트가 정해요. 마케팅은 현지 반응 근거를 전달해요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '번역 업체 계약서를 직접 고쳐 다시 보낸다', feedback: '계약서 검토와 수정은 법무·홍보·구매팀이 해요. 사업·마케팅은 필요한 조건을 정리해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'release-save-bug',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '공개 이틀 전, 저장이 날아가는 버그가 나왔어요',
        situation:
          '정식 공개까지 이틀 남았어요. 최종 점검에서 100번에 1번꼴로 저장 데이터가 사라지는 버그가 나왔어요. 원인은 아직 몰라요. 예정대로 공개할지, 미룰지 정해야 해요.',
        sources: [
          { title: 'Google SRE Workbook — Canarying Releases(일부 유저에게 먼저 배포해 영향을 줄이며 검증)', url: 'https://sre.google/workbook/canarying-releases/' },
          { title: 'Google SRE Book — Release Engineering(재현 가능한 빌드와 배포 기준)', url: 'https://sre.google/sre-book/release-engineering/' },
        ],
        neglect: { delta: { stability: -7, trust: -5 }, log: '판단을 미룬 채 공개일이 됐다. 첫날 저장이 사라졌다는 문의가 쏟아졌다.' },
        byRole: {
          기획: {
            targets: ['org-devsupport-qa'],
            wrongHint: '이 버그가 얼마나 자주, 어떤 조건에서 생기는지 아는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 "저장 중에 창을 닫으면 생긴다, 영향받는 건 진행도 데이터"라고 정리해 줬어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '저장이 날아가도 피해가 작도록, 중요한 순간마다 자동 저장 지점을 하나 더 두자고 제안한다', effect: { cost: 1, delta: { quality: 2, stability: 5, trust: 4, fatigue: 5, xp: 4 } }, result: '최악의 경우에도 잃는 진행은 5분 이내가 됐다. 공개 판단에 쓸 수 있는 선택지가 하나 늘었다.', next: null },
                  { kind: 'mine', label: '이 버그를 고치는 데 필요하면 공개 범위에서 뺄 수 있는 콘텐츠를 정리해 PMO에 넘긴다', effect: { cost: 2, delta: { stability: 5, trust: 4, fatigue: 7, xp: 8 } }, result: '개발팀이 버그에만 집중할 수 있도록 미뤄도 되는 일 3개를 내놓았다.', next: null },
                  { kind: 'mine', label: '100번에 1번이면 드문 일이라며 그대로 가자고 한다', effect: { cost: 1, delta: { stability: -4, trust: -4, fatigue: 1, xp: 1 } }, result: '유저 1만 명이 하루 세 번 저장하면 300번이 날아간다. 드문 일이 아니었다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '공개를 일주일 미루겠다고 직접 발표한다', feedback: '공개 여부와 일정은 PMO가 QA·개발 리더와 함께 판단해요. 기획은 판단에 필요한 정보를 줘요.' },
                  { kind: 'other', owner: 'org-program-db', label: '저장 데이터 구조를 직접 바꿔 버그를 막는다', feedback: '저장 데이터 구조는 개발팀 DB파트가 맡아요. 기획은 어떤 데이터가 꼭 지켜져야 하는지 알려요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-devsupport-qa'],
            wrongHint: '버그가 생기는 조건을 재현해 정리하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'QA파트가 재현 순서와 발생 기기 목록을 넘겨줬어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '저장할 때 임시 파일에 먼저 쓰고, 다 쓴 뒤에 바꿔치기하도록 고쳐 중간에 끊겨도 원본이 남게 한다', effect: { cost: 2, delta: { quality: 3, stability: 9, fatigue: 10, xp: 8 } }, result: '창을 닫아도 이전 저장은 그대로 남는다. QA가 같은 조건으로 200번 시험해 한 번도 날아가지 않았다.', next: null },
                  { kind: 'mine', label: '수정본을 먼저 유저 10%에게만 배포하고 문제가 없으면 넓히는 계획을 세운다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: 5, xp: 4 } }, result: '혹시 새 문제가 생겨도 영향은 일부에 그친다.', next: null },
                  { kind: 'mine', label: '원인은 모르지만 저장 직후 한 번 더 저장하게 해서 덮어 둔다', effect: { cost: 1, delta: { stability: -2, quality: -1, fatigue: 4, xp: 2 } }, result: '발생 빈도는 줄었지만 원인은 그대로다. 더 찾기 어려운 버그가 됐다.', next: null },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '고쳤으니 테스트 없이 바로 "해결"로 닫는다', feedback: '해결 확인은 QA파트가 같은 조건으로 다시 시험한 뒤 해요. 개발은 무엇을 바꿨는지 알려요.' },
                  { kind: 'other', owner: 'org-pmo', label: '공개해도 된다고 직접 결론 내려 팀에 알린다', feedback: '공개 여부는 PMO가 QA·개발 리더와 함께 판단해요. 개발은 수정 상태와 위험을 정확히 알려요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-pmo'],
            wrongHint: '공개할지 미룰지, 팀들의 판단을 모아 정하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "남은 이틀은 버그 수정에 집중하고 새 작업은 멈춘다"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '진행 중인 그림 작업을 멈추고, 저장 실패 시 보여 줄 안내 그림과 문구 자리를 준비한다', effect: { cost: 1, delta: { quality: 2, stability: 3, trust: 4, fatigue: 4, xp: 4 } }, result: '혹시 저장이 실패해도 유저가 무슨 일인지 알 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '공개 뒤 첫 업데이트에 넣을 그림 목록을 정리해, 지금은 손대지 않기로 한다', effect: { cost: 1, delta: { stability: 4, fatigue: -2, xp: 4 } }, result: '공개 직전 빌드에 변경이 섞이지 않아 버그 추적이 쉬워졌다.', next: null },
                  { kind: 'mine', label: '마지막 기회라며 그림 몇 장을 더 바꿔 넣는다', effect: { cost: 1, delta: { quality: 2, stability: -4, fatigue: 5, xp: 2 } }, result: '바뀐 그림 때문에 빌드를 다시 만들어야 했고, 버그 확인이 반나절 늦어졌다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '아트팀은 일정대로 공개하자고 직접 결정해 알린다', feedback: '공개 판단은 PMO가 팀들의 정보를 모아 해요. 아트는 아트 작업의 준비 상태를 알려요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '저장 버그를 직접 여러 번 재현해 보고서를 쓴다', feedback: '버그 재현과 보고서는 QA파트의 일이에요. 아트는 그림과 관련된 문제를 알려요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-pmo'],
            wrongHint: '공개할지 말지 최종 판단을 모으는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "공개 판단 회의에 QA 의견이 필요하다"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '재현 조건·발생 빈도·영향받는 데이터·수정 후 재시험 결과를 한 장으로 정리해 판단 근거로 낸다', effect: { cost: 1, delta: { stability: 6, trust: 6, fatigue: 5, xp: 4 } }, result: '회의가 "느낌"이 아니라 숫자로 진행됐다. 수정본 재시험 결과를 보고 공개를 정했다.', next: null },
                  { kind: 'mine', label: '수정본으로 저장 관련 시험을 집중적으로 다시 돌리고, 다른 기능이 망가지지 않았는지도 확인한다', effect: { cost: 2, delta: { quality: 3, stability: 8, fatigue: 10, xp: 8 } }, result: '수정 때문에 불러오기 화면이 느려진 걸 찾아냈다. 공개 전에 함께 고쳤다.', next: null },
                  { kind: 'mine', label: '불안하니 무조건 미뤄야 한다고만 말한다', effect: { cost: 1, delta: { stability: 1, trust: -3, fatigue: 2, xp: 2 } }, result: '걱정은 전했지만 근거가 없어 판단에 도움이 되지 않았다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '공개 연기를 직접 결정해 외부에 알린다', feedback: '공개 일정 결정은 PMO가 리더들과 함께, 외부 공지는 마케팅팀이 해요. QA는 품질 근거를 제공해요.' },
                  { kind: 'other', owner: 'org-program-db', label: '저장 처리 코드를 직접 고친다', feedback: '코드 수정은 개발팀의 일이에요. QA는 고친 결과를 다시 시험해 확인해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-pmo'],
            wrongHint: '공개 일정을 바꿀지 판단하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "공개를 미루면 외부에 어떤 영향이 있는지 알려 달라"고 했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '미룰 경우와 그대로 갈 경우, 외부 약속·광고 비용·파트너 일정에 생기는 영향을 정리해 넘긴다', effect: { cost: 1, delta: { stability: 4, trust: 6, fatigue: 5, xp: 4 } }, result: '하루 미루는 비용보다 저장 사고의 비용이 훨씬 크다는 게 분명해졌다.', next: null },
                  { kind: 'mine', label: '미루게 될 경우를 대비해 솔직한 연기 안내문 초안을 미리 써 둔다', effect: { cost: 1, delta: { trust: 5, fatigue: 4, xp: 4 } }, result: '결정이 나면 바로 알릴 수 있다. 이유를 숨기지 않는 문장으로 썼다.', next: null },
                  { kind: 'mine', label: '이미 광고를 집행했으니 무조건 예정대로 가야 한다고 주장한다', effect: { cost: 1, delta: { stability: -4, trust: -3, fatigue: 2, xp: 2 } }, result: '광고는 살렸지만, 첫 유저들의 저장이 날아갈 위험을 그대로 안았다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '공개 연기를 직접 결정한다', feedback: '공개 일정 결정은 PMO가 QA·개발 리더와 함께 해요. 마케팅은 외부 영향을 근거로 제공해요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '버그가 고쳐졌는지 직접 해 보고 판단한다', feedback: '수정 확인은 QA파트가 같은 조건으로 시험해서 해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'release-age-rating',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '공개 일주일 전, 연령 등급을 안 받았대요',
        situation:
          '국내 정식 공개를 일주일 앞두고, 게임 등급분류를 아직 받지 않았다는 걸 알았어요. 국내에서 게임을 서비스하려면 원칙적으로 등급분류를 받아야 해요. 누가 맡기로 했는지도 분명하지 않아요.',
        sources: [
          { title: '국가법령정보센터 — 게임산업진흥에 관한 법률(제21조 등급분류)', url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B2%8C%EC%9E%84%EC%82%B0%EC%97%85%EC%A7%84%ED%9D%A5%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0' },
          { title: '게임물관리위원회 — 등급분류 안내', url: 'https://www.grac.or.kr/' },
          { title: 'IARC — How IARC Works(설문 한 번으로 여러 스토어의 연령 등급 받기)', url: 'https://www.globalratings.com/how-iarc-works.aspx' },
        ],
        neglect: { delta: { stability: -5, trust: -6 }, log: '등급분류를 챙기지 못한 채 공개일이 다가왔다. 결국 국내 공개를 미뤄야 했다.' },
        byRole: {
          기획: {
            targets: ['org-biz-business'],
            wrongHint: '출시 플랫폼과 출시에 필요한 사업 절차를 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '사업팀이 "등급 신청서에 폭력성·사행성 같은 콘텐츠 정보를 정확히 적어야 한다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '전투 표현, 아이템 뽑기, 채팅 같은 등급에 영향을 주는 요소를 빠짐없이 정리해 넘긴다', effect: { cost: 2, delta: { stability: 6, trust: 5, fatigue: 8, xp: 8 } }, result: '신청서 질문에 바로 답할 수 있는 자료가 됐다. 등급이 예상과 다를 위험도 줄었다.', next: null },
                  { kind: 'mine', label: '목표 등급(전체 이용가)에 걸리는 요소가 있는지 확인하고 대안을 함께 제시한다', effect: { cost: 1, delta: { quality: 1, stability: 4, trust: 4, fatigue: 4, xp: 4 } }, result: '자유 채팅이 등급에 영향을 줄 수 있다는 걸 알고, 정해진 문장으로만 대화하는 대안을 냈다.', next: null },
                  { kind: 'mine', label: '귀여운 게임이니 등급은 문제없을 거라며 자료를 대충 넘긴다', effect: { cost: 1, delta: { stability: -3, trust: -3, fatigue: 1, xp: 1 } }, result: '빠진 정보 때문에 신청서를 다시 써야 했다.', next: null },
                  { kind: 'other', owner: 'org-biz-business', label: '등급분류 신청서를 직접 작성해 제출한다', feedback: '등급분류 신청은 사업팀이 출시 절차로 챙기고, 법적 검토는 법무팀이 도와요. 기획은 콘텐츠 정보를 정확히 줘요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '이 게임은 등급분류가 필요 없다고 직접 판단한다', feedback: '법이 적용되는지에 대한 판단은 법무·홍보·구매팀의 일이에요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-biz-business'],
            wrongHint: '출시에 필요한 절차와 서류를 챙기는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '사업팀이 "심사용 빌드와 설명 자료가 필요하다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '심사하는 사람이 모든 콘텐츠를 빠르게 볼 수 있게 심사용 빌드와 사용법을 만든다', effect: { cost: 2, delta: { stability: 6, trust: 5, fatigue: 8, xp: 8 } }, result: '심사에 필요한 장면을 바로 열 수 있다. 확인 질문이 줄었다.', next: null },
                  { kind: 'mine', label: '등급에 영향을 줄 수 있는 기능(채팅, 결제 등)이 빌드에 있는지 목록으로 확인해 넘긴다', effect: { cost: 1, delta: { stability: 4, trust: 4, fatigue: 4, xp: 4 } }, result: '테스트용으로 넣어 둔 결제 화면이 아직 남아 있다는 걸 찾았다.', next: null },
                  { kind: 'mine', label: '서류 일은 개발과 상관없다며 기능 개발을 계속한다', effect: { cost: 1, delta: { stability: -2, trust: -3, fatigue: 2, xp: 2 } }, result: '심사용 빌드가 늦어져 신청도 늦어졌다.', next: null },
                  { kind: 'other', owner: 'org-biz-business', label: '게임물관리위원회에 직접 연락해 일정을 조율한다', feedback: '외부 기관과의 출시 절차 창구는 사업팀이에요. 개발은 기술 자료를 준비해요.' },
                  { kind: 'other', owner: 'org-plan-system', label: '등급을 낮추려고 전투 규칙을 직접 바꾼다', feedback: '게임 규칙 변경은 기획팀 시스템파트가 정해요. 개발은 바뀐 규칙을 구현해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-biz-business'],
            wrongHint: '출시 전에 받아야 할 등급과 절차를 챙기는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '사업팀이 "표현 수위가 등급에 영향을 준다"고 알려 줬어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '전투·피해 표현이 들어간 그림과 효과를 모아 장면별로 정리해 넘긴다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 4, xp: 4 } }, result: '심사에 제출할 표현 자료가 한곳에 모였다.', next: null },
                  { kind: 'mine', label: '목표 등급에 걸릴 수 있는 표현을 순화한 대체 그림을 미리 준비한다', effect: { cost: 2, delta: { quality: 1, stability: 4, fatigue: 8, xp: 8 } }, result: '등급 결과가 예상과 달라도 바로 바꿔 넣을 수 있다.', next: null },
                  { kind: 'mine', label: '표현 수위는 아트의 개성이라며 정리를 미룬다', effect: { cost: 1, delta: { stability: -2, trust: -3, fatigue: 1, xp: 1 } }, result: '자료가 빠져 신청서 작성이 늦어졌다.', next: null },
                  { kind: 'other', owner: 'org-biz-business', label: '등급 결과를 예상해 스토어에 직접 등급 표시를 붙인다', feedback: '등급 표시는 공식 결과가 나온 뒤 사업팀이 절차대로 반영해요.' },
                  { kind: 'other', owner: 'org-plan', label: '등급에 걸리는 장면을 직접 기획에서 뺀다', feedback: '장면을 뺄지는 기획팀이 정해요. 아트는 표현을 바꿀 수 있는 방법을 제안해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-biz-business'],
            wrongHint: '출시 절차를 챙기는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '사업팀이 "신청서 내용이 실제 게임과 같아야 한다"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '신청서에 적은 콘텐츠 정보를 실제 빌드와 하나씩 대조해 다른 곳을 찾아 넘긴다', effect: { cost: 2, delta: { stability: 6, trust: 6, fatigue: 8, xp: 8 } }, result: '신청서에 없던 숨은 보스 연출 하나를 찾아 미리 추가했다.', next: null },
                  { kind: 'mine', label: '공개 전 점검표에 "등급분류 완료·표시 확인" 항목을 넣는다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 3, xp: 4 } }, result: '다음 출시부터는 같은 일이 점검 단계에서 걸러진다.', next: null },
                  { kind: 'mine', label: '등급은 QA가 볼 일이 아니라며 버그 확인만 계속한다', effect: { cost: 1, delta: { stability: -2, trust: -2, fatigue: 2, xp: 2 } }, result: '출시를 막을 수 있는 문제가 점검표 밖에 남았다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '이 정도 표현이면 전체 이용가라고 직접 판정한다', feedback: '등급은 공식 기관이나 등급 설문 결과로 정해지고, 법적 해석은 법무팀이 도와요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '등급분류 신청을 직접 제출한다', feedback: '출시 절차는 사업팀이 맡아요. QA는 제출 자료가 실제와 같은지 확인해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-support-legal'],
            wrongHint: '법이 정한 출시 요건을 검토하는 곳은 어디일까요? 다른 층에 있을 수도 있어요.',
            steps: [
              {
                id: 'main',
                prompt: '법무팀이 "국내 서비스는 등급분류가 원칙이고, 받는 경로는 직접 신청과 스토어 등급 설문 두 가지가 있다"고 설명했어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '우리 출시 플랫폼에 맞는 등급 경로를 정하고, 담당자와 마감일을 정해 출시 일정에 넣는다', effect: { cost: 2, delta: { stability: 7, trust: 5, fatigue: 8, xp: 8 } }, result: '누가, 언제까지 할지가 분명해졌다. 공개일을 지킬 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '앞으로 출시 체크리스트에 등급·약관·개인정보 처리방침 같은 필수 절차를 넣는다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 3, xp: 4 } }, result: '이번처럼 "누가 맡았는지 모르는" 일이 다시 생기지 않게 됐다.', next: null },
                  { kind: 'mine', label: '일단 공개하고 등급은 나중에 받자고 한다', effect: { cost: 1, delta: { stability: -5, trust: -5, fatigue: 1, xp: 1 } }, result: '법이 정한 절차를 건너뛰는 위험을 안게 됐다.', next: null },
                  { kind: 'other', owner: 'org-support-legal', label: '법 조문을 직접 해석해 예외에 해당한다고 결론 낸다', feedback: '법 적용과 예외 판단은 법무·홍보·구매팀의 일이에요. 사업팀은 출시 계획 정보를 줘요.' },
                  { kind: 'other', owner: 'org-plan', label: '등급을 낮추려고 콘텐츠를 직접 빼 달라고 정한다', feedback: '콘텐츠 변경은 기획팀이 정해요. 사업팀은 목표 등급과 그 이유를 전달해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'release-outage-notice',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '공개 첫날 서버가 멈췄는데 아무 공지가 없어요',
        situation:
          '정식 공개 첫날 저녁, 서버가 1시간째 접속이 안 돼요. 개발팀은 원인을 찾는 중인데 바깥에는 아무 공지도 없어요. 커뮤니티에는 "망한 거냐"는 글이 올라오고 있어요.',
        sources: [
          { title: 'Atlassian — Incident communication(장애 공지 채널·템플릿·업데이트 주기를 미리 정하기)', url: 'https://www.atlassian.com/incident-management/incident-communication' },
          { title: 'Google SRE Book — Postmortem Culture(탓하지 않는 사후 회고)', url: 'https://sre.google/sre-book/postmortem-culture/' },
        ],
        neglect: { delta: { stability: -3, trust: -8 }, log: '아무 말 없이 서버만 고쳤다. 다시 열렸을 때는 이미 많은 유저가 떠난 뒤였다.' },
        byRole: {
          기획: {
            targets: ['org-biz-marketing'],
            wrongHint: '유저에게 소식을 알리는 공지와 커뮤니티를 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "공지를 쓰려는데 유저에게 무엇을 보상할지 정해야 한다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '멈춘 시간 동안 잃은 진행을 기준으로, 게임 경제를 흔들지 않는 보상안을 설계한다', effect: { cost: 1, delta: { stability: 3, trust: 6, fatigue: 5, xp: 4 } }, result: '하루치 배달 보상을 주기로 했다. 게임 속 균형은 지키면서 사과의 뜻을 전했다.', next: null },
                  { kind: 'mine', label: '다시 열릴 때 기다린 유저가 바로 즐길 수 있는 짧은 환영 이벤트를 준비한다', effect: { cost: 2, delta: { quality: 3, trust: 5, fatigue: 8, xp: 8 } }, result: '돌아온 유저들이 화를 내기보다 이벤트 이야기를 하기 시작했다.', next: null },
                  { kind: 'mine', label: '미안하니 최고급 아이템을 모두에게 지급하자고 한다', effect: { cost: 1, delta: { quality: -2, trust: 2, stability: -2, fatigue: 2, xp: 2 } }, result: '당장은 반겼지만, 게임 속 경제가 흔들려 다음 주 콘텐츠가 싱거워졌다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '커뮤니티에 직접 사과 글을 올린다', feedback: '대외 공지는 마케팅팀이 정해진 채널과 형식으로 해요. 여러 사람이 각자 올리면 말이 엇갈려요.' },
                  { kind: 'other', owner: 'org-program-server', label: '서버를 직접 다시 켜 본다', feedback: '서버 복구는 개발팀 서버파트가 원인을 확인하며 해요. 함부로 다시 켜면 원인 기록이 사라질 수 있어요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-biz-marketing'],
            wrongHint: '유저에게 지금 상황을 알리는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "기술적으로 정확한 상황을 알려 줘야 공지를 쓸 수 있다"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '확인된 사실, 유저 데이터 안전 여부, 다음 소식 시간을 쉬운 말로 정리해 30분마다 전달한다', effect: { cost: 1, delta: { stability: 3, trust: 7, fatigue: 5, xp: 4 } }, result: '공지가 30분마다 올라오자 커뮤니티 분위기가 기다려 보자는 쪽으로 바뀌었다.', next: null },
                  { kind: 'mine', label: '복구 뒤 원인과 재발 방지책을 사람 탓 없이 정리하는 회고 문서를 쓴다', effect: { cost: 2, delta: { stability: 7, trust: 3, fatigue: 8, xp: 8 } }, result: '접속이 몰릴 때 자동으로 서버를 늘리는 설정이 빠져 있었다는 걸 모두가 배웠다.', next: null },
                  { kind: 'mine', label: '고치는 게 먼저라며 질문에 답하지 않는다', effect: { cost: 1, delta: { stability: 2, trust: -4, fatigue: 4, xp: 2 } }, result: '서버는 고쳤지만, 그동안 공지는 하나도 나가지 못했다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '공식 계정에 직접 기술 설명 글을 올린다', feedback: '대외 공지는 마케팅팀이 써요. 개발은 정확한 사실을 마케팅팀에 전달해요.' },
                  { kind: 'other', owner: 'org-plan', label: '보상 아이템을 직접 정해 지급한다', feedback: '보상 내용은 기획팀이 게임 경제를 보며 정해요. 개발은 지급 방법을 구현해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-biz-marketing'],
            wrongHint: '공지와 커뮤니티 소통을 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "공지 이미지가 필요하다"고 했어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '점검 중임을 알리는 간단하고 읽기 쉬운 공지 이미지를 빠르게 만든다', effect: { cost: 1, delta: { trust: 5, fatigue: 4, xp: 4 } }, result: '10분 만에 공지에 이미지가 붙었다. 상황이 한눈에 전달됐다.', next: null },
                  { kind: 'mine', label: '앞으로 쓸 점검·장애·복구 공지 이미지 템플릿을 미리 만들어 둔다', effect: { cost: 2, delta: { stability: 3, trust: 4, fatigue: 7, xp: 8 } }, result: '다음에는 글자만 바꿔 바로 올릴 수 있다.', next: null },
                  { kind: 'mine', label: '분위기를 살리려고 공들인 일러스트를 그리느라 공지를 늦춘다', effect: { cost: 1, delta: { quality: 1, trust: -3, fatigue: 6, xp: 2 } }, result: '그림은 예뻤지만, 공지는 2시간 뒤에야 나갔다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '개인 계정으로 커뮤니티에 상황을 설명한다', feedback: '대외 소통은 마케팅팀이 공식 채널로 해요. 개인 계정의 설명은 공식 입장과 엇갈릴 수 있어요.' },
                  { kind: 'other', owner: 'org-program-server', label: '서버 상태 화면을 직접 보며 원인을 추측해 공유한다', feedback: '원인 파악은 서버파트가 해요. 확인되지 않은 추측이 퍼지면 혼란이 커져요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-biz-marketing'],
            wrongHint: '유저의 문의와 공지를 맡는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '마케팅팀이 "유저 문의가 쏟아지는데 무엇이 사실인지 모르겠다"고 했어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '유저 문의를 증상별로 묶어, 서버 장애와 다른 버그를 구분해 개발팀과 마케팅팀에 나눠 전달한다', effect: { cost: 2, delta: { stability: 6, trust: 4, fatigue: 9, xp: 8 } }, result: '문의 중 일부는 서버와 상관없는 결제 화면 버그였다. 따로 고칠 수 있었다.', next: null },
                  { kind: 'mine', label: '서버가 다시 열리면 로그인·저장·배달 같은 핵심 기능을 바로 확인하는 순서를 준비한다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 4, xp: 4 } }, result: '복구 10분 만에 "정상"이라고 자신 있게 알릴 수 있었다.', next: null },
                  { kind: 'mine', label: '서버는 내 담당이 아니라며 원래 테스트 계획을 계속한다', effect: { cost: 1, delta: { stability: -1, trust: -3, fatigue: 2, xp: 1 } }, result: '가장 급한 순간에 QA의 확인 능력이 쓰이지 못했다.', next: null },
                  { kind: 'other', owner: 'org-biz-marketing', label: '유저 문의에 직접 하나하나 답장한다', feedback: '유저 응대는 마케팅팀이 공식 문구로 해요. QA는 답에 필요한 사실을 정리해 줘요.' },
                  { kind: 'other', owner: 'org-pmo', label: '오늘 이벤트를 직접 취소한다', feedback: '일정과 이벤트 변경은 PMO가 관련 팀과 함께 정해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-program-server'],
            wrongHint: '서버가 왜 멈췄고 언제 돌아올지 아는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '서버파트가 "원인은 찾는 중이고 유저 데이터는 안전하다"고 알려 줬어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '확인된 사실만 담아 바로 첫 공지를 올리고, 다음 소식 시간을 약속한 뒤 지킨다', effect: { cost: 1, delta: { trust: 8, fatigue: 5, xp: 4 } }, result: '"30분 뒤 다시 알려 드릴게요"를 지키자, 기다리는 사람이 늘었다.', next: null },
                  { kind: 'mine', label: '공지 채널·문구 템플릿·담당자를 정한 장애 공지 절차를 만든다', effect: { cost: 2, delta: { stability: 4, trust: 5, fatigue: 7, xp: 8 } }, result: '다음 장애 때는 누가 무엇을 올릴지 고민하지 않아도 된다.', next: null },
                  { kind: 'mine', label: '원인이 확실해질 때까지 공지를 미룬다', effect: { cost: 1, delta: { trust: -5, fatigue: 2, xp: 1 } }, result: '정확함을 기다리는 동안 소문이 먼저 퍼졌다.', next: null },
                  { kind: 'other', owner: 'org-program-server', label: '복구 예상 시간을 직접 정해 공지한다', feedback: '복구 시간 예측은 서버파트가 해요. 마케팅이 임의로 시간을 약속하면 지키지 못할 수 있어요.' },
                  { kind: 'other', owner: 'org-plan', label: '보상 아이템을 직접 정해 공지에 넣는다', feedback: '보상 내용은 기획팀이 게임 경제를 보며 정해요. 마케팅은 유저 분위기를 전달해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'release-late-feature',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '공개 사흘 전, 새 기능을 넣자는 요청이 왔어요',
        situation:
          '정식 공개를 사흘 앞두고 "친구 초대 기능이 있으면 홍보에 좋겠다, 지금 넣자"는 요청이 왔어요. 빌드는 이미 최종 점검 중이고, 변경을 멈추기로 한 시점이 지났어요.',
        sources: [
          { title: 'Chromium — Release Cycle(정해진 시점 이후에는 안정화 변경만 받는 출시 주기)', url: 'https://chromium.googlesource.com/chromium/src/+/main/docs/process/release_cycle.md' },
          { title: 'Google SRE Book — Release Engineering(출시 직전 변경 관리)', url: 'https://sre.google/sre-book/release-engineering/' },
        ],
        neglect: { delta: { stability: -5, trust: -3 }, log: '요청을 정리하지 못한 채 여러 팀이 각자 손을 댔다. 최종 점검을 다시 해야 했다.' },
        byRole: {
          기획: {
            targets: ['org-pmo'],
            wrongHint: '출시 직전 변경을 받을지 말지 판단하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "변경을 받으려면 무엇을 얻고 무엇을 잃는지 근거가 필요하다"고 했어요. 기획자로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '친구 초대 기능을 공개 뒤 첫 업데이트에 넣는 계획으로 다시 정리해 제안한다', effect: { cost: 1, delta: { stability: 6, trust: 4, fatigue: 4, xp: 4 } }, result: '요청은 버리지 않고 시점만 옮겼다. 최종 빌드는 흔들리지 않았다.', next: null },
                  { kind: 'mine', label: '기능 없이도 할 수 있는 대안(초대 링크를 공유하는 이벤트)을 설계한다', effect: { cost: 2, delta: { quality: 2, stability: 4, trust: 5, fatigue: 7, xp: 8 } }, result: '게임을 바꾸지 않고도 홍보 목적을 이룰 방법이 생겼다.', next: null },
                  { kind: 'mine', label: '요청이니 간단하게라도 기획서를 써서 바로 넘긴다', effect: { cost: 1, delta: { quality: 1, stability: -4, fatigue: 5, xp: 2 } }, result: '급하게 쓴 기획서 때문에 개발팀과 QA가 최종 점검을 멈췄다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '변경을 받겠다고 직접 확정해 공지한다', feedback: '출시 직전 변경 승인은 PMO가 리더들과 위험을 따져 정해요. 기획은 기능의 가치와 대안을 정리해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '친구 초대 기능의 구현 기간을 직접 추정해 약속한다', feedback: '구현 기간 추정은 개발팀이 해요.' },
                ],
              },
            ],
          },
          프로그래밍: {
            targets: ['org-pmo'],
            wrongHint: '변경을 멈추기로 한 시점 이후의 요청을 조율하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "구현하면 어떤 위험이 있는지 알려 달라"고 했어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '구현 기간, 건드려야 할 코드, 다시 해야 할 테스트 범위를 정리해 PMO에 넘긴다', effect: { cost: 1, delta: { stability: 6, trust: 5, fatigue: 4, xp: 4 } }, result: '서버와 계정 시스템까지 손대야 해서 최종 점검을 처음부터 다시 해야 한다는 게 드러났다.', next: null },
                  { kind: 'mine', label: '공개 뒤 업데이트에 넣을 수 있게 기능을 켜고 끌 수 있는 구조로 미리 설계만 해 둔다', effect: { cost: 2, delta: { stability: 3, quality: 2, fatigue: 7, xp: 8 } }, result: '최종 빌드는 그대로 두고, 다음 업데이트 준비를 시작했다.', next: null },
                  { kind: 'mine', label: '밤새 몰래 만들어 최종 빌드에 넣는다', effect: { cost: 2, delta: { quality: 1, stability: -6, fatigue: 14, xp: 2 } }, result: '기능은 들어갔지만 검증되지 않은 코드가 공개 빌드에 섞였다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '변경은 절대 안 된다고 직접 거절해 요청자에게 통보한다', feedback: '변경을 받을지 판단하고 요청자와 조율하는 건 PMO의 일이에요. 개발은 위험과 비용을 알려요.' },
                  { kind: 'other', owner: 'org-plan', label: '친구 초대 화면을 직접 설계해 만든다', feedback: '기능 설계는 기획팀이 해요. 개발은 기술적으로 가능한 방법을 제안해요.' },
                ],
              },
            ],
          },
          아트: {
            targets: ['org-pmo'],
            wrongHint: '출시 직전 작업을 늘릴지 판단하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "아트 작업은 얼마나 드는지" 물었어요. 아티스트로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '필요한 화면·아이콘 수와 작업 시간을 정리해 PMO에 넘긴다', effect: { cost: 1, delta: { stability: 5, trust: 4, fatigue: 3, xp: 4 } }, result: '아트만 이틀이 필요하다는 근거가 판단에 보태졌다.', next: null },
                  { kind: 'mine', label: '공개 뒤 업데이트에 쓸 수 있게 초대 화면 시안만 미리 그려 둔다', effect: { cost: 2, delta: { quality: 2, stability: 2, fatigue: 7, xp: 8 } }, result: '최종 빌드는 건드리지 않고 다음 업데이트를 앞당길 준비를 했다.', next: null },
                  { kind: 'mine', label: '요청을 듣자마자 화면 그림을 그려 빌드에 넣는다', effect: { cost: 1, delta: { quality: 1, stability: -4, fatigue: 6, xp: 2 } }, result: '그림이 들어가자 빌드를 다시 만들어야 했다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '아트팀은 못 한다고 직접 요청자에게 거절한다', feedback: '요청자와의 조율은 PMO가 해요. 아트는 작업량 근거를 줘요.' },
                  { kind: 'other', owner: 'org-plan', label: '친구 초대 기능의 흐름을 직접 정한다', feedback: '기능의 흐름 설계는 기획팀이 해요. 아트는 정해진 흐름에 맞춰 화면을 그려요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-pmo'],
            wrongHint: '출시 직전 변경의 위험을 판단하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "이 기능이 들어가면 다시 시험해야 할 범위가 어디까지인지" 물었어요. QA로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '기능이 닿는 계정·서버·저장 영역을 짚고, 다시 시험하는 데 드는 시간을 계산해 넘긴다', effect: { cost: 1, delta: { stability: 6, trust: 5, fatigue: 4, xp: 4 } }, result: '재시험에 이틀 반이 든다는 숫자가 나왔다. 공개일을 지킬 수 없다는 게 분명해졌다.', next: null },
                  { kind: 'mine', label: '변경 동결 이후 들어오는 요청을 기록하고 공개 뒤 순서대로 검토하는 목록을 만든다', effect: { cost: 1, delta: { stability: 5, trust: 3, fatigue: 3, xp: 4 } }, result: '요청이 사라지지 않고 다음 업데이트 후보로 남았다.', next: null },
                  { kind: 'mine', label: '작은 기능이니 대충 한 번만 확인하면 된다고 말한다', effect: { cost: 1, delta: { stability: -4, trust: -2, fatigue: 2, xp: 1 } }, result: '작아 보이는 기능이 계정 시스템을 건드린다는 걸 놓쳤다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '변경 요청을 직접 승인하고 테스트 일정을 바꾼다', feedback: '변경 승인과 일정 조정은 PMO가 해요. QA는 재시험 범위와 시간을 근거로 줘요.' },
                  { kind: 'other', owner: 'org-program-program', label: '기능 일부를 직접 코드로 만들어 시험해 본다', feedback: '구현은 개발팀의 일이에요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-pmo'],
            wrongHint: '출시 직전에 기능을 넣을지 말지 판단하는 곳은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: 'PMO가 "지금 넣으면 공개를 최소 사흘 미뤄야 한다"고 알려 줬어요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  { kind: 'mine', label: '공개는 예정대로 하고, 친구 초대 기능은 첫 업데이트의 홍보 소재로 쓰자고 제안한다', effect: { cost: 1, delta: { stability: 5, trust: 5, fatigue: 3, xp: 4 } }, result: '공개일도 지키고, 한 주 뒤 알릴 거리도 생겼다.', next: null },
                  { kind: 'mine', label: '기능 없이 할 수 있는 초대 이벤트(공유 링크·보상)를 사업팀·기획팀과 함께 꾸린다', effect: { cost: 2, delta: { trust: 6, quality: 1, fatigue: 7, xp: 8 } }, result: '게임을 바꾸지 않고도 초대 효과를 시험할 수 있게 됐다.', next: null },
                  { kind: 'mine', label: '홍보 효과가 크니 일정이 밀려도 꼭 넣어야 한다고 고집한다', effect: { cost: 1, delta: { stability: -4, trust: -3, fatigue: 3, xp: 2 } }, result: '팀들은 다시 최종 점검을 시작해야 했다.', next: null },
                  { kind: 'other', owner: 'org-pmo', label: '공개일을 직접 사흘 미루겠다고 정한다', feedback: '공개 일정 결정은 PMO가 리더들과 함께 해요. 마케팅은 일정 변경의 영향을 알려요.' },
                  { kind: 'other', owner: 'org-program-program', label: '개발자에게 따로 부탁해 기능을 몰래 넣는다', feedback: '구현 순서는 개발팀이 PMO와 정한 계획대로 해요. 따로 하는 부탁은 최종 점검을 흔들어요.' },
                ],
              },
            ],
          },
        },
      },
      // 웹서비스팀 (2026-11-17, user-directed): 자사 게임의 웹페이지 제작·운영. 프리 데모 단계부터 나온다.
      {
        id: 'web-official-site',
        stage: 1,
        scope: 'cross',
        initiator: 'event',
        title: '게임을 소개할 공식 홈페이지가 없어요',
        situation: '프리 데모 소식이 알려지자 커뮤니티에서 "게임 정보는 어디서 보나요?"라는 질문이 이어져요. 지금은 회사 소개 페이지 한 장뿐이라 게임 소개, 스크린샷, 공개 일정을 안내할 곳이 없어요.',
        sources: [
          { title: 'Steamworks — 스토어 페이지(게임 소개에 필요한 정보와 자산)', url: 'https://partner.steamgames.com/doc/store' },
          { title: 'Google Search Central — 웹 개발자를 위한 검색엔진 최적화 가이드', url: 'https://developers.google.com/search/docs/fundamentals/get-started-developers' },
          { title: 'web.dev — 반응형 웹 디자인 기초', url: 'https://web.dev/articles/responsive-web-design-basics' },
        ],
        neglect: {
          delta: { trust: -4 },
          log: '공식 홈페이지 없이 소식이 커뮤니티 글로만 퍼졌다. 잘못된 정보가 바로잡히지 않았다.',
        },
        byRole: {
          '기획': {
            targets: ['org-webservice'],
            wrongHint: '자사 게임의 공식 홈페이지를 직접 만들고 운영하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "홈페이지에 넣을 게임 소개와 핵심 특징을 정리해 달라"고 요청했어요. 기획자로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '세계관·핵심 재미·플레이 방식을 짧은 소개 문장과 특징 3가지로 정리해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, quality: 1, fatigue: 4, xp: 4 },
                    },
                    result: '웹 PM이 바로 페이지 구성에 쓸 수 있는 소개 문구가 생겼다. 게임을 한 문장으로 설명하는 것도 기획의 일이다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '데모에서 확정된 내용과 아직 바뀔 수 있는 내용을 나눠 표시해 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, stability: 2, fatigue: 7, xp: 8 },
                    },
                    result: '아직 바뀔 수 있는 기능이 홈페이지에 약속처럼 올라가는 일을 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '기획 문서 전체를 그대로 보내고 알아서 골라 쓰라고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: -1, fatigue: 2, xp: 2 },
                    },
                    result: '웹 PM이 문서를 다시 읽고 골라내느라 일정이 밀렸다. 전달할 내용은 받는 사람에 맞게 정리해야 한다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '홈페이지 메뉴 구성과 화면 배치를 직접 설계해 확정한다', feedback: '페이지 구성과 화면 설계는 웹서비스팀의 일이에요. 기획은 게임에 대한 정확한 내용을 정리해 넘겨요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '홈페이지 공개에 맞춘 광고 문구와 홍보 일정을 직접 정한다', feedback: '홍보 메시지와 일정은 마케팅팀의 일이에요. 기획은 소개 내용이 게임과 맞는지 확인해 줘요.' },
                ],
              },
            ],
          },
          '프로그래밍': {
            targets: ['org-webservice'],
            wrongHint: '자사 게임의 공식 홈페이지를 직접 만들고 운영하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 개발자가 "데모 빌드의 버전과 사양을 홈페이지에 정확히 보여 주고 싶다"고 해요. 프로그래머로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '데모 버전·최소 사양 같은 정보를 정해진 형식의 파일로 내보내 웹에서 읽을 수 있게 한다',
                    effect: {
                      cost: 2,
                      delta: { stability: 5, trust: 4, fatigue: 8, xp: 8 },
                    },
                    result: '빌드가 바뀔 때마다 홈페이지 정보도 같이 맞춰진다. 손으로 고치다 틀리는 일이 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '최소·권장 사양을 실제로 측정해 정확한 값을 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 2, fatigue: 4, xp: 4 },
                    },
                    result: '홈페이지에 적힌 사양이 실제와 맞아 문의가 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '지금 바쁘니 사양은 대충 적어 달라고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: -2, fatigue: 1, xp: 1 },
                    },
                    result: '사양이 틀렸다는 제보가 들어와 다시 고쳐야 했다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '홈페이지 화면을 직접 코딩해서 올린다', feedback: '홈페이지 구현과 운영은 웹서비스팀 웹 개발자의 일이에요. 게임 프로그래머는 게임 쪽 데이터와 정보를 정확히 넘겨요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '홈페이지가 모든 브라우저에서 열리는지 점검 기준을 직접 만든다', feedback: '웹 표준과 크로스 브라우징 기준은 퍼블리싱본부 표준 및 접근성 영역의 일이에요.' },
                ],
              },
            ],
          },
          '아트': {
            targets: ['org-webservice'],
            wrongHint: '자사 게임의 공식 홈페이지를 직접 만들고 운영하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 디자이너가 "홈페이지 첫 화면에 쓸 키 아트와 캐릭터 그림이 필요하다"고 해요. 아티스트로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: 'PC 가로 화면과 모바일 세로 화면에 모두 쓸 수 있게 여백을 둔 키 아트 원본을 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, quality: 2, fatigue: 8, xp: 8 },
                    },
                    result: '웹 디자이너가 화면 크기마다 그림을 다시 자르지 않고 배치할 수 있었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '캐릭터·색상 사용 규칙을 한 장으로 정리해 함께 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 1, fatigue: 4, xp: 4 },
                    },
                    result: '홈페이지와 게임 화면의 색과 분위기가 맞춰졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '게임 속 스크린샷만 몇 장 보내 준다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, fatigue: 2, xp: 2 },
                    },
                    result: '첫 화면에 쓸 큰 그림이 없어 홈페이지 첫인상이 약했다.',
                    next: null,
                  },
                  {
                    kind: 'other',
                    owner: 'org-webservice',
                    label: '홈페이지 화면 디자인과 배너를 직접 완성해 올린다',
                    feedback: '홈페이지 화면 구성과 배너 디자인은 웹서비스팀 웹 디자이너의 일이에요. 아트팀은 게임 그림과 사용 규칙을 넘겨요.',
                  },
                  { kind: 'other', owner: 'org-biz-marketing', label: '홈페이지에 올릴 홍보 문구를 직접 쓴다', feedback: '홍보 메시지는 마케팅팀이 정해요. 아트팀은 그림이 메시지와 어울리는지 함께 봐요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-webservice'],
            wrongHint: '자사 게임의 공식 홈페이지를 직접 만들고 운영하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "공개 전에 홈페이지 내용이 실제 데모와 맞는지 봐 달라"고 해요. QA로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '홈페이지의 소개·사양·스크린샷을 실제 데모와 하나씩 대조해 다른 곳을 목록으로 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, stability: 2, fatigue: 4, xp: 4 },
                    },
                    result: '데모에 없는 기능이 소개되어 있던 두 군데를 공개 전에 바로잡았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: 'PC·모바일 주요 기기에서 페이지를 열어 깨지는 화면을 재현 조건과 함께 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 5, trust: 3, fatigue: 7, xp: 8 },
                    },
                    result: '모바일에서 버튼이 잘리던 문제를 웹 개발자가 공개 전에 고쳤다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '한 번 훑어보고 괜찮다고 답한다',
                    effect: {
                      cost: 1,
                      delta: { fatigue: 1, xp: 1 },
                    },
                    result: '공개 뒤 사양 표가 틀렸다는 제보가 들어왔다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '틀린 문구를 직접 고쳐 홈페이지에 반영한다', feedback: '홈페이지 수정과 반영은 웹서비스팀이 해요. QA는 문제와 근거를 넘기고 고친 결과를 확인해요.' },
                  { kind: 'other', owner: 'org-plan', label: '홈페이지에 소개할 게임 특징을 직접 정한다', feedback: '게임을 어떻게 소개할지는 기획팀이 정리해요. QA는 소개가 실제 빌드와 맞는지 확인해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-webservice'],
            wrongHint: '자사 게임의 공식 홈페이지를 직접 만들고 운영하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "홈페이지로 무엇을 이루고 싶은지 목표를 정해 달라"고 해요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '홈페이지 목표를 "데모 공개 소식 받기 신청"으로 정하고 어디서 방문자를 데려올지 계획을 공유한다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, fatigue: 7, xp: 8 },
                    },
                    result: '홈페이지에서 무엇을 가장 크게 보여 줄지 정해졌다. 방문자를 데려오는 건 마케팅, 그 방문자를 맞을 페이지는 웹서비스팀의 몫이다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '출시 플랫폼과 공개 일정처럼 확정된 사업 정보만 정리해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 1, fatigue: 3, xp: 4 },
                    },
                    result: '홈페이지에 틀린 일정이 올라가는 일을 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '다른 게임 홈페이지를 보내며 똑같이 만들어 달라고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: -2, fatigue: 2, xp: 1 },
                    },
                    result: '우리 게임에 맞지 않는 구성이라 처음부터 다시 정리해야 했다.',
                    next: null,
                  },
                  {
                    kind: 'other',
                    owner: 'org-webservice',
                    label: '홈페이지 메뉴와 화면 배치를 직접 정해 개발자에게 넘긴다',
                    feedback: '페이지 구성과 제작 일정 조율은 웹서비스팀 웹 PM의 일이에요. 사업·마케팅은 목표와 방문자 유입 계획을 정해요.',
                  },
                  { kind: 'other', owner: 'area-pub-architecture', label: '홈페이지에 쓸 웹 컴포넌트 구조를 직접 정한다', feedback: '공통 웹 컴포넌트 구조는 퍼블리싱본부 기술 및 아키텍처 영역의 일이에요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'web-preregistration',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '사전예약을 받을 페이지가 필요해요',
        situation: '공개 데모 일정이 정해지자 마케팅팀이 홍보를 시작하려 해요. 그런데 홍보를 보고 들어온 사람이 "출시되면 알려 주세요"라고 신청할 곳이 없어요. 사전예약 페이지가 있어야 관심이 실제 예약으로 이어져요.',
        sources: [
          { title: 'Google Play Console 고객센터 — 사전 등록으로 앱 알리기', url: 'https://support.google.com/googleplay/android-developer/answer/9859047' },
          { title: 'Steamworks — 출시 예정(Coming Soon) 페이지', url: 'https://partner.steamgames.com/doc/store/coming_soon' },
          { title: '국가법령정보센터 — 개인정보 보호법(수집·이용 동의)', url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95' },
        ],
        neglect: {
          delta: { trust: -4 },
          log: '사전예약 받을 곳 없이 홍보를 시작했다. 관심을 보인 사람들을 다시 찾을 방법이 없었다.',
        },
        byRole: {
          '기획': {
            targets: ['org-webservice'],
            wrongHint: '사전예약 페이지를 만들고 운영할 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "사전예약 보상을 무엇으로 할지 정해 달라"고 해요. 기획자로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '게임 밸런스를 해치지 않는 꾸미기 아이템으로 보상을 정하고 지급 조건을 문서로 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, stability: 3, fatigue: 7, xp: 8 },
                    },
                    result: '보상이 밸런스를 흔들지 않으면서도 예약할 이유가 생겼다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '보상 이름과 짧은 설명 문구를 정리해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '페이지에 보상을 보여 줄 문구가 준비됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '강한 성장 아이템을 보상으로 주자고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 2, stability: -3, fatigue: 3, xp: 2 },
                    },
                    result: '예약은 끌겠지만 출시 직후 밸런스 문제가 걱정거리로 남았다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '사전예약 신청 화면을 직접 그려 개발자에게 넘긴다', feedback: '신청 화면 설계와 디자인은 웹서비스팀의 일이에요. 기획은 보상과 지급 조건을 정해 넘겨요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '사전예약 개인정보 수집 동의 문구를 직접 쓴다', feedback: '개인정보 수집 동의와 약관 검토는 법무·홍보·구매팀이 맡아요.' },
                ],
              },
            ],
          },
          '프로그래밍': {
            targets: ['org-webservice'],
            wrongHint: '사전예약 페이지를 만들고 운영할 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 개발자가 "예약 정보를 어디에 저장하고, 출시 때 보상을 어떻게 지급할지" 묻고 있어요. 프로그래머로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '서버파트와 함께 예약 저장과 보상 지급 방식을 정해 웹에서 쓸 연동 규격을 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 4, fatigue: 8, xp: 8 },
                    },
                    result: '웹 페이지와 게임 서버가 같은 규칙으로 예약을 다루게 됐다. 화면은 웹서비스팀, 서버 연동은 서버파트가 맡는 구조가 분명해졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '같은 사람이 여러 번 예약하지 않도록 중복 확인 기준을 정해 준다',
                    effect: {
                      cost: 1,
                      delta: { stability: 4, fatigue: 4, xp: 4 },
                    },
                    result: '중복 예약으로 숫자가 부풀려지는 일을 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '일단 화면부터 열고 서버 연동은 나중에 하자고 한다',
                    effect: {
                      cost: 1,
                      delta: { stability: -3, trust: 1, fatigue: 2, xp: 2 },
                    },
                    result: '예약은 받았지만 출시 때 보상을 누구에게 줄지 다시 정리해야 하는 숙제가 남았다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '사전예약 페이지 화면과 버튼을 직접 만든다', feedback: '페이지 화면 구현은 웹서비스팀 웹 개발자의 일이에요. 게임 프로그래머는 서버 연동에 필요한 정보를 맞춰요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '사전예약 목표 인원을 직접 정해 공지한다', feedback: '예약 목표와 홍보 계획은 마케팅팀이 정해요.' },
                ],
              },
            ],
          },
          '아트': {
            targets: ['org-webservice'],
            wrongHint: '사전예약 페이지를 만들고 운영할 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 디자이너가 "사전예약 페이지와 홍보 배너에 같은 그림을 쓰고 싶다"고 해요. 아티스트로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '보상 아이템 그림과 키 아트를 웹·배너 크기에 맞게 원본으로 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, quality: 1, fatigue: 8, xp: 8 },
                    },
                    result: '페이지와 배너가 같은 그림으로 이어져 홍보를 보고 들어온 사람이 헷갈리지 않았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '보상 아이템이 실제 게임에서 어떻게 보이는지 캡처를 함께 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '받게 될 보상이 분명히 보여 신청할 이유가 생겼다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '아직 확정되지 않은 콘셉트 그림을 보낸다',
                    effect: {
                      cost: 1,
                      delta: { trust: -2, fatigue: 2, xp: 2 },
                    },
                    result: '출시 때 그림이 달라질 수 있어 문구를 다시 고쳐야 했다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '사전예약 페이지의 버튼 위치와 화면 흐름을 직접 정한다', feedback: '페이지 화면 흐름과 디자인은 웹서비스팀 웹 디자이너의 일이에요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '배너를 어느 광고 매체에 올릴지 정한다', feedback: '광고 매체와 홍보 일정은 마케팅팀의 일이에요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-webservice'],
            wrongHint: '사전예약 페이지를 만들고 운영할 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "공개 전에 예약이 제대로 되는지 확인해 달라"고 해요. QA로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: 'PC·모바일에서 신청, 중복 신청, 입력 오류, 동의 해제 같은 경우를 하나씩 시험해 결과를 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 3, fatigue: 8, xp: 8 },
                    },
                    result: '모바일에서 동의 체크 없이도 신청되던 오류를 공개 전에 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '신청 완료 화면과 안내 메일이 제대로 오는지 확인한다',
                    effect: {
                      cost: 1,
                      delta: { stability: 3, fatigue: 3, xp: 4 },
                    },
                    result: '기본 흐름은 확인했지만 예외 상황은 그대로 남았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '내가 쓰는 기기에서 한 번 신청해 본다',
                    effect: {
                      cost: 1,
                      delta: { stability: 1, fatigue: 1, xp: 1 },
                    },
                    result: '다른 기기에서 생기는 문제는 공개 뒤에야 알게 됐다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '찾은 오류를 직접 고쳐 페이지에 반영한다', feedback: '페이지 수정은 웹서비스팀 웹 개발자가 해요. QA는 재현 조건을 넘기고 수정 결과를 다시 확인해요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '예약자 개인정보 보관 기간을 직접 정한다', feedback: '개인정보 처리 기준은 법무·홍보·구매팀이 검토해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-webservice'],
            wrongHint: '사전예약 페이지를 만들고 운영할 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "어디서 몇 명이 들어올지 알아야 페이지를 준비할 수 있다"고 해요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '홍보 채널별 일정과 예상 유입 규모를 공유하고 채널마다 구분되는 링크를 요청한다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, stability: 2, fatigue: 7, xp: 8 },
                    },
                    result: '홍보가 몰리는 날을 미리 알아 페이지가 버틸 준비를 했다. 어느 채널에서 예약이 많이 오는지도 볼 수 있게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '사전예약 보상과 공개 일정을 홍보 문구와 맞춰 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '광고와 페이지의 말이 같아 들어온 사람이 헷갈리지 않았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '홍보를 먼저 크게 시작하고 페이지는 따라오라고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, stability: -3, fatigue: 2, xp: 2 },
                    },
                    result: '첫날 몰린 방문자에 페이지가 한동안 느려졌다.',
                    next: null,
                  },
                  {
                    kind: 'other',
                    owner: 'org-webservice',
                    label: '사전예약 페이지 화면 구성을 직접 정해 디자이너에게 넘긴다',
                    feedback: '페이지 구성과 제작 일정은 웹서비스팀 웹 PM이 조율해요. 사업·마케팅은 목표와 유입 계획을 정해요.',
                  },
                  { kind: 'other', owner: 'org-program-server', label: '예약 정보를 저장할 서버를 직접 고른다', feedback: '서버 구성은 개발팀 서버파트의 일이에요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'web-maintenance',
        stage: 2,
        scope: 'cross',
        initiator: 'event',
        title: '홈페이지 오류 제보가 쌓이고 있어요',
        situation: '홈페이지를 연 지 2주, "모바일에서 메뉴가 안 열려요", "공개 일정이 예전 날짜예요" 같은 제보가 7건 쌓였어요. 공개 데모를 앞두고 방문자가 늘어날수록 불편도 커질 거예요.',
        sources: [
          { title: 'web.dev — Web Vitals(로딩·반응성·화면 안정성 지표)', url: 'https://web.dev/articles/vitals' },
          { title: 'W3C — WCAG 2.2 이해하기: 최소 명도 대비', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' },
          { title: 'Atlassian — 장애 상황의 대외 커뮤니케이션', url: 'https://www.atlassian.com/incident-management/incident-communication' },
        ],
        neglect: {
          delta: { stability: -3, trust: -2 },
          log: '홈페이지 오류를 방치했다. 방문자들이 불편을 겪고 공식 정보에 대한 믿음도 떨어졌다.',
        },
        byRole: {
          '기획': {
            targets: ['org-webservice'],
            wrongHint: '홈페이지 오류를 고치고 운영 정보를 갱신하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "바뀐 공개 일정과 게임 정보를 정확히 알려 달라"고 해요. 기획자로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '바뀐 정보를 한곳에 정리하고, 앞으로 정보가 바뀌면 웹 PM에게 바로 알리는 순서를 정한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, stability: 2, fatigue: 4, xp: 4 },
                    },
                    result: '홈페이지 정보가 늦게 바뀌는 일이 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '제보 중 게임을 잘못 이해해서 생긴 질문을 모아 자주 묻는 질문으로 정리한다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, stability: 3, fatigue: 7, xp: 8 },
                    },
                    result: '같은 질문이 반복되는 일이 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '정보가 바뀌면 생각날 때 알려 주겠다고 한다',
                    effect: {
                      cost: 1,
                      delta: { fatigue: 1, xp: 1 },
                    },
                    result: '다음 변경 때도 홈페이지 정보가 늦게 바뀌었다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '모바일 메뉴 오류를 직접 고친다', feedback: '웹 오류 수정과 유지보수는 웹서비스팀 웹 개발자의 일이에요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '홈페이지 접근성 기준을 직접 새로 정한다', feedback: '웹 접근성 기준은 퍼블리싱본부 표준 및 접근성 영역이 정해요.' },
                ],
              },
            ],
          },
          '프로그래밍': {
            targets: ['org-webservice'],
            wrongHint: '홈페이지 오류를 고치고 운영 정보를 갱신하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 개발자가 "모바일 메뉴는 고치는 중인데, 홈페이지의 게임 정보가 자꾸 예전 값으로 돌아간다"고 해요. 프로그래머로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '게임 정보를 내보내는 파일이 빌드마다 갱신되도록 고치고 웹 개발자와 함께 확인한다',
                    effect: {
                      cost: 1,
                      delta: { stability: 5, trust: 3, fatigue: 4, xp: 4 },
                    },
                    result: '홈페이지 정보가 예전 값으로 돌아가는 원인이 사라졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '서버파트와 함께 홈페이지가 읽는 정보의 갱신 시점과 장애 알림을 정한다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 3, fatigue: 8, xp: 8 },
                    },
                    result: '정보가 끊기면 바로 알 수 있게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '웹 문제니까 내 일은 아니라고 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: -2, fatigue: 1, xp: 1 },
                    },
                    result: '원인이 게임 쪽 데이터에 있었다는 걸 뒤늦게 알았다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '모바일 메뉴 코드를 직접 고쳐 올린다', feedback: '홈페이지 코드 수정과 반영은 웹서비스팀 웹 개발자가 맡아요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '수정이 끝났다고 직접 판정해 제보를 닫는다', feedback: '수정 확인은 QA파트가 해요.' },
                ],
              },
            ],
          },
          '아트': {
            targets: ['org-webservice'],
            wrongHint: '홈페이지 오류를 고치고 운영 정보를 갱신하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 디자이너가 "모바일에서 글자가 배경 그림에 묻힌다는 제보가 있다"고 해요. 아티스트로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '글자 뒤에 오는 배경 그림을 차분하게 다듬은 웹용 그림을 다시 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { stability: 3, trust: 4, fatigue: 4, xp: 4 },
                    },
                    result: '모바일에서도 글자가 또렷하게 읽혔다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '모바일 세로 화면용 그림을 따로 만들어 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 4, trust: 4, quality: 1, fatigue: 8, xp: 8 },
                    },
                    result: '작은 화면에서도 그림과 글자가 겹치지 않게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '그림은 그대로 두고 글자를 키우면 된다고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: -1, fatigue: 1, xp: 1 },
                    },
                    result: '글자는 커졌지만 여전히 배경과 겹쳤다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '홈페이지 색과 글자 크기를 직접 바꿔 올린다', feedback: '홈페이지 화면 수정은 웹서비스팀 웹 디자이너와 웹 개발자가 해요.' },
                  { kind: 'other', owner: 'area-pub-standards', label: '글자와 배경의 대비 기준을 직접 정한다', feedback: '대비 같은 접근성 기준은 퍼블리싱본부 표준 및 접근성 영역이 정해요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-webservice'],
            wrongHint: '홈페이지 오류를 고치고 운영 정보를 갱신하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "쌓인 제보를 정리해 무엇부터 고칠지 정하고 싶다"고 해요. QA로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '제보 7건을 재현해 기기·화면별로 묶고 영향이 큰 순서를 표시해 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 4, fatigue: 8, xp: 8 },
                    },
                    result: '웹 개발자가 영향이 큰 모바일 메뉴 오류부터 고쳤다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '수정이 끝난 항목을 다시 확인해 제보자에게 알릴 목록을 만든다',
                    effect: {
                      cost: 1,
                      delta: { stability: 3, trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '고쳐진 것을 확인해 제보를 깔끔하게 닫을 수 있었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '제보를 받은 순서대로 그대로 전달한다',
                    effect: {
                      cost: 1,
                      delta: { stability: 1, fatigue: 1, xp: 1 },
                    },
                    result: '급한 오류가 뒤로 밀렸다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '홈페이지 코드를 직접 고친다', feedback: '웹 오류 수정은 웹서비스팀 웹 개발자가 해요. QA는 재현 조건과 수정 확인을 맡아요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '제보자들에게 사과 공지를 직접 올린다', feedback: '대외 안내 문구와 채널은 마케팅팀이 정해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-webservice'],
            wrongHint: '홈페이지 오류를 고치고 운영 정보를 갱신하는 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "공개 데모 홍보 전에 무엇부터 고칠지 같이 정하자"고 해요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '홍보로 방문자가 가장 많이 볼 화면을 알려 주고 그 화면의 오류부터 고치도록 우선순위를 맞춘다',
                    effect: {
                      cost: 1,
                      delta: { stability: 4, trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '홍보 전에 가장 많이 볼 화면이 먼저 고쳐졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '수정이 끝날 때까지 홍보 시작을 하루 늦추자고 웹 PM·PMO와 맞춘다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 2, fatigue: 6, xp: 8 },
                    },
                    result: '하루 늦췄지만 방문자를 오류 없는 페이지로 맞을 수 있었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '오류는 두고 홍보부터 시작하자고 한다',
                    effect: {
                      cost: 1,
                      delta: { stability: -3, trust: -1, fatigue: 2, xp: 1 },
                    },
                    result: '홍보로 들어온 방문자들이 같은 오류를 겪었다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '홈페이지 수정 일정을 직접 정해 개발자에게 지시한다', feedback: '웹 수정 일정과 작업 순서는 웹서비스팀 웹 PM이 조율해요.' },
                  { kind: 'other', owner: 'org-program-server', label: '홈페이지 서버를 직접 늘린다', feedback: '서버 구성은 개발팀 서버파트가 맡아요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'web-update-page',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '데모 업데이트 내용을 알릴 곳이 없어요',
        situation: '공개 직전 점검에서 고친 버그와 새로 넣은 배달 구간이 꽤 많아요. 그런데 바뀐 점을 정리해 보여 줄 페이지가 없어, 예전 데모를 해 본 사람들은 무엇이 달라졌는지 알 수 없어요.',
        sources: [
          { title: 'Steamworks — 이벤트 유형: 소규모 업데이트·패치 노트', url: 'https://partner.steamgames.com/doc/marketing/event_tools/type_patchnotes' },
          { title: 'Steamworks — 이벤트 유형: 주요 업데이트', url: 'https://partner.steamgames.com/doc/marketing/event_tools/type_majorupdate' },
        ],
        neglect: {
          delta: { trust: -3 },
          log: '업데이트 내용을 알리지 못했다. 예전 데모를 해 본 사람들은 달라진 점을 모른 채 지나갔다.',
        },
        byRole: {
          '기획': {
            targets: ['org-webservice'],
            wrongHint: '업데이트 소개 페이지를 만들고 올릴 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "업데이트 소개 페이지에 넣을 핵심 변경점을 골라 달라"고 해요. 기획자로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '새 배달 구간과 달라진 재미를 앞에, 자잘한 수정은 목록으로 나눠 정리해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, quality: 1, fatigue: 4, xp: 4 },
                    },
                    result: '방문자가 첫 화면에서 무엇이 새로워졌는지 바로 알 수 있게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '예전 데모를 해 본 사람을 위해 "다시 해 볼 이유"를 따로 정리한다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, fatigue: 7, xp: 8 },
                    },
                    result: '예전 플레이어가 돌아올 이유가 페이지에 생겼다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '모든 변경 내역을 순서 없이 그대로 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, fatigue: 2, xp: 2 },
                    },
                    result: '내용은 많지만 중요한 변화가 묻혔다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '업데이트 소개 페이지 디자인을 직접 만든다', feedback: '페이지 디자인과 구현은 웹서비스팀의 일이에요. 기획은 무엇이 바뀌었는지 정확히 정리해요.' },
                  { kind: 'other', owner: 'org-devsupport-qa', label: '수정된 버그가 정말 고쳐졌는지 직접 판정한다', feedback: '수정 확인은 QA파트가 맡아요. 기획은 확인된 내용만 소개하도록 QA 결과를 받아요.' },
                ],
              },
            ],
          },
          '프로그래밍': {
            targets: ['org-webservice'],
            wrongHint: '업데이트 소개 페이지를 만들고 올릴 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 개발자가 "이번 빌드에 실제로 반영된 수정 목록이 필요하다"고 해요. 프로그래머로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '이번 빌드에 실제로 들어간 수정만 골라 이해하기 쉬운 말로 정리해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 3, fatigue: 4, xp: 4 },
                    },
                    result: '빌드에 없는 수정이 소개되는 일을 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '빌드 번호와 수정 내역을 함께 기록하는 방식을 만들어 다음 업데이트부터 자동으로 모이게 한다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 3, fatigue: 8, xp: 8 },
                    },
                    result: '다음 업데이트부터는 정리하는 시간이 크게 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '코드 변경 기록을 그대로 복사해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: -1, fatigue: 1, xp: 2 },
                    },
                    result: '방문자가 읽기 어려운 기술 용어가 그대로 올라갈 뻔했다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '업데이트 페이지를 직접 코딩해 올린다', feedback: '페이지 구현은 웹서비스팀 웹 개발자가 해요.' },
                  { kind: 'other', owner: 'org-biz-marketing', label: '업데이트 소식을 SNS에 직접 올린다', feedback: '외부 채널 홍보는 마케팅팀의 일이에요.' },
                ],
              },
            ],
          },
          '아트': {
            targets: ['org-webservice'],
            wrongHint: '업데이트 소개 페이지를 만들고 올릴 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 디자이너가 "새 구간을 보여 줄 비교 이미지가 필요하다"고 해요. 아티스트로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '바뀐 구간의 이전·이후 화면을 같은 구도로 캡처해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, fatigue: 4, xp: 4 },
                    },
                    result: '무엇이 달라졌는지 그림만 봐도 알 수 있게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '새 구간의 대표 그림을 웹용 크기로 다시 다듬어 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, quality: 2, fatigue: 8, xp: 8 },
                    },
                    result: '업데이트 페이지 첫 화면이 눈에 띄게 좋아졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '작업 중인 원본 파일을 통째로 보낸다',
                    effect: {
                      cost: 1,
                      delta: { trust: -1, fatigue: 2, xp: 2 },
                    },
                    result: '웹 디자이너가 쓸 그림을 골라내느라 시간이 걸렸다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '업데이트 페이지의 화면 배치를 직접 정한다', feedback: '페이지 화면 구성은 웹서비스팀 웹 디자이너의 일이에요.' },
                  { kind: 'other', owner: 'org-plan', label: '어떤 변경점을 소개할지 직접 고른다', feedback: '소개할 변경점은 기획팀이 게임 의도에 맞게 골라요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-webservice'],
            wrongHint: '업데이트 소개 페이지를 만들고 올릴 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "소개할 수정 사항이 실제로 고쳐졌는지 확인해 달라"고 해요. QA로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '소개 목록의 수정 사항을 최종 빌드에서 하나씩 다시 확인해 결과를 표시한다',
                    effect: {
                      cost: 2,
                      delta: { stability: 5, trust: 4, fatigue: 8, xp: 8 },
                    },
                    result: '아직 고쳐지지 않은 한 건을 소개 목록에서 뺐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '알려진 남은 문제를 정리해 페이지에 함께 안내하자고 제안한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 5, fatigue: 3, xp: 4 },
                    },
                    result: '남은 문제를 솔직하게 알려 문의가 줄었다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '개발팀이 고쳤다고 했으니 그대로 믿고 넘어간다',
                    effect: {
                      cost: 1,
                      delta: { fatigue: 1, xp: 1 },
                    },
                    result: '고쳐졌다던 문제가 다시 제보됐다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '업데이트 페이지 문구를 직접 고쳐 올린다', feedback: '페이지 반영은 웹서비스팀이 해요. QA는 확인 결과를 넘겨요.' },
                  { kind: 'other', owner: 'org-program-program', label: '남은 버그를 직접 고친다', feedback: '버그 수정은 개발팀 프로그램파트의 일이에요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-webservice'],
            wrongHint: '업데이트 소개 페이지를 만들고 올릴 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "업데이트 소식을 어디로 알릴지 정해 달라"고 해요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '예전 데모 참여자에게 보낼 안내와 SNS 소식을 업데이트 페이지로 연결하는 계획을 세운다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, fatigue: 7, xp: 8 },
                    },
                    result: '예전 플레이어가 소식을 보고 바로 업데이트 내용을 확인할 수 있게 됐다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '업데이트 소식 공개 시각을 페이지 오픈 시각과 맞춘다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 1, fatigue: 3, xp: 4 },
                    },
                    result: '소식을 보고 들어왔는데 페이지가 없는 일을 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '페이지 없이 SNS 글로만 알린다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, fatigue: 2, xp: 2 },
                    },
                    result: '글이 금방 묻혀 자세한 내용을 찾기 어려웠다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '업데이트 페이지 오픈 일정을 직접 정해 개발자에게 지시한다', feedback: '페이지 제작 일정은 웹서비스팀 웹 PM이 조율해요.' },
                  { kind: 'other', owner: 'org-program-program', label: '업데이트에 들어갈 기능을 직접 고른다', feedback: '빌드에 들어갈 기능은 개발팀이 PMO와 정해요.' },
                ],
              },
            ],
          },
        },
      },
      {
        id: 'web-event-page',
        stage: 3,
        scope: 'cross',
        initiator: 'event',
        title: '데모 공개 기념 이벤트를 열 페이지가 필요해요',
        situation: '사업본부가 데모 공개에 맞춰 "플레이 소감 남기기" 이벤트를 열기로 했어요. 참여자 중 추첨으로 굿즈를 보내려면 이벤트 안내와 참여 신청을 받을 페이지가 있어야 해요.',
        sources: [
          { title: 'Steamworks — 이벤트 및 공지 도구', url: 'https://partner.steamgames.com/doc/marketing/event_tools' },
          {
            title: '국가법령정보센터 — 게임산업진흥에 관한 법률(경품 제공 기준)',
            url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B2%8C%EC%9E%84%EC%82%B0%EC%97%85%EC%A7%84%ED%9D%A5%EC%97%90%EA%B4%80%ED%95%9C%EB%B2%95%EB%A5%A0',
          },
          { title: '국가법령정보센터 — 개인정보 보호법(수집·이용 동의)', url: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95' },
        ],
        neglect: {
          delta: { trust: -3 },
          log: '이벤트를 알리기만 하고 참여할 곳을 만들지 못했다. 참여하려던 사람들이 문의 글을 남기고 떠났다.',
        },
        byRole: {
          '기획': {
            targets: ['org-webservice'],
            wrongHint: '이벤트 안내와 참여 페이지를 만들 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "이벤트 참여 조건과 당첨 규칙을 정리해 달라"고 해요. 기획자로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '데모를 끝까지 해 본 사람이 소감을 남기는 흐름으로 참여 조건과 당첨 규칙을 문서로 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, quality: 1, fatigue: 7, xp: 8 },
                    },
                    result: '이벤트가 게임을 실제로 해 보게 만드는 방향으로 짜였다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '참여 방법을 세 단계로 줄인 안내 문구를 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '참여 방법이 짧고 분명해졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '조건 없이 누구나 여러 번 응모할 수 있게 하자고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, stability: -2, fatigue: 2, xp: 2 },
                    },
                    result: '중복 응모가 몰려 당첨자 선정이 복잡해졌다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '이벤트 페이지 화면과 참여 버튼을 직접 만든다', feedback: '이벤트 페이지 제작은 웹서비스팀의 일이에요. 기획은 참여 조건과 규칙을 정해요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '경품 추첨 규칙이 법에 맞는지 직접 판단한다', feedback: '경품과 개인정보 관련 검토는 법무·홍보·구매팀이 맡아요.' },
                ],
              },
            ],
          },
          '프로그래밍': {
            targets: ['org-webservice'],
            wrongHint: '이벤트 안내와 참여 페이지를 만들 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 개발자가 "데모를 끝까지 해 본 사람만 참여하게 하고 싶다"고 해요. 프로그래머로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '데모 완료를 확인할 코드를 게임에서 발급하고, 서버파트와 확인 방식을 맞춰 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 5, trust: 4, fatigue: 8, xp: 8 },
                    },
                    result: '참여 조건을 웹에서 확인할 수 있게 됐다. 페이지는 웹서비스팀, 확인 서버는 서버파트가 맡았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '데모 완료 화면에 이벤트 페이지로 가는 안내를 넣는다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 3, xp: 4 },
                    },
                    result: '데모를 마친 사람이 자연스럽게 이벤트로 이어졌다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '조건 확인 없이 누구나 참여하게 두자고 한다',
                    effect: {
                      cost: 1,
                      delta: { stability: -2, trust: 1, fatigue: 1, xp: 1 },
                    },
                    result: '데모를 해 보지 않은 응모가 섞였다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '이벤트 참여 화면을 직접 코딩한다', feedback: '이벤트 페이지 구현은 웹서비스팀 웹 개발자의 일이에요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '경품 수량과 예산을 직접 정한다', feedback: '이벤트 예산과 경품은 사업팀이 정해요.' },
                ],
              },
            ],
          },
          '아트': {
            targets: ['org-webservice'],
            wrongHint: '이벤트 안내와 참여 페이지를 만들 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 디자이너가 "이벤트 페이지에 쓸 굿즈 그림이 필요하다"고 해요. 아티스트로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '굿즈 시안과 이벤트용 캐릭터 그림을 웹 크기에 맞춰 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 5, quality: 1, fatigue: 8, xp: 8 },
                    },
                    result: '받게 될 굿즈가 분명히 보여 참여할 이유가 생겼다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '이벤트 기간에만 쓸 작은 아이콘 세트를 만들어 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, fatigue: 4, xp: 4 },
                    },
                    result: '페이지 곳곳에 이벤트 분위기가 살아났다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '예전 홍보 그림을 그대로 다시 쓰자고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: 1, fatigue: 1, xp: 1 },
                    },
                    result: '새 이벤트라는 느낌이 약했다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '이벤트 페이지 레이아웃을 직접 짠다', feedback: '페이지 구성은 웹서비스팀 웹 디자이너의 일이에요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '굿즈 제작 업체를 직접 정한다', feedback: '외부 제작과 비용은 사업팀이 맡아요.' },
                ],
              },
            ],
          },
          QA: {
            targets: ['org-webservice'],
            wrongHint: '이벤트 안내와 참여 페이지를 만들 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "이벤트 참여가 제대로 되는지 봐 달라"고 해요. QA로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '정상 참여, 중복 참여, 기간이 끝난 뒤 참여, 모바일 참여를 시험해 결과를 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { stability: 6, trust: 3, fatigue: 8, xp: 8 },
                    },
                    result: '기간이 끝난 뒤에도 응모되던 오류를 공개 전에 막았다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '참여 완료 안내 문구가 맞게 뜨는지 확인한다',
                    effect: {
                      cost: 1,
                      delta: { stability: 3, fatigue: 3, xp: 4 },
                    },
                    result: '안내는 맞췄지만 예외 상황은 확인하지 못했다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '한 번 응모해 보고 끝낸다',
                    effect: {
                      cost: 1,
                      delta: { stability: 1, fatigue: 1, xp: 1 },
                    },
                    result: '중복 응모 문제는 이벤트가 시작된 뒤에야 알게 됐다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '찾은 오류를 직접 고친다', feedback: '페이지 수정은 웹서비스팀이 해요. QA는 재현 조건과 수정 확인을 맡아요.' },
                  { kind: 'other', owner: 'org-biz-business', label: '당첨자를 직접 뽑는다', feedback: '당첨자 선정과 경품 발송은 사업팀이 운영해요.' },
                ],
              },
            ],
          },
          '사업·마케팅': {
            targets: ['org-webservice'],
            wrongHint: '이벤트 안내와 참여 페이지를 만들 팀은 어디일까요?',
            steps: [
              {
                id: 'main',
                prompt: '웹서비스팀 웹 PM이 "이벤트의 목표와 기간을 정해 달라"고 해요. 사업·마케팅 담당으로서 무엇을 할까요?',
                options: [
                  {
                    kind: 'mine',
                    label: '목표를 "데모 완료 후 소감 남기기"로 정하고 기간·경품·홍보 일정을 한 장으로 정리해 넘긴다',
                    effect: {
                      cost: 2,
                      delta: { trust: 6, fatigue: 7, xp: 8 },
                    },
                    result: '웹서비스팀이 무엇을 만들어야 하는지 분명해졌다. 참여를 이끄는 건 이벤트 설계, 참여하기 쉬운 페이지는 웹서비스팀의 몫이다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '경품 수량과 당첨 발표 날짜를 확정해 넘긴다',
                    effect: {
                      cost: 1,
                      delta: { trust: 4, stability: 1, fatigue: 3, xp: 4 },
                    },
                    result: '페이지에 확정된 정보만 올라갔다.',
                    next: null,
                  },
                  {
                    kind: 'mine',
                    label: '이벤트 기간을 정하지 않고 일단 열자고 한다',
                    effect: {
                      cost: 1,
                      delta: { trust: -2, fatigue: 2, xp: 1 },
                    },
                    result: '언제 끝나는지 묻는 문의가 쏟아졌다.',
                    next: null,
                  },
                  { kind: 'other', owner: 'org-webservice', label: '참여 신청 화면을 직접 디자인해 넘긴다', feedback: '이벤트 페이지 디자인은 웹서비스팀 웹 디자이너의 일이에요.' },
                  { kind: 'other', owner: 'org-support-legal', label: '응모자 개인정보 동의 문구를 직접 쓴다', feedback: '개인정보 수집 동의 문구는 법무·홍보·구매팀이 검토해요.' },
                ],
              },
            ],
          },
        },
      },
    ],
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.MissionData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);

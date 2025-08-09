export const dummyTestimonialData = [
  {
    image:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&h=200&auto=format&fit=crop',
    name: '김OO',
    title: '마케팅 팀장',
    content:
      'W-AI를 쓰면서 콘텐츠 제작에 쓰는 시간이 절반으로 줄었어요. 아이디어만 있으면 바로 초안이 나오니까 업무 효율이 정말 좋아졌습니다.',
    rating: 4,
  },
  {
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop',
    name: '이OO',
    title: '콘텐츠 크리에이터',
    content:
      '예전엔 글 한 편 완성하는 데 며칠씩 걸렸는데, 지금은 몇 시간 만에 끝낼 수 있어요. 결과물 퀄리티도 훨씬 높아져서 정말 만족합니다.',
    rating: 5,
  },
  {
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    name: '박OO',
    title: '콘텐츠 에디터',
    content:
      '아이디어만 정리해두면 바로 글로 만들어줘서 훨씬 편해졌어요. 수정도 쉽게 할 수 있어서 작업 속도가 확실히 빨라졌습니다.',
    rating: 4,
  },
];

export interface CreationItemData {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[];
  created_at: string;
  updated_at: string;
}

export const dummyCreationData: CreationItemData[] = [
  {
    id: 9,
    user_id: 'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
    prompt: '기술 관련 블로그 제목 추천',
    content: `기술 분야 블로그에 어울릴 만한 제목 아이디어를 정리해봤습니다.

**가장 무난한 제목**

* 테크 블로그: 최신 뉴스와 리뷰
* 오늘의 기술: 알아두면 좋은 IT 소식
* 미래를 만드는 기술 이야기
* 테크 토크: 새로운 혁신을 말하다

**조금 더 센스 있는 제목**

* 디지털 인사이트: 기술 세상 들여다보기
* 기기 너머의 이야기: 기술과 삶의 연결`,
    type: '블로그 제목 추천',
    publish: false,
    likes: [],
    created_at: '2025-07-01T11:09:50.492Z',
    updated_at: '2025-07-01T11:09:50.492Z',
  },
  {
    id: 8,
    user_id: 'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
    prompt: '일반 블로그 제목 추천',
    content: `다양한 주제의 블로그에 쓸 수 있는 제목 예시를 준비했습니다.

**쉽고 직관적인 제목**

* 블로그 가이드: 글쓰기부터 운영까지
* 블로깅 인사이트: 꿀팁과 최신 트렌드
* 블로그 초보자를 위한 모든 것

**조금 더 감각적인 제목**

* 글 너머의 이야기: 블로깅의 매력 찾기
* 블로그 세상 탐험기: 온라인 글쓰기의 모든 것`,
    type: '블로그 제목 추천',
    publish: false,
    likes: [],
    created_at: '2025-07-01T11:08:10.450Z',
    updated_at: '2025-07-01T11:08:10.450Z',
  },
  {
    id: 7,
    user_id: 'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
    prompt: 'AI와 코딩의 관계를 짧게 설명하는 글 작성',
    content: `## AI와 코딩, 함께 진화하는 기술

AI와 코딩은 이제 떼려야 뗄 수 없는 관계가 됐습니다. AI는 인간처럼 학습하고 문제를 해결하는 기술이고, 코딩은 그 AI를 움직이게 하는 언어입니다.

**코딩이 AI를 만드는 과정**

AI 모델은 데이터 준비부터 학습, 배포까지 모두 코드로 만들어집니다. 파이썬이나 R 같은 언어와 TensorFlow, PyTorch 같은 라이브러리가 주로 활용됩니다.

**AI가 개발 방식을 바꾸는 이유**

요즘은 AI가 코드 자동 완성, 테스트, 디버깅까지 도와주면서 개발 속도를 높여줍니다. 심지어 자연어로 설명만 해도 코드를 만들어주는 도구도 나오고 있습니다.

**앞으로 개발자의 역할**

앞으로는 단순 코딩보다는 설계와 최적화, AI 활용 능력이 더 중요해질 것입니다. AI와 코딩은 서로를 보완하며 개발의 새로운 가능성을 열고 있습니다.

결국, 코딩은 AI의 기반이고 AI는 코딩의 효율을 높여주는 파트너입니다.`,
    type: '글 작성',
    publish: false,
    likes: [],
    created_at: '2025-07-01T11:07:51.312Z',
    updated_at: '2025-07-01T11:07:51.312Z',
  },
];

export interface PublishedCreationData {
  id: number;
  user_id: string;
  prompt: string;
  content: string;
  type: string;
  publish: boolean;
  likes: string[];
  created_at: string;
  updated_at: string;
  __v?: number;
}
export const dummyPublishedCreationData: PublishedCreationData[] = [
  {
    id: 1,
    user_id: 'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
    prompt:
      'Generate an image of A Boy is on Boat , and fishing in the style Anime style.',
    content: 'ai_gen_img_1',
    type: 'image',
    publish: true,
    likes: [
      'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
      'user_2yaW5EHzeDfQbXdAJWYFnZo2bje',
    ],
    created_at: '2025-06-19T09:02:25.035Z',
    updated_at: '2025-06-19T09:58:37.552Z',
  },
  {
    id: 2,
    user_id: 'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
    prompt:
      'Generate an image of A Boy Riding a bicycle on road and bicycle is from year 2201  in the style Anime style.',
    content: 'ai_gen_img_2',
    type: 'image',
    publish: true,
    likes: [
      'user_2yMX02PRbyMtQK6PebpjnxvRNIA',
      'user_2yaW5EHzeDfQbXdAJWYFnZo2bje',
    ],
    created_at: '2025-06-19T08:16:54.614Z',
    updated_at: '2025-06-19T09:58:40.072Z',
  },
  {
    id: 3,
    user_id: 'user_2yaW5EHzeDfQbXdAJWYFnZo2bje',
    prompt:
      'Generate an image of a boy riding a car on sky in the style Realistic.',
    content: 'ai_gen_img_3',
    type: 'image',
    publish: true,
    likes: ['user_2yaW5EHzeDfQbXdAJWYFnZo2bje'],
    created_at: '2025-06-23T11:29:23.351Z',
    updated_at: '2025-06-23T11:29:44.434Z',
    __v: 1,
  },
];

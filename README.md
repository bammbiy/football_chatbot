# 풋볼 AI (Node.js 버전)

Python에서 Node.js로 다시 짠 버전입니다.
SSE 스트리밍이랑 비동기 처리가 훨씬 자연스러워졌어요.
가상환경 같은 것도 없어서 설치도 편합니다.

## 파일 구조

```
football-ai/
├── server.js          # Express 서버. /api/chat에서 SSE 스트리밍 처리
├── football_data.js   # 축구 지식이랑 시스템 프롬프트
├── public/
│   └── index.html     # UI 전부. 따로 빌드 필요 없음.
├── package.json
└── run.sh
```

## 실행

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
bash run.sh
```

그러면 `npm install` 하고 서버 바로 뜸. `http://localhost:5000` 열면 됩니다.

직접 하고 싶으면:
```bash
npm install
node server.js

# 코드 수정하면서 테스트할 때 (파일 변경 감지 자동 재시작)
npm run dev
```

## Python 버전이랑 뭐가 다른가

스트리밍 쪽이 제일 달라요. Python에서는 `stream_with_context`랑 제너레이터를 같이 써야 했는데, Node에서는 `for await`으로 그냥 읽으면 됨. 코드가 훨씬 짧아졌습니다.

그리고 빠른 질문 버튼을 `/api/questions`에서 내려주는 구조로 바꿔서, 나중에 질문 목록 바꾸고 싶을 때 `football_data.js`만 수정하면 됩니다.

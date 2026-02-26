import express from "express";
import session from "express-session";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";
import { SYSTEM_PROMPT, QUICK_QUESTIONS } from "./football_data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수에서 자동으로 읽음

const MAX_HISTORY = 20; // 너무 많으면 API 비용 올라가서 최근 20개만 들고다님

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET_KEY || "football-ai-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 하루
  })
);

// 메인 페이지 - 빠른 질문 버튼 데이터를 같이 내려보냄
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/questions", (req, res) => {
  res.json(QUICK_QUESTIONS);
});

// 채팅 - SSE로 스트리밍. Python보다 이쪽이 훨씬 깔끔함
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message?.trim();
  if (!userMessage) return res.status(400).json({ error: "메시지가 없어요" });

  // 대화 기록 초기화 및 추가
  if (!req.session.history) req.session.history = [];
  req.session.history.push({ role: "user", content: userMessage });

  // 너무 쌓이면 앞에서 자름
  if (req.session.history.length > MAX_HISTORY) {
    req.session.history = req.session.history.slice(-MAX_HISTORY);
  }

  const history = [...req.session.history];

  // SSE 헤더 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    let fullResponse = "";

    // stream() 쓰면 for-await으로 바로 읽을 수 있어서 편함
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        fullResponse += chunk.delta.text;
        send({ chunk: chunk.delta.text });
      }
    }

    // 응답 기록에 저장하고 세션 업데이트
    req.session.history.push({ role: "assistant", content: fullResponse });
    send({ done: true });
  } catch (err) {
    console.error("스트리밍 오류:", err.message);
    send({ error: "오류가 생겼어요. 잠깐 후에 다시 해봐요." });
  } finally {
    res.end();
  }
});

// 대화 초기화
app.post("/api/clear", (req, res) => {
  req.session.history = [];
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n⚽  풋볼 AI 켜졌음`);
  console.log(`   http://localhost:${PORT}\n`);
});

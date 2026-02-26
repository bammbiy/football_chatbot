#!/bin/bash
# 이거 실행하면 됨. API 키만 미리 설정해두면 알아서 다 됨.

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo ""
  echo "  API 키 설정이 필요해요:"
  echo "    export ANTHROPIC_API_KEY='your-api-key-here'"
  echo ""
  exit 1
fi

# node 없으면 종료
if ! command -v node &> /dev/null; then
  echo "  Node.js가 없어요. https://nodejs.org 에서 설치해주세요."
  exit 1
fi

npm install
echo ""
echo "  http://localhost:5000"
echo ""
node server.js

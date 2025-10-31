def get_response(user_input):
    responses = {
        "안녕": "안녕하세요! 축구 챗봇입니다 ⚽",
        "메시": "메시는 세계 최고의 선수 중 한 명이죠!",
        "호날두": "호날두는 엄청난 득점력을 가진 선수입니다!",
        "손흥민": "손흥민은 한국 최고의 축구 스타죠!",
    }
    return responses.get(user_input, "잘 모르겠어요. 다른 질문 해보실래요?")

# 스페인어 현지화 가이드 (더빙·제목·설명)

사용자는 스페인어를 판단할 수 없다 → 이 문서 + `scripts/check-text.py` 규칙 + Claude 검토(`scripts/locale-review.py` 도장) + AI 음성 검수(`qa-voice.mjs`)로 대신한다.
기계 규칙은 **`es.rules.json`** (스페인 표현·tú/usted·anglicismos·수동태·숫자·¿¡·발음, 예문 시험 `python3 scripts/check-text.py --selftest`). 이 문서에 새 금지 표현을 넣으면 규칙 파일에도 넣는다

## 대상
- **중남미 중립 스페인어** (목소리가 es-US). 멕시코·콜롬비아·아르헨티나 시청자가 다 자연스럽게 듣는 말
- 스페인 전용 표현 금지: `vosotros`·`os`·`habéis`·`vale`·`coger`(중남미에선 비속어)·`ordenador`
- 2인칭 복수는 `ustedes`. 시청자에게 말할 땐 친근한 `tú`로 통일 (`usted`와 섞지 않음)

## 목표 말투
- 중남미 역사 유튜버(예: Academia Play, Pero eso es otra historia) 톤 - 가볍고 빠르게, 질문 던지기 ("¿Y saben qué pasó?")
- 문장 짧게, 극적인 곳에서 끊기

## 번역 말고 현지화
- 영어 구조 직역 금지 (anglicismos): "hacer sentido" → "tener sentido", "en orden de" → "para", "aplicar para" → "postularse"
- 수동태(`fue + 과거분사`) 남발 금지 → 능동태나 `se` 구문
- 영어 낱말 그대로 두지 않기 (고유명사 빼고)
- 물음표·느낌표는 여는 부호 `¿ ¡` 짝 필수

## 숫자·연도
- 연도는 숫자로 쓰고 TTS가 "mil doscientos seis"로 읽음. 세기는 로마 숫자: "siglo XIII"
- 천 단위 마침표: "20.000 jinetes" (중남미 일부는 쉼표 - 채널은 마침표로 통일)

## 이름 표기
- `episodes/names.json`의 es 표기 (스페인어 관용 표기: Gengis Kan, Temuyín, Corasmia, Samarcanda)
- 발음이 틀리면 `audio/pron.json`에 (예: "sah" → "saje")

## 자주 나오는 실수
- `tú`/`usted` 섞임, 스페인식 `vosotros`
- 성·수 일치 (los mongoles / la horda)
- 문장이 영어보다 길어짐 - 스페인어는 보통 영어보다 15~25% 김. 영어 길이를 넘지 않게 줄인다 (장면 길이 = 가장 긴 언어)

## AI 티 · 번역투 (사람이 판단)
기계 규칙(경고)이 잡는 것: AI 상투구(cabe destacar·un testimonio de·sin lugar a dudas), 어림말 겹침, 글말(no obstante·mediante·restantes), "Paso uno:"·"Una:" 번호 매기기, calco(eventualmente·tenían historia), la fuerza principal, caballos extra, ser + 분사 + por, 쉼표로 이은 -ando 사슬, 문장 첫 Pero 남발, 몸 부위 su, 설명란 "13th c."·동명사 챕터 제목. 아래는 규칙이 못 잡으니 읽고 판단한다
- 영어 동사를 그대로: take·hold·make → tomar·tener·volver. "tomó a los clanes… y los unió" → "logró unir a los clanes", "tenía el norte de China" → "dominaba", "eso vuelve a alguien tu enemigo" → "eso los convertía en enemigos", "atacaron todo a la vez" → "atacaron por todos lados a la vez"
- 명사만 떼어 놓은 강조 조각("Los Jin." "Xia Occidental." "A su propia gente.")은 한 편에 두세 번까지. 나머지는 콜론이나 한 문장으로 ("…su futuro enemigo: los Jin.")
- 같은 말로 다시 풀기("una ruta que unía pozos…, una ruta que nadie vigilaba") - 영어 동격 반복. 한 번만 쓰고 "y"로 잇기. 같은 틀 문장 두 개 연달아도 같은 문제
- his/their를 매번 su로: 누구 것인지 흐려짐 ("Su comandante… Su ejército quedó deshecho"). 분명하면 el·la, 헷갈리면 이름
- 영어 This was 시작("Este era un Estado muy poderoso") → 주어를 말하기 ("Los Jin eran…")
- 놀라운 숫자를 밋밋하게 말하지 않기: "Otrar resistió cinco meses" → "Otrar aguantó nada menos que cinco meses". 작게 보일 땐 apenas·ni siquiera·solo con. 어림말(unos·casi)은 한 대목에 한 번
- 영어식 쉼표 + y ("Se giró hacia el sur, y escupió") - 주어가 같으면 쉼표 빼기
- 관사·목적어 빠짐: "era fin del invierno" → "era el final del invierno", "el pueblo abrió sin pelear" → "abrió sus puertas"
- 낱말: masivo(massive) → enorme, "el número" → "la ventaja numérica", "crecían a caballo" → "se criaban a caballo", "de práctica" → "de prueba"
- 마지막 줄에 첫 문장 되풀이 요약("Así cayó Corasmia, el imperio islámico…")은 AI 티 - 바로 다음 이야기로
- 설명란: "Así se preparó: A, B, C y D"처럼 콜론 + 명사 나열은 AI 요약 티 - 질문이나 한 장면으로 시작. 출처 책 제목도 스페인어판 (Historia secreta de los mongoles)

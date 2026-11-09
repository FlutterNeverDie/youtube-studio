# 영어 현지화 가이드 (원본 대사·제목·설명)

영어는 긴 영상의 **기준 언어** - 장면 타이밍을 영어에 맞추고 다른 언어가 그 길이 안에 들어간다. 역사 대본은 한국어로 먼저 쓰는 일이 많아서 영어에 한국어 번역투가 남기 쉽다. 쇼츠(Openology)는 영어로 먼저 쓰지만 AI 글 티가 남기 쉽다.
기계 규칙은 **`en.rules.json`** (발음 + AI 티·번역투, 예문 시험 `python3 scripts/check-text.py --selftest`). AI 티·번역투 규칙은 2026-11-09부터 전부 경고(결과 보고 오류로 올릴지 정함). 이 문서에 새 금지 표현을 넣으면 규칙 파일에도 넣는다

## 대상
- 미국 영어 (목소리 en-US, 철자 color·defense, 단위는 쇼츠에서 quarts 등 미국식 + 필요하면 미터법)
- 시청자는 "you"로 부른다. 내레이션은 말하듯이 (축약형 don't·it's 그대로)

## 목표 말투
- 영어권 역사·설명 유튜버(Kings and Generals, OverSimplified, Kurzgesagt) 톤 - 문장 짧게, 사실 먼저, 말로 들어서 바로 이해되게
- 놀라운 사실은 예고 없이 바로. "Here's the strange part"로 알리지 말고 숫자를 세게: ✓ "The line for diabetes is just half a teaspoon more."

## 번역 말고 현지화 (한국어 초안에서 옮길 때)
- 한국어 문장 순서·구조를 따라가지 않는다. 같은 정보를 영어 유튜버가 말할 순서로 새로 쓴다
- 쉼표로 TTS 쉼을 만들지 않는다 - 쉼은 대본의 `/` 표시로 (`en-pause-comma`: ✗ "So how, did Genghis…" ✗ "The Mongol invasion of the Jin, continues in part two.")
- 장소부터 말하는 한국어 어순을 뒤집기 문장으로 옮기지 않는다 (`en-inversion`): ✗ "At the edge of the desert stood a small town." ✓ "A small town sat at the edge of the desert."
- 긴 대시(em dash·en dash) 안 씀, 괄호 안 씀 (`en-dash`, `en-paren`)

## 숫자·연도
- 연도는 숫자 그대로 ("In 1206"). 세기·로마 숫자는 말로 ("Muhammad the Second")
- 어림말(about·around·roughly·nearly)은 출처가 추정치일 때만, 한 문장에 한 번. 소수점까지 정확한 숫자에는 붙이지 않는다 (`en-hedge-exact`·`en-hedge-stack`·`en-hedge-many`). 영어에 about이 겹치면 다른 언어 번역에도 "정도…쯤"이 겹쳐 들어간다

## 이름 표기
- `episodes/names.json`의 en 표기가 기준 (틀리면 check-text 오류)
- 발음이 틀리면 `audio/pron.json`에

## AI 티 · 번역투 (사람이 판단)
정규식으로 못 잡는 것. `/localize` 검토와 대본 쓸 때 줄마다 본다
- **훅을 끝에서 되풀이하지 않는다.** 쇼츠 끝 3~5줄이 "So X isn't just Y. It's Z."로 훅을 다시 요약하면 AI 글. 끝맺음은 한 줄, 새 정보나 첫 줄로 이어지는 고리 하나. ✗ 01-diabetes L01 "Diabetes isn't just too much sugar…" + L36 "So diabetes isn't just about sugar…"
- **기계적 대구·셋 나열은 한 편에 한두 번.** ✗ "It carries no sugar. It only carries a message." · "One copy protects. Two cause disease." · "A plaque breaks. A clot forms. An artery closes." · "Fatigue. No appetite. Itching. Foggy thinking." 같은 틀이 장마다 나오면 리듬이 기계 같다. 두 문장이 같은 틀로 이어지면 하나를 다른 구조로
- **편끼리 같은 문장을 다시 쓰지 않는다.** ✗ "And through all of it, you feel nothing." (01b) / "And through all of it, you may feel completely fine." (04b), "you never feel a thing"류 맺음 8번, "Here's the strange part" 3편. 새 편을 쓰면 이전 편 대사를 검색해 본다
- **설명란도 틀 돌려쓰기 금지.** 쇼츠 설명 10개 중 9개가 "Here's how/what/why …"로 끝나고, 역사 설명은 "This is how …" + 명사 나열. 첫 문장에 가장 센 사실 하나, 끝 문장은 편마다 다르게
- **어림말 말고 다른 모호한 말도 겹치지 않게.** ✗ "They often bulge outward, so the channel can stay fairly open." (often·can·fairly) ✓ "They bulge outward, so the channel stays fairly open." 의학 내용은 출처의 조심스러운 말(may·can) 하나만 남긴다
- **주어 빠진 한국어 → 영어 매달린 수식어.** ✗ "To reach the walls, it had to be filled." (it = 해자, 해자가 성벽에 닿는 꼴) ✓ "Before they could reach the walls, they had to fill it in."
- **한국어 관용구 직역.** ✗ "spread through the mouths of survivors" (생존자들의 입을 통해) ✓ "Survivors, let go on purpose, spread the story." ✗ "a man sent from the Jin side" (금나라 측) ✓ "a man from the Jin camp" ✗ "today's Uzbekistan" (오늘날의) ✓ "what's now Uzbekistan" · "modern-day Uzbekistan"
- **뜻이 틀어지는 직역.** ✗ "had barely attacked a single city" (제대로 공격해 본 적 없다 → 영어로는 "조금은 공격했다") ✓ "had never really attacked a walled city"
- **추상명사 목적어 대신 동사.** ✗ "worked to block any unity on the steppe" (통합을 막다) ✓ "worked to keep the steppe divided" ✗ "the mood inside dragged down the garrison's morale" ✓ "panic spread, and the garrison lost heart"
- **감정·평가를 설명하지 말고 행동으로.** ✗ "Genghis couldn't believe it. He was furious." ✓ 바로 "He turned to face south, and he spat." 판단 형용사 겹치기도 하나로: ✗ "his indecisive, incompetent uncle"
- **접속어 되풀이.** ✗ "And so the Mongols took Khwarazm with ease." 다음 줄 "And so the Mongols conquered Khwarazm…" - 같은 접속어·같은 내용이 붙어 나오면 하나 뺀다
- 질문 뒤 바로 "Because …"로 자문자답하는 줄은 한 편에 한 번 ("So why don't you feel it? Because…")

## 자주 나오는 실수
- 문장이 길어 장면이 늘어짐 - 영어가 기준 길이라 영어가 길면 모든 언어가 늘어난다
- 같은 편 안에서 숫자 표기 섞임 ("1 in 5" / "one in five") - TTS는 둘 다 읽지만 한 편은 하나로
- 컷을 나눈 문장이 마침표로 끊겨 다음 컷이 소문자로 시작 (✗ "About 44 percent had a ruptured plaque." + "and erosion in about 31 percent.") - 이어지는 컷이면 앞 컷을 쉼표로

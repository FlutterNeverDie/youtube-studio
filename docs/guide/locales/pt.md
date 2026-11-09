# 포르투갈어(브라질) 현지화 가이드 (더빙·제목·설명) - 2026-10-26 1편 더빙에서 시작

사용자는 포르투갈어를 판단할 수 없다 → 이 문서 + Claude 검토로 대신한다. 기계 규칙은 `pt.rules.json` (2026-11-09, 사용자가 결과를 보기 전까지 전부 warn).

## 대상
- **브라질 포르투갈어** (목소리 pt-BR Chirp3-HD Charon). 포르투갈식 표현 금지: `tu` 동사 변화, `estás`, `autocarro`, `comboio`, `fixe`, `estar a + 동사원형`(→ `estar + 현재분사`: "estava fugindo")
- 시청자에게는 `você`. 구어체 줄임 `pra`·`pro`는 써도 됨 (브라질 유튜버 말투)

## 목표 말투
- 브라질 역사 유튜버(Buenas Ideias, Nerdologia, História em Meia Hora) 톤 - 짧은 문장, 질문 던지기, 극적인 곳에서 끊기
- 번역이 아니라 그 말투로 새로 쓴다. 영어 직역(`fazer sentido` 남용, 수동태 `foi + 분사` 연발) 피하기

## 이름·숫자
- Gengis Khan, Temujin, Yesugei, Hoelun, Borte, Jamukha, Toghrul, Jebe, Subutai, tártaros, merquitas, keraítas, taichiutes, naimanes, Xia Ocidental, dinastia Jin, Zhongdu(Pequim), Império Corásmio / Corásmia, Otrar, Inalchuq, o xá
- 연도는 숫자. 천 단위는 마침표 `3.000`. 거리는 km

## 길이
- 영상이 이미 정해진 뒤 더한 언어 → 줄마다 rate(=길이/줄 길이) 1.15 이하. 포르투갈어는 영어보다 20~30% 길어서 문장을 줄여야 하는 줄이 많다 (`scripts/draft-lines.py --lang=pt`가 넘는 줄을 알려 줌)

## AI 티 · 번역투 (사람이 판단)
`pt.rules.json`이 잡는 것(포르투갈식 tu·estar a·철자, mesóclise·문장 가운데 rendeu-se, contudo·cujo 같은 글말, vale ressaltar·verdadeiro testemunho·tapete da história·mergulhar 같은 AI 상투어, "Um: ... Dois:", tomou lugar·mais e mais·de novo e de novo, 어림말 겹치기, 문장 첫 Mas·수동태 남발)은 빼고, 아래는 읽고 판단한다. 예는 1·2편에서 실제로 나온 줄
- **영어 문장 틀 그대로** - 낱말은 포르투갈어인데 틀이 영어: "Esses dois já tinham história"(had history) → "Essa briga vinha de antes" · "Pra manter isso chegando"(keep them coming) → "Pra isso continuar chegando" · "mais seda e ferro"(plus) → "além de seda e ferro" · "jogou fora sua maior arma: os números" → "a vantagem numérica" · "Só dão um tanto de água"(only so much) → "Cada um dá pouca água" · "sem cidade nenhuma ver"(unseen by any city) → "sem que nenhuma cidade visse" · "que nenhum exército deveria atravessar"(should) → "conseguiria"
- **명사 + 현재분사 (영어 -ing)** - "uma nova potência surgindo ali" → "ver uma nova potência surgir ali", 장 제목 "Atravessando o deserto" → "A travessia do deserto"
- **영어 부사 1:1** - exactly → "exatamente" 대신 "justamente"(é justamente por isso), actually → "Na verdade" 대신 "Aliás" 또는 빼기, So how → "Então, como..." 대신 말로는 "E como é que...?"
- **일반 주어 você를 옛 이야기에** - "E você negociava com Estados agrícolas", "plantar você mesmo" → 주어 없이 또는 "a gente". 시청자에게 직접 말할 때만 você
- **소유사 seu·sua 남발** - 영어 his/their를 매번 옮기면 딱딱하고 "당신의"로도 들린다: "Picou seu grande exército" → "Dividiu o exército". 꼭 필요하면 "dele·deles"
- **한 문장 안에서 말투 섞기** - "amarraram ele ... e o pregaram ali"(구어 + 글말), 구어 대본 속 "enfraquecê-lo". 한 문장은 한 말투로. 인용 대사도 "pouparemos"(글말 미래)와 "quebramos·matamos"(현재)를 섞지 않기
- **같은 틀 되풀이** - 붙은 두 줄 "E assim os mongóis engoliram a Corásmia." → "Assim, os mongóis conquistaram a Corásmia" (영어 And so... And so 그대로). 설명란도 편마다 "... Mesmo assim ... Foi assim que ..." 같은 틀이면 AI 티 - 편마다 다르게
- **놀라운 사실을 밋밋하게** - 영어엔 없어도 포르투갈어는 "só", "nada menos que", "simplesmente"로 세운다: "foram 20.000 cavaleiros" → "foram só 20.000 cavaleiros", "Otrar resistiu por cinco meses" → "Otrar aguentou nada menos que cinco meses". 남발은 금지, 한 장에 한두 번
- **설명란·태그** - 출처의 "(13th c.)" → "(século XIII)", 태그도 포르투갈어로 (영어 태그 그대로 두지 않기)

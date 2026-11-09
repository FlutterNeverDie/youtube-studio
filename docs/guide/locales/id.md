# 인도네시아어 현지화 가이드 (더빙·제목·설명) - 2026-10-26 1편 더빙에서 시작

사용자는 인도네시아어를 판단할 수 없다 → 이 문서 + Claude 검토로 대신한다. 기계 규칙은 `id.rules.json` (2026-11-09부터, 아직 전부 경고 - 결과 보고 오류로 올릴지 정함)

## 대상
- 표준 인도네시아어 (목소리 id-ID Chirp3-HD Charon). 말레이시아어 낱말 금지 (`kerana`, `sahaja`, `kereta`=차)
- 시청자에게는 `kalian`/`kau`(일반 지칭), 공손한 인물 대사는 `Anda`

## 목표 말투
- 인도네시아 교양 유튜버(Kok Bisa?, Sejarah Indonesia 채널들) 톤 - 반쯤 구어: `cuma`, `bakal`, `kok bisa?`, `makanya` 허용. 너무 딱딱한 문어(`tersebut` 남발, 긴 수동태) 피하기
- 짧은 문장, 극적인 곳에서 끊기

## 이름·숫자
- Jenghis Khan, Temujin, Yesugei, Hoelun, Borte, Jamukha, Toghrul, Jebe, Subutai, bangsa Tatar, Merkit, Kerait, Taichiud, Naiman, Xia Barat, Dinasti Jin, Zhongdu(Beijing), Kekaisaran Khwarazmia, Otrar, Inalchuq, Syah, Tiongkok(‘Cina’ 금지)
- 연도는 숫자, 천 단위는 마침표 `3.000`, 거리는 km

## 길이
- 줄마다 rate 1.15 이하 (`scripts/draft-lines.py --lang=id`). 인도네시아어는 낱말이 길어 영어보다 25~35% 길다 - 접두사 겹치는 표현을 줄여 쓴다

## AI 티 · 번역투 (사람이 판단) - 2026-11-09 1·2편 더빙에서 찾음
규칙 파일이 잡는 것(di mana 관계사, di-…oleh, "Panik,"로 시작, "Jin, didirikan …", "Langkah satu", "Iran sekarang", "Invasi Jin", sempurna, mati tanpa pewaris, negara yang menetap, punya sejarah 등)은 빼고, 규칙으로 못 잡는 것만:
- **영어 문장 뼈대 그대로**: 앞에 긴 전치구 + 관계절 주어 + 본동사 (`Di depan tembok tinggi dan pasukan raksasanya, / Mongol yang cuma biasa bertempur …, nyaris belum pernah …`). 인니 유튜버는 짧게 끊는다 → `Temboknya tinggi, pasukannya besar. Sementara Mongol cuma terbiasa perang di padang terbuka.`
- **시간·방식 부사를 영어처럼 끝에**: `Jenghis kembali dengan serius / setahun setelah jadi Khan Agung` → `Setahun setelah jadi Khan Agung, Jenghis kembali. Kali ini serius.`
- **영어 동명사 주어**: `Musuh saling bertarung itu kabar baik.` (Their enemies fighting each other was good news) → `Biar saja musuhnya saling hantam. Buat Jin, itu kabar baik.`
- **뜻이 바뀐 직역** - 하나씩 영어와 대조: `tak terlihat satu kota pun` ("unseen by any city"인데 "한 도시도 못 봤다"로 읽힘 → `tanpa terlihat dari kota mana pun`), `Alasannya` (excuse=핑계면 `Dalihnya`), `besar di atas kuda` (grew up on horseback → `sejak kecil hidup di atas pelana`), `musuh masa depan` (→ `calon musuh`), `berhitung` (did the math → `memperhitungkannya`). 공격·침공 명사는 누가 누구를 쳤는지 늘 확인 (`Invasi Jin` 사고)
- **영어 꾸밈말 따라오기**: `benar-benar`(really)·`sangat`·`sempurna`(perfect)·`fisik dan mental`(in body and in mind)를 문장 끝에 덧붙임 → 한 편에 한두 번, 빼도 뜻이 같으면 뺀다
- **di- 수동은 인니어에서 자연스럽다** - 문제는 영어 수동을 그대로 옮긴 곳(`oleh`, 앞에 분사구)과, 대상이 앞에 오는 자연스러운 꼴(`yang Jenghis anggap musuh`, `Kota itu mereka ratakan`)을 안 쓰는 것. 무조건 능동으로 바꾸지 않는다
- **adalah = 영어 was**: `Pesan yang mereka kirim / adalah ancaman.` → `Pesannya jelas: ancaman.` / `-lah`·쌍점으로. 설명(제목·설명란)의 `X adalah …`도 같음
- **문장 첫머리 Jadi·Dan**: 영어 So·And를 옮기면 편마다 4번 넘게 나옴. 구어에서 쓰긴 하니 한 장에 한 번 정도, 나머지는 `Makanya`·`Terus`·`Nah`·그냥 빼기
- **같은 틀 연속**: `Pasukan pertama … / Pasukan kedua … / Yang ketiga …`처럼 나열은 괜찮지만, 이유·결과 문장이 `Kalau …, … . Tapi kalau …, … .`로 두 번 이어지면 하나를 바꾼다
- **놀라운 사실을 밋밋하게**: 숫자·반전은 `cuma`·`baru … saja sudah …`·`bayangin`·`kok bisa?`로 받친다 (`Otrar bertahan lima bulan.` → `Otrar sanggup bertahan lima bulan penuh.`)
- **명사 하나로 끝내는 강조** (`… sebagai musuh masa depan. Jin.`): 영어식. 쌍점(`… calon musuh: Jin.`)으로 붙이는 게 자연스러움 - 극적인 곳 한 편에 한두 번만
- **tak / nggak / tidak**: 지금 대본은 `tak`(글말 느낌)이 편에 10번 안팎. 반쯤 구어 톤이면 `nggak`·`enggak` 섞기가 맞는지 원어민 확인 거리
- **시리즈 제목 통일**: 앞인사·끝인사·업로드 제목이 같은 이름 (`Invasi Mongol ke Jin, bagian 1` / `Kekaisaran Mongol, bagian 2`), `Yuk.` 한 낱말로 끝내지 말고 `Yuk, kita mulai.`


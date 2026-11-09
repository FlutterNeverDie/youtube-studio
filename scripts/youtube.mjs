// History Map World 유튜브 채널 업로드 (YouTube Data API v3, 추가 패키지 없이 fetch만)
//
// 처음 한 번:  node scripts/youtube.mjs auth
//   브라우저에서 사이트 계정 → History Map World 채널 → 허용. 받은 갱신 토큰을 secrets/token.json에 저장
// 확인:       node scripts/youtube.mjs whoami
// 올리기:     node scripts/youtube.mjs upload out/a.mp4 uploads/<편>.json [--dry-run]
//   meta = 쇼츠 { title, description, tags[], privacy, publishAt? } 또는 편 형식(upload-info.py: 언어별 제목·설명·썸네일) - 아래 request()
//   --dry-run: 올리지 않고 보낼 내용만 보여 줌
//   스튜디오에 남는 것: 더빙 오디오 트랙(API 없음), 자막·재생목록(권한 밖 - 감사 다시), 썸네일 비교 테스트, 최종 화면·카드
//   publishAt을 주면 비공개로 올렸다가 그 시각에 유튜브가 공개한다
// 예약 묶음: node scripts/youtube.mjs queue   (uploads/schedule.json)
//   [{ video: "out/a.mp4", meta: "uploads/a.json", publishAt: "2026-10-27T13:00:00Z" }, ...]
//   아직 안 올린 항목만 publishAt을 붙여 올리고, 올린 영상 id를 그 항목에 적어 둔다 (다시 돌려도 두 번 안 올림)
//   ※ API 감사 통과 전에는 유튜브가 API 업로드를 비공개로 잠가서 예약 공개도 안 된다
//
// 열쇠 순서: 환경변수(YT_CLIENT_ID · YT_CLIENT_SECRET · YT_REFRESH_TOKEN, 깃허브 Actions용) → secrets/ 파일
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFile, rm, stat, writeFile } from "node:fs/promises";
import { openPath } from "./tools.mjs";

const SECRETS = new URL("../secrets/", import.meta.url);
// 2026-11-03 사용자 "권한 넓혀줘": 올린 뒤 제목·설명 고치기(videos.update)·재생목록 만들기에 youtube.force-ssl 추가 → auth 다시 받아야 함
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtube.force-ssl"];

const readJson = async (name) => JSON.parse(await readFile(new URL(name, SECRETS), "utf8"));

async function client() {
  if (process.env.YT_CLIENT_ID) return { id: process.env.YT_CLIENT_ID, secret: process.env.YT_CLIENT_SECRET };
  const { installed } = await readJson("client_secret.json");
  return { id: installed.client_id, secret: installed.client_secret };
}

async function refreshToken() {
  if (process.env.YT_REFRESH_TOKEN) return process.env.YT_REFRESH_TOKEN;
  return (await readJson("token.json")).refresh_token;
}

async function accessToken() {
  const { id, secret } = await client();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: await refreshToken(), grant_type: "refresh_token" }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`토큰 갱신 실패: ${body.error} ${body.error_description ?? ""}`);
  return body.access_token;
}

// 내 맥의 임시 주소(127.0.0.1)로 구글이 돌려보내는 코드를 받는다
async function auth() {
  const { id, secret } = await client();
  const server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const redirect = `http://127.0.0.1:${server.address().port}`;
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({ client_id: id, redirect_uri: redirect, response_type: "code", scope: SCOPES.join(" "), access_type: "offline", prompt: "consent" });
  const code = await new Promise((resolve, reject) => {
    server.on("request", (req, res) => {
      const q = new URL(req.url, redirect).searchParams;
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(q.get("code") ? "<h2>완료 - 이 창은 닫아도 됩니다</h2>" : `<h2>실패: ${q.get("error")}</h2>`);
      q.get("code") ? resolve(q.get("code")) : reject(new Error(q.get("error") ?? "코드 없음"));
    });
    openPath(url); // 맥 open, 윈도우 start
    console.log("브라우저에서 허용해 주세요. 창이 안 뜨면 이 주소를 여세요:\n" + url);
  });
  server.close();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  });
  const body = await res.json();
  if (!body.refresh_token) throw new Error(`갱신 토큰을 못 받음: ${body.error ?? JSON.stringify(Object.keys(body))}`);
  await writeFile(new URL("token.json", SECRETS), JSON.stringify({ refresh_token: body.refresh_token }), { mode: 0o600 });
  console.log("secrets/token.json 저장");
  await whoami();
}

async function whoami() {
  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { authorization: `Bearer ${await accessToken()}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body.error));
  for (const c of body.items ?? []) console.log(`채널: ${c.snippet.title} (${c.id})`);
}

// 올릴 정보 읽기 - 두 형식을 받는다
//   단순(쇼츠): { title, description, tags, privacy?, publishAt? }
//   편(upload-info.py가 만드는 uploads/<편>.json): { video, thumbs[], categoryId, defaultLanguage, localizations: { en: {title, description, tags}, ko: {...}, es: {...} } }
//     → 기본 언어가 snippet, 나머지 언어는 localizations(언어별 제목·설명), thumbs[0]은 썸네일 (경로는 ~/ReStory 기준)
function request(meta) {
  const lang = meta.defaultLanguage ?? "en";
  const main = meta.localizations?.[lang] ?? meta;
  const status = { privacyStatus: meta.publishAt ? "private" : (meta.privacy ?? "private"), selfDeclaredMadeForKids: false, containsSyntheticMedia: meta.synthetic ?? false }; // 2026-10-28 사용자가 AI 표시를 끔: 누가 봐도 애니메이션이고 실존 인물 목소리를 흉내 내지 않아 표시 의무 대상 아님 (설명란에 AI 목소리라고 적음). 실제처럼 보이는 합성이면 meta.synthetic = true
  if (meta.publishAt) status.publishAt = meta.publishAt;
  const body = {
    snippet: { title: main.title, description: main.description ?? "", tags: main.tags ?? [], categoryId: meta.categoryId ?? "27", defaultLanguage: lang, defaultAudioLanguage: lang },
    status,
  };
  const others = Object.entries(meta.localizations ?? {}).filter(([l]) => l !== lang);
  if (others.length) body.localizations = Object.fromEntries(others.map(([l, v]) => [l, { title: v.title, description: v.description ?? "" }]));
  return body;
}

// 이어 올리기(resumable): 세션을 연 뒤 파일을 한 번에 보낸다
async function upload(file, metaPath, ...flags) {
  const meta = JSON.parse(await readFile(metaPath, "utf8"));
  const body0 = request(meta);
  const parts = ["snippet", "status", ...(body0.localizations ? ["localizations"] : [])].join(",");
  // 편(uploads/<편>.json)이면 깜빡임 검사를 통과한 렌더만 올린다 - out/<편>.mp4.checked 가 영상보다 새로워야 함 (04 사고 기록: 깨진 2편 업로드)
  const epId = metaPath.match(/uploads\/([\w-]+)\.json$/)?.[1];
  if (meta.localizations && epId && !flags.includes("--dry-run")) {
    const src = fileURLToPath(new URL(`../out/${epId}.mp4`, import.meta.url));
    const [ok, s0] = await Promise.all([stat(src + ".checked").catch(() => null), stat(src).catch(() => null)]);
    if (!ok || !s0 || ok.mtimeMs < s0.mtimeMs) throw new Error(`깜빡임 검사를 통과하지 않은 영상이라 올리지 않음: ${src}`);
  }
  const thumb = meta.thumbs?.[0] ? join(process.env.HWM ?? join(homedir(), "ReStory"), meta.thumbs[0]) : null;
  if (flags.includes("--dry-run")) {
    console.log(`보낼 내용 (part=${parts}):\n${JSON.stringify(body0, null, 1)}\n영상: ${file}\n썸네일: ${thumb ?? "없음"}`);
    return;
  }
  const token = await accessToken();
  const size = (await stat(file)).size;
  const init = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=${parts}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=UTF-8",
      "x-upload-content-length": String(size),
      "x-upload-content-type": "video/mp4",
    },
    body: JSON.stringify(body0),
  });
  if (!init.ok) throw new Error(`업로드 세션 실패: ${init.status} ${await init.text()}`);
  const res = await fetch(init.headers.get("location"), {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "video/mp4", "content-length": String(size) },
    body: await readFile(file),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`업로드 실패: ${res.status} ${JSON.stringify(body.error)}`);
  console.log(`올림: https://youtu.be/${body.id} · ${body.status.privacyStatus}${body.status.publishAt ? ` · 공개 예약 ${body.status.publishAt}` : ""}`);
  // 썸네일 (채널 인증 전이면 실패할 수 있음 → 경고만)
  if (thumb) {
    const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${body.id}`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": thumb.endsWith(".png") ? "image/png" : "image/jpeg" },
      body: await readFile(thumb),
    });
    console.log(t.ok ? "썸네일 1번 올림" : `썸네일 실패(스튜디오에서 직접): ${t.status} ${(await t.text()).slice(0, 200)}`);
  }
  // 편이면 episodes/<편>/meta.json에 올린 날짜·영상 ID → 편집기 잠금, pipeline.py 업로드 완료
  const ep = metaPath.match(/uploads\/([\w-]+)\.json$/)?.[1];
  const epMeta = ep && fileURLToPath(new URL(`../episodes/${ep}/meta.json`, import.meta.url));
  if (epMeta && (await stat(epMeta).catch(() => null))) {
    const m = JSON.parse(await readFile(epMeta, "utf8"));
    m.uploaded = new Date().toISOString().slice(0, 10);
    m.youtubeId = body.id;
    await writeFile(epMeta, JSON.stringify(m, null, 1) + "\n");
    console.log(`→ episodes/${ep}/meta.json uploaded`);
  }
  return body;
}

async function queue(path = "uploads/schedule.json") {
  const list = JSON.parse(await readFile(path, "utf8"));
  for (const item of list) {
    if (item.id) continue;
    const meta = JSON.parse(await readFile(item.meta, "utf8"));
    const tmp = `${item.meta}.queued.json`;
    await writeFile(tmp, JSON.stringify({ ...meta, publishAt: item.publishAt }));
    const body = await upload(item.video, tmp);
    await rm(tmp);
    item.id = body.id;
    await writeFile(path, JSON.stringify(list, null, 1));
  }
}

// 영상 상태 보기 (읽기만): 공개 여부·처리 상태·연령 제한·아동용·지역 차단·조회수 - 2026-10-28 "검색에 안 뜬다"
async function status(...ids) {
  const token = await accessToken();
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status,snippet,contentDetails,statistics&id=${ids.join(",")}`, { headers: { authorization: `Bearer ${token}` } });
  const body = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(body.error));
  for (const v of body.items ?? []) {
    const s = v.status, c = v.contentDetails;
    console.log(`${v.id} · ${v.snippet.title}\n  공개: ${s.privacyStatus}${s.publishAt ? ` (예약 ${s.publishAt})` : ""} · 처리: ${s.uploadStatus}${s.rejectionReason ? ` 거절 ${s.rejectionReason}` : ""}${s.failureReason ? ` 실패 ${s.failureReason}` : ""}` +
      `\n  아동용: ${s.madeForKids} · 연령 제한: ${c.contentRating?.ytRating ?? "없음"} · 지역 차단: ${JSON.stringify(c.regionRestriction ?? "없음")} · 퍼가기: ${s.embeddable}` +
      `\n  올린 때: ${v.snippet.publishedAt} · 조회 ${v.statistics.viewCount} · 좋아요 ${v.statistics.likeCount ?? "-"} · 기본 언어 ${v.snippet.defaultLanguage ?? "-"}/${v.snippet.defaultAudioLanguage ?? "-"}`);
  }
  if (!body.items?.length) console.log("영상을 찾지 못함 (지워졌거나 이 채널 영상이 아님)");
}

// 이미 올린 영상의 썸네일만 바꾸기 (2026-11-03 2편: 업로드 뒤에 썸네일을 골라서) - 경로는 그대로 또는 ~/ReStory 기준
async function thumb(id, file) {
  const path = (await stat(file).catch(() => null)) ? file : join(process.env.HWM ?? join(homedir(), "ReStory"), file);
  const token = await accessToken();
  const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${id}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": path.endsWith(".png") ? "image/png" : "image/jpeg" },
    body: await readFile(path),
  });
  console.log(t.ok ? `썸네일 바꿈: ${id}` : `썸네일 실패: ${t.status} ${(await t.text()).slice(0, 300)}`);
}

// 이미 올린 영상의 제목·설명·태그·언어별 번역 고치기 (공개 상태는 안 건드림): node scripts/youtube.mjs update <영상ID> uploads/<편>.json [--dry-run]
async function update(id, metaPath, ...flags) {
  const { snippet, localizations } = request(JSON.parse(await readFile(metaPath, "utf8")));
  const body = { id, snippet, ...(localizations ? { localizations } : {}) };
  if (flags.includes("--dry-run")) return console.log(JSON.stringify(body, null, 1));
  const token = await accessToken();
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet${localizations ? ",localizations" : ""}`, {
    method: "PUT", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8" }, body: JSON.stringify(body),
  });
  const out = await r.json();
  if (!r.ok) throw new Error(`고치기 실패: ${r.status} ${JSON.stringify(out.error)}`);
  console.log(`고침: ${id} · ${out.snippet.title}`);
}

// 재생목록 만들기·채우기: node scripts/youtube.mjs playlist uploads/playlist-<이름>.json
//   { id?, title, description, defaultLanguage, localizations: { ko: {title, description} }, privacy, videos: [영상ID...] }
//   id가 없으면 만들고 적어 둠, 목록에 아직 없는 영상만 순서대로 더함 (다시 돌려도 두 번 안 넣음)
async function playlist(path) {
  const pl = JSON.parse(await readFile(path, "utf8"));
  const token = await accessToken();
  const api = async (url, method = "GET", body) => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${url}`, { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8" }, body: body && JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) throw new Error(`재생목록 실패 (${url}): ${r.status} ${JSON.stringify(j.error)}`);
    return j;
  };
  // 엉뚱한 채널에 만들지 않게: 허용받은 채널이 넣을 영상의 채널과 같아야 함 (2026-11-03 개인 채널 "유튭"으로 허용돼 재생목록이 거기 생김)
  const mine = (await api("channels?part=snippet&mine=true")).items?.[0];
  const owner = pl.videos?.length ? (await api(`videos?part=snippet&id=${pl.videos[0]}`)).items?.[0]?.snippet : null;
  if (owner && mine?.id !== owner.channelId) throw new Error(`허용받은 채널(${mine?.snippet.title})이 영상 채널(${owner.channelTitle})과 다름 - auth를 다시 받으며 "${owner.channelTitle}"을 고를 것`);
  const meta = { snippet: { title: pl.title, description: pl.description, defaultLanguage: pl.defaultLanguage ?? "en" }, status: { privacyStatus: pl.privacy ?? "private" }, ...(pl.localizations ? { localizations: pl.localizations } : {}) };
  const parts = `snippet,status${pl.localizations ? ",localizations" : ""}`;
  const fresh = !pl.id;
  if (fresh) {
    pl.id = (await api(`playlists?part=${parts}`, "POST", meta)).id;
    await writeFile(path, JSON.stringify(pl, null, 1) + "\n");
    console.log(`재생목록 만듦: https://www.youtube.com/playlist?list=${pl.id}`);
  } else {
    await api(`playlists?part=${parts}`, "PUT", { id: pl.id, ...meta });
    console.log(`재생목록 고침: ${pl.id}`);
  }
  // 막 만든 목록은 몇 초 동안 조회가 404 (2026-11-03) → 비었다고 보고 바로 넣음
  const have = fresh ? new Set() : new Set((await api(`playlistItems?part=contentDetails&maxResults=50&playlistId=${pl.id}`)).items.map((i) => i.contentDetails.videoId));
  for (const v of pl.videos ?? []) {
    if (have.has(v)) continue;
    await api("playlistItems?part=snippet", "POST", { snippet: { playlistId: pl.id, resourceId: { kind: "youtube#video", videoId: v } } });
    console.log(`  + ${v}`);
  }
}

// 자막 올리기 (2026-11-03): node scripts/youtube.mjs caption <영상ID> <언어> <파일.srt>
//   같은 언어 자막이 이미 있으면 내용만 바꿈(update), 없으면 새로(insert). 이름은 비워 둠 = 유튜브가 언어 이름으로 보여 줌
async function caption(id, lang, file) {
  const token = await accessToken();
  const list = await (await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${id}`, { headers: { authorization: `Bearer ${token}` } })).json();
  const old = (list.items ?? []).find((c) => c.snippet.language === lang && c.snippet.trackKind !== "asr");
  const meta = old ? { id: old.id } : { snippet: { videoId: id, language: lang, name: "", isDraft: false } };
  const boundary = "cap" + Date.now();
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\ncontent-type: application/octet-stream\r\n\r\n`),
    await readFile(file),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const r = await fetch(`https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet`, {
    method: old ? "PUT" : "POST", headers: { authorization: `Bearer ${token}`, "content-type": `multipart/related; boundary=${boundary}` }, body,
  });
  const out = await r.json();
  if (!r.ok) throw new Error(`자막 실패 (${lang}): ${r.status} ${JSON.stringify(out.error)}`);
  // 올렸다고 나왔는데 목록에 없던 적이 있음 (2026-11-03 인도네시아어) → 목록에서 다시 확인
  const after = await (await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${id}`, { headers: { authorization: `Bearer ${token}` } })).json();
  if (!(after.items ?? []).some((c) => c.snippet.language === lang && c.snippet.trackKind !== "asr")) throw new Error(`자막 ${lang}: 올렸다고 나왔지만 목록에 없음 - 다시 올릴 것`);
  console.log(`자막 ${old ? "바꿈" : "올림"} (목록 확인): ${id} ${lang}`);
}

// 공개 범위만 바꾸기: node scripts/youtube.mjs publish <영상ID> [public|unlisted|private] (2026-11-06)
async function publish(id, privacy = "public") {
  const token = await accessToken();
  const cur = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${id}`, { headers: { authorization: `Bearer ${token}` } })).json();
  const status = cur.items?.[0]?.status;
  if (!status) throw new Error(`영상 없음: ${id}`);
  const r = await fetch("https://www.googleapis.com/youtube/v3/videos?part=status", {
    method: "PUT", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ id, status: { ...status, privacyStatus: privacy, publishAt: undefined } }),
  });
  const out = await r.json();
  if (!r.ok) throw new Error(`공개 범위 바꾸기 실패: ${r.status} ${JSON.stringify(out.error)}`);
  console.log(`${id} · ${out.status.privacyStatus}`);
}

const [cmd, ...args] = process.argv.slice(2);
const run = { auth, whoami, upload, queue, status, thumb, update, playlist, caption, publish }[cmd];
if (!run) {
  console.log("사용법: node scripts/youtube.mjs auth | whoami | upload <영상.mp4> <meta.json> [--dry-run] | queue [schedule.json] | status <영상ID...> | thumb <영상ID> <그림> | update <영상ID> <meta.json> [--dry-run] | playlist <playlist.json> | caption <영상ID> <언어> <파일.srt>");
  process.exit(1);
}
await run(...args);

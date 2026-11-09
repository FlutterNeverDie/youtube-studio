import { Composition, Still } from "remotion";
import { Banner } from "./channel/Banner";
import { Profile, Watermark } from "./channel/Profile";
import { ProfileChar } from "./channel/ProfileChar";
import { MongolTeaser, TEASER_FRAMES } from "./shorts/MongolTeaser";
import { KalkaTeaser, KALKA_TEASER_FRAMES } from "./shorts/KalkaTeaser";
import { Mongol01Hook, MONGOL01_HOOK_FRAMES } from "./hook/Mongol01Hook";
import { M01Draft, M01_DRAFT_FRAMES } from "./draft/M01Draft";
import { chapterFrames } from "./draft/kit";
import { M01Ch0 } from "./draft/M01Ch0";
import { M02Ch0 } from "./draft/M02Ch0";
import { M02Ch1 } from "./draft/M02Ch1";
import { M02Ch2 } from "./draft/M02Ch2";
import { M02Ch3 } from "./draft/M02Ch3";
import { M02Ch4 } from "./draft/M02Ch4";
import { M02_CH5_FRAMES, M02Ch5 } from "./draft/M02Ch5";
import { M02_EP_FRAMES, M02Ep } from "./draft/M02Ep";
import { TECH_DEMO_FRAMES, TechDemo } from "./draft/TechDemo";
import { M01Ch1 } from "./draft/M01Ch1";
import { M01Ch2 } from "./draft/M01Ch2";
import { M01Ch3 } from "./draft/M01Ch3";
import { M01HookCh3, M01_HOOK_CH3_FRAMES } from "./draft/M01HookCh3";
import { M01Ep, M01_EP_FRAMES } from "./draft/M01Ep";
import { M01Ch4 } from "./draft/M01Ch4";
import { M01Ch5, M01_CH5_FRAMES } from "./draft/M01Ch5";
import { M01R_EP_FRAMES, M01REp } from "./draft/M01REp";
import { Architecture, UserFlow } from "./channel/AuditDiagrams";
import { Episode, timelineFrames, type Timeline } from "./episode/Episode";
import { Thumb } from "./episode/Thumb";
import { ShortThumb } from "./shorts/ShortThumb";
import mongol01pilot from "../public/ep/mongol-01/pilot/timeline.json";
import mongol01 from "../public/ep/mongol-01/ep/timeline.json";
import tl from "../timeline.json";
import social from "../social.json";
import { Reel } from "./Reel";
import { Scrub, SCRUB_FRAMES } from "./social/Scrub";
import { Borders, bordersTimeline } from "./social/Borders";
import { Quiz, QUIZ_FRAMES } from "./social/Quiz";
import shorts from "../shorts.json";
import { Timelapse, VIDEOS, framesOf } from "./shorts/Timelapse";
import { QuizV, QV_FRAMES } from "./shorts/QuizV";
import { SameYear, SAMEYEAR_FRAMES } from "./shorts/SameYear";
import { CutShort, cutShortFrames } from "./shorts/CutShort";
// 1편 쇼츠: 이유 3 연대 책임 (c3_15~16, 본편 13902~14388) - 첫 질문 동안은 한 명이 도망치려다 끌리는 장면(구간 9.3초부터)
const R3 = { id: "m01-r3", lang: "ko", clip: 486, hook: 105, hookFrom: 279, thumb: "shorts-src/m01-thumb.png" };

const base = { component: Reel, durationInFrames: tl.durationInFrames, fps: tl.fps, width: tl.width, height: tl.height };
const fps = social.fps;

export const Root = () => (
  <>
    <Composition id="ReelEN" {...base} defaultProps={{ locale: "en" as const }} />
    <Composition id="ReelKO" {...base} defaultProps={{ locale: "ko" as const }} />
    <Composition id="ReelJA" {...base} defaultProps={{ locale: "ja" as const }} />
    <Composition id="ReelZH" {...base} defaultProps={{ locale: "zh" as const }} />
    {/* 레딧·쓰레드용 (src/social, social.json) */}
    <Composition id="SocialScrub" component={Scrub} durationInFrames={SCRUB_FRAMES} fps={fps} width={social.scrub.width} height={social.scrub.height} />
    <Composition id="SocialBorders" component={Borders} durationInFrames={bordersTimeline("borders").frames} fps={fps} width={social.borders.width} height={social.borders.height} defaultProps={{ id: "borders" as const }} />
    <Composition id="SocialBordersAsia" component={Borders} durationInFrames={bordersTimeline("bordersAsia").frames} fps={fps} width={social.bordersAsia.width} height={social.bordersAsia.height} defaultProps={{ id: "bordersAsia" as const }} />
    <Composition id="SocialQuiz" component={Quiz} durationInFrames={QUIZ_FRAMES} fps={fps} width={social.quiz.width} height={social.quiz.height} />
    {/* 유튜브 쇼츠·틱톡용 세로 (src/shorts, shorts.json) */}
    {VIDEOS.map((v) => (
      <Composition key={v.id} id={`Shorts-${v.id}`} component={Timelapse} durationInFrames={framesOf(v.id)} fps={shorts.fps} width={shorts.width} height={shorts.height} defaultProps={{ id: v.id }} />
    ))}
    <Composition id="Shorts-quiz" component={QuizV} durationInFrames={QV_FRAMES} fps={shorts.fps} width={shorts.width} height={shorts.height} />
    <Composition id="Shorts-mongol-teaser" component={MongolTeaser} durationInFrames={TEASER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Mongol01-Draft" component={M01Draft} durationInFrames={M01_DRAFT_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "en" as const }} />
    <Composition id="Mongol02-Ch0" component={M02Ch0} durationInFrames={chapterFrames("m2.0")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol02-Ch1" component={M02Ch1} durationInFrames={chapterFrames("m2.1")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="TechDemo" component={TechDemo} durationInFrames={TECH_DEMO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Mongol02-Ch2" component={M02Ch2} durationInFrames={chapterFrames("m2.2")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol02-Ch3" component={M02Ch3} durationInFrames={chapterFrames("m2.3")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol02-Ch4" component={M02Ch4} durationInFrames={chapterFrames("m2.4")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol02-Ch5" component={M02Ch5} durationInFrames={M02_CH5_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol02-Ep" component={M02Ep} durationInFrames={M02_EP_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol01r-Ep" component={M01REp} durationInFrames={M01R_EP_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "en" as const }} />
    <Composition id="Mongol01-Ch0" component={M01Ch0} durationInFrames={chapterFrames("0")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol01-Ch1" component={M01Ch1} durationInFrames={chapterFrames("1")} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol01-Ch2" component={M01Ch2} durationInFrames={chapterFrames("2")} fps={30} width={1920} height={1080} />
    <Composition id="Mongol01-Ch3" component={M01Ch3} durationInFrames={chapterFrames("3")} fps={30} width={1920} height={1080} />
    <Composition id="Mongol01-Ep" component={M01Ep} durationInFrames={M01_EP_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const, stem: "all" as const }} />
    <Composition id="Mongol01-HookCh3" component={M01HookCh3} durationInFrames={M01_HOOK_CH3_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ lang: "ko" as const }} />
    <Composition id="Mongol01-Ch4" component={M01Ch4} durationInFrames={chapterFrames("4")} fps={30} width={1920} height={1080} />
    <Composition id="Mongol01-Ch5" component={M01Ch5} durationInFrames={M01_CH5_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Mongol01-Hook" component={Mongol01Hook} durationInFrames={MONGOL01_HOOK_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Shorts-kalka-teaser" component={KalkaTeaser} durationInFrames={KALKA_TEASER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Shorts-kalka-teaser-en" component={KalkaTeaser} durationInFrames={KALKA_TEASER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    <Composition id="Shorts-kalka-teaser-es" component={KalkaTeaser} durationInFrames={KALKA_TEASER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "es" as const }} />
    <Composition id="Shorts-sameyear" component={SameYear} durationInFrames={SAMEYEAR_FRAMES} fps={shorts.fps} width={shorts.width} height={shorts.height} />
      {(["cine", "ink", "art"] as const).map((look) => (
      <Still key={look} id={`ChannelBanner-${look}`} component={Banner} width={2560} height={1440} defaultProps={{ look }} />
    ))}
    {(["helmet", "hourglass", "seal"] as const).map((look) => (
      <Still key={look} id={`ChannelProfile-${look}`} component={Profile} width={800} height={800} defaultProps={{ look }} />
    ))}
    {(["globe", "duo", "trio", "antique", "antiqueHelmet", "globeHelmet", "globeHelmetMark"] as const).map((look) => (
      <Still key={look} id={`ChannelProfileChar-${look}`} component={ProfileChar} width={800} height={800} defaultProps={{ look }} />
    ))}
    {(["helmet", "hourglass", "seal"] as const).map((look) => (
      <Still key={look} id={`ChannelWatermark-${look}`} component={Watermark} width={300} height={300} defaultProps={{ look }} />
    ))}
    <Still id="AuditArchitecture" component={Architecture} width={1600} height={900} />
    <Still id="AuditUserFlow" component={UserFlow} width={1600} height={900} />
    <Composition id="Mongol01Pilot" component={Episode} durationInFrames={timelineFrames(mongol01pilot as Timeline)} fps={30} width={1920} height={1080} defaultProps={{ timeline: mongol01pilot as Timeline }} />
    <Composition id="Mongol01" component={Episode} durationInFrames={timelineFrames(mongol01 as Timeline)} fps={30} width={1920} height={1080} defaultProps={{ timeline: mongol01 as Timeline }} />
    {/* 언어별 썸네일은 이 하나로 --props를 바꿔 찍는다 (scripts/thumbs.mjs) */}
    <Still id="ShortThumb" component={ShortThumb} width={1080} height={1920} defaultProps={{ img: "ep/teaser/maps/kalka/01250.jpg", zoom: 1.6, focusY: 52, band: "1223", top: "They ran away", bottom: "On purpose" }} />
    <Composition id="CutShort-m01-r3" component={CutShort} durationInFrames={cutShortFrames(R3)} fps={30} width={1080} height={1920} defaultProps={R3} />
    <Still id="Thumb" component={Thumb} width={1280} height={720} defaultProps={{ map: "clean/mg-wide/1260.png", face: "art/mongol/genghis-portrait.jpg", faceFocus: "50% 25%", top: "From hunted orphan", big: "To world conqueror", look: "red" as const }} />
    <Still id="Mongol01-ThumbA" component={Thumb} width={1280} height={720} defaultProps={{ map: "clean/mg-wide/1260.png", face: "art/mongol/genghis-portrait.jpg", faceFocus: "50% 25%", top: "From hunted orphan", big: "To world conqueror", look: "red" as const }} />
    <Still id="Mongol01-ThumbB" component={Thumb} width={1280} height={720} defaultProps={{ map: "clean/mg-wide/1260.png", face: "art/mongol/genghis-portrait.jpg", faceFocus: "50% 25%", top: "1 million vs 100 million", big: "How did he win?", look: "red" as const }} />
    <Still id="Mongol01-ThumbC" component={Thumb} width={1280} height={720} defaultProps={{ map: "clean/mg-wide/1260.png", face: "art/mongol/genghis-portrait.jpg", faceFocus: "50% 25%", top: "Left to die at 9", big: "Genghis Khan", look: "red" as const }} />
    </>
);

import { Still } from "remotion";
import { Mongol01Thumb3, type M01ThumbProps } from "./Mongol01Thumbs";
import { Mongol02Thumb, type M02ThumbProps } from "./Mongol02Thumbs";
import { JinThumb } from "./JinThumbs";

export const ThumbRoot = () => (
  <>
    <Still id="Mongol01Thumb3" component={Mongol01Thumb3} width={1280} height={720} defaultProps={{ concept: "A", lang: "ko" } as M01ThumbProps} />
    <Still id="JinThumb" component={JinThumb} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
    <Still id="Mongol02Thumb" component={Mongol02Thumb} width={1280} height={720} defaultProps={{ concept: "A", lang: "ko" } as M02ThumbProps} />
  </>
);

// 썸네일 시안 전용 진입점 - 큰 Root.tsx와 따로 묶어 빨리 찍는다 (scripts/m01-thumbs3.mjs)
import { registerRoot } from "remotion";
import { ThumbRoot } from "./ThumbRoot";

registerRoot(ThumbRoot);

import { json } from "@hattip/response";
import type { RequestContext } from "rakkasjs";

// https://github.com/expo/custom-expo-updates-server/blob/a20aa7b45698b2c5c43b994983e7252038eb0afd/expo-updates-server/pages/api/manifest.ts

export async function get(ctx: RequestContext) {
  ctx;
  return json({
    message: "hello world",
  });
}

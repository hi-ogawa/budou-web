import { json } from "@hattip/response";
import type { RequestContext } from "rakkasjs";
import * as sudachi from "../../utils/sudachi-helper";

export async function post(ctx: RequestContext) {
  await sudachi.setup();
  const source = await ctx.request.text();
  const result = await sudachi.run(source);
  return json({
    result,
  });
}

#!/usr/bin/env node
// ADA sprite pipeline as an MCP server.
// Exposes the spritesheet generator to any MCP client (Claude Code, etc.)
// so artwork iteration becomes tool calls instead of manual script runs.
//
// Tools:
//   generate_atlases  — regenerate assets/kazim.png+json and assets/props.png+json
//   list_frames       — list every frame/animation in the generated atlases
//   preview_frame     — render one frame (or a whole animation strip) at Nx zoom
//                       to a PNG file and return its path, for visual review
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ASSETS = join(ROOT, "assets");
const PREVIEWS = join(ROOT, "assets", "previews");

async function libs() {
  const { Sprite } = await import(join(ROOT, "tools/sprite.js"));
  const { encodePNG } = await import(join(ROOT, "tools/png.js"));
  const { buildKazim } = await import(join(ROOT, "tools/kazim.js"));
  const { buildProps } = await import(join(ROOT, "tools/props.js"));
  return { Sprite, encodePNG, buildKazim, buildProps };
}

function upscale(Sprite, spr, k) {
  const out = new Sprite(spr.w * k, spr.h * k);
  for (let y = 0; y < spr.h; y++)
    for (let x = 0; x < spr.w; x++) {
      const c = spr.data[y * spr.w + x];
      if (c !== "_") out.rect(x * k, y * k, k, k, c);
    }
  return out;
}

const server = new McpServer({ name: "ada-sprites", version: "1.0.0" });

server.tool(
  "generate_atlases",
  "Regenerate all ADA spritesheets (kazim + props) into assets/. Run after editing tools/kazim.js, tools/props.js or tools/palette.js.",
  {},
  async () => {
    const { generateAll } = await import(join(ROOT, "tools/spritegen.js"));
    const result = generateAll();
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list_frames",
  "List all frames and animations available in the generated atlases (reads assets/kazim.json and assets/props.json).",
  {},
  async () => {
    const k = JSON.parse(readFileSync(join(ASSETS, "kazim.json"), "utf8"));
    const p = JSON.parse(readFileSync(join(ASSETS, "props.json"), "utf8"));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          kazim: { frames: Object.keys(k.frames), animations: k.animations },
          props: { frames: Object.keys(p.frames) },
        }, null, 2),
      }],
    };
  },
);

server.tool(
  "preview_frame",
  "Render a character animation strip or a prop frame at N× zoom to assets/previews/<name>.png for visual review. 'name' is an animation name (idle, walk, fish, work, reach, lie, happy, sad, think, shrug, sit) or a props frame name (palm_0, raft_2, fire_1, ...).",
  { name: z.string(), zoom: z.number().int().min(1).max(12).default(6) },
  async ({ name, zoom }) => {
    const { Sprite, encodePNG, buildKazim, buildProps } = await libs();
    mkdirSync(PREVIEWS, { recursive: true });
    const out = join(PREVIEWS, `${name}_${zoom}x.png`);

    const { frames, anims, fw, fh } = buildKazim();
    if (anims[name]) {
      const list = anims[name].frames;
      const strip = new Sprite(fw * list.length, fh);
      list.forEach((fn, i) => {
        const f = frames.find((fr) => fr.name === fn);
        strip.blit(f.spr, i * fw, 0);
      });
      const big = upscale(Sprite, strip, zoom);
      writeFileSync(out, encodePNG(big.w, big.h, big.toRGBA()));
      return { content: [{ type: "text", text: `wrote ${out} (${list.length} frames, durations ${anims[name].durations.join("/")}ms)` }] };
    }
    const propItem = buildProps().find((p) => p.name === name);
    if (propItem) {
      const big = upscale(Sprite, propItem.spr, zoom);
      writeFileSync(out, encodePNG(big.w, big.h, big.toRGBA()));
      return { content: [{ type: "text", text: `wrote ${out} (${propItem.spr.w}x${propItem.spr.h})` }] };
    }
    return { content: [{ type: "text", text: `unknown frame/animation: ${name}` }], isError: true };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

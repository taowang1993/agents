import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const DEBUG_LOG = "/tmp/pi-screenshot-debug.log";
function dbg(msg: string) {
  try { appendFileSync(DEBUG_LOG, `${new Date().toISOString()} ${msg}\n`); } catch {}
}
dbg("module loaded");

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------

const execFileP = promisify(execFile);
const MAX_DIMENSION = 1280;
const MAX_IMAGE_MESSAGES_IN_CONTEXT = 2;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function mimeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
  };
  return map[mimeType] ?? ".png";
}

async function detectResizeTool(): Promise<"sips" | "magick" | "convert" | null> {
  for (const cmd of ["sips", "magick", "convert"] as const) {
    try {
      await execFileP(cmd, ["--version"], { timeout: 3000 });
      return cmd;
    } catch {}
  }
  return null;
}

async function getImageDimensions(
  path: string,
  tool: "sips" | "magick" | "convert",
): Promise<{ w: number; h: number } | null> {
  try {
    if (tool === "sips") {
      const { stdout } = await execFileP("sips", [
        "-g", "pixelWidth", "-g", "pixelHeight", path,
      ]);
      const wMatch = /pixelWidth:\s*(\d+)/.exec(stdout);
      const hMatch = /pixelHeight:\s*(\d+)/.exec(stdout);
      if (wMatch && hMatch) {
        return { w: parseInt(wMatch[1]!, 10), h: parseInt(hMatch[1]!, 10) };
      }
    } else {
      const { stdout } = await execFileP(tool, [
        "identify", "-format", "%w %h", path,
      ]);
      const parts = stdout.trim().split(/\s+/);
      if (parts.length === 2) {
        return { w: parseInt(parts[0]!, 10), h: parseInt(parts[1]!, 10) };
      }
    }
  } catch {}
  return null;
}

async function resizeImage(
  data: string,
  mimeType: string,
  tool: "sips" | "magick" | "convert",
  maxDim: number,
): Promise<{ data: string; width: number; height: number }> {
  const tmpDir = await mkdtemp(join(tmpdir(), "pi-resize-"));
  const ext = mimeToExt(mimeType);
  const inPath = join(tmpDir, `input${ext}`);
  const outPath = join(tmpDir, `output${ext}`);

  try {
    await writeFile(inPath, Buffer.from(data, "base64"));

    const dims = await getImageDimensions(inPath, tool);
    // Skip vertical images (e.g. dual-screen stacks) — don't scale them down
    if (dims && dims.h > dims.w) {
      return { data, width: dims.w, height: dims.h };
    }
    if (dims && dims.w <= maxDim && dims.h <= maxDim) {
      return { data, width: dims.w, height: dims.h };
    }

    switch (tool) {
      case "sips":
        await execFileP("sips", ["-Z", String(maxDim), inPath, "-o", outPath]);
        break;
      case "magick":
        await execFileP("magick", [inPath, "-resize", `${maxDim}x${maxDim}>`, outPath]);
        break;
      case "convert":
        await execFileP("convert", [inPath, "-resize", `${maxDim}x${maxDim}>`, outPath]);
        break;
    }

    const outDims = await getImageDimensions(outPath, tool);
    const buf = await readFile(outPath);
    return {
      data: buf.toString("base64"),
      width: outDims?.w ?? dims?.w ?? maxDim,
      height: outDims?.h ?? dims?.h ?? maxDim,
    };
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Prune
// ---------------------------------------------------------------------------

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

function hasImages(msg: { role: string; content: unknown }): boolean {
  if (!Array.isArray(msg.content)) return false;
  return msg.content.some((b: { type: string }) => b.type === "image");
}

function stripImages(content: ContentBlock[]): ContentBlock[] {
  const kept = content.filter((b) => b.type !== "image");
  return kept.length > 0 ? kept : [{ type: "text", text: "" }];
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

export default function (pi: ExtensionAPI) {
  let tool: "sips" | "magick" | "convert" | null = null;
  let detected = false;
  let notified = false;

  dbg("factory called");

  pi.on("session_start", async () => {
    dbg("session_start");
  });

  // -- Resize images in read tool results ------------------------------------

  pi.on("tool_result", async (event, ctx) => {
    if (event.toolName !== "read") return;

    const imageBlocks = (event.content ?? []).filter(
      (b: { type: string }) => b.type === "image",
    );
    if (imageBlocks.length === 0) return;

    dbg(`tool_result read: ${imageBlocks.length} image(s)`);

    if (!detected) {
      tool = await detectResizeTool();
      detected = true;
      dbg(`resize tool: ${tool ?? "none"}`);
    }

    if (!tool) return;

    let totalBefore = 0;
    let totalAfter = 0;
    let changed = false;

    const newContent = [...(event.content ?? [])];
    for (let i = 0; i < newContent.length; i++) {
      const block = newContent[i]! as { type: string; data?: string; mimeType?: string };
      if (block.type !== "image" || !block.data) continue;

      totalBefore += block.data.length;
      try {
        const resized = await resizeImage(block.data, block.mimeType ?? "image/png", tool, MAX_DIMENSION);
        if (resized.data !== block.data) {
          newContent[i] = { type: "image", data: resized.data, mimeType: block.mimeType ?? "image/png" };
          changed = true;
        }
        totalAfter += resized.data.length;

        // Update dimension note in text blocks to reflect the actual resize
        for (let j = 0; j < newContent.length; j++) {
          const tb = newContent[j]! as { type: string; text?: string };
          if (tb.type === "text" && tb.text) {
            tb.text = tb.text.replace(
              /\[Image: original (\d+)x(\d+), displayed at \d+x\d+\. Multiply coordinates by [\d.]+ to map to original image\.\]/,
              (_m, origW, origH) => {
                const scale = (parseInt(origW) / resized.width).toFixed(2);
                return `[Image: original ${origW}x${origH}, displayed at ${resized.width}x${resized.height}. Multiply coordinates by ${scale} to map to original image.]`;
              },
            );
          }
        }
      } catch (e) {
        dbg(`resize error: ${e}`);
        totalAfter += block.data.length;
      }
    }

    dbg(`resize: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}`);

    if (changed && !notified) {
      notified = true;
      ctx.ui.notify(
        `Screenshots will be resized to ${MAX_DIMENSION}px (${tool})`,
        "info",
      );
    }

    return { content: newContent };
  });

  // -- Prune old images before each LLM call ----------------------------------

  pi.on("context", async (event, _ctx) => {
    const messages = event.messages;
    const imageMessageIndexes: number[] = [];

    for (let i = 0; i < messages.length; i++) {
      if (hasImages(messages[i]!)) {
        imageMessageIndexes.push(i);
      }
    }

    if (imageMessageIndexes.length <= MAX_IMAGE_MESSAGES_IN_CONTEXT) return;

    const keepFromIdx = imageMessageIndexes[
      imageMessageIndexes.length - MAX_IMAGE_MESSAGES_IN_CONTEXT
    ]!;

    for (let i = 0; i < keepFromIdx; i++) {
      const msg = messages[i]!;
      if (Array.isArray(msg.content) && hasImages(msg)) {
        msg.content = stripImages(msg.content as ContentBlock[]);
      }
    }

    dbg(
      `context prune: kept ${MAX_IMAGE_MESSAGES_IN_CONTEXT} image message(s), stripped ${imageMessageIndexes.length - MAX_IMAGE_MESSAGES_IN_CONTEXT}`,
    );

    return { messages };
  });
}

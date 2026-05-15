import { exec } from "child_process";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("agent_end", async (_event, _ctx) => {
    exec("afplay -v 0.5 /System/Library/Sounds/Funk.aiff");
  });
}
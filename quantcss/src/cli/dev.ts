import { runBuild } from "./build";
import fs from "fs";
import path from "path";

export async function runDev() {
  console.log("🔁 QuantCSS dev (watch mode)");
  await runBuild();

  const watchPaths = ["src", "styles"];

  const watcher = (filePath: string) => {
    if (/\.(qs|js|ts|jsx|tsx|vue|svelte|html|pug)$/.test(filePath)) {
      runBuild()
        .then(() => console.log("🔁 rebuild ok"))
        .catch((err) => console.error("⚠️ erro ao rebuildar:", err));
    }
  };

  watchPaths.forEach((p) => {
    fs.watch(
      path.resolve(p),
      { recursive: true },
      (_, filename) => {
        if (filename) watcher(filename);
      }
    );
  });
}

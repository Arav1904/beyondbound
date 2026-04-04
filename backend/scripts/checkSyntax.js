import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const ALLOWED_EXTENSIONS = new Set([".js"]);
const SKIP_DIRS = new Set(["node_modules", ".git"]);

const collectFiles = (dirPath, result = []) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      collectFiles(fullPath, result);
      continue;
    }

    if (!ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    result.push(fullPath);
  }

  return result;
};

const files = collectFiles(ROOT).sort();

for (const filePath of files) {
  const check = spawnSync(process.execPath, ["--check", filePath], {
    stdio: "inherit",
  });

  if (check.status !== 0) {
    process.exit(check.status || 1);
  }
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);

import { spawnSync } from "node:child_process";

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function run(args) {
  const result = spawnSync(npxCommand, args, { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.VERCEL_ENV === "production") {
  run(["prisma", "migrate", "deploy"]);
}

run(["next", "build"]);

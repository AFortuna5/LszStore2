import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const source = readFileSync("prisma/seed.js", "utf8");

async function runSeed(environment: Record<string, string | undefined>) {
  const deletion = vi.fn();
  const errors: unknown[] = [];
  const exit = vi.fn();
  const prisma = new Proxy({ $disconnect: vi.fn() }, {
    get: (target, name) => name === "$disconnect" ? target.$disconnect : { deleteMany: deletion },
  });
  runInNewContext(source, {
    URL,
    require: (name: string) => {
      if (name === "@prisma/client") return { PrismaClient: class { constructor() { return prisma; } } };
      if (name === "@prisma/adapter-pg") return { PrismaPg: class {} };
      return {};
    },
    process: { env: environment, exit },
    console: { log: vi.fn(), error: (error: unknown) => errors.push(error) },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { deletion, errors, exit };
}

describe("seed safeguards", () => {
  it.each([
    { NODE_ENV: "production", DATABASE_URL: "postgresql://postgres:postgres@localhost/store" },
    { VERCEL: "1", DATABASE_URL: "postgresql://postgres:postgres@localhost/store" },
    { DATABASE_URL: "postgresql://example:example@remote.example.com/store" },
    { DATABASE_URL: "postgresql://postgres:postgres@localhost/store" },
    { DATABASE_URL: "postgresql://postgres:postgres@localhost/store", ALLOW_DESTRUCTIVE_SEED: "true" },
  ])("refuses unsafe seed before deleting anything: %j", async (env) => {
    const result = await runSeed(env);
    expect(result.errors).toHaveLength(1);
    expect(result.exit).toHaveBeenCalledWith(1);
    expect(result.deletion).not.toHaveBeenCalled();
  });
});

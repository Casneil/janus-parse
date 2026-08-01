import { execSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

type Arguments = "c" | "cs" | "s" | "ss";
type Map = { name: string; loc: string };

const rl = readline.createInterface({ input, output });
const commandArguments: Record<Arguments, Map> = {
  c: { name: "client", loc: "dist/client/client.js" },
  cs: { name: "client stream", loc: "dist/client/stream.js" },
  s: { name: "server", loc: "dist/server/server.js" },
  ss: { name: "server stream", loc: "dist/server/stream.js" },
};

try {
  const answerPromise = await rl.question(
    `📦 (c = client / s = server / ss server stream / cs = client stream)\n=> `,
  );
  rl.close();
  const answer = answerPromise.toLowerCase().trim() as Arguments;

  const name = commandArguments[answer]["name"];
  console.log(`Measuring ${name} size...`);

  const nodeFlag = ["s", "ss"].includes(answer) ? "--platform=node" : "";

  execSync("pnpm build", { stdio: "ignore" });
  const bytes = Number(
    String(
      execSync(
        `pnpm esbuild ${commandArguments[answer]["loc"]} --bundle --minify ${nodeFlag} | gzip -c | wc -c`,
      ),
    ).trim(),
  );

  console.log(
    `\nMeasured: ${(bytes / 1024).toFixed(2)} KB (${bytes} bytes) gzipped.\n`,
  );
} catch {
  rl.close();
  console.error(`\nFailed to measure Build size`);
}

import { spawn } from "node:child_process";

const commands = [
  ["server", "tsx", ["watch", "server/index.ts"]],
  ["client", "vite", []]
];

const children = commands.map(([name, command, args]) => {
  const child = spawn(command, args, {
    shell: process.platform === "win32",
    stdio: ["inherit", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  return child;
});

function stop() {
  children.forEach((child) => child.kill());
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

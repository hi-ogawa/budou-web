import child_process from "node:child_process";
import { Readable } from "node:stream";
import { tinyassert } from "./tinyassert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import tar from "tar";

//
// sudachi
//

const SRC_PATH = path.resolve(process.cwd(), "sudachi/dist.tar.gz");
const DIST_PATH = path.resolve(
  process.env["VERCEL"] ? os.tmpdir() : process.cwd(),
  "sudachi/dist"
);

export async function setup() {
  if (!fs.existsSync(DIST_PATH)) {
    const cwd = path.resolve(DIST_PATH, "..");
    await fs.promises.mkdir(cwd, { recursive: true });
    await tar.x({
      file: SRC_PATH,
      C: cwd,
    });
  }
}

function getSudachiCommand(): string {
  return `${DIST_PATH}/sudachi -p ${DIST_PATH}/resources -r ${DIST_PATH}/resources/sudachi.json -l ${DIST_PATH}/resources/system.dic`;
}

//
// sudachi cli wrapper
//

interface SudachiItem {
  text: string;
  pos: string;
  tags: string[];
}

export async function run(source: string): Promise<SudachiItem[]> {
  const { stdout } = await execCommand(getSudachiCommand(), source);
  const lines = stdout.split("\n").slice(0, -2);
  return lines.map((line) => {
    const [text, rawTags] = line.split("\t");
    tinyassert(text);
    tinyassert(rawTags);
    const tags = rawTags.split(",");
    const [pos] = tags;
    tinyassert(pos);
    return {
      text,
      pos,
      tags,
    };
  });
}

//
// utils
//

async function execCommand(
  command: string,
  stdin: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = child_process.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
    if (!proc.stdin) {
      reject(new Error("stdin not available"));
      return;
    }
    Readable.from(stdin).pipe(proc.stdin);
  });
}

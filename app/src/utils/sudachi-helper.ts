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

// try to reuse single instance of sudachi process
class SudachiWrapper {
  private process?: child_process.ChildProcess;
  private stdoutReader?: ReadableStreamDefaultReader<string>;
  private queue: Queue<{
    input: string;
    resolve: (output: string) => void;
    reject: (error: unknown) => void;
  }> = new Queue();

  constructor(private command: string) {}

  start() {
    tinyassert(!this.process);
    // TODO: re-spawn process when it dies for whatever reason
    this.process = child_process.spawn(this.command, {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    tinyassert(this.process.stdout);
    this.stdoutReader = transformToLines(
      nodeToWeb(this.process.stdout)
    ).getReader();
    this.startLoop(3); // hanging promise
  }

  private async startLoop(maxRetry: number) {
    for (let i = 0; i < maxRetry; i++) {
      try {
        await this.startLoopImpl();
      } catch (e) {
        console.error(e);
      }
    }
  }

  private async startLoopImpl() {
    while (true) {
      const request = await this.queue.get();
      try {
        const output = await this.handleRequest(request.input);
        request.resolve(output);
      } catch (e) {
        request.reject(e);
        throw e;
      }
    }
  }

  private async handleRequest(input: string): Promise<string> {
    if (!this.process || !this.process.stdin || !this.stdoutReader) {
      throw new Error("process is not ready");
    }

    // write input
    this.process.stdin.write(input);

    // read ouptut and wait for EOS
    let output = "";
    while (true) {
      const data = await this.stdoutReader.read();
      tinyassert(!data.done);
      output += data.value + "\n";
      if (data.value === "EOS") {
        break;
      }
    }
    return output;
  }

  async tokenize(input: string): Promise<string> {
    input = input.replaceAll(/\s/, " ");
    // TODO: maybe timeout just in case
    return new Promise((resolve, reject) => {
      this.queue.put({ input, resolve, reject });
    });
  }
}

//
// multi-producer single-consumer async queue
//
class Queue<T> {
  private resolve?: (value: T) => void;
  private values: T[] = [];

  async get(): Promise<T> {
    const value = this.values.shift();
    if (value) {
      return value;
    }
    return await new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  put(value: T): void {
    if (this.resolve) {
      this.resolve(value);
      delete this.resolve;
      return;
    }
    this.values.push(value);
  }
}

//
// stream utility
//

function nodeToWeb(nodeStream: Readable): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (data) => {
        tinyassert(data instanceof Buffer);
        controller.enqueue(data.toString());
      });
    },
    cancel() {
      if (!nodeStream.destroyed) {
        nodeStream.destroy();
      }
    },
  });
}

function transformToLines(
  istr: ReadableStream<string>
): ReadableStream<string> {
  const reader = istr.getReader();
  return new ReadableStream({
    start: async (controller) => {
      let chunk: string = "";
      while (true) {
        const res = await reader.read();
        if (res.done) {
          break;
        }
        chunk += res.value;
        while (chunk.includes("\n")) {
          const i = chunk.indexOf("\n");
          controller.enqueue(chunk.slice(0, i));
          chunk = chunk.slice(i + 1);
        }
      }
    },
    cancel: async () => {
      await reader.cancel();
    },
  });
}

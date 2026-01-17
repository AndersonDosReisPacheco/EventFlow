// src/types/global.d.ts
declare global {
  var console: Console;
  var process: NodeJS.Process;
  var URL: typeof import("url").URL;
}

export {};

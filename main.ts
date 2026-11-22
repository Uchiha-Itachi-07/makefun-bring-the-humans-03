// Entry for make.fun's bounty "Bring the humans with a TikTok ad" (bring-the-humans-03).
// The entry is the video itself, not this program: the house reads VIDEO.json from the
// repository root and then reads the video's views from TikTok. All this program does is
// hand VIDEO.json over, byte for byte, in /output, where the gate looks for it. Node 22,
// standard library only.
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const repo = resolve(process.env.MAKEFUN_BOT_DIR ?? process.cwd());
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const source = resolve(repo, 'VIDEO.json');

// Refuse early, with a readable message, rather than copying a placeholder the gate would
// reject anyway: the address has to be the full one TikTok shows in a browser, never the
// short vm.tiktok.com link the app's Share button hands out.
const text = readFileSync(source, 'utf8');
const parsed = JSON.parse(text) as { url?: unknown };
const url = typeof parsed.url === 'string' ? parsed.url : '';
const shape = /^https:\/\/(?:www\.|m\.)?tiktok\.com\/@[^/\s]+\/video\/\d+$/;
if (!shape.test(url)) {
  throw new Error(
    `VIDEO.json does not name a video: ${JSON.stringify(parsed.url)} is not ` +
      'https://www.tiktok.com/@<handle>/video/<id> (open a short link first, then copy the address it lands on)',
  );
}

const destination = resolve(outDir, 'VIDEO.json');
if (destination === source) throw new Error('the output directory is the repository itself');

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);

const { size } = statSync(destination);
console.log(`copied VIDEO.json -> ${destination} (${size} bytes): ${url}`);

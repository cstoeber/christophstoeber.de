import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../public/images/astronaut-button.png', import.meta.url);
const output = new URL('../public/', import.meta.url);
const png = size => sharp(fileURLToPath(source)).resize(size, size).png().toBuffer();

for (const [name, size] of [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
]) {
  await writeFile(new URL(name, output), await png(size));
}

// Multi-resolution ICO for browsers and desktop bookmarks.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL('favicon.ico', output), Buffer.concat([header, ...images]));

import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('public/admin', { recursive: true });
await copyFile('node_modules/decap-cms/dist/decap-cms.js', 'public/admin/decap-cms.js');

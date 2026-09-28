import fs from 'node:fs/promises';
import path from 'node:path';

const PACKAGE_RELEASE_ID = 'b37da591-1051-4120-a7b1-cd3eede5562f';
const BASE_DIR = path.resolve('rp2040-motor-controller');

async function main() {
  console.log('Fetching package file list for rp2040-motor-controller...');
  const listRes = await fetch(
    `https://api.tscircuit.com/package_files/list?package_release_id=${PACKAGE_RELEASE_ID}`
  );
  if (!listRes.ok) {
    throw new Error(`Failed to list package files: ${listRes.statusText}`);
  }
  const { package_files } = await listRes.json();
  console.log(`Found ${package_files.length} files. Downloading into ${BASE_DIR}...`);

  let successCount = 0;
  for (const file of package_files) {
    const filePath = file.file_path;
    const targetPath = path.join(BASE_DIR, filePath);
    const targetDir = path.dirname(targetPath);

    await fs.mkdir(targetDir, { recursive: true });

    const downloadUrl = `https://api.tscircuit.com/package_files/download?package_release_id=${PACKAGE_RELEASE_ID}&file_path=${encodeURIComponent(
      filePath
    )}`;

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        console.warn(`[WARN] Failed to download ${filePath}: ${res.status}`);
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
      successCount++;
      if (successCount % 10 === 0 || successCount === package_files.length) {
        console.log(`Downloaded ${successCount}/${package_files.length}: ${filePath}`);
      }
    } catch (err) {
      console.error(`[ERROR] Downloading ${filePath}:`, err.message);
    }
  }

  console.log(`\nSuccessfully downloaded ${successCount} files of rp2040-motor-controller!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

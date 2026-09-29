import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import occtimportjs from 'occt-import-js';

// GLTFExporter uses FileReader when emitting a binary GLB. Node 20+ already
// exposes Blob, but it does not provide the browser FileReader API.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/convert-step-to-glb.mjs <input.step> <output.glb>');
  process.exit(1);
}

const occt = await occtimportjs();
const input = await fs.readFile(inputPath);
const result = occt.ReadStepFile(input, {
  linearUnit: 'millimeter',
  linearDeflectionType: 'absolute_value',
  linearDeflection: 0.08,
  angularDeflection: 0.35,
});

if (!result.success) {
  throw new Error(`OCCT could not read ${inputPath}`);
}

const root = new THREE.Group();
root.name = path.basename(inputPath, path.extname(inputPath));

for (const meshData of result.meshes) {
  if (!meshData.attributes?.position || !meshData.index) continue;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3));
  if (meshData.attributes.normal) {
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3));
  } else {
    geometry.computeVertexNormals();
  }
  geometry.setIndex(meshData.index.array);

  const rgb = meshData.color ?? [0.18, 0.22, 0.28];
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(rgb[0], rgb[1], rgb[2]),
    metalness: 0.12,
    roughness: 0.42,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = meshData.name || `mesh-${root.children.length + 1}`;
  root.add(mesh);
}

root.updateMatrixWorld(true);
const exporter = new GLTFExporter();
const output = await new Promise((resolve, reject) => {
  exporter.parse(root, resolve, reject, { binary: true, includeCustomExtensions: true });
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, Buffer.from(output));
console.log(`Converted ${result.meshes.length} meshes to ${outputPath}`);

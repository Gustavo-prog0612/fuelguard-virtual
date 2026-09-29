import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// GLTFExporter uses FileReader when emitting a binary GLB.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const outputPath = process.argv[2] ?? 'public/models/official/espressif-esp32-s3-devkitc-1-v1.1.glb';
const root = new THREE.Group();
root.name = 'ESP32-S3-DevKitC-1-N8R8-v1.1';

const materials = {
  pcb: new THREE.MeshStandardMaterial({ color: 0x123b35, metalness: 0.15, roughness: 0.38 }),
  pcbEdge: new THREE.MeshStandardMaterial({ color: 0x0b241f, metalness: 0.05, roughness: 0.58 }),
  solder: new THREE.MeshStandardMaterial({ color: 0xb7c2c8, metalness: 0.8, roughness: 0.22 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xdcae42, metalness: 0.9, roughness: 0.16 }),
  header: new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.08, roughness: 0.46 }),
  shield: new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.84, roughness: 0.25 }),
  shieldDark: new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.72, roughness: 0.3 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111318, metalness: 0.04, roughness: 0.42 }),
  white: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.1, roughness: 0.45 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.1, roughness: 0.34 }),
  green: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.35, roughness: 0.22 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xc47b34, metalness: 0.86, roughness: 0.18 }),
};

function addBox(name, size, position, material, parent = root) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addCylinder(name, radius, height, position, material, parent = root, radialSegments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addMicroUsbConnector(name, z, outwardSign) {
  // A revisão v1.1 usa Micro-USB nos dois conectores da placa. O perfil
  // chanfrado evita que o runtime pareça um conector USB-C genérico.
  const profile = new THREE.Shape();
  profile.moveTo(-4.1, -1.7);
  profile.lineTo(4.1, -1.7);
  profile.lineTo(4.45, -1.25);
  profile.lineTo(4.45, 1.25);
  profile.lineTo(4.1, 1.7);
  profile.lineTo(-4.1, 1.7);
  profile.lineTo(-4.45, 1.25);
  profile.lineTo(-4.45, -1.25);
  profile.closePath();

  const depth = 7.2;
  const shell = new THREE.Mesh(
    new THREE.ExtrudeGeometry(profile, {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.28,
      bevelThickness: 0.22,
      curveSegments: 2,
    }),
    materials.shield,
  );
  shell.name = `${name} Micro-USB metal shell`;
  shell.position.set(0, 2.15, z - (outwardSign * depth) / 2);
  if (outwardSign < 0) shell.rotation.y = Math.PI;
  root.add(shell);

  const opening = addBox(`${name} Micro-USB cavity`, [5.8, 1.35, 0.9], [0, 2.15, z + outwardSign * 3.72], materials.black);
  const tongue = addBox(`${name} Micro-USB tongue`, [4.7, 0.22, 1.15], [0, 1.72, z + outwardSign * 4.05], materials.white);
  opening.castShadow = true;
  tongue.castShadow = true;
}

// Official v1.1 envelope: 25.5 x 68 mm. The detailed component placement is
// reconstructed from the Espressif v1.1 guide, PCB drawing and pin layout.
addBox('PCB 25.5x68 mm', [25.5, 1.6, 68], [0, 0, 0], materials.pcb);
addBox('PCB edge', [25.5, 0.16, 68], [0, 0.86, 0], materials.pcbEdge);

// ESP32-S3-WROOM-1-N8R8 RF module and antenna area.
const wroom = new THREE.Group();
wroom.name = 'ESP32-S3-WROOM-1-N8R8';
wroom.position.set(0, 1.45, 6);
root.add(wroom);
addBox('WROOM metal shield', [18.0, 3.1, 24.8], [0, 1.55, 0], materials.shield, wroom);
addBox('WROOM shield top plate', [17.2, 0.18, 23.8], [0, 3.18, 0], materials.shieldDark, wroom);
addBox('WROOM shield seam', [14.0, 0.12, 0.45], [0, 3.16, -8.6], materials.shieldDark, wroom);
addBox('WROOM shield seam', [14.0, 0.12, 0.45], [0, 3.16, 8.6], materials.shieldDark, wroom);
for (const z of [-7, -3.5, 0, 3.5, 7]) addBox('RF shield marking', [0.22, 0.08, 2.0], [-7.9, 3.18, z], materials.solder, wroom);

// Printed antenna / keepout at the opposite end.
for (const [x, z, width, depth] of [
  [-7.2, -26.3, 0.8, 8.4], [-4.8, -29.9, 5.2, 0.7], [2.0, -29.9, 5.2, 0.7], [7.0, -26.3, 0.8, 8.4],
]) addBox('PCB antenna copper trace', [width, 0.08, depth], [x, 0.88, z], materials.copper);

// Two 2x22 through-hole headers, 2.54 mm pitch.
for (const x of [-11.43, 11.43]) {
  addBox('2x22 header body', [2.25, 2.6, 56.0], [x, -1.0, 0], materials.header);
  for (let i = 0; i < 22; i += 1) {
    const z = -26.67 + i * 2.54;
    addBox('gold header pin', [0.64, 6.2, 0.64], [x, -3.0, z], materials.gold);
  }
}

// The official v1.1 guide identifies both board connectors as Micro-USB.
addMicroUsbConnector('USB-to-UART Port A', 31.0, 1);
addMicroUsbConnector('ESP32-S3 USB OTG Port', -31.0, -1);

// Boot/reset tactile switches, power LED, RGB LED and main IC packages.
for (const [name, x] of [['BOOT button', -6.8], ['RESET button', 6.8]]) {
  addBox(name, [3.8, 1.8, 3.8], [x, 1.9, 23.0], materials.black);
  addCylinder(`${name} actuator`, 0.85, 0.65, [x, 3.05, 23.0], materials.white, root, 16);
}
addBox('WS2812 RGB LED', [2.1, 1.05, 2.1], [0, 1.45, 22.2], materials.green);
addBox('power LED', [1.5, 0.9, 1.5], [-4.2, 1.45, 27.4], materials.blue);
addBox('USB-UART bridge', [5.0, 0.8, 5.0], [5.2, 1.35, 26.2], materials.black);
addBox('3V3 LDO package', [4.2, 1.0, 3.0], [-6.2, 1.4, -17.5], materials.black);
addBox('ESD protection', [2.4, 0.7, 2.0], [5.8, 1.25, -19.5], materials.black);
addBox('crystal package', [3.2, 0.7, 1.7], [-1.8, 1.25, -17.5], materials.solder);

// Fine-pitch passives and regulator details around the USB/power section.
for (const [name, x, z, w, d] of [
  ['USB-UART decoupling', -2.2, 26.2, 1.4, 0.8],
  ['USB-UART decoupling', 1.2, 26.2, 1.4, 0.8],
  ['LDO input capacitor', -9.2, -17.5, 1.4, 0.8],
  ['LDO output capacitor', -9.2, -13.8, 1.4, 0.8],
  ['RF matching network', 7.4, -14.2, 1.0, 0.65],
]) addBox(name, [w, 0.34, d], [x, 1.2, z], materials.solder);

// Silkscreen-like reference marks make the board inspectable at close range.
for (const [x, z, w] of [
  [-10.0, 19.8, 2.5], [-6.5, 19.8, 1.4], [-2.8, 19.8, 2.0], [1.0, 19.8, 1.5],
  [-9.0, -11.2, 2.4], [-5.0, -11.2, 1.6], [5.0, -11.2, 2.8],
]) addBox('silkscreen reference mark', [w, 0.035, 0.22], [x, 0.89, z], materials.white);

// Small passives and silkscreen-like component markers improve inspection at close range.
for (const [x, z] of [[-8, -21], [-4, -21], [0, -21], [4, -21], [8, -21], [-8, 17], [8, 17], [-8, 13], [8, 13]]) {
  addBox('0402 passive', [1.2, 0.35, 0.8], [x, 1.1, z], materials.solder);
}
for (const x of [-8.5, -5.5, -2.5, 0.5, 3.5, 6.5]) addBox('silkscreen guide', [1.6, 0.04, 0.18], [x, 0.86, 30], materials.white);

root.updateMatrixWorld(true);
const exporter = new GLTFExporter();
const output = await new Promise((resolve, reject) => exporter.parse(root, resolve, reject, { binary: true }));
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, Buffer.from(output));
console.log(`Generated detailed ESP32-S3 DevKitC-1 v1.1 reference GLB at ${outputPath}`);

import fs from 'node:fs/promises';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CatmullRomCurve3 } from 'three';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const outputDir = 'public/models/reference';
const materials = {
  body: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.34 }),
  bodyEdge: new THREE.MeshStandardMaterial({ color: 0xd5dde5, roughness: 0.48 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.46 }),
  hole: new THREE.MeshStandardMaterial({ color: 0x172033, roughness: 0.62 }),
  red: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  blue: new THREE.MeshBasicMaterial({ color: 0x0284c7 }),
  green: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.4, transparent: true, opacity: 0.9, roughness: 0.18 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 }),
  black: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.36 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xdcae42, metalness: 0.9, roughness: 0.18 }),
};

function box(name, size, position, material, parent) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function roundedBox(name, size, radius, position, material, parent) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, radius), material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function cylinder(name, radius, height, position, material, parent, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.name = name;
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function tube(name, points, radius, material, parent) {
  const curve = new CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 8, false), material);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function makeBreadboard() {
  const root = new THREE.Group();
  root.name = 'MB-102-830-reference';
  roundedBox('MB-102 body 165x55x8.5 mm', [165, 8.5, 55], 1.8, [0, 0, 0], materials.body, root);
  box('central DIP ravine', [162, 1.8, 4.0], [0, 4.1, 0], materials.bodyEdge, root);

  for (const z of [-23, -20, 20, 23]) {
    box(z < 0 ? 'negative/positive power rail' : 'positive/negative power rail', [156, 0.22, 1.25], [0, 4.42, z], z === -23 || z === 20 ? materials.red : materials.blue, root);
  }

  const holeGeometry = new THREE.CylinderGeometry(0.52, 0.52, 0.18, 8);
  for (let column = 0; column < 63; column += 1) {
    const x = -78.74 + column * 2.54;
    for (const z of [-12.7, -10.16, -7.62, -5.08, -2.54, 2.54, 5.08, 7.62, 10.16, 12.7]) {
      const hole = new THREE.Mesh(holeGeometry, materials.hole);
      hole.name = 'contact hole 2.54 mm';
      hole.position.set(x, 4.42, z);
      root.add(hole);
    }
  }

  for (const z of [-24.6, 24.6]) {
    box('rail separator', [156, 0.18, 0.5], [0, 4.44, z], materials.bodyEdge, root);
  }
  for (const x of [-72, -36, 0, 36, 72]) {
    box('breadboard polarity mark', [8, 0.06, 0.32], [x, 4.46, -26.1], materials.red, root);
  }
  return root;
}

function makeLed() {
  const root = new THREE.Group();
  root.name = 'Kingbright-WP7113GD-reference';
  cylinder('LED T-1 3/4 lower body', 2.5, 4.5, [0, 2.25, 0], materials.green, root);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), materials.green);
  dome.name = 'LED green diffused dome';
  dome.position.set(0, 4.5, 0);
  root.add(dome);
  cylinder('LED cathode lead', 0.28, 6.2, [-1.27, -0.5, 0], materials.metal, root, 8);
  cylinder('LED anode lead', 0.28, 6.2, [1.27, -0.5, 0], materials.metal, root, 8);
  box('LED cathode flat marker', [0.22, 0.05, 1.7], [-1.95, 4.55, 0], materials.dark, root);
  return root;
}

function makeBuzzer() {
  const root = new THREE.Group();
  root.name = 'SameSky-CMI-1295IC-0385T-reference';
  cylinder('active buzzer 12x9.5 mm', 6, 9.5, [0, 4.75, 0], materials.black, root, 32);
  cylinder('buzzer acoustic port', 1.55, 0.45, [0, 9.58, 0], materials.dark, root, 20);
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
    cylinder('buzzer grille opening', 0.28, 0.08, [Math.cos(angle) * 3.0, 9.62, Math.sin(angle) * 3.0], materials.dark, root, 8);
  }
  box('buzzer polarity mark', [1.8, 0.12, 0.42], [3.35, 9.62, 0], materials.copper, root);
  cylinder('buzzer pin 1', 0.4, 6, [0, -1, 3.81], materials.metal, root, 8);
  cylinder('buzzer pin 2', 0.4, 6, [0, -1, -3.81], materials.metal, root, 8);
  return root;
}

function makeSen0311() {
  const root = new THREE.Group();
  root.name = 'DFRobot-SEN0311-A02YYUW-documented-reference';

  // Mechanical drawing reference: maximum width 84.6 mm, body width 63.6 mm,
  // body height 29.6 mm, body depth 12.5 mm, transducer pitch 34.0 mm and
  // mounting holes Ø3.2 mm. The model is intentionally classified as B:
  // documented reconstruction, not manufacturer-exported CAD.
  roundedBox('SEN0311 housing 63.6x29.6x12.5 mm', [63.6, 29.6, 12.5], 3.0, [0, 14.8, 0], materials.dark, root);

  const earMaterial = new THREE.MeshStandardMaterial({ color: 0x263241, roughness: 0.48 });
  roundedBox('SEN0311 left mounting ear', [10.5, 4.0, 12.5], 1.4, [-37.05, 2.0, 0], earMaterial, root);
  roundedBox('SEN0311 right mounting ear', [10.5, 4.0, 12.5], 1.4, [37.05, 2.0, 0], earMaterial, root);

  // Two downward-facing waterproof transducers with the documented 34 mm pitch.
  for (const x of [-17, 17]) {
    cylinder('A02YYUW ultrasonic transducer', 8.2, 1.8, [x, -0.9, 0], materials.metal, root, 32);
    cylinder('A02YYUW transducer seal ring', 8.8, 0.35, [x, -1.85, 0], materials.black, root, 32);
  }

  // Connector relief and a documented PH2.0-4P cable termination.
  roundedBox('SEN0311 cable strain relief', [8.0, 5.5, 7.0], 1.5, [0, 32.0, 0], materials.bodyEdge, root);
  roundedBox('SEN0311 PH2.0-4P connector', [8.0, 4.5, 6.0], 1.0, [0, 36.5, 0], materials.body, root);
  for (let index = 0; index < 4; index += 1) {
    box('SEN0311 connector contact', [0.85, 2.0, 2.0], [-2.3 + index * 1.53, 36.7, -3.15], materials.copper, root);
  }

  // A restrained visible tail preserves the 300 mm cable reference without
  // making the asset swallow the entire bench; the full length is recorded in
  // the manifest and remains part of the routing registry.
  tube('SEN0311 cable tail — 300 mm documented', [
    [0, 39.0, 0],
    [0, 45.0, 0],
    [2.0, 51.0, 4.0],
    [5.0, 58.0, 7.0],
  ], 1.05, materials.black, root);
  return root;
}

function makeMc38() {
  const root = new THREE.Group();
  root.name = 'MC-38-reed-switch-magnet-documented-reference';
  const housingMaterial = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38 });
  const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.54 });

  // Vendor reference envelope: each half approximately 27 x 14 x 10 mm,
  // with two Ø3 mm mounting holes. The family is not a unique MPN, therefore
  // this remains a C-class documented reference until the purchased lot is fixed.
  const reed = new THREE.Group();
  reed.name = 'MC-38 reed housing';
  roundedBox('MC-38 reed housing 27x14x10 mm', [27, 10, 14], 2.0, [0, 5, 0], housingMaterial, reed);
  for (const x of [-9, 9]) {
    cylinder('MC-38 reed mounting hole', 1.5, 0.35, [x, 10.15, 0], materials.hole, reed, 16);
  }
  cylinder('MC-38 reed capsule', 2.2, 12, [0, 5, 0], materials.metal, reed, 20);
  reed.position.set(0, 0, 0);
  root.add(reed);

  const magnet = new THREE.Group();
  magnet.name = 'MC-38 magnet housing';
  roundedBox('MC-38 magnet housing 27x14x10 mm', [27, 10, 14], 2.0, [0, 5, 22], housingMaterial, magnet);
  for (const x of [-9, 9]) {
    cylinder('MC-38 magnet mounting hole', 1.5, 0.35, [x, 10.15, 22], materials.hole, magnet, 16);
  }
  cylinder('MC-38 magnet insert', 4.0, 3.0, [0, 5, 22], materials.red, magnet, 24);
  root.add(magnet);

  tube('MC-38 reed cable tail', [[-11, 5, 0], [-20, 5, -4], [-30, 5, -7], [-42, 5, -5]], 0.8, wireMaterial, root);
  tube('MC-38 magnet cable tail', [[11, 5, 22], [20, 5, 26], [30, 5, 29], [42, 5, 27]], 0.8, wireMaterial, root);
  return root;
}

async function writeGlb(root, filename) {
  root.updateMatrixWorld(true);
  const exporter = new GLTFExporter();
  const output = await new Promise((resolve, reject) => exporter.parse(root, resolve, reject, { binary: true }));
  const target = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(target, Buffer.from(output));
  console.log(`Generated ${target}`);
}

await writeGlb(makeBreadboard(), 'mb102-830-reference.glb');
await writeGlb(makeLed(), 'kingbright-wp7113gd-reference.glb');
await writeGlb(makeBuzzer(), 'samesky-cmi-1295ic-0385t-reference.glb');
await writeGlb(makeSen0311(), 'dfrobot-sen0311-a02yyuw-reference.glb');
await writeGlb(makeMc38(), 'mc-38-reed-switch-magnet-reference.glb');

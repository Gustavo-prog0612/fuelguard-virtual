import { Document, NodeIO } from '@gltf-transform/core';

const output = 'public/assets/cad/carrier/RFID1/reference-derived.glb';
const BOARD = { width: 120, depth: 50, thickness: 1.6 };

const document = new Document();
document.createBuffer('RFID1 reference geometry');
const scene = document.createScene('RFID1 — Adafruit PN532 Breakout v1.6 · Eagle-derived reference');
const modelRoot = document.createNode('RFID1 model origin · board center');
modelRoot.setTranslation([-60, 0, -25]);
scene.addChild(modelRoot);
const materials = new Map();

function material(name, color, roughness = 0.62, metallic = 0) {
  if (!materials.has(name)) {
    materials.set(name, document.createMaterial(name)
      .setBaseColorFactor([...color, 1])
      .setRoughnessFactor(roughness)
      .setMetallicFactor(metallic));
  }
  return materials.get(name);
}

const MAT = {
  board: material('PCB green', [0.035, 0.22, 0.16]),
  copper: material('Copper', [0.78, 0.32, 0.06], 0.34, 0.75),
  gold: material('Header gold', [0.92, 0.62, 0.12], 0.28, 0.8),
  black: material('Plastic black', [0.025, 0.03, 0.035]),
  chip: material('IC package', [0.07, 0.08, 0.09]),
  ceramic: material('Ceramic', [0.72, 0.74, 0.7]),
  white: material('Silkscreen', [0.88, 0.9, 0.82], 0.55),
  hole: material('Through hole', [0.01, 0.012, 0.014], 0.8),
};

function meshFromGeometry(name, positions, indices, mat) {
  const position = document.createAccessor(`${name} positions`)
    .setType('VEC3')
    .setArray(new Float32Array(positions));
  const index = document.createAccessor(`${name} indices`)
    .setType('SCALAR')
    .setArray(new Uint32Array(indices));
  const primitive = document.createPrimitive()
    .setAttribute('POSITION', position)
    .setIndices(index)
    .setMaterial(mat);
  return document.createMesh(name).addPrimitive(primitive);
}

function addBox(name, size, position, mat, rotationY = 0) {
  const [sx, sy, sz] = size;
  const x = sx / 2, y = sy / 2, z = sz / 2;
  const positions = [
    -x, -y, -z, x, -y, -z, x, y, -z, -x, y, -z,
    -x, -y, z, x, -y, z, x, y, z, -x, y, z,
  ];
  const indices = [
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7,
    1, 5, 6, 1, 6, 2, 0, 3, 7, 0, 7, 4,
  ];
  const node = document.createNode(name)
    .setMesh(meshFromGeometry(name, positions, indices, mat))
    .setTranslation(position);
  if (rotationY) node.setRotation([0, Math.sin(rotationY / 2), 0, Math.cos(rotationY / 2)]);
  modelRoot.addChild(node);
  return node;
}

function addCylinder(name, radius, height, position, mat, segments = 24) {
  const positions = [];
  const indices = [];
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -height / 2, z, x, height / 2, z);
  }
  for (let i = 0; i < segments; i += 1) {
    const next = (i + 1) % segments;
    indices.push(i * 2, next * 2, next * 2 + 1, i * 2, next * 2 + 1, i * 2 + 1);
  }
  const node = document.createNode(name)
    .setMesh(meshFromGeometry(name, positions, indices, mat))
    .setTranslation(position);
  modelRoot.addChild(node);
  return node;
}

function addHeader(name, x, z, count, orientation = 'z') {
  const pitch = 2.54;
  const length = count * pitch;
  if (orientation === 'x') addBox(`${name} plastic`, [length, 2.1, 2.8], [x, 2.4, z], MAT.black);
  else addBox(`${name} plastic`, [2.8, 2.1, length], [x, 2.4, z], MAT.black);
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * pitch;
    const pinPosition = orientation === 'x' ? [x + offset, 3.4, z] : [x, 3.4, z + offset];
    addBox(`${name} pin ${i + 1}`, [0.65, 3.8, 0.65], pinPosition, MAT.gold);
  }
}

function addSmd(name, x, z, size = [2.4, 0.85, 1.5], mat = MAT.ceramic) {
  addBox(name, size, [x, 2.05, z], mat);
  addBox(`${name} solder A`, [0.45, 0.25, size[2] + 0.3], [x - size[0] / 2 - 0.3, 2.05, z], MAT.copper);
  addBox(`${name} solder B`, [0.45, 0.25, size[2] + 0.3], [x + size[0] / 2 + 0.3, 2.05, z], MAT.copper);
}

// Eagle v1.6 outline: x=-0.056..119.944, y=0..50 mm.
addBox('Adafruit PN532 v1.6 PCB', [BOARD.width, BOARD.thickness, BOARD.depth], [60, 0.8, 25], MAT.board);

// Mounting holes from U$6/U$36/U$37/U$38 in the official board file.
for (const [x, z] of [[4.944, 5], [4.944, 45], [114.944, 5], [114.944, 45]]) {
  addCylinder('M3 mounting hole', 2.7, 0.18, [x, 1.7, z], MAT.copper);
  addCylinder('M3 opening', 1.55, 0.24, [x, 1.82, z], MAT.hole);
}

// Exact header/jumper anchors read from the Eagle element list.
addHeader('JP4 1x08', 116.534, 24.67, 8, 'z');
addHeader('JP3 1x12', 95.644, 46.866, 12, 'x');
addHeader('CN1 FTDI 1x06', 78.194, 4, 6, 'x');
addHeader('JP1 SEL0', 91.224, 8.51, 3, 'z');
addHeader('JP2 SEL1', 100.334, 8.51, 3, 'z');

// PN532 QFN, 4050 level shifter, regulator, crystal and dense passives.
addBox('U1 PN532 QFN40', [8, 1.2, 8], [95.734, 2.25, 24.62], MAT.chip);
addBox('U1 thermal pad', [3.6, 0.12, 3.6], [95.734, 2.9, 24.62], MAT.copper);
addBox('U2 MIC5225 regulator', [3.2, 1.0, 2.6], [111.194, 2.15, 37.5], MAT.chip);
addBox('Y1 27.12MHz crystal', [3.2, 1.0, 2.5], [94.956, 2.05, 15.24], MAT.ceramic);
for (const [x, z] of [[87.32, 26.289], [87.32, 23.495], [75.251, 27.809], [75.251, 22.61], [73.223, 27.809], [73.223, 22.61], [86.562, 30.734], [91.765, 29.718], [88.721, 30.607]]) addSmd('0805 passive', x, z);
addBox('LED1 green', [1.5, 0.9, 1.5], [74.944, 2.2, 45], MAT.white);

// Copper stripline antenna area on the left side of the board.
const antennaSegments = [
  [18, 12, 52, 12], [52, 12, 52, 38], [52, 38, 18, 38],
  [18, 38, 18, 17], [18, 17, 47, 17], [47, 17, 47, 33],
  [47, 33, 23, 33], [23, 33, 23, 22], [23, 22, 42, 22],
  [42, 22, 42, 28], [42, 28, 28, 28],
];
for (let i = 0; i < antennaSegments.length; i += 1) {
  const [x1, z1, x2, z2] = antennaSegments[i];
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  addBox(`Antenna trace ${i + 1}`, [length, 0.18, 0.45], [(x1 + x2) / 2, 1.76, (z1 + z2) / 2], MAT.copper, -Math.atan2(dz, dx));
}
addBox('Antenna feed', [18, 0.18, 0.45], [53, 1.76, 25], MAT.copper);

document.getRoot().setExtras({
  source: 'https://github.com/adafruit/Adafruit-PN532-RFID-NFC-Breakout',
  sourceFile: 'Adafruit PN532_Breakout_v1.6.brd',
  sourceRevision: 'v1.6',
  dimensionsMm: BOARD,
  status: 'derived-reference-pending-physical-validation',
});

await new NodeIO().write(output, document);
console.log(`Generated ${output}`);

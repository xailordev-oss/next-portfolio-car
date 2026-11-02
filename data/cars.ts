// All site content and 3D layout data lives here.

export type Vec3 = [number, number, number];
export type Point = [number, number];

export type PaintColor = { name: string; hex: string };

export type Spec = { label: string; value: string; unit: string };

export type PartKind =
  | "body"
  | "roof"
  | "glass"
  | "wheel"
  | "headlight"
  | "taillight"
  | "mirror"
  | "spoiler";

export type CarPart = {
  id: string;
  kind: PartKind;
  position: Vec3;
  /** The way this part travels when the car comes apart. */
  explodeDirection: Vec3;
  /** Rotation in radians at full explosion. */
  spin: Vec3;
};

export type Box = { position: Vec3; size: Vec3; rotation?: Vec3 };

// Side profiles use x = length (front is positive) and y = height.
export type CarShape = {
  halfLength: number;
  halfWidth: number;
  bottom: number;
  /** Body top line, from the front bumper to the rear bumper. */
  bodyLine: Point[];
  /** Closed outline of the glass area. */
  cabin: Point[];
  /** Closed outline of the roof panel. */
  roof: Point[];
  cabinHalfWidth: number;
  /** How much narrower the cabin is at the roof than at the beltline. */
  tumblehome: number;
  beltY: number;
  topY: number;
  wheelRadius: number;
  wheelFrontX: number;
  wheelRearX: number;
  headlight: { x: number; y: number; z: number; size: Vec3 };
  taillight: { x: number; y: number; z: number; size: Vec3 };
  mirror: { x: number; y: number; z: number };
  /** The spoiler part: wing, lip, ducktail or pickup sport bar. */
  spoiler: Box[];
  /** Dark details fixed to the body, such as a grille or truck bed. */
  details: Box[];
};

export type Car = {
  id: string;
  name: string;
  bodyType: string;
  description: string;
  specs: [Spec, Spec, Spec];
  colors: [PaintColor, PaintColor, PaintColor, PaintColor, PaintColor];
  shape: CarShape;
  parts: CarPart[];
};

export const developer = {
  name: "xailordev",
  role: "Full-stack developer",
  // Change the name and link here; the header and footer both read from it.
  url: "https://github.com/xailordev",
  linkLabel: "ເບິ່ງຜົນງານໃນ GitHub",
};

// Builds the 14 parts from a shape. `spread` gives each car its own break-up.
function buildParts(shape: CarShape, spread: { up: number; side: number; long: number }): CarPart[] {
  const { up, side, long } = spread;
  const wheelY = shape.wheelRadius;
  const wheelZ = shape.halfWidth - 0.1;
  const wheel = (id: string, x: number, z: number, direction: Vec3, spinY: number): CarPart => ({
    id,
    kind: "wheel",
    position: [x, wheelY, z],
    explodeDirection: direction,
    spin: [0.5, spinY, 1.2],
  });
  const { headlight: head, taillight: tail, mirror } = shape;

  return [
    { id: "body", kind: "body", position: [0, 0, 0], explodeDirection: [0, -0.12, 0], spin: [0, 0, 0.02] },
    { id: "glass", kind: "glass", position: [0, 0, 0], explodeDirection: [-0.08, 0.5 * up, 0], spin: [0, 0, -0.05] },
    { id: "roof", kind: "roof", position: [0, 0, 0], explodeDirection: [-0.1, 1.05 * up, 0], spin: [0.08, 0, 0.12] },
    { id: "spoiler", kind: "spoiler", position: [0, 0, 0], explodeDirection: [-0.75 * long, 0.75 * up, 0], spin: [0, 0, 0.35] },
    wheel("wheel-front-left", shape.wheelFrontX, wheelZ, [0.35 * long, -0.25, 0.95 * side], 0.5),
    wheel("wheel-front-right", shape.wheelFrontX, -wheelZ, [0.35 * long, -0.25, -0.95 * side], -0.5),
    wheel("wheel-rear-left", shape.wheelRearX, wheelZ, [-0.35 * long, -0.25, 0.95 * side], -0.4),
    wheel("wheel-rear-right", shape.wheelRearX, -wheelZ, [-0.35 * long, -0.25, -0.95 * side], 0.4),
    { id: "headlight-left", kind: "headlight", position: [head.x, head.y, head.z], explodeDirection: [0.95 * long, 0.2, 0.35 * side], spin: [0.4, 0.6, 0] },
    { id: "headlight-right", kind: "headlight", position: [head.x, head.y, -head.z], explodeDirection: [0.95 * long, 0.2, -0.35 * side], spin: [-0.4, -0.6, 0] },
    { id: "taillight-left", kind: "taillight", position: [tail.x, tail.y, tail.z], explodeDirection: [-0.95 * long, 0.22, 0.35 * side], spin: [0.4, -0.6, 0] },
    { id: "taillight-right", kind: "taillight", position: [tail.x, tail.y, -tail.z], explodeDirection: [-0.95 * long, 0.22, -0.35 * side], spin: [-0.4, 0.6, 0] },
    { id: "mirror-left", kind: "mirror", position: [mirror.x, mirror.y, mirror.z], explodeDirection: [0.2, 0.55, 0.9 * side], spin: [0.7, 0.4, 0] },
    { id: "mirror-right", kind: "mirror", position: [mirror.x, mirror.y, -mirror.z], explodeDirection: [0.2, 0.55, -0.9 * side], spin: [-0.7, -0.4, 0] },
  ];
}

const sportShape: CarShape = {
  halfLength: 2.15,
  halfWidth: 0.96,
  bottom: 0.2,
  bodyLine: [[2.15, 0.36], [2.1, 0.56], [1.25, 0.72], [0.62, 0.86], [-0.9, 0.92], [-1.75, 0.93], [-2.12, 0.78], [-2.15, 0.42]],
  cabin: [[0.72, 0.84], [0.02, 1.2], [-0.62, 1.24], [-1.25, 1.08], [-1.75, 0.9]],
  roof: [[0.08, 1.17], [-0.02, 1.235], [-0.64, 1.275], [-1.06, 1.17], [-0.62, 1.2]],
  cabinHalfWidth: 0.74,
  tumblehome: 0.76,
  beltY: 0.84,
  topY: 1.28,
  wheelRadius: 0.36,
  wheelFrontX: 1.34,
  wheelRearX: -1.3,
  headlight: { x: 1.72, y: 0.665, z: 0.6, size: [0.34, 0.06, 0.26] },
  taillight: { x: -2.12, y: 0.75, z: 0.5, size: [0.05, 0.07, 0.48] },
  mirror: { x: 0.45, y: 0.95, z: 0.92 },
  spoiler: [
    { position: [-1.9, 1.23, 0], size: [0.46, 0.04, 1.68], rotation: [0, 0, 0.05] },
    { position: [-1.84, 1.06, 0.42], size: [0.2, 0.34, 0.04] },
    { position: [-1.84, 1.06, -0.42], size: [0.2, 0.34, 0.04] },
  ],
  details: [{ position: [2.08, 0.34, 0], size: [0.14, 0.14, 1.1] }],
};

const suvShape: CarShape = {
  halfLength: 2.45,
  halfWidth: 1.03,
  bottom: 0.34,
  bodyLine: [[2.45, 0.55], [2.4, 0.95], [1.75, 1.1], [0.9, 1.2], [-1.35, 1.26], [-2.3, 1.2], [-2.45, 0.92], [-2.42, 0.55]],
  cabin: [[1.02, 1.17], [0.36, 1.72], [-1.2, 1.72], [-2.0, 1.48], [-2.28, 1.2]],
  roof: [[0.42, 1.68], [0.33, 1.76], [-1.24, 1.78], [-2.04, 1.5], [-1.2, 1.68]],
  cabinHalfWidth: 0.86,
  tumblehome: 0.8,
  beltY: 1.2,
  topY: 1.78,
  wheelRadius: 0.46,
  wheelFrontX: 1.56,
  wheelRearX: -1.5,
  headlight: { x: 2.43, y: 0.9, z: 0.58, size: [0.06, 0.09, 0.36] },
  taillight: { x: -2.38, y: 1.08, z: 0.55, size: [0.05, 0.08, 0.56] },
  mirror: { x: 0.8, y: 1.3, z: 1.02 },
  spoiler: [{ position: [-1.98, 1.72, 0], size: [0.42, 0.05, 1.28], rotation: [0, 0, -0.32] }],
  details: [
    { position: [2.43, 0.75, 0], size: [0.06, 0.28, 1.1] },
    { position: [2.4, 0.46, 0], size: [0.12, 0.14, 1.24] },
  ],
};

const sedanShape: CarShape = {
  halfLength: 2.48,
  halfWidth: 0.97,
  bottom: 0.22,
  bodyLine: [[2.48, 0.38], [2.44, 0.62], [1.55, 0.82], [0.92, 0.94], [-1.2, 1.02], [-2.2, 1.01], [-2.46, 0.84], [-2.48, 0.44]],
  cabin: [[1.05, 0.92], [0.22, 1.38], [-0.9, 1.4], [-1.65, 1.18], [-2.1, 1.0]],
  roof: [[0.28, 1.35], [0.18, 1.415], [-0.92, 1.44], [-1.42, 1.28], [-0.9, 1.36]],
  cabinHalfWidth: 0.78,
  tumblehome: 0.78,
  beltY: 0.94,
  topY: 1.44,
  wheelRadius: 0.37,
  wheelFrontX: 1.58,
  wheelRearX: -1.5,
  headlight: { x: 2.1, y: 0.72, z: 0.58, size: [0.4, 0.05, 0.34] },
  taillight: { x: -2.42, y: 0.9, z: 0.34, size: [0.05, 0.05, 0.72] },
  mirror: { x: 0.78, y: 1.03, z: 0.94 },
  spoiler: [{ position: [-2.27, 1.03, 0], size: [0.28, 0.035, 1.42], rotation: [0, 0, 0.14] }],
  details: [{ position: [2.42, 0.34, 0], size: [0.08, 0.1, 1.0] }],
};

const coupeShape: CarShape = {
  halfLength: 2.34,
  halfWidth: 0.98,
  bottom: 0.21,
  bodyLine: [[2.34, 0.38], [2.3, 0.66], [1.48, 0.84], [0.8, 0.97], [-1.15, 1.02], [-1.98, 1.03], [-2.32, 0.88], [-2.34, 0.44]],
  cabin: [[0.9, 0.95], [0.08, 1.34], [-0.76, 1.36], [-1.48, 1.14], [-1.92, 1.0]],
  roof: [[0.14, 1.31], [0.04, 1.375], [-0.78, 1.4], [-1.26, 1.25], [-0.76, 1.32]],
  cabinHalfWidth: 0.77,
  tumblehome: 0.76,
  beltY: 0.97,
  topY: 1.4,
  wheelRadius: 0.37,
  wheelFrontX: 1.48,
  wheelRearX: -1.38,
  headlight: { x: 1.98, y: 0.77, z: 0.61, size: [0.34, 0.06, 0.3] },
  taillight: { x: -2.29, y: 0.9, z: 0.54, size: [0.05, 0.07, 0.42] },
  mirror: { x: 0.64, y: 1.05, z: 0.95 },
  spoiler: [{ position: [-2.12, 1.05, 0], size: [0.34, 0.06, 1.46], rotation: [0, 0, 0.22] }],
  details: [
    { position: [2.31, 0.58, 0.22], size: [0.05, 0.2, 0.32] },
    { position: [2.31, 0.58, -0.22], size: [0.05, 0.2, 0.32] },
    { position: [2.3, 0.33, 0], size: [0.1, 0.1, 1.2] },
  ],
};

const pickupShape: CarShape = {
  halfLength: 2.72,
  halfWidth: 1.08,
  bottom: 0.42,
  bodyLine: [[2.72, 0.62], [2.68, 1.14], [1.75, 1.3], [0.88, 1.32], [-0.6, 1.34], [-0.72, 1.24], [-2.68, 1.24], [-2.72, 0.62]],
  cabin: [[0.98, 1.3], [0.4, 1.86], [-0.48, 1.88], [-0.68, 1.34]],
  roof: [[0.44, 1.82], [0.36, 1.9], [-0.5, 1.93], [-0.68, 1.84], [-0.48, 1.84]],
  cabinHalfWidth: 0.92,
  tumblehome: 0.86,
  beltY: 1.3,
  topY: 1.93,
  wheelRadius: 0.5,
  wheelFrontX: 1.68,
  wheelRearX: -1.72,
  headlight: { x: 2.7, y: 1.06, z: 0.64, size: [0.06, 0.12, 0.34] },
  taillight: { x: -2.69, y: 1.02, z: 0.86, size: [0.05, 0.28, 0.14] },
  mirror: { x: 0.86, y: 1.44, z: 1.1 },
  // The pickup carries a sport bar over the bed instead of a wing.
  spoiler: [
    { position: [-0.92, 1.72, 0], size: [0.09, 0.08, 1.68] },
    { position: [-0.92, 1.48, 0.8], size: [0.09, 0.5, 0.09] },
    { position: [-0.92, 1.48, -0.8], size: [0.09, 0.5, 0.09] },
  ],
  details: [
    // Truck bed: dark liner with raised side rails and a tailgate lip.
    { position: [-1.7, 1.29, 0], size: [1.86, 0.03, 1.66] },
    { position: [-1.7, 1.36, 0.95], size: [1.9, 0.16, 0.12] },
    { position: [-1.7, 1.36, -0.95], size: [1.9, 0.16, 0.12] },
    { position: [-2.64, 1.36, 0], size: [0.1, 0.16, 1.9] },
    { position: [2.72, 0.86, 0], size: [0.06, 0.28, 0.98] },
    { position: [2.68, 0.56, 0], size: [0.12, 0.16, 1.5] },
  ],
};

export const cars: Car[] = [
  {
    id: "porsche-911-gt3",
    name: "Porsche 911 GT3",
    bodyType: "Sport",
    description: "ເຄື່ອງສູບນອນ 6 ສູບ 4.0 ລິດ ບໍ່ມີເທີໂບ ສ້າງມາເພື່ອສະໜາມແຂ່ງ ແຕ່ຍັງຂັບເທິງຖະໜົນໄດ້.",
    specs: [
      { label: "ແຮງມ້າ", value: "510", unit: "PS" },
      { label: "0–100 km/h", value: "3.4", unit: "ວິນາທີ" },
      { label: "ຄວາມໄວສູງສຸດ", value: "318", unit: "km/h" },
    ],
    colors: [
      { name: "Signal Yellow", hex: "#E3BC1C" },
      { name: "Midnight Black", hex: "#141518" },
      { name: "Arctic Silver", hex: "#B9BEC4" },
      { name: "Carmine Red", hex: "#A3121F" },
      { name: "Shark Blue", hex: "#1F4FA8" },
    ],
    shape: sportShape,
    parts: buildParts(sportShape, { up: 1, side: 1, long: 1 }),
  },
  {
    id: "lamborghini-urus-s",
    name: "Lamborghini Urus S",
    bodyType: "SUV",
    description: "Super SUV ເຄື່ອງ V8 ເທີໂບຄູ່ ຂັບສີ່ລໍ້ ພື້ນທີ່ຂອງລົດຄອບຄົວ ກັບຕົວເລກຂອງລົດສະປອດ.",
    specs: [
      { label: "ແຮງມ້າ", value: "666", unit: "CV" },
      { label: "0–100 km/h", value: "3.5", unit: "ວິນາທີ" },
      { label: "ຄວາມໄວສູງສຸດ", value: "305", unit: "km/h" },
    ],
    colors: [
      { name: "Viper Green", hex: "#6AA51F" },
      { name: "Graphite Grey", hex: "#3A3D42" },
      { name: "Pearl White", hex: "#E6E4DE" },
      { name: "Burnt Orange", hex: "#C9511A" },
      { name: "Deep Violet", hex: "#3D2266" },
    ],
    shape: suvShape,
    parts: buildParts(suvShape, { up: 0.85, side: 1.1, long: 0.9 }),
  },
  {
    id: "tesla-model-s-plaid",
    name: "Tesla Model S Plaid",
    bodyType: "Sedan",
    description: "ຊີດານໄຟຟ້າສາມມໍເຕີ ແຮງບິດມາທັນທີທີ່ກົດຄັນເລັ່ງ ໃນຫ້ອງໂດຍສານ 5 ທີ່ນັ່ງ.",
    specs: [
      { label: "ແຮງມ້າ", value: "1,020", unit: "hp" },
      { label: "0–100 km/h", value: "2.1", unit: "ວິນາທີ" },
      { label: "ຄວາມໄວສູງສຸດ", value: "322", unit: "km/h" },
    ],
    colors: [
      { name: "Ruby Coat", hex: "#9A1628" },
      { name: "Stealth Grey", hex: "#2E3135" },
      { name: "Glacier White", hex: "#EDEFF0" },
      { name: "Ocean Deep", hex: "#123C69" },
      { name: "Liquid Silver", hex: "#8F9499" },
    ],
    shape: sedanShape,
    parts: buildParts(sedanShape, { up: 1.1, side: 0.9, long: 1.1 }),
  },
  {
    id: "bmw-m4-competition",
    name: "BMW M4 Competition",
    bodyType: "Coupe",
    description: "ຄູເປ້ຂັບລໍ້ຫຼັງ ເຄື່ອງ 6 ສູບລຽງ 3.0 ລິດ ເທີໂບຄູ່ ໃຊ້ໄດ້ທັງທຸກວັນ ແລະ ວັນລົງສະໜາມ.",
    specs: [
      { label: "ແຮງມ້າ", value: "510", unit: "PS" },
      { label: "0–100 km/h", value: "3.9", unit: "ວິນາທີ" },
      { label: "ຄວາມໄວສູງສຸດ", value: "290", unit: "km/h" },
    ],
    colors: [
      { name: "Isle Teal", hex: "#1B7F78" },
      { name: "Frozen Black", hex: "#17181B" },
      { name: "Harbor Grey", hex: "#6A7077" },
      { name: "Cobalt Blue", hex: "#12439E" },
      { name: "Crimson Flame", hex: "#B3161B" },
    ],
    shape: coupeShape,
    parts: buildParts(coupeShape, { up: 1, side: 1.05, long: 1 }),
  },
  {
    id: "ford-f150-raptor",
    name: "Ford F-150 Raptor",
    bodyType: "Pickup",
    description: "ປິກອັບສາຍທະເລຊາຍ ເຄື່ອງ V6 3.5 ລິດ ເທີໂບຄູ່ ພ້ອມຊ່ວງລ່າງສຳລັບທາງວິບາກຄວາມໄວສູງ.",
    specs: [
      { label: "ແຮງມ້າ", value: "450", unit: "hp" },
      { label: "0–100 km/h", value: "5.9", unit: "ວິນາທີ" },
      { label: "ຄວາມໄວສູງສຸດ", value: "172", unit: "km/h" },
    ],
    colors: [
      { name: "Desert Orange", hex: "#E0641B" },
      { name: "Basalt Black", hex: "#1A1B1C" },
      { name: "Alpine White", hex: "#E9E8E3" },
      { name: "Azure Grey", hex: "#5A6B7A" },
      { name: "Ironclad Blue", hex: "#1E3350" },
    ],
    shape: pickupShape,
    parts: buildParts(pickupShape, { up: 0.8, side: 1.15, long: 0.85 }),
  },
];

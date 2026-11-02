"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Box, Car, CarPart, CarShape, Point } from "@/data/cars";
import { useScrollExplode } from "@/hooks/useScrollExplode";

const EXPLODE_DISTANCE = 2.1; // World units a part travels at full explosion.
const ASSEMBLE_MS = 800;
const STAGGER_MS = 35;
const COLOR_DAMPING = 9; // Reaches the new colour in roughly 400ms.

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

function extrude(shape: THREE.Shape, halfWidth: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: halfWidth * 2 - 0.08,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.04,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -halfWidth + 0.04);
  return geometry;
}

function outline(points: Point[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.closePath();
  return shape;
}

// Narrows the nose and tail so the car is not a plain slab from above.
function bodyGeometry(car: CarShape) {
  const shape = new THREE.Shape();
  car.bodyLine.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
  shape.lineTo(-car.halfLength, car.bottom);

  // Cut a faceted arch for each wheel while walking the sill rear to front.
  const archRadius = car.wheelRadius * 1.14;
  const start = Math.asin(clamp01((car.wheelRadius - car.bottom) / archRadius));
  for (const centerX of [car.wheelRearX, car.wheelFrontX]) {
    for (let step = 0; step <= 8; step += 1) {
      const angle = Math.PI + start - (step / 8) * (Math.PI + 2 * start);
      shape.lineTo(centerX + archRadius * Math.cos(angle), car.wheelRadius + archRadius * Math.sin(angle));
    }
  }
  shape.lineTo(car.halfLength, car.bottom);
  shape.closePath();

  const geometry = extrude(shape, car.halfWidth);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const end = clamp01((Math.abs(position.getX(i)) / car.halfLength - 0.55) / 0.45);
    position.setZ(i, position.getZ(i) * (1 - 0.15 * end * end));
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Leans the glass and roof inward toward the top, like a real cabin.
function cabinGeometry(points: Point[], car: CarShape) {
  const geometry = extrude(outline(points), car.cabinHalfWidth);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const height = clamp01((position.getY(i) - car.beltY) / (car.topY - car.beltY));
    position.setZ(i, position.getZ(i) * (1 - (1 - car.tumblehome) * height));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createMaterials(color: string) {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.55,
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      flatShading: true,
    }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#07090c", metalness: 0.85, roughness: 0.08, flatShading: true }),
    trim: new THREE.MeshStandardMaterial({ color: "#0a0b0c", roughness: 0.75 }),
    tire: new THREE.MeshStandardMaterial({ color: "#0c0c0d", roughness: 0.92, flatShading: true }),
    rim: new THREE.MeshStandardMaterial({ color: "#a9adb2", metalness: 0.9, roughness: 0.3, flatShading: true }),
    headlight: new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#fff6e2", emissiveIntensity: 2.4 }),
    taillight: new THREE.MeshStandardMaterial({ color: "#47050a", emissive: "#ff1a2c", emissiveIntensity: 1.9 }),
  };
}

type Materials = ReturnType<typeof createMaterials>;

function BoxMesh({ box, material }: { box: Box; material: THREE.Material }) {
  return (
    <mesh position={box.position} rotation={box.rotation} material={material} castShadow>
      <boxGeometry args={box.size} />
    </mesh>
  );
}

function Wheel({ radius, materials }: { radius: number; materials: Materials }) {
  const width = radius * 0.72;
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={materials.tire} castShadow>
        <cylinderGeometry args={[radius, radius, width, 18]} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, (side * width) / 2, 0]}>
          <mesh material={materials.rim}>
            <cylinderGeometry args={[radius * 0.2, radius * 0.24, 0.03, 8]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((spoke) => (
            <mesh key={spoke} rotation={[0, (spoke / 5) * Math.PI * 2, 0]} material={materials.rim}>
              <boxGeometry args={[radius * 1.2, 0.025, radius * 0.16]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function PartMesh({ part, car, materials }: { part: CarPart; car: Car; materials: Materials }) {
  const { shape } = car;
  const geometries = useMemo(
    () =>
      part.kind === "body"
        ? bodyGeometry(shape)
        : part.kind === "glass"
          ? cabinGeometry(shape.cabin, shape)
          : part.kind === "roof"
            ? cabinGeometry(shape.roof, shape)
            : null,
    [part.kind, shape],
  );
  useEffect(() => () => geometries?.dispose(), [geometries]);

  switch (part.kind) {
    case "body":
      return (
        <>
          <mesh geometry={geometries!} material={materials.paint} castShadow />
          {shape.details.map((box, index) => (
            <BoxMesh key={index} box={box} material={materials.trim} />
          ))}
        </>
      );
    case "glass":
      return <mesh geometry={geometries!} material={materials.glass} />;
    case "roof":
      return <mesh geometry={geometries!} material={materials.paint} castShadow />;
    case "spoiler":
      return (
        <>
          {shape.spoiler.map((box, index) => (
            <BoxMesh key={index} box={box} material={index === 0 ? materials.paint : materials.trim} />
          ))}
        </>
      );
    case "wheel":
      return <Wheel radius={shape.wheelRadius} materials={materials} />;
    case "headlight":
      return (
        <mesh material={materials.headlight}>
          <boxGeometry args={shape.headlight.size} />
        </mesh>
      );
    case "taillight":
      return (
        <mesh material={materials.taillight}>
          <boxGeometry args={shape.taillight.size} />
        </mesh>
      );
    case "mirror":
      return (
        <group>
          <mesh material={materials.paint} castShadow>
            <boxGeometry args={[0.13, 0.1, 0.2]} />
          </mesh>
          <mesh position={[-0.066, 0, 0]} material={materials.glass}>
            <boxGeometry args={[0.005, 0.075, 0.16]} />
          </mesh>
        </group>
      );
  }
}

type CarModelProps = {
  car: Car;
  color: string;
  floorMaterial: RefObject<THREE.MeshBasicMaterial | null>;
  /** The section backdrop; its --tint follows the paint without a re-render. */
  backdrop: RefObject<HTMLElement | null>;
};

export default function CarModel({ car, color, floorMaterial, backdrop }: CarModelProps) {
  const scroll = useScrollExplode();
  const groups = useRef<(THREE.Group | null)[]>([]);
  const motion = useRef({
    amounts: car.parts.map(() => 0),
    from: car.parts.map(() => 0),
    settledAt: 0,
    wasScrolling: false,
  });
  const materials = useMemo(() => createMaterials(color), [car.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const targetColor = useMemo(() => new THREE.Color(color), [color]);
  const liveColor = useRef(new THREE.Color(color));

  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);

  useFrame((_, delta) => {
    const m = motion.current;
    const now = performance.now();
    const dt = Math.min(delta, 0.05);

    // Remember where each part was when scrolling stopped.
    if (m.wasScrolling && !scroll.scrolling) {
      m.from = [...m.amounts];
      m.settledAt = scroll.settledAt;
    }
    m.wasScrolling = scroll.scrolling;

    car.parts.forEach((part, index) => {
      if (scroll.scrolling) {
        // Follow the scroll speed, quickly but without snapping.
        m.amounts[index] = THREE.MathUtils.damp(m.amounts[index], scroll.target, 11, dt);
      } else {
        // Ease back together one part after another.
        const t = clamp01((now - m.settledAt - index * STAGGER_MS) / ASSEMBLE_MS);
        m.amounts[index] = m.from[index] * (1 - easeOutCubic(t));
      }

      const group = groups.current[index];
      if (!group) return;
      const amount = m.amounts[index];
      const [dx, dy, dz] = part.explodeDirection;
      group.position.set(
        part.position[0] + dx * amount * EXPLODE_DISTANCE,
        part.position[1] + dy * amount * EXPLODE_DISTANCE,
        part.position[2] + dz * amount * EXPLODE_DISTANCE,
      );
      group.rotation.set(part.spin[0] * amount, part.spin[1] * amount, part.spin[2] * amount);
    });

    // Fade the paint, floor light and backdrop to the current colour.
    const live = liveColor.current;
    if (!live.equals(targetColor)) {
      live.lerp(targetColor, scroll.reducedMotion ? 1 : 1 - Math.exp(-COLOR_DAMPING * dt));
      if (Math.abs(live.r - targetColor.r) + Math.abs(live.g - targetColor.g) + Math.abs(live.b - targetColor.b) < 0.002) {
        live.copy(targetColor);
      }
      materials.paint.color.copy(live);
      floorMaterial.current?.color.copy(live);
      backdrop.current?.style.setProperty("--tint", `#${live.getHexString()}`);
    }
  });

  return (
    <group position={[0, -0.75, 0]}>
      {car.parts.map((part, index) => (
        <group
          key={part.id}
          position={part.position}
          ref={(node) => {
            groups.current[index] = node;
          }}
        >
          <PartMesh part={part} car={car} materials={materials} />
        </group>
      ))}
    </group>
  );
}

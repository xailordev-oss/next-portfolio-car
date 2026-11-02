"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import CarModel from "@/components/CarModel";
import type { Car } from "@/data/cars";

const CAMERA_DIRECTION = new THREE.Vector3(0.72, 0.26, 0.72).normalize();
const FOV = 26;

// Keeps the whole car in frame at any aspect ratio.
function CameraFit() {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const get = useThree((state) => state.get);
  useEffect(() => {
    const distance = Math.max(15, 11.5 / aspect);
    get().camera.position.copy(CAMERA_DIRECTION).multiplyScalar(distance);
  }, [aspect, get]);
  return null;
}

// A soft pool of light under the car, tinted with the paint.
function FloorLight({ color, material }: { color: string; material: RefObject<THREE.MeshBasicMaterial | null> }) {
  // Initial colour only; CarModel fades it after that.
  const [initialColor] = useState(color);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d")!;
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255,255,255,0.5)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.13)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[11, 8]} />
      <meshBasicMaterial ref={material} map={texture} color={initialColor} transparent depthWrite={false} />
    </mesh>
  );
}

// Text and colours stay usable when a device cannot run WebGL.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <NoWebGL />;
    return this.props.children;
  }
}

function NoWebGL() {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
      ອຸປະກອນນີ້ສະແດງໂມເດລ 3D ບໍ່ໄດ້ ເພາະ WebGL ບໍ່ເຮັດວຽກ.
    </div>
  );
}

type CarCanvasProps = {
  car: Car;
  color: string;
  /** Off-screen canvases stop rendering to save battery. */
  active: boolean;
  backdrop: RefObject<HTMLElement | null>;
};

export default function CarCanvas({ car, color, active, backdrop }: CarCanvasProps) {
  const floorMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  return (
    <WebGLBoundary>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, position: [9, 3, 9], near: 0.1, far: 80 }}
        fallback={<NoWebGL />}
        aria-hidden
      >
        <CameraFit />
        <ambientLight intensity={0.12} />
        <directionalLight position={[3, 7, 4]} intensity={1.1} />

        {/* Studio reflections are generated locally, so nothing loads from a CDN. */}
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={7} position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 3, 1]} />
          <Lightformer form="rect" intensity={3.5} position={[-7, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[8, 1, 1]} />
          <Lightformer form="rect" intensity={3.5} position={[7, 2, -3]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 1, 1]} />
          <Lightformer form="rect" intensity={1.6} position={[0, 2, 8]} rotation={[0, Math.PI, 0]} scale={[10, 0.6, 1]} />
          <Lightformer form="rect" intensity={1.6} position={[0, 3, -8]} scale={[10, 0.6, 1]} />
        </Environment>

        <FloorLight color={color} material={floorMaterial} />
        <ContactShadows position={[0, -0.75, 0]} opacity={0.85} scale={11} blur={2.2} far={2.4} resolution={256} color="#000000" />
        <CarModel car={car} color={color} floorMaterial={floorMaterial} backdrop={backdrop} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.7}
          minPolarAngle={0.95}
          maxPolarAngle={1.5}
        />
      </Canvas>
    </WebGLBoundary>
  );
}

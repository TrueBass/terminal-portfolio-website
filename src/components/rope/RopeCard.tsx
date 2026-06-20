import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { config } from "../../config";
import { readAccents, THEME_EVENT } from "../../theme";

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: any;
    meshLineMaterial: any;
  }
}

// Modeled badge + woven strap, after reactbits.dev/components/lanyard.
const CARD_GLB = "/assets/lanyard/card.glb";

useGLTF.preload(CARD_GLB);

const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

/**
 * Woven strap carrying the logo wordmark, repeated along the band length.
 * Drawn in neutral greys so the meshline material's `color` can tint it to the
 * active accent (keeping the tube shading + weave) — see Band's accent state.
 */
function makeStrapTexture(): THREE.Texture {
  const w = 1024;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  // rounded-tube shading across the strap width (darker edges, lit middle)
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#7a7a7a");
  grad.addColorStop(0.5, "#f2f2f2");
  grad.addColorStop(1, "#7a7a7a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // faint diagonal weave
  ctx.strokeStyle = "rgba(13,13,13,0.06)";
  ctx.lineWidth = 6;
  for (let x = -h; x < w + h; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }

  // printed wordmark running along the strap (dark imprint, stays dark under any tint)
  const label = (config.logo || "truebass").toLowerCase();
  ctx.fillStyle = "rgba(18,18,18,0.62)";
  ctx.font = `600 ${Math.round(h * 0.34)}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, w * 0.5, h * 0.5);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  return tex;
}

function Band() {
  const maxSpeed = 50;
  const minSpeed = 0;

  const band = useRef<any>(null);
  const fixed = useRef<RapierRigidBody>(null);
  const j1 = useRef<RapierRigidBody>(null);
  const j2 = useRef<RapierRigidBody>(null);
  const j3 = useRef<RapierRigidBody>(null);
  const card = useRef<RapierRigidBody>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF(CARD_GLB) as any;
  const [strap] = useState(makeStrapTexture);

  // Strap follows the active accent theme (tints the neutral weave texture).
  const [accent, setAccent] = useState(() => readAccents().accent);
  useEffect(() => {
    const update = () => setAccent(readAccents().accent);
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  curve.curveType = "chordal";

  // meshline recomputes a bounding sphere inside setPoints; while rapier settles,
  // adjacent points can coincide and yield NaN (THREE logs an error). The band is
  // always on-screen, so a fixed sphere + no-op compute is safe here.
  useEffect(() => {
    const g = band.current?.geometry as THREE.BufferGeometry | undefined;
    if (g) {
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000);
      g.computeBoundingSphere = () => {};
    }
  }, []);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach((r) => {
        const ref = r.current as any;
        if (!ref.lerped) ref.lerped = new THREE.Vector3().copy(ref.translation());
        const dist = Math.max(0.1, Math.min(1, ref.lerped.distanceTo(ref.translation())));
        ref.lerped.lerp(ref.translation(), delta * (minSpeed + dist * (maxSpeed - minSpeed)));
      });

      curve.points[0].copy(j3.current.translation() as any);
      curve.points[1].copy((j2.current as any).lerped);
      curve.points[2].copy((j1.current as any).lerped);
      curve.points[3].copy(fixed.current.translation() as any);

      // Chordal Catmull-Rom divides by point spacing — coincident joints mid-settle
      // yield NaN; only push the band when every generated point is finite.
      const pts = curve.getPoints(isMobile ? 16 : 32);
      if (pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) {
        band.current.geometry.setPoints(pts);
      }

      ang.copy(card.current.angvel() as any);
      rot.copy(card.current.rotation() as any);
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current!.translation() as any)));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      {/* woven strap — sage tint over the weave texture; frustumCulled off so THREE
          never computes a bounding sphere on the (mid-settle NaN) meshline geometry */}
      <mesh ref={band} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial
          color={accent}
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={strap}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

/**
 * Interactive 3D badge on a lanyard — react-three-fiber + rapier, after the
 * reactbits.dev Lanyard. Real rope physics, glossy modeled card, woven strap.
 * The card face is whatever texture is baked into card.glb.
 */
export function RopeCard() {
  return (
    <div className="relative h-full min-h-[260px] w-full">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 20 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band />
        </Physics>

        {/* Lightformer environment → glossy badge reflections (no HDR file needed) */}
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#f8c7cc" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="#81a684" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>

      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] text-muted/60">
        grab the badge — drag to swing
      </p>
    </div>
  );
}

import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Edges,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  Sparkles,
} from '@react-three/drei'
import * as THREE from 'three'

const CAMERA_PATH = [
  { position: [0, 2.55, 15], target: [0, 2.2, -3] },
  { position: [-3.2, 2.45, 3], target: [-2.2, 2.2, -9] },
  { position: [3.5, 2.2, -7], target: [0.8, 1.95, -20] },
  { position: [-3.8, 2.55, -22], target: [-1.3, 2.15, -34] },
  { position: [4.1, 2.25, -39], target: [-1.2, 1.9, -50] },
  { position: [0, 3.0, -54], target: [0, 1.8, -68] },
]

const FOG_TONES = ['#0E0F10', '#171512', '#24221F', '#1A1917', '#13181C', '#101112']

const ACCENT_TONES = ['#C9BFA9', '#B7A489', '#7E9593', '#D8D1C2', '#C9BFA9', '#C9BFA9']

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return reduced
}

function SceneFallback() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <div className="scene-fallback__halo" />
      <div className="scene-fallback__column" />
      <div className="scene-fallback__column" />
      <div className="scene-fallback__grid" />
    </div>
  )
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn('HALDEN Pavilion WebGL fallback engaged.', error)
    }
  }

  render() {
    if (this.state.failed) return <SceneFallback />
    return this.props.children
  }
}

function CameraRig({ progressRef, activeChapter, reducedMotion }) {
  const { camera, scene, size } = useThree()
  const smoothProgress = useRef(0)
  const lookAt = useRef(new THREE.Vector3(0, 2.2, -3))
  const pointer = useRef({ x: 0, y: 0 })
  const targetPosition = useMemo(() => new THREE.Vector3(), [])
  const targetLook = useMemo(() => new THREE.Vector3(), [])
  const path = useMemo(
    () =>
      CAMERA_PATH.map((point) => ({
        position: new THREE.Vector3(...point.position),
        target: new THREE.Vector3(...point.target),
      })),
    [],
  )
  const fogColors = useMemo(() => FOG_TONES.map((tone) => new THREE.Color(tone)), [])

  useEffect(() => {
    const handlePointer = (event) => {
      if (event.pointerType === 'touch') return
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    const resetPointer = () => {
      pointer.current.x = 0
      pointer.current.y = 0
    }

    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerleave', resetPointer)
    return () => {
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerleave', resetPointer)
    }
  }, [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const progress = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1)
    const mobile = size.width < 760

    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      progress,
      reducedMotion ? 12 : 2.2,
      delta,
    )

    const total = path.length - 1
    const scaled = smoothProgress.current * total
    const index = Math.min(Math.floor(scaled), total - 1)
    const fraction = scaled - index
    const eased = fraction * fraction * (3 - 2 * fraction)
    const from = path[index]
    const to = path[index + 1]

    targetPosition.lerpVectors(from.position, to.position, eased)
    targetPosition.z += mobile ? 2.4 : 0
    targetPosition.y += mobile ? 0.15 : 0

    const pointerStrength = reducedMotion ? 0 : 1
    targetPosition.x += pointer.current.x * (mobile ? 0.16 : 0.52) * pointerStrength
    targetPosition.y += -pointer.current.y * (mobile ? 0.08 : 0.2) * pointerStrength

    camera.position.lerp(targetPosition, 1 - Math.exp(-delta * 4.2))

    targetLook.lerpVectors(from.target, to.target, eased)
    targetLook.x += pointer.current.x * (mobile ? 0.06 : 0.3) * pointerStrength
    targetLook.y += -pointer.current.y * (mobile ? 0.04 : 0.14) * pointerStrength

    lookAt.current.lerp(targetLook, 1 - Math.exp(-delta * 3))
    camera.lookAt(lookAt.current)

    const targetFov = mobile ? 56 : 44
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4, delta)
      camera.updateProjectionMatrix()
    }

    if (scene.fog) {
      const fogTarget = fogColors[activeChapter] ?? fogColors[0]
      scene.fog.color.lerp(fogTarget, 1 - Math.exp(-delta * 1.4))
    }

    if (scene.background instanceof THREE.Color) {
      const backgroundTarget = fogColors[activeChapter] ?? fogColors[0]
      scene.background.lerp(backgroundTarget, 1 - Math.exp(-delta * 1.1))
    }
  })

  return null
}

function DriftingGroup({
  children,
  position,
  float = 0.16,
  speed = 0.08,
  phase = 0,
  reducedMotion = false,
}) {
  const ref = useRef(null)
  const baseY = position[1]

  useFrame((state, delta) => {
    if (!ref.current || reducedMotion) return
    const time = state.clock.elapsedTime
    ref.current.position.y = baseY + Math.sin(time * 0.32 + phase) * float
    ref.current.rotation.y += delta * speed
  })

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

function InterlockingRing({ reducedMotion }) {
  return (
    <DriftingGroup position={[-3.6, 3.15, -8]} float={0.2} speed={0.055} phase={0.4} reducedMotion={reducedMotion}>
      <mesh rotation={[Math.PI / 2, 0.12, 0.32]}>
        <torusGeometry args={[1.82, 0.4, 18, 72]} />
        <meshStandardMaterial color="#6d675d" roughness={0.94} metalness={0.08} />
      </mesh>
      <mesh rotation={[0.55, Math.PI / 2, 0.85]}>
        <torusGeometry args={[1.82, 0.4, 18, 72]} />
        <meshStandardMaterial color="#777166" roughness={0.96} metalness={0.06} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.012, 6, 96]} />
        <meshBasicMaterial color="#C9BFA9" transparent opacity={0.42} />
      </mesh>
      <mesh rotation={[0.2, 0.7, 0.35]}>
        <torusGeometry args={[3.05, 0.006, 6, 100]} />
        <meshBasicMaterial
          color="#ddcda9"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, 0.2, 0]} intensity={9} distance={8} decay={2} color="#d8c5a5" />
      <mesh position={[0, -2.1, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </DriftingGroup>
  )
}

function BronzePrism({ reducedMotion }) {
  return (
    <DriftingGroup position={[3.65, 3.05, -29]} float={0.22} speed={0.11} phase={2.2} reducedMotion={reducedMotion}>
      <mesh rotation={[0.56, 0.28, 0.18]}>
        <cylinderGeometry args={[1.42, 2.05, 3.35, 6, 1]} />
        <meshStandardMaterial
          color="#967a51"
          metalness={0.82}
          roughness={0.29}
          emissive="#160f07"
          emissiveIntensity={0.4}
        />
        <Edges scale={1.001} threshold={12} color="#c7ae86" />
      </mesh>
      <mesh rotation={[1.2, 0.4, -0.25]}>
        <torusGeometry args={[2.5, 0.018, 6, 100]} />
        <meshStandardMaterial color="#b99b6d" metalness={0.78} roughness={0.35} />
      </mesh>
      <mesh position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 48]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} intensity={16} distance={7} decay={2} color="#e2b87d" />
    </DriftingGroup>
  )
}

function FrostedSlab({ reducedMotion }) {
  return (
    <DriftingGroup position={[-3.55, 3.55, -48]} float={0.18} speed={0.035} phase={4.4} reducedMotion={reducedMotion}>
      <mesh>
        <boxGeometry args={[3.65, 6.45, 0.32]} />
        <meshPhysicalMaterial
          color="#c7d0cf"
          transmission={0.9}
          thickness={1.5}
          roughness={0.3}
          metalness={0.04}
          ior={1.44}
          clearcoat={0.45}
          clearcoatRoughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[3.2, 5.9]} />
        <meshBasicMaterial color="#91a8a5" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0.5, 1.2]} intensity={8} distance={7} decay={2} color="#a9c8c3" />
      <mesh position={[-1.86, 0, 0]}>
        <boxGeometry args={[0.035, 6.55, 0.045]} />
        <meshStandardMaterial color="#8c7656" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[1.86, 0, 0]}>
        <boxGeometry args={[0.035, 6.55, 0.045]} />
        <meshStandardMaterial color="#8c7656" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.26, 0]}>
        <boxGeometry args={[3.75, 0.035, 0.045]} />
        <meshStandardMaterial color="#8c7656" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, -3.26, 0]}>
        <boxGeometry args={[3.75, 0.035, 0.045]} />
        <meshStandardMaterial color="#8c7656" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, -3.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 48]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.17} depthWrite={false} />
      </mesh>
    </DriftingGroup>
  )
}

function Colonnade() {
  const frames = useMemo(
    () => Array.from({ length: 12 }, (_, index) => ({ z: 7 - index * 8.1, index })),
    [],
  )

  const stoneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#191a1c',
        roughness: 0.94,
        metalness: 0.04,
      }),
    [],
  )

  const bronzeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8f7655',
        roughness: 0.42,
        metalness: 0.7,
      }),
    [],
  )

  useEffect(
    () => () => {
      stoneMaterial.dispose()
      bronzeMaterial.dispose()
    },
    [stoneMaterial, bronzeMaterial],
  )

  return (
    <group>
      {frames.map(({ z, index }) => (
        <group key={z} position={[0, 0, z]}>
          {[-6.6, 6.6].map((x) => (
            <mesh key={x} position={[x, 3.18, 0]} material={stoneMaterial}>
              <boxGeometry args={[0.38, 6.4, 0.68]} />
            </mesh>
          ))}
          <mesh position={[0, 6.35, 0]} material={stoneMaterial}>
            <boxGeometry args={[13.6, 0.4, 0.68]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} material={stoneMaterial}>
            <boxGeometry args={[13.6, 0.18, 0.95]} />
          </mesh>
          <mesh position={[-6.37, 2.9, 0.36]} material={bronzeMaterial}>
            <boxGeometry args={[0.025, 2.8, 0.018]} />
          </mesh>
          <mesh position={[6.37, 2.9, 0.36]} material={bronzeMaterial}>
            <boxGeometry args={[0.025, 2.8, 0.018]} />
          </mesh>
          {index % 3 === 0 ? (
            <mesh position={[0, 6.12, 0.36]}>
              <boxGeometry args={[13.2, 0.022, 0.016]} />
              <meshBasicMaterial color="#d8c5a5" transparent opacity={0.16} />
            </mesh>
          ) : null}
        </group>
      ))}
    </group>
  )
}

function FloorInlays() {
  const seams = useMemo(() => Array.from({ length: 10 }, (_, index) => -4 - index * 8.1), [])

  return (
    <group>
      {[-5.85, 5.85].map((x) => (
        <mesh key={x} position={[x, 0.012, -39]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.018, 96]} />
          <meshBasicMaterial color="#C9BFA9" transparent opacity={0.27} depthWrite={false} />
        </mesh>
      ))}
      {seams.map((z) => (
        <mesh key={z} position={[0, 0.011, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[11.7, 0.012]} />
          <meshBasicMaterial color="#EFECE6" transparent opacity={0.06} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function EndPortal() {
  return (
    <group position={[0, 0, -88]}>
      <mesh position={[0, 4.2, 0]}>
        <planeGeometry args={[5.2, 8.4]} />
        <meshBasicMaterial color="#35332d" transparent opacity={0.52} side={THREE.DoubleSide} />
      </mesh>
      {[-2.62, 2.62].map((x) => (
        <mesh key={x} position={[x, 4.2, 0.01]}>
          <boxGeometry args={[0.025, 8.4, 0.02]} />
          <meshBasicMaterial color="#C9BFA9" transparent opacity={0.26} />
        </mesh>
      ))}
      <mesh position={[0, 8.42, 0.01]}>
        <boxGeometry args={[5.28, 0.025, 0.02]} />
        <meshBasicMaterial color="#C9BFA9" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 4.2, 0.03]}>
        <planeGeometry args={[0.07, 8.1]} />
        <meshBasicMaterial
          color="#e5d3b4"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function GalleryLights({ accentColor }) {
  const accentRef = useRef(null)
  const targetColor = useMemo(() => new THREE.Color(accentColor), [accentColor])

  useFrame((state, rawDelta) => {
    if (!accentRef.current) return
    const delta = Math.min(rawDelta, 0.05)
    accentRef.current.color.lerp(targetColor, 1 - Math.exp(-delta * 2.2))
  })

  return (
    <>
      <ambientLight intensity={0.46} color="#c9bfa9" />
      <hemisphereLight args={['#b9b1a3', '#08090a', 0.5]} />
      <directionalLight position={[7, 12, 6]} intensity={1.28} color="#d8c8ae" />
      <spotLight
        position={[-4.5, 9, 9]}
        angle={0.5}
        penumbra={1}
        intensity={180}
        distance={42}
        decay={2}
        color="#ddcab0"
      />
      <spotLight
        position={[4.5, 8.5, -18]}
        angle={0.54}
        penumbra={1}
        intensity={162}
        distance={44}
        decay={2}
        color="#a6bdb9"
      />
      <spotLight
        position={[-3, 8, -46]}
        angle={0.55}
        penumbra={1}
        intensity={154}
        distance={44}
        decay={2}
        color="#e0d1ba"
      />
      <spotLight
        ref={accentRef}
        position={[0, 7.5, -30]}
        angle={0.7}
        penumbra={1}
        intensity={145}
        distance={54}
        decay={2}
        color={accentColor}
      />
    </>
  )
}

function PavilionWorld({ progressRef, activeChapter, accentColor, reducedMotion }) {
  const { size } = useThree()
  const mobile = size.width < 760

  return (
    <>
      <fog attach="fog" args={[FOG_TONES[0], 13, 94]} />
      <color attach="background" args={[FOG_TONES[0]]} />
      <CameraRig
        progressRef={progressRef}
        activeChapter={activeChapter}
        reducedMotion={reducedMotion}
      />

      <Suspense fallback={null}>
        <Environment resolution={mobile ? 64 : 128} frames={1}>
          <Lightformer
            form="rect"
            intensity={2.8}
            color="#efe6d6"
            position={[-5, 6, 4]}
            scale={[9, 4, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.8}
            color="#93a6a3"
            position={[6, 3, -4]}
            scale={[6, 3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#c9b393"
            position={[0, 2, 8]}
            scale={[8, 2, 1]}
          />
        </Environment>
      </Suspense>

      <GalleryLights accentColor={accentColor} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -38]}>
        <planeGeometry args={[220, 220]} />
        <MeshReflectorMaterial
          resolution={mobile ? 512 : 1024}
          blur={[260, 90]}
          mixBlur={1.1}
          mixStrength={2.45}
          roughness={0.82}
          metalness={0.3}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.45}
          mirror={0.56}
          color="#141516"
        />
      </mesh>

      <FloorInlays />
      <Colonnade />
      <InterlockingRing reducedMotion={reducedMotion} />
      <BronzePrism reducedMotion={reducedMotion} />
      <FrostedSlab reducedMotion={reducedMotion} />
      <EndPortal />

      <Sparkles
        count={mobile ? 58 : 112}
        scale={[22, 9, 96]}
        position={[0, 4.2, -38]}
        size={mobile ? 0.9 : 1.15}
        speed={reducedMotion ? 0 : 0.16}
        opacity={0.26}
        color="#d8c7ac"
        noise={0.45}
      />
      <Sparkles
        count={mobile ? 26 : 48}
        scale={[16, 6, 72]}
        position={[0, 2.6, -34]}
        size={0.7}
        speed={reducedMotion ? 0 : 0.1}
        opacity={0.14}
        color="#91a7a4"
        noise={0.7}
      />
    </>
  )
}

function PavilionCanvas({ progressRef, activeChapter, accentColor }) {
  const reducedMotion = useReducedMotion()
  const gl = useMemo(
    () => ({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    }),
    [],
  )

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={gl}
      camera={{ position: [0, 2.55, 15], fov: 44, near: 0.1, far: 190 }}
      performance={{ min: 0.5 }}
      onCreated={({ gl: renderer, scene }) => {
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.18
        renderer.outputColorSpace = THREE.SRGBColorSpace
        scene.background = new THREE.Color(FOG_TONES[0])
      }}
    >
      <PavilionWorld
        progressRef={progressRef}
        activeChapter={activeChapter}
        accentColor={accentColor}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  )
}

export default function PavilionScene({ progressRef, activeChapter = 0, accentColor = ACCENT_TONES[0] }) {
  const [available] = useState(supportsWebGL)

  if (!available) return <SceneFallback />

  return (
    <SceneBoundary>
      <PavilionCanvas
        progressRef={progressRef}
        activeChapter={activeChapter}
        accentColor={accentColor}
      />
    </SceneBoundary>
  )
}

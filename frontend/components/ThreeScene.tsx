'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={2}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          color="#4ade80"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </mesh>
    </Float>
  );
}

function FloatingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[-3, 1, 0]}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <MeshDistortMaterial
        color="#3b82f6"
        attach="material"
        distort={0.2}
        speed={3}
      />
    </mesh>
  );
}

function FloatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.6;
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, -1, 0]}>
      <torusGeometry args={[1, 0.4, 16, 100]} />
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.4}
        speed={4}
      />
    </mesh>
  );
}

// Leaf model for agriculture theme
function LeafModel() {
  const leafRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (leafRef.current) {
      leafRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
      leafRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={leafRef} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.1}
          speed={1}
        />
      </mesh>
    </group>
  );
}

// Field model representing crops
function FieldModel() {
  const fieldRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      <mesh ref={fieldRef}>
        <planeGeometry args={[10, 10, 10, 10]} />
        <MeshDistortMaterial
          color="#84cc16"
          attach="material"
          distort={0.05}
          speed={0.5}
        />
      </mesh>
    </group>
  );
}

export default function ThreeScene() {
  return (
    <group>
      <AnimatedSphere />
      <FloatingCube />
      <FloatingTorus />
      <LeafModel />
      <FieldModel />
    </group>
  );
}
'use client';

import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl';
import { useEffect, useRef } from 'react';
import './Orb.css';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  backgroundColor?: string;
  /** Ref to a live audio intensity value (0–5+). Bypasses prop-update lag. */
  audioIntensityRef?: React.MutableRefObject<number>;
}

function hexToVec3(color: string): Vec3 {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return new Vec3(r, g, b);
  }
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return new Vec3(parseInt(rgbMatch[1]) / 255, parseInt(rgbMatch[2]) / 255, parseInt(rgbMatch[3]) / 255);
  }
  return new Vec3(0, 0, 0);
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = '#ffffff',
  audioIntensityRef,
}: OrbProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  // Keep a ref for the "active" flag so the shader loop always reads latest
  const activeRef = useRef(forceHoverState);
  const intensityRef = useRef(hoverIntensity);

  useEffect(() => { activeRef.current = forceHoverState; }, [forceHoverState]);
  useEffect(() => { intensityRef.current = hoverIntensity; }, [hoverIntensity]);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hover;
    varying vec2 vUv;

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float map(vec3 p) {
      float pulse = hover * 0.05;
      p.xy *= rot(iTime * 0.15);
      p.xz *= rot(iTime * 0.2);
      float radius = 1.1 + pulse;
      float d = length(p) - radius;
      float shell = abs(d) - 0.04;
      float scale = 3.5;
      vec3 q = p * scale;
      float gyroid = dot(sin(q), cos(q.zxy)) / scale;
      float ridges = sin(p.y * 150.0 + iTime * 2.0) * 0.003;
      ridges += sin(p.x * 150.0) * 0.003;
      float finalDist = max(shell, gyroid * 0.7) + ridges;
      finalDist -= hover * 0.01 * sin(p.x * 20.0 + iTime * 10.0);
      return finalDist;
    }

    vec3 calcNormal(vec3 p) {
      vec2 e = vec2(0.002, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      vec3 ro = vec3(0.0, 0.0, 2.8);
      vec3 rd = normalize(vec3(uv, -1.0));
      float t = 0.0;
      float d = 0.0;
      for(int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        d = map(p);
        if(d < 0.001 || t > 5.0) break;
        t += d;
      }

      if(t < 5.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 lightPos1 = vec3(-2.0, 1.0, 2.0);
        vec3 lightPos2 = vec3(2.0, -1.0, 1.0);
        vec3 l1 = normalize(lightPos1 - p);
        vec3 l2 = normalize(lightPos2 - p);
        float dif1 = max(dot(n, l1), 0.0);
        float dif2 = max(dot(n, l2), 0.0);
        vec3 viewDir = normalize(ro - p);
        vec3 half1 = normalize(l1 + viewDir);
        vec3 half2 = normalize(l2 + viewDir);
        float spec1 = pow(max(dot(n, half1), 0.0), 64.0);
        float spec2 = pow(max(dot(n, half2), 0.0), 64.0);
        vec3 colGold = vec3(0.64, 0.90, 0.21);   // electric lime  #a3e635
        vec3 colPurple = vec3(0.25, 0.64, 0.05);  // deep lime-green #40a30d
        float ao = clamp(map(p + n * 0.1) * 10.0, 0.0, 1.0);
        vec3 color = vec3(0.02);
        color += colGold * dif1 * 0.9 * ao + colGold * spec1 * 0.8;
        color += colPurple * dif2 * 0.9 * ao + colPurple * spec2 * 0.8;
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
        color += mix(colGold, colPurple, 0.5) * fresnel * 0.6 * ao;
        color *= 1.0 + (hover * 0.25);
        gl_FragColor = vec4(color, 1.0);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        hover: { value: 0 }
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + 'px';
      gl.canvas.style.height = height + 'px';
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let rafId: number;

    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      program.uniforms.iTime.value = t * 0.001;

      // Read live intensity from ref — always fresh, no stale closure
      const liveIntensity = audioIntensityRef
        ? audioIntensityRef.current
        : (activeRef.current ? intensityRef.current : 0);

      program.uniforms.hover.value += (liveIntensity - program.uniforms.hover.value) * 0.12;
      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnDom} className="orb-container" />;
}

"use client";

import { useEffect, useRef } from "react";

// Seeded random for deterministic initial values
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function drawOctagonalStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation: number
) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const outerAngle = (i * Math.PI) / 4 + rotation;
    const innerAngle = outerAngle + Math.PI / 8;
    const ox = cx + Math.cos(outerAngle) * outerR;
    const oy = cy + Math.sin(outerAngle) * outerR;
    const ix = cx + Math.cos(innerAngle) * innerR;
    const iy = cy + Math.sin(innerAngle) * innerR;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
}

function drawIslamicPattern(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  alpha: number,
  glow: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Glow effect
  if (glow > 0) {
    ctx.shadowColor = "rgba(232, 200, 111, 0.6)";
    ctx.shadowBlur = 15 * glow;
  }

  ctx.strokeStyle = `rgba(211, 173, 87, ${alpha})`;
  ctx.lineWidth = 0.8 + glow * 0.5;

  // Outer octagon
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x = Math.cos(angle) * size;
    const y = Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner star
  drawOctagonalStar(ctx, 0, 0, size * 0.85, size * 0.5, 0);
  ctx.stroke();

  // Cross lines
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    ctx.stroke();
  }

  // Inner diamond
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const x = Math.cos(angle) * size * 0.35;
    const y = Math.sin(angle) * size * 0.35;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
}

interface BurstEffect {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  maxRadius: number;
}

interface FloatingParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export function IslamicPatternBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frameId: number;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;
    let mouseActive = false;

    const rand = seededRandom(42);

    // Grid of patterns
    const patterns: {
      x: number; y: number; size: number; speed: number; phase: number;
      baseAlpha: number;
    }[] = [];

    // Floating particles
    const particles: FloatingParticle[] = [];
    const maxParticles = 50;

    // Click burst effects
    const bursts: BurstEffect[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = canvas.parentElement?.clientWidth || 800;
      height = canvas.parentElement?.clientHeight || 600;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Rebuild pattern grid
      patterns.length = 0;
      const spacing = 140;
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          patterns.push({
            x: c * spacing + (r % 2 === 0 ? 0 : spacing / 2),
            y: r * spacing,
            size: 25 + rand() * 20,
            speed: 0.0003 + rand() * 0.0004,
            phase: rand() * Math.PI * 2,
            baseAlpha: 0.04 + rand() * 0.03,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      bursts.push({
        x, y, life: 0, maxLife: 80, maxRadius: 120,
      });
      // Spawn particles at click
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * (1 + rand() * 1.5),
          vy: Math.sin(angle) * (1 + rand() * 1.5),
          size: 1.5 + rand() * 1.5,
          alpha: 1,
          life: 0,
          maxLife: 60 + rand() * 40,
        });
      }
    };

    const spawnParticle = () => {
      if (particles.length >= maxParticles) return;
      particles.push({
        x: rand() * width,
        y: height + 10,
        vx: (rand() - 0.5) * 0.3,
        vy: -(0.3 + rand() * 0.5),
        size: 1 + rand() * 2,
        alpha: 0,
        life: 0,
        maxLife: 300 + rand() * 200,
      });
    };

    const drawBurst = (burst: BurstEffect) => {
      const progress = burst.life / burst.maxLife;
      const radius = burst.maxRadius * progress;
      const alpha = (1 - progress) * 0.5;

      ctx.save();
      ctx.translate(burst.x, burst.y);

      // Expanding octagonal rings
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = radius * (0.5 + ring * 0.25);
        const ringAlpha = alpha * (1 - ring * 0.3);
        ctx.strokeStyle = `rgba(211, 173, 87, ${ringAlpha})`;
        ctx.lineWidth = 1.5 - ring * 0.4;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + progress * 0.5;
          const x = Math.cos(angle) * ringRadius;
          const y = Math.sin(angle) * ringRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Central glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
      gradient.addColorStop(0, `rgba(232, 200, 111, ${alpha * 0.4})`);
      gradient.addColorStop(1, "rgba(232, 200, 111, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Draw pattern grid with mouse interaction
      patterns.forEach((p) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = mouseActive ? Math.max(0, 1 - dist / 250) : 0;

        const pulse = Math.sin(time * 0.01 + p.phase) * 0.15 + 0.85;
        const alpha = (p.baseAlpha + mouseInfluence * 0.08) * pulse;
        const rotation = time * p.speed + mouseInfluence * 0.3;
        const glow = mouseInfluence;

        drawIslamicPattern(ctx, p.x, p.y, p.size, rotation, alpha, glow);
      });

      // Draw and update bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].life++;
        if (bursts[i].life > bursts[i].maxLife) {
          bursts.splice(i, 1);
          continue;
        }
        drawBurst(bursts[i]);
      }

      // Draw floating particles
      if (time % 12 === 0) spawnParticle();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.min(1, p.life / 30) * Math.max(0, 1 - p.life / p.maxLife);

        // Mouse attraction
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 10) {
            const force = 0.15 / dist;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.life > p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 200, 111, ${p.alpha * 0.06})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(211, 173, 87, ${p.alpha * 0.6})`;
        ctx.fill();
      }

      // Central large star (mouse-reactive rotation)
      const cx = width / 2;
      const cy = height / 2;
      const starAlpha = 0.03 + Math.sin(time * 0.008) * 0.015;
      const mouseAngle = mouseActive
        ? Math.atan2(mouseY - cy, mouseX - cx) * 0.1
        : 0;
      drawIslamicPattern(ctx, cx, cy, 200, time * 0.0002 + mouseAngle, starAlpha, mouseActive ? 0.3 : 0);

      // Mouse cursor glow
      if (mouseActive) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 100);
        gradient.addColorStop(0, "rgba(232, 200, 111, 0.08)");
        gradient.addColorStop(0.5, "rgba(211, 173, 87, 0.03)");
        gradient.addColorStop(1, "rgba(211, 173, 87, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      frameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ cursor: "crosshair" }}
    />
  );
}

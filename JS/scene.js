const MAX_PARTICLES = 70;
const POINTER_INFLUENCE = 140;

export function initScene(canvas) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const scene = document.querySelector(".scene");
  const ctx = canvas.getContext("2d", { alpha: true });

  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
  const target = { ...pointer };

  let width = 0;
  let height = 0;
  let particles = [];
  let frameId = 0;
  let lastTheme = document.documentElement.dataset.theme || "dark";

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = createParticles(width, height);
  }

  function createParticles(w, h) {
    return Array.from({ length: MAX_PARTICLES }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.1 + Math.random() * 2.2,
      pulse: Math.random() * Math.PI * 2
    }));
  }

  function themeColors() {
    const isLight = document.documentElement.dataset.theme === "light";

    return isLight
      ? {
          particle: "rgba(79, 70, 229, 0.55)",
          line: "rgba(14, 165, 233, 0.16)",
          glow: "rgba(244, 114, 182, 0.18)"
        }
      : {
          particle: "rgba(167, 139, 250, 0.85)",
          line: "rgba(34, 211, 238, 0.16)",
          glow: "rgba(251, 113, 133, 0.18)"
        };
  }

  function draw(now) {
    const colors = themeColors();
    const theme = document.documentElement.dataset.theme || "dark";

    if (theme !== lastTheme) {
      lastTheme = theme;
    }

    pointer.x += (target.x - pointer.x) * 0.08;
    pointer.y += (target.y - pointer.y) * 0.08;

    const nx = pointer.x / width;
    const ny = pointer.y / height;

    document.documentElement.style.setProperty("--pointer-x", `${nx}`);
    document.documentElement.style.setProperty("--pointer-y", `${ny}`);

    if (scene) {
      scene.style.setProperty("--orb-x", `${pointer.x}px`);
      scene.style.setProperty("--orb-y", `${pointer.y}px`);
    }

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = colors.glow;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 90, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < POINTER_INFLUENCE) {
        const force = (POINTER_INFLUENCE - dist) / POINTER_INFLUENCE;
        p.vx += (dx / dist) * force * 0.22;
        p.vy += (dy / dist) * force * 0.22;
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const gap = Math.hypot(p.x - q.x, p.y - q.y);

        if (gap < 110) {
          ctx.strokeStyle = colors.line;
          ctx.globalAlpha = 1 - gap / 110;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      const radius = p.r + Math.sin(p.pulse + now / 700) * 0.4;
      ctx.fillStyle = colors.particle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(draw);
    }
  }

  function onPointerMove(event) {
    target.x = event.clientX;
    target.y = event.clientY;
  }

  function onPointerLeave() {
    target.x = width * 0.5;
    target.y = height * 0.35;
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerleave", onPointerLeave);
  frameId = window.requestAnimationFrame(draw);

  if (reducedMotion) {
    draw(0);
  }

  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
  };
}

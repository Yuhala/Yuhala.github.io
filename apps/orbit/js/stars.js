export function startStarfield(canvas) {
  const ctx = canvas.getContext("2d");
  const stars = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    stars.length = 0;
    const count = Math.round((window.innerWidth * window.innerHeight) / 2800);
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        tw: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.6,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      const twinkle = 0.55 + Math.sin(time * 0.001 * star.s + star.tw) * 0.45;
      ctx.beginPath();
      ctx.fillStyle = `rgba(244, 239, 230, ${star.a * twinkle})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
}

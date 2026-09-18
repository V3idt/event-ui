import { useEffect, useRef } from 'react';
import './footer.css';

type Cell = { alive: boolean; age: number; dying: number };
const colors = [[171, 70, 221], [243, 26, 124], [248, 113, 43], [234, 171, 38]];
const patterns = [
  [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
  [[0, 1], [0, 4], [1, 0], [2, 0], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3]],
  [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  [[0, 1], [1, 3], [2, 0], [2, 1], [2, 4], [2, 5], [2, 6]],
  [[0, 6], [1, 0], [1, 1], [2, 1], [2, 5], [2, 6], [2, 7]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [2, 1], [3, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9]],
  [[0, 0], [1, 0], [1, 2], [2, 0], [2, 1], [3, 0]],
  [[0, 0], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 1]],
  [[0, 2], [0, 3], [1, 1], [1, 4], [2, 0], [2, 5], [3, 0], [3, 5], [4, 1], [4, 4], [5, 2], [5, 3]],
  [[0, 1], [0, 2], [1, 0], [1, 3], [2, 1], [2, 3], [3, 2]],
  [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]],
  [[0, 1], [1, 2], [1, 3], [2, 0], [2, 1], [3, 2]],
];

function seedPatterns(grid: Cell[][], count: number) {
  const rows = grid.length;
  const columns = grid[0].length;
  for (let i = 0; i < count; i++) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const row = Math.floor(Math.random() * rows);
    const column = Math.floor(Math.random() * columns);
    for (const [dy, dx] of pattern) {
      grid[(row + dy) % rows][(column + dx) % columns] = { alive: true, age: 0, dying: 0 };
    }
  }
}

function nextGeneration(grid: Cell[][]) {
  const rows = grid.length;
  const columns = grid[0].length;
  return grid.map((row, y) => row.map((cell, x) => {
    let neighbors = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((dy || dx) && grid[(y + dy + rows) % rows][(x + dx + columns) % columns].alive) neighbors++;
      }
    }
    const alive = neighbors === 3 || (cell.alive && neighbors === 2);
    return {
      alive,
      age: alive && cell.alive ? cell.age + 1 : 0,
      dying: alive ? 0 : cell.alive ? 6 : Math.max(0, cell.dying - 1),
    };
  }));
}

function FooterDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !wrapper || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let grid: Cell[][] = [];
    let palette: string[] = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let visible = false;
    let lastStep = 0;
    let generation = 0;

    const draw = () => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const offsetX = width % 8 / 2;
      const offsetY = height % 8 / 2;
      grid.forEach((row, y) => row.forEach((cell, x) => {
        const bright = cell.age < 3;
        context.fillStyle = cell.alive || cell.dying ? palette[x] : '#ffffff';
        context.globalAlpha = cell.alive ? bright ? 0.36 : 0.24 : cell.dying ? 0.1 * cell.dying / 6 : 0.08;
        const radius = cell.alive ? bright ? 1.7 : 1.3 : cell.dying ? 1.1 * (0.8 + 0.2 * cell.dying / 6) : 1.1;
        context.beginPath();
        context.arc(offsetX + x * 8 + 4, offsetY + y * 8 + 4, radius, 0, Math.PI * 2);
        context.fill();
      }));
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (now - lastStep >= 160) {
        lastStep = now;
        grid = nextGeneration(grid);
        generation++;
        if (generation % 60 === 0) seedPatterns(grid, Math.max(2, Math.floor(grid.length * grid[0].length / 3000)));
        draw();
      }
      frame = requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      if (visible && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      if (width === wrapper.clientWidth && height === wrapper.clientHeight) return;
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      const columns = Math.ceil(width / 8) + 1;
      const rows = Math.ceil(height / 8) + 1;
      grid = Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ alive: Math.random() < 0.03, age: 0, dying: 0 })));
      seedPatterns(grid, Math.max(12, Math.floor(rows * columns / 400)));
      palette = Array.from({ length: columns }, (_, x) => {
        const position = x / Math.max(1, columns - 1) * (colors.length - 1);
        const stop = Math.min(Math.floor(position), colors.length - 2);
        const blend = position - stop;
        const rgb = colors[stop].map((channel, i) => {
          const value = channel + (colors[stop + 1][i] - channel) * blend;
          return Math.round(value + (255 - value) * 0.4);
        });
        return `rgb(${rgb.join(',')})`;
      });
      generation = 0;
      draw();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    intersectionObserver.observe(wrapper);
    reducedMotion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener('change', syncAnimation);
      document.removeEventListener('visibilitychange', syncAnimation);
    };
  }, []);

  return <canvas ref={canvasRef} className="footer-dots" aria-hidden="true" />;
}

function FooterLogo() {
  return <svg viewBox="0 0 724 264" aria-hidden="true"><path fill="currentColor" d="M38.53 260.65H.43V27.86h38.1zm86.46 2.77c-42.25 0-66.48-22.96-66.48-63V89.33h38.1v108.28c0 23.61 8.7 32.39 32.12 32.39 30.35 0 42.73-14.54 42.73-50.17v-90.5h38.1v171.33h-36.54v-29.91c-4.99 22.98-27.12 32.67-48.03 32.67m347.2-2.77H434.4V149.87c0-22.5-7.01-30.87-25.88-30.87-24.28 0-37.11 14.45-37.11 41.79v99.86h-37.79V149.87c0-21.93-7.23-30.87-24.94-30.87-31.59 0-38.05 32.96-38.05 41.79v99.86h-38.1V89.33h36.54v29.96c6.49-21.02 27.02-33.71 47.72-33.71 20.69 0 38.09 7.9 45.64 33.71 10.13-26.76 28.35-33.71 50.15-33.71 37.88 0 59.61 18.88 59.61 51.81zm76.65 2.77c-52.62 0-61.55-33.45-61.55-50.52 0-20.1 8.83-38.21 27.93-45.55 8.41-3.11 16.52-5.43 24.84-7.1 7.33-1.47 18.64-3.03 26.91-4.17l2.73-.38c14.38-2 29.67-9.21 29.67-18.62 0-16-20.51-18.39-32.74-18.39-13.87 0-23.64 3.57-27.53 10.05-3.49 6.46-3.73 7.97-4.62 13.6l-.62 4.43h-38.1l.68-5.61c1.35-11.14 3.41-19.03 6.48-24.83 10.54-20.39 31.77-30.75 63.08-30.75 26.11 0 44.63 8.23 53.26 15.94 5.31 4.6 9.1 9.84 11.89 16.46 5.84 12.36 6.32 20.63 6.32 29.4v86.43c0 8.07.78 14.97 2.31 20.5l1.76 6.35h-38.91l-.7-4.19c-.5-2.96-.67-19.75-.88-26.23-8.99 23.61-28.27 33.18-52.21 33.18m50.53-93.72c-7.97 6.11-20.47 9.6-38.62 13.23-31.27 5.78-36.54 13.06-36.54 27.22 0 12.5 10.63 20.26 27.75 20.26 33.23 0 47.41-15.48 47.41-51.77zm124.2-105.51C688.46 64.19 660 35.73 660 .62c0 35.11-28.46 63.57-63.57 63.57 35.11 0 63.57 28.46 63.57 63.57 0-35.11 28.46-63.57 63.57-63.57" /></svg>;
}

function SocialIcon({ name }: { name: 'instagram' | 'x' | 'mail' }) {
  if (name === 'instagram') return <svg aria-hidden="true" viewBox="0 0 16 16"><g fill="currentColor" fillRule="evenodd"><path d="M12.9 4.225a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0M8 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m0-1.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2"></path><path d="M.5 7.7c0-2.52 0-3.78.49-4.744A4.5 4.5 0 0 1 2.957.991C3.92.5 5.178.5 7.7.5h.6c2.52 0 3.78 0 4.744.49a4.5 4.5 0 0 1 1.966 1.967c.49.963.49 2.221.49 4.743v.6c0 2.52 0 3.78-.49 4.744a4.5 4.5 0 0 1-1.967 1.966c-.963.49-2.221.49-4.743.49h-.6c-2.52 0-3.78 0-4.744-.49A4.5 4.5 0 0 1 .99 13.043C.5 12.08.5 10.822.5 8.3zM7.7 2h.6c1.284 0 2.158 0 2.833.056.658.054.994.151 1.228.271a3 3 0 0 1 1.313 1.31c.119.235.215.573.27 1.229.055.675.056 1.549.056 2.834v.6c0 1.284 0 2.158-.056 2.833-.054.658-.151.994-.271 1.228a3 3 0 0 1-1.31 1.313c-.235.119-.573.215-1.229.27-.675.055-1.549.056-2.834.056h-.6c-1.284 0-2.158 0-2.833-.056-.658-.054-.994-.151-1.228-.271a3 3 0 0 1-1.313-1.31c-.119-.235-.215-.573-.27-1.229C2.001 10.46 2 9.585 2 8.3v-.6c0-1.284 0-2.158.056-2.833.054-.658.151-.994.271-1.228a3 3 0 0 1 1.31-1.313c.235-.119.573-.215 1.229-.27C5.54 2.001 6.415 2 7.7 2"></path></g></svg>;
  if (name === 'x') return <svg aria-hidden="true" viewBox="0 0 120 120"><path d="m108.783 107.652-38.24-55.748.066.053L105.087 12H93.565L65.478 44.522 43.174 12H12.957l35.7 52.048-.005-.005L11 107.653h11.522L53.748 71.47l24.817 36.182zM38.609 20.696l53.652 78.26h-9.13l-53.696-78.26z" fill="currentColor"></path></svg>;
  return <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M7 2.5h2c1.436 0 2.4.002 3.134.077.71.072 1.038.2 1.255.344a2.5 2.5 0 0 1 .69.69c.145.217.272.545.344 1.255.075.734.077 1.698.077 3.134s-.002 2.4-.077 3.134c-.072.71-.2 1.038-.344 1.255a2.5 2.5 0 0 1-.69.69c-.217.145-.545.272-1.255.344-.735.075-1.698.077-3.134.077H7c-1.436 0-2.4-.002-3.134-.077-.71-.072-1.038-.2-1.255-.344a2.5 2.5 0 0 1-.69-.69c-.145-.217-.272-.545-.344-1.255C1.502 10.4 1.5 9.436 1.5 8s.002-2.4.077-3.134c.072-.71.2-1.038.344-1.255a2.5 2.5 0 0 1 .69-.69c.217-.145.545-.272 1.255-.344C4.6 2.502 5.564 2.5 7 2.5M0 8c0-2.809 0-4.213.674-5.222a4 4 0 0 1 1.104-1.104C2.787 1 4.19 1 7 1h2c2.809 0 4.213 0 5.222.674a4 4 0 0 1 1.104 1.104C16 3.787 16 5.19 16 8s0 4.213-.674 5.222a4 4 0 0 1-1.104 1.104C13.213 15 11.81 15 9 15H7c-2.809 0-4.213 0-5.222-.674a4 4 0 0 1-1.104-1.104C0 12.213 0 10.81 0 8m5.458-2.594a.75.75 0 0 0-.916 1.188l2.282 1.757.004.004a1.96 1.96 0 0 0 2.363 0l.007-.006 2.262-1.757a.75.75 0 1 0-.92-1.184L8.282 7.16a.46.46 0 0 1-.546 0z" fill="currentColor" fillRule="evenodd"></path></svg>;
}

export function Footer() {
  return (
    <div className="landing-footer">
      <FooterDots />
      <section className="footer-cta" aria-labelledby="footer-heading">
        <h3 id="footer-heading">Your next unforgettable memory awaits.</h3>
        <div className="footer-cta-buttons">
          <a className="footer-button footer-button-outline" href="/discover">Discover Events</a>
          <a className="footer-button footer-button-app" href="https://luma.com/app">Get the App</a>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-main-row">
            <div className="footer-navigation">
              <a className="footer-logo" href="/demo" aria-label="Luma Home"><FooterLogo /></a>
              <nav className="footer-links" aria-label="Footer">
                <a href="/discover">Discover</a>
                <a href="https://luma.com/pricing">Pricing</a>
                <a href="https://luma.com/app">App</a>
                <a href="https://help.luma.com" target="_blank" rel="noopener noreferrer">Help</a>
              </nav>
            </div>
            <div className="footer-socials">
              <a href="https://www.instagram.com/luma_hq/" aria-label="Luma on Instagram" target="_blank" rel="noopener noreferrer"><SocialIcon name="instagram" /></a>
              <a href="https://x.com/LumaHQ" aria-label="Luma on X" target="_blank" rel="noopener noreferrer"><SocialIcon name="x" /></a>
              <a href="mailto:support@luma.com" aria-label="Contact Us"><SocialIcon name="mail" /></a>
            </div>
          </div>
          <nav className="footer-legal" aria-label="Legal">
            <a href="https://luma.com/terms">Terms</a>
            <a href="https://luma.com/privacy-policy">Privacy</a>
            <a href="https://luma.com/security">Security</a>
            <a href="https://luma.com/dmca">DMCA</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Footer;

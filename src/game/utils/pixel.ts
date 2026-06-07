import type { RuneElement } from '../../types/game';

export const drawPixelRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
};

export const drawPixelCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  ctx.fillStyle = color;
  const r = Math.floor(radius);
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
};

export const getElementColor = (element: RuneElement): string => {
  switch (element) {
    case 'fire': return '#ff6b35';
    case 'ice': return '#4ecdc4';
    case 'thunder': return '#ffe66d';
    default: return '#ffffff';
  }
};

export const getElementGlowColor = (element: RuneElement): string => {
  switch (element) {
    case 'fire': return 'rgba(255, 107, 53, 0.5)';
    case 'ice': return 'rgba(78, 205, 196, 0.5)';
    case 'thunder': return 'rgba(255, 230, 109, 0.5)';
    default: return 'rgba(255, 255, 255, 0.5)';
  }
};

export const drawFox = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: number,
  animFrame: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  
  const offsetY = animFrame % 2 === 0 ? 0 : -s;
  
  ctx.fillStyle = '#ff8c42';
  ctx.fillRect(px + 4 * s, py + 6 * s + offsetY, 8 * s, 7 * s);
  
  ctx.fillStyle = '#fff5e6';
  ctx.fillRect(px + 5 * s, py + 9 * s + offsetY, 6 * s, 4 * s);
  
  ctx.fillStyle = '#ff8c42';
  ctx.fillRect(px + 3 * s, py + 2 * s + offsetY, 10 * s, 6 * s);
  
  ctx.fillStyle = '#fff5e6';
  ctx.fillRect(px + 5 * s, py + 5 * s + offsetY, 6 * s, 3 * s);
  
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(px + 3 * s, py + 1 * s + offsetY, 2 * s, 3 * s);
  ctx.fillRect(px + 11 * s, py + 1 * s + offsetY, 2 * s, 3 * s);
  
  const eyeX = direction < 0 ? px + 4 * s : px + 10 * s;
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(eyeX, py + 4 * s + offsetY, s, s);
  
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 7 * s, py + 6 * s + offsetY, 2 * s, s);
  
  const tailDir = direction < 0 ? 1 : -1;
  ctx.fillStyle = '#ff8c42';
  ctx.fillRect(px + (direction < 0 ? 12 : 1) * s, py + 7 * s + offsetY, 3 * s, 4 * s);
  ctx.fillStyle = '#fff5e6';
  ctx.fillRect(px + (direction < 0 ? 13 : 1) * s, py + 9 * s + offsetY, 2 * s, 2 * s);
  
  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(px + 4 * s, py + 0 * s + offsetY, 8 * s, 2 * s);
  ctx.fillRect(px + 5 * s, py - 1 * s + offsetY, 6 * s, s);
  ctx.fillRect(px + 7 * s, py - 2 * s + offsetY, 2 * s, s);
  
  ctx.fillStyle = '#ffeaa7';
  ctx.fillRect(px + 7 * s, py - 3 * s + offsetY, 2 * s, s);
  
  ctx.fillStyle = '#d63031';
  const legOffset = animFrame % 2 === 0 ? 0 : s;
  ctx.fillRect(px + 5 * s, py + 13 * s, 2 * s, 2 * s - legOffset / 2);
  ctx.fillRect(px + 9 * s, py + 13 * s, 2 * s, 2 * s - legOffset / 2);
};

export const drawMonster = (
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  color: string,
  animFrame: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  const bounce = animFrame % 2 === 0 ? 0 : -s;
  
  switch (type) {
    case 'slime':
      ctx.fillStyle = color;
      ctx.fillRect(px + 3 * s, py + 6 * s + bounce, 10 * s, 7 * s);
      ctx.fillRect(px + 4 * s, py + 5 * s + bounce, 8 * s, s);
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 6 * s, s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 5 * s, py + 7 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 7 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 6 * s, py + 8 * s + bounce, s, s);
      ctx.fillRect(px + 10 * s, py + 8 * s + bounce, s, s);
      break;
      
    case 'bat':
      ctx.fillStyle = color;
      const wingOffset = animFrame % 2 === 0 ? 0 : -2 * s;
      ctx.fillRect(px + 6 * s, py + 5 * s + bounce, 4 * s, 4 * s);
      ctx.fillRect(px + 1 * s, py + 4 * s + wingOffset + bounce, 5 * s, 3 * s);
      ctx.fillRect(px + 10 * s, py + 4 * s + wingOffset + bounce, 5 * s, 3 * s);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(px + 6 * s, py + 6 * s + bounce, s, s);
      ctx.fillRect(px + 9 * s, py + 6 * s + bounce, s, s);
      break;
      
    case 'skeleton':
      ctx.fillStyle = color;
      ctx.fillRect(px + 5 * s, py + 2 * s + bounce, 6 * s, 5 * s);
      ctx.fillRect(px + 4 * s, py + 7 * s + bounce, 8 * s, 5 * s);
      ctx.fillRect(px + 5 * s, py + 12 * s, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 12 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 6 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 8 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#636e72';
      ctx.fillRect(px + 12 * s, py + 6 * s + bounce, s, 6 * s);
      break;
      
    case 'ghost':
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(px + 3 * s, py + 2 * s + bounce, 10 * s, 10 * s);
      ctx.fillRect(px + 3 * s, py + 12 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 7 * s, py + 12 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 10 * s, py + 12 * s + bounce, 3 * s, 2 * s);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 5 * s, py + 6 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 6 * s + bounce, 2 * s, 2 * s);
      break;
      
    case 'goblin':
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 2 * s + bounce, 8 * s, 5 * s);
      ctx.fillRect(px + 3 * s, py + 7 * s + bounce, 10 * s, 6 * s);
      ctx.fillRect(px + 2 * s, py + 1 * s + bounce, 2 * s, 3 * s);
      ctx.fillRect(px + 12 * s, py + 1 * s + bounce, 2 * s, 3 * s);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 2 * s, s);
      ctx.fillRect(px + 9 * s, py + 4 * s + bounce, 2 * s, s);
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(px + 6 * s, py + 6 * s + bounce, 4 * s, s);
      break;
      
    default:
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 4 * s, 8 * s, 8 * s);
  }
};

export const drawChest = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opened: boolean,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(px + 2 * s, py + 7 * s, 12 * s, 7 * s);
  
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(px + 2 * s, py + 3 * s, 12 * s, 5 * s);
  
  ctx.fillStyle = '#daa520';
  ctx.fillRect(px + 2 * s, py + 6 * s, 12 * s, s);
  ctx.fillRect(px + 7 * s, py + 8 * s, 2 * s, 3 * s);
  
  if (!opened) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(px + 7 * s, py + 9 * s, 2 * s, 2 * s);
  } else {
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(px + 3 * s, py + 4 * s, 10 * s, 3 * s);
  }
};

export const drawStairs = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 2 * s, py + 12 * s, 12 * s, 2 * s);
  
  ctx.fillStyle = '#636e72';
  ctx.fillRect(px + 4 * s, py + 9 * s, 8 * s, 2 * s);
  
  ctx.fillStyle = '#b2bec3';
  ctx.fillRect(px + 6 * s, py + 6 * s, 4 * s, 2 * s);
  
  ctx.fillStyle = '#dfe6e9';
  ctx.fillRect(px + 7 * s, py + 3 * s, 2 * s, 2 * s);
};

export const drawRuneIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size: number = 24
) => {
  const s = size / 16;
  const cx = x;
  const cy = y;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * size * 0.4;
    const py = cy + Math.sin(angle) * size * 0.4;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * size * 0.25;
    const py = cy + Math.sin(angle) * size * 0.25 - size * 0.1;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + Math.cos(angle) * size * 0.4;
    const py = cy + Math.sin(angle) * size * 0.4;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
};

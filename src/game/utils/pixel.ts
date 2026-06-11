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
  scale: number = 2,
  isBoss: boolean = false,
  bossType?: string
) => {
  if (isBoss) {
    drawBoss(ctx, bossType || '', x, y, color, animFrame, scale);
    return;
  }

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

    case 'archer':
      ctx.fillStyle = color;
      ctx.fillRect(px + 5 * s, py + 2 * s + bounce, 6 * s, 5 * s);
      ctx.fillRect(px + 4 * s, py + 7 * s + bounce, 8 * s, 5 * s);
      ctx.fillRect(px + 5 * s, py + 12 * s, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 12 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 6 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 8 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(px + 0 * s, py + 4 * s + bounce, 5 * s, s);
      ctx.fillRect(px + 0 * s, py + 3 * s + bounce, s, 3 * s);
      ctx.fillStyle = '#daa520';
      ctx.fillRect(px + 0 * s, py + 3 * s + bounce, s, s);
      break;

    case 'caster':
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 3 * s + bounce, 8 * s, 9 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 4 * s, py + 2 * s + bounce, 8 * s, 3 * s);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(px + 5 * s, py + 5 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 5 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(px + 0 * s, py + 4 * s + bounce, 4 * s, s);
      ctx.fillRect(px + 12 * s, py + 4 * s + bounce, 4 * s, s);
      ctx.globalAlpha = 1;
      break;

    case 'summoner':
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 2 * s + bounce, 8 * s, 10 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 3 * s, py + 1 * s + bounce, 10 * s, 3 * s);
      ctx.fillStyle = '#e056a0';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#6c5ce7';
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 3; i++) {
        const orbY = py + (2 + Math.sin(Date.now() / 300 + i * 2) * 2) * s;
        ctx.fillRect(px + (1 + i * 5) * s, orbY, 2 * s, 2 * s);
      }
      ctx.globalAlpha = 1;
      break;

    case 'healer':
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 2 * s + bounce, 8 * s, 5 * s);
      ctx.fillRect(px + 3 * s, py + 7 * s + bounce, 10 * s, 6 * s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, s, s);
      ctx.fillRect(px + 10 * s, py + 4 * s + bounce, s, s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 7 * s, py + 7 * s + bounce, 2 * s, 4 * s);
      ctx.fillRect(px + 6 * s, py + 8 * s + bounce, 4 * s, 2 * s);
      break;
      
    default:
      ctx.fillStyle = color;
      ctx.fillRect(px + 4 * s, py + 4 * s, 8 * s, 8 * s);
  }
};

export const drawBoss = (
  ctx: CanvasRenderingContext2D,
  bossType: string,
  x: number,
  y: number,
  color: string,
  animFrame: number,
  scale: number = 2
) => {
  const s = scale * 1.5;
  const px = Math.floor(x - 10 * s);
  const py = Math.floor(y - 10 * s);
  const bounce = animFrame % 2 === 0 ? 0 : -s;

  ctx.fillStyle = color;

  switch (bossType) {
    case 'stone_golem':
      ctx.fillRect(px + 4 * s, py + 3 * s + bounce, 12 * s, 14 * s);
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(px + 2 * s, py + 6 * s + bounce, 2 * s, 8 * s);
      ctx.fillRect(px + 16 * s, py + 6 * s + bounce, 2 * s, 8 * s);
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(px + 6 * s, py + 6 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 11 * s, py + 6 * s + bounce, 3 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 7 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 7 * s + bounce, s, s);
      ctx.fillStyle = '#636e72';
      ctx.fillRect(px + 5 * s, py + 1 * s + bounce, 10 * s, 3 * s);
      break;

    case 'forest_guardian':
      ctx.fillRect(px + 4 * s, py + 4 * s + bounce, 12 * s, 12 * s);
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(px + 2 * s, py + 2 * s + bounce, 4 * s, 6 * s);
      ctx.fillRect(px + 14 * s, py + 2 * s + bounce, 4 * s, 6 * s);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(px + 0 * s, py + 0 * s + bounce, 3 * s, 3 * s);
      ctx.fillRect(px + 17 * s, py + 0 * s + bounce, 3 * s, 3 * s);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(px + 6 * s, py + 7 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 11 * s, py + 7 * s + bounce, 3 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 8 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 8 * s + bounce, s, s);
      break;

    case 'ice_witch':
      ctx.globalAlpha = 0.8;
      ctx.fillRect(px + 5 * s, py + 3 * s + bounce, 10 * s, 12 * s);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0984e3';
      ctx.fillRect(px + 5 * s, py + 1 * s + bounce, 10 * s, 4 * s);
      ctx.fillRect(px + 7 * s, py + 0 * s + bounce, 6 * s, 2 * s);
      ctx.fillStyle = '#74b9ff';
      ctx.fillRect(px + 6 * s, py + 5 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 11 * s, py + 5 * s + bounce, 3 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 6 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 6 * s + bounce, s, s);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(px + 3 * s, py + 4 * s + bounce, 2 * s, 8 * s);
      ctx.fillRect(px + 15 * s, py + 4 * s + bounce, 2 * s, 8 * s);
      break;

    case 'fire_demon':
      ctx.fillRect(px + 4 * s, py + 4 * s + bounce, 12 * s, 12 * s);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(px + 2 * s, py + 2 * s + bounce, 4 * s, 4 * s);
      ctx.fillRect(px + 14 * s, py + 2 * s + bounce, 4 * s, 4 * s);
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(px + 2 * s, py + 0 * s + bounce, 3 * s, 3 * s);
      ctx.fillRect(px + 5 * s, py + -1 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 12 * s, py + -1 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 15 * s, py + 0 * s + bounce, 3 * s, 3 * s);
      ctx.fillStyle = '#ffe66d';
      ctx.fillRect(px + 6 * s, py + 7 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 11 * s, py + 7 * s + bounce, 3 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 8 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 8 * s + bounce, s, s);
      break;

    case 'sand_pharaoh':
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(px + 4 * s, py + 3 * s + bounce, 12 * s, 13 * s);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(px + 4 * s, py + 1 * s + bounce, 12 * s, 4 * s);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(px + 7 * s, py + 0 * s + bounce, 6 * s, 2 * s);
      ctx.fillStyle = '#d35400';
      ctx.fillRect(px + 6 * s, py + 6 * s + bounce, 3 * s, 2 * s);
      ctx.fillRect(px + 11 * s, py + 6 * s + bounce, 3 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 7 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 7 * s + bounce, s, s);
      ctx.fillStyle = '#daa520';
      ctx.fillRect(px + 8 * s, py + 9 * s + bounce, 4 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 8 * s + bounce, 2 * s, s);
      break;

    case 'crystal_dragon':
      ctx.fillRect(px + 3 * s, py + 4 * s + bounce, 14 * s, 10 * s);
      ctx.fillStyle = '#8c7ae6';
      ctx.fillRect(px + 5 * s, py + 2 * s + bounce, 10 * s, 4 * s);
      ctx.fillRect(px + 7 * s, py + 0 * s + bounce, 6 * s, 3 * s);
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(px + 0 * s, py + 5 * s + bounce, 3 * s, 6 * s);
      ctx.fillRect(px + 17 * s, py + 5 * s + bounce, 3 * s, 6 * s);
      ctx.fillStyle = '#ffe66d';
      ctx.fillRect(px + 6 * s, py + 5 * s + bounce, 3 * s, 3 * s);
      ctx.fillRect(px + 11 * s, py + 5 * s + bounce, 3 * s, 3 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 7 * s, py + 6 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 6 * s + bounce, s, s);
      break;

    case 'ancient_lich':
      ctx.globalAlpha = 0.8;
      ctx.fillRect(px + 5 * s, py + 3 * s + bounce, 10 * s, 12 * s);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 5 * s, py + 1 * s + bounce, 10 * s, 4 * s);
      ctx.fillRect(px + 7 * s, py + 0 * s + bounce, 6 * s, 2 * s);
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(px + 6 * s, py + 5 * s + bounce, 3 * s, 3 * s);
      ctx.fillRect(px + 11 * s, py + 5 * s + bounce, 3 * s, 3 * s);
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(px + 7 * s, py + 6 * s + bounce, s, s);
      ctx.fillRect(px + 12 * s, py + 6 * s + bounce, s, s);
      ctx.fillStyle = '#a29bfe';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(px + 1 * s, py + 3 * s + bounce, 4 * s, 10 * s);
      ctx.fillRect(px + 15 * s, py + 3 * s + bounce, 4 * s, 10 * s);
      ctx.globalAlpha = 1;
      break;

    case 'swamp_hydra':
      ctx.fillRect(px + 2 * s, py + 5 * s + bounce, 16 * s, 10 * s);
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(px + 3 * s, py + 2 * s + bounce, 4 * s, 5 * s);
      ctx.fillRect(px + 13 * s, py + 2 * s + bounce, 4 * s, 5 * s);
      ctx.fillRect(px + 8 * s, py + 1 * s + bounce, 4 * s, 5 * s);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(px + 4 * s, py + 3 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 14 * s, py + 3 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 2 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 4 * s, py + 4 * s + bounce, s, s);
      ctx.fillRect(px + 14 * s, py + 4 * s + bounce, s, s);
      ctx.fillRect(px + 9 * s, py + 3 * s + bounce, s, s);
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(px + 0 * s, py + 12 * s + bounce, 4 * s, 3 * s);
      ctx.fillRect(px + 6 * s, py + 13 * s + bounce, 4 * s, 2 * s);
      ctx.fillRect(px + 10 * s, py + 13 * s + bounce, 4 * s, 2 * s);
      ctx.fillRect(px + 16 * s, py + 12 * s + bounce, 4 * s, 3 * s);
      break;

    default:
      ctx.fillRect(px + 3 * s, py + 3 * s, 14 * s, 14 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 6 * s, py + 6 * s, 3 * s, 3 * s);
      ctx.fillRect(px + 11 * s, py + 6 * s, 3 * s, 3 * s);
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

export const drawPet = (
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  direction: number,
  animFrame: number,
  isAttacking: boolean,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  const bounce = animFrame % 2 === 0 ? 0 : -s;

  switch (type) {
    case 'fire_dragonling': {
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(px + 4 * s, py + 5 * s + bounce, 8 * s, 7 * s);
      ctx.fillRect(px + 3 * s, py + 2 * s + bounce, 10 * s, 5 * s);
      ctx.fillStyle = '#ff8c42';
      ctx.fillRect(px + 4 * s, py + 3 * s + bounce, 8 * s, 3 * s);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(px + 2 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 12 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      const eyeX = direction < 0 ? px + 4 * s : px + 10 * s;
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(eyeX, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(eyeX + (direction < 0 ? 0 : s), py + 4 * s + bounce, s, s);
      ctx.fillStyle = '#ff6b35';
      const tailX = direction < 0 ? px + 12 * s : px + 1 * s;
      ctx.fillRect(tailX, py + 7 * s + bounce, 3 * s, 3 * s);
      if (isAttacking) {
        ctx.fillStyle = '#ffe66d';
        const fireX = direction < 0 ? px - 2 * s : px + 14 * s;
        ctx.fillRect(fireX, py + 5 * s + bounce, 2 * s, 2 * s);
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(fireX + (direction < 0 ? -s : s), py + 6 * s + bounce, s, s);
      }
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(px + 5 * s, py + 12 * s, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 12 * s, 2 * s, 2 * s);
      break;
    }

    case 'ice_sprite': {
      ctx.fillStyle = 'rgba(78, 205, 196, 0.7)';
      ctx.beginPath();
      ctx.arc(x, y + bounce, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(116, 185, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y + bounce, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillRect(px + 9 * s, py + 4 * s + bounce, 2 * s, 2 * s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(px + 6 * s, py + 5 * s + bounce, s, s);
      ctx.fillRect(px + 10 * s, py + 5 * s + bounce, s, s);
      ctx.fillStyle = '#4ecdc4';
      const wingFlap = animFrame % 2 === 0 ? 0 : -2 * s;
      ctx.fillRect(px + 1 * s, py + 5 * s + wingFlap + bounce, 3 * s, 4 * s);
      ctx.fillRect(px + 12 * s, py + 5 * s + wingFlap + bounce, 3 * s, 4 * s);
      if (isAttacking) {
        ctx.fillStyle = '#a8e6cf';
        for (let i = 0; i < 3; i++) {
          const sparkleX = px + (4 + i * 3) * s;
          const sparkleY = py + (10 + (i % 2) * 2) * s + bounce;
          ctx.fillRect(sparkleX, sparkleY, s, s);
        }
      }
      break;
    }

    case 'thunder_bird': {
      ctx.fillStyle = '#ffe66d';
      ctx.fillRect(px + 4 * s, py + 4 * s + bounce, 8 * s, 6 * s);
      ctx.fillRect(px + 5 * s, py + 2 * s + bounce, 6 * s, 4 * s);
      ctx.fillStyle = '#fdcb6e';
      ctx.fillRect(px + 3 * s, py + 3 * s + bounce, 2 * s, 3 * s);
      ctx.fillRect(px + 11 * s, py + 3 * s + bounce, 2 * s, 3 * s);
      const birdEyeX = direction < 0 ? px + 5 * s : px + 9 * s;
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(birdEyeX, py + 4 * s + bounce, s, s);
      ctx.fillStyle = '#e17055';
      const beakX = direction < 0 ? px + 2 * s : px + 13 * s;
      ctx.fillRect(beakX, py + 5 * s + bounce, 2 * s, s);
      ctx.fillStyle = '#ffe66d';
      const wingOffset = animFrame % 2 === 0 ? 0 : -3 * s;
      ctx.fillRect(px + 1 * s, py + 6 * s + wingOffset + bounce, 3 * s, 4 * s);
      ctx.fillRect(px + 12 * s, py + 6 * s + wingOffset + bounce, 3 * s, 4 * s);
      ctx.fillStyle = '#fdcb6e';
      ctx.fillRect(px + 6 * s, py + 10 * s + bounce, s, 3 * s);
      ctx.fillRect(px + 9 * s, py + 10 * s + bounce, s, 3 * s);
      if (isAttacking) {
        ctx.fillStyle = '#ffffff';
        const lightningX = direction < 0 ? px - 2 * s : px + 15 * s;
        ctx.fillRect(lightningX, py + 3 * s + bounce, s, 3 * s);
        ctx.fillRect(lightningX + (direction < 0 ? -s : s), py + 5 * s + bounce, s, 2 * s);
      }
      break;
    }

    case 'shadow_cat': {
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(px + 3 * s, py + 5 * s + bounce, 10 * s, 6 * s);
      ctx.fillRect(px + 4 * s, py + 2 * s + bounce, 8 * s, 5 * s);
      ctx.fillStyle = '#a29bfe';
      ctx.fillRect(px + 5 * s, py + 4 * s + bounce, 6 * s, 2 * s);
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(px + 3 * s, py + 1 * s + bounce, 2 * s, 3 * s);
      ctx.fillRect(px + 11 * s, py + 1 * s + bounce, 2 * s, 3 * s);
      const catEyeX = direction < 0 ? px + 5 * s : px + 9 * s;
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(catEyeX, py + 4 * s + bounce, 2 * s, s);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(catEyeX + s, py + 4 * s + bounce, s, s);
      ctx.fillStyle = '#a29bfe';
      const catTailDir = direction < 0 ? 1 : -1;
      const catTailX = direction < 0 ? px + 13 * s : px + 0 * s;
      ctx.fillRect(catTailX, py + 6 * s + bounce, s, 4 * s);
      ctx.fillRect(catTailX + catTailDir * s, py + 5 * s + bounce, s, s);
      ctx.fillStyle = '#6c5ce7';
      const legBounce = animFrame % 2 === 0 ? 0 : s;
      ctx.fillRect(px + 4 * s, py + 11 * s, 2 * s, 3 * s - legBounce / 2);
      ctx.fillRect(px + 10 * s, py + 11 * s, 2 * s, 3 * s - legBounce / 2);
      if (isAttacking) {
        ctx.fillStyle = '#a29bfe';
        const clawX = direction < 0 ? px - 1 * s : px + 14 * s;
        ctx.fillRect(clawX, py + 5 * s + bounce, s, 2 * s);
        ctx.fillRect(clawX, py + 8 * s + bounce, s, 2 * s);
      }
      break;
    }

    default:
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4 * s, py + 4 * s, 8 * s, 8 * s);
  }
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

export const drawShopkeeper = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: number = 1,
  animFrame: number = 0,
  scale: number = 3
) => {
  const s = scale;
  const px = Math.floor(x - 10 * s);
  const py = Math.floor(y - 12 * s);
  const bounce = animFrame % 2 === 0 ? 0 : -s;

  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(px + 4 * s, py + 8 * s + bounce, 12 * s, 12 * s);

  ctx.fillStyle = '#a29bfe';
  ctx.fillRect(px + 5 * s, py + 9 * s + bounce, 10 * s, 3 * s);

  ctx.fillStyle = '#ffeaa7';
  ctx.fillRect(px + 5 * s, py + 3 * s + bounce, 10 * s, 6 * s);

  ctx.fillStyle = '#6c5ce7';
  ctx.fillRect(px + 4 * s, py + 1 * s + bounce, 12 * s, 3 * s);
  ctx.fillRect(px + 6 * s, py + 0 * s + bounce, 8 * s, s);
  ctx.fillRect(px + 8 * s, py - 1 * s + bounce, 4 * s, s);

  ctx.fillStyle = '#ffd93d';
  ctx.fillRect(px + 8 * s, py - 2 * s + bounce, 4 * s, 2 * s);
  ctx.fillRect(px + 9 * s, py - 3 * s + bounce, 2 * s, s);

  const eyeOffset = direction < 0 ? -s : s;
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 6 * s + eyeOffset, py + 5 * s + bounce, 2 * s, 2 * s);
  ctx.fillRect(px + 10 * s + eyeOffset, py + 5 * s + bounce, 2 * s, 2 * s);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 6 * s + eyeOffset, py + 5 * s + bounce, s, s);
  ctx.fillRect(px + 10 * s + eyeOffset, py + 5 * s + bounce, s, s);

  ctx.fillStyle = '#e17055';
  ctx.fillRect(px + 8 * s, py + 7 * s + bounce, 4 * s, 2 * s);

  ctx.fillStyle = '#d63031';
  ctx.fillRect(px + 9 * s, py + 7 * s + bounce, 2 * s, s);

  ctx.fillStyle = '#ffeaa7';
  const armSwing = animFrame % 2 === 0 ? 0 : s;
  ctx.fillRect(px + 2 * s, py + 9 * s + bounce + armSwing, 3 * s, 6 * s);
  ctx.fillRect(px + 15 * s, py + 9 * s + bounce - armSwing, 3 * s, 6 * s);

  ctx.fillStyle = '#fdcb6e';
  ctx.fillRect(px + 1 * s, py + 14 * s + bounce + armSwing, 4 * s, 2 * s);
  ctx.fillRect(px + 15 * s, py + 14 * s + bounce - armSwing, 4 * s, 2 * s);

  ctx.fillStyle = '#0984e3';
  ctx.fillRect(px + 5 * s, py + 20 * s, 4 * s, 3 * s);
  ctx.fillRect(px + 11 * s, py + 20 * s, 4 * s, 3 * s);

  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 4 * s, py + 22 * s, 6 * s, 2 * s);
  ctx.fillRect(px + 10 * s, py + 22 * s, 6 * s, 2 * s);

  ctx.fillStyle = '#ffd700';
  ctx.fillRect(px + 7 * s, py + 12 * s + bounce, 6 * s, 6 * s);
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(px + 9 * s, py + 13 * s + bounce, 2 * s, 4 * s);
  ctx.fillRect(px + 8 * s, py + 14 * s + bounce, 4 * s, 2 * s);
};

export const drawTorch = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  animFrame: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 4 * s);
  const py = Math.floor(y - 8 * s);
  const flicker = animFrame % 2 === 0 ? 0 : -s;
  
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(px + 3 * s, py + 8 * s, 2 * s, 6 * s);
  
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(px + 2 * s, py + 6 * s, 4 * s, 3 * s);
  
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(px + 2 * s, py + 3 * s + flicker, 4 * s, 4 * s);
  
  ctx.fillStyle = '#ffe66d';
  ctx.fillRect(px + 3 * s, py + 4 * s + flicker, 2 * s, 2 * s);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 3 * s, py + 5 * s + flicker, s, s);
};

export const drawPillar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 6 * s);
  const py = Math.floor(y - 10 * s);
  
  const colors = [
    { base: '#636e72', light: '#b2bec3', dark: '#2d3436' },
    { base: '#8b7355', light: '#d4a574', dark: '#5a4a3a' },
    { base: '#5a7a9a', light: '#74b9ff', dark: '#2a4a6a' },
  ];
  const color = colors[variant % colors.length];
  
  ctx.fillStyle = color.base;
  ctx.fillRect(px + 2 * s, py + 2 * s, 8 * s, 16 * s);
  
  ctx.fillStyle = color.light;
  ctx.fillRect(px + 2 * s, py + 2 * s, 2 * s, 16 * s);
  ctx.fillRect(px, py, 12 * s, 3 * s);
  
  ctx.fillStyle = color.dark;
  ctx.fillRect(px + 8 * s, py + 2 * s, 2 * s, 16 * s);
  ctx.fillRect(px, py + 17 * s, 12 * s, 3 * s);
  
  ctx.fillStyle = color.base;
  ctx.fillRect(px + s, py + s, 10 * s, s);
  ctx.fillRect(px + s, py + 18 * s, 10 * s, s);
};

export const drawSkull = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 6 * s);
  const py = Math.floor(y - 6 * s);
  
  ctx.fillStyle = '#dfe4ea';
  ctx.fillRect(px + 2 * s, py + s, 8 * s, 7 * s);
  ctx.fillRect(px + 3 * s, py + 8 * s, 6 * s, 2 * s);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 3 * s, py + 2 * s, 6 * s, 5 * s);
  
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 3 * s, py + 4 * s, 2 * s, 2 * s);
  ctx.fillRect(px + 7 * s, py + 4 * s, 2 * s, 2 * s);
  
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + 5 * s, py + 8 * s, s, s);
  ctx.fillRect(px + 4 * s, py + 10 * s, s, s);
  ctx.fillRect(px + 6 * s, py + 10 * s, s, s);
  ctx.fillRect(px + 5 * s, py + 11 * s, s, s);
};

export const drawAltar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accentColor: string = '#6c5ce7',
  animFrame: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 10 * s);
  const py = Math.floor(y - 8 * s);
  const glow = animFrame % 4 < 2;
  
  ctx.fillStyle = '#5a5a6a';
  ctx.fillRect(px + 2 * s, py + 6 * s, 16 * s, 8 * s);
  
  ctx.fillStyle = '#4a4a5a';
  ctx.fillRect(px + 2 * s, py + 12 * s, 16 * s, 2 * s);
  
  ctx.fillStyle = '#6a6a7a';
  ctx.fillRect(px + 3 * s, py + 4 * s, 14 * s, 3 * s);
  
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(px + 4 * s, py + 7 * s, 12 * s, 4 * s);
  
  ctx.fillStyle = glow ? accentColor : '#ffffff';
  ctx.fillRect(px + 8 * s, py + s, 4 * s, 4 * s);
  
  ctx.fillStyle = accentColor;
  ctx.globalAlpha = glow ? 0.5 : 0.3;
  ctx.fillRect(px + 7 * s, py, 6 * s, s);
  ctx.fillRect(px + 7 * s, py + 5 * s, 6 * s, s);
  ctx.globalAlpha = 1;
};

export const drawCrate = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 7 * s);
  const py = Math.floor(y - 7 * s);
  
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(px + s, py + s, 12 * s, 12 * s);
  
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(px + s, py + s, 12 * s, 2 * s);
  ctx.fillRect(px + s, py + 11 * s, 12 * s, 2 * s);
  ctx.fillRect(px + s, py + s, 2 * s, 12 * s);
  ctx.fillRect(px + 11 * s, py + s, 2 * s, 12 * s);
  
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(px + s, py + 7 * s, 12 * s, s);
  ctx.fillRect(px + 7 * s, py + s, s, 12 * s);
  
  ctx.fillStyle = '#daa520';
  ctx.fillRect(px + 6 * s, py + 6 * s, 2 * s, 3 * s);
};

export const drawBarrel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 6 * s);
  const py = Math.floor(y - 8 * s);
  
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(px + 2 * s, py + 2 * s, 8 * s, 12 * s);
  
  ctx.fillStyle = '#a0522d';
  ctx.fillRect(px + 2 * s, py + 2 * s, 8 * s, 2 * s);
  ctx.fillRect(px + 2 * s, py + 12 * s, 8 * s, 2 * s);
  
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(px + s, py + 5 * s, 10 * s, s);
  ctx.fillRect(px + s, py + 10 * s, 10 * s, s);
  
  ctx.fillStyle = '#4a2a0a';
  ctx.fillRect(px + 2 * s, py + 7 * s, 8 * s, s);
};

export const drawBones = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 4 * s);
  
  ctx.fillStyle = '#dfe4ea';
  
  if (variant % 2 === 0) {
    ctx.fillRect(px + s, py + 2 * s, 10 * s, 2 * s);
    ctx.fillRect(px, py + s, 2 * s, 4 * s);
    ctx.fillRect(px + 10 * s, py + s, 2 * s, 4 * s);
  } else {
    ctx.fillRect(px + 4 * s, py + s, 2 * s, 8 * s);
    ctx.fillRect(px + 3 * s, py, 4 * s, 2 * s);
    ctx.fillRect(px + 3 * s, py + 7 * s, 4 * s, 2 * s);
  }
  
  ctx.fillStyle = '#ffffff';
  if (variant % 2 === 0) {
    ctx.fillRect(px + 2 * s, py + 2 * s, 8 * s, s);
  } else {
    ctx.fillRect(px + 4 * s, py + 2 * s, s, 6 * s);
  }
};

export const drawCobweb = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 8 * s);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = s;
  
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + 16 * s, py + 16 * s);
  ctx.moveTo(px + 16 * s, py);
  ctx.lineTo(px, py + 16 * s);
  ctx.moveTo(px + 8 * s, py);
  ctx.lineTo(px + 8 * s, py + 16 * s);
  ctx.moveTo(px, py + 8 * s);
  ctx.lineTo(px + 16 * s, py + 8 * s);
  ctx.stroke();
  
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    const r = i * 3 * s;
    ctx.arc(px + 8 * s, py + 8 * s, r, 0, Math.PI * 2);
    ctx.stroke();
  }
};

export const drawCrystal = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string = '#a29bfe',
  animFrame: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 6 * s);
  const py = Math.floor(y - 10 * s);
  const glow = animFrame % 4 < 2;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px + 6 * s, py);
  ctx.lineTo(px + 10 * s, py + 6 * s);
  ctx.lineTo(px + 8 * s, py + 16 * s);
  ctx.lineTo(px + 4 * s, py + 16 * s);
  ctx.lineTo(px + 2 * s, py + 6 * s);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = glow ? '#ffffff' : color;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(px + 6 * s, py + 2 * s);
  ctx.lineTo(px + 8 * s, py + 6 * s);
  ctx.lineTo(px + 6 * s, py + 12 * s);
  ctx.lineTo(px + 4 * s, py + 6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  
  if (glow) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(px + 6 * s, py + 8 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

export const drawRuneStone = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  runeColor: string = '#6c5ce7',
  animFrame: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 10 * s);
  const glow = animFrame % 4 < 2;
  
  ctx.fillStyle = '#4a4a5a';
  ctx.fillRect(px + 2 * s, py + 4 * s, 12 * s, 12 * s);
  
  ctx.fillStyle = '#5a5a6a';
  ctx.fillRect(px + 2 * s, py + 4 * s, 12 * s, 2 * s);
  ctx.fillRect(px + 2 * s, py + 4 * s, 2 * s, 12 * s);
  
  ctx.fillStyle = glow ? runeColor : '#3a3a4a';
  ctx.fillRect(px + 5 * s, py + 7 * s, 6 * s, 2 * s);
  ctx.fillRect(px + 7 * s, py + 6 * s, 2 * s, 6 * s);
  ctx.fillRect(px + 5 * s, py + 11 * s, 2 * s, 2 * s);
  ctx.fillRect(px + 9 * s, py + 11 * s, 2 * s, 2 * s);
  
  if (glow) {
    ctx.fillStyle = runeColor;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(px + 8 * s, py + 10 * s, 12 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

export const drawRoots = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 8 * s);
  const py = Math.floor(y - 4 * s);
  
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(px, py + 4 * s, 16 * s, 2 * s);
  
  ctx.fillStyle = '#5d4037';
  if (variant % 3 === 0) {
    ctx.fillRect(px + 2 * s, py + 2 * s, 2 * s, 4 * s);
    ctx.fillRect(px + 6 * s, py + s, 2 * s, 5 * s);
    ctx.fillRect(px + 10 * s, py + 2 * s, 2 * s, 4 * s);
  } else if (variant % 3 === 1) {
    ctx.fillRect(px + 4 * s, py + 2 * s, 2 * s, 4 * s);
    ctx.fillRect(px + 8 * s, py + s, 2 * s, 5 * s);
    ctx.fillRect(px + 12 * s, py + 3 * s, 2 * s, 3 * s);
  } else {
    ctx.fillRect(px + s, py + 3 * s, 2 * s, 3 * s);
    ctx.fillRect(px + 5 * s, py + s, 2 * s, 5 * s);
    ctx.fillRect(px + 9 * s, py + 2 * s, 2 * s, 4 * s);
    ctx.fillRect(px + 13 * s, py + 3 * s, 2 * s, 3 * s);
  }
};

export const drawMushroom = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  animFrame: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 5 * s);
  const py = Math.floor(y - 8 * s);
  const glow = animFrame % 4 < 2;
  
  const capColors = ['#e74c3c', '#9b59b6', '#27ae60', '#f39c12'];
  const capColor = capColors[variant % capColors.length];
  
  ctx.fillStyle = '#f5f5dc';
  ctx.fillRect(px + 3 * s, py + 8 * s, 4 * s, 6 * s);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 3 * s, py + 8 * s, s, 6 * s);
  
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.ellipse(px + 5 * s, py + 7 * s, 5 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px + 3 * s, py + 5 * s, 2 * s, 2 * s);
  ctx.fillRect(px + 6 * s, py + 6 * s, s, s);
  ctx.fillRect(px + 5 * s, py + 3 * s, s, s);
  
  if (glow && (variant % 2 === 0)) {
    ctx.fillStyle = capColor;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(px + 5 * s, py + 7 * s, 8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
};

export const drawVines = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 4 * s);
  const py = Math.floor(y - 12 * s);
  
  ctx.fillStyle = '#2e7d32';
  
  if (variant % 2 === 0) {
    for (let i = 0; i < 6; i++) {
      const offset = Math.sin(i * 0.8) * s;
      ctx.fillRect(px + 2 * s + offset, py + i * 4 * s, 2 * s, 4 * s);
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const offset = Math.cos(i * 0.8) * s;
      ctx.fillRect(px + 2 * s + offset, py + i * 4 * s, 2 * s, 4 * s);
    }
  }
  
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(px, py + 4 * s, 2 * s, 2 * s);
  ctx.fillRect(px + 4 * s, py + 8 * s, 2 * s, 2 * s);
  ctx.fillRect(px + s, py + 14 * s, 2 * s, 2 * s);
  ctx.fillRect(px + 4 * s, py + 16 * s, 2 * s, 2 * s);
};

export const drawIcicle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: number = 0,
  scale: number = 2
) => {
  const s = scale;
  const px = Math.floor(x - 4 * s);
  const py = Math.floor(y - 8 * s);
  
  ctx.fillStyle = '#b3e5fc';
  ctx.beginPath();
  ctx.moveTo(px + s, py);
  ctx.lineTo(px + 7 * s, py);
  ctx.lineTo(px + 4 * s, py + 16 * s);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#e1f5fe';
  ctx.beginPath();
  ctx.moveTo(px + 2 * s, py);
  ctx.lineTo(px + 4 * s, py);
  ctx.lineTo(px + 3 * s, py + 12 * s);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(px + 2 * s, py + 2 * s, s, 4 * s);
  ctx.globalAlpha = 1;
  
  if (variant % 2 === 0) {
    ctx.fillStyle = '#81d4fa';
    ctx.fillRect(px + 6 * s, py + 4 * s, s, 8 * s);
  }
};

export const drawDecoration = (
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  variant: number = 0,
  accentColor: string = '#6c5ce7',
  animFrame: number = 0,
  scale: number = 2
) => {
  switch (type) {
    case 'torch':
      drawTorch(ctx, x, y, animFrame, scale);
      break;
    case 'pillar':
      drawPillar(ctx, x, y, variant, scale);
      break;
    case 'skull':
      drawSkull(ctx, x, y, scale);
      break;
    case 'altar':
      drawAltar(ctx, x, y, accentColor, animFrame, scale);
      break;
    case 'crate':
      drawCrate(ctx, x, y, scale);
      break;
    case 'barrel':
      drawBarrel(ctx, x, y, scale);
      break;
    case 'bones':
      drawBones(ctx, x, y, variant, scale);
      break;
    case 'cobweb':
      drawCobweb(ctx, x, y, scale);
      break;
    case 'crystal':
      drawCrystal(ctx, x, y, accentColor, animFrame, scale);
      break;
    case 'rune_stone':
      drawRuneStone(ctx, x, y, accentColor, animFrame, scale);
      break;
    case 'roots':
      drawRoots(ctx, x, y, variant, scale);
      break;
    case 'mushroom':
      drawMushroom(ctx, x, y, variant, animFrame, scale);
      break;
    case 'vines':
      drawVines(ctx, x, y, variant, scale);
      break;
    case 'icicle':
      drawIcicle(ctx, x, y, variant, scale);
      break;
    default:
      break;
  }
};

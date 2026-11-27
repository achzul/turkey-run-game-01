// TurkeyArt: every picture in Gobble Dash is drawn with canvas shapes.
// Original autumn art: a brown turkey, a farmer in overalls, the farmyard
// and the kitchen. Nothing is loaded from a file.
export const PALETTE = {
  skyTop: '#f7b733',
  skyMid: '#fc9a4b',
  skyLow: '#e8703a',
  hillFar: '#c97b2d',
  hillNear: '#8a5a24',
  ground: '#6b4423',
  grass: '#7da23c',
  turkeyBody: '#7a4a21',
  turkeyWing: '#5d3413',
  turkeyHead: '#c98a5a',
  wattle: '#d43d2a',
  beak: '#f2a541',
  feather: '#a0662c',
  farmerShirt: '#b8452e',
  farmerOveralls: '#3f5e8c',
  farmerSkin: '#e8b98a',
  farmerHat: '#8a6d3b',
  ovenBody: '#4a4a52',
  ovenGlow: '#ff9a2a',
  knifeBlade: '#dfe6ee',
  knifeHandle: '#3a2a1a',
  hay: '#e8c25a',
  corn: '#ffd23e',
};

export function drawTurkey(ctx, x, y, scale, runPhase, ducking, hidden) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (hidden) {
    ctx.globalAlpha = 0.35;
  }
  const bob = ducking ? 0 : Math.sin(runPhase) * 2;
  const legSwing = ducking ? 0 : Math.sin(runPhase) * 6;

  // Tail fan feathers
  ctx.fillStyle = PALETTE.feather;
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(-16, -14 + bob);
    ctx.rotate(i * 0.35);
    ctx.beginPath();
    ctx.ellipse(0, -16, 7, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.ellipse(0, -28, 3.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.feather;
    ctx.restore();
  }

  // Legs
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(-4 + legSwing, 20);
  ctx.moveTo(5, 8);
  ctx.lineTo(5 - legSwing, 20);
  ctx.stroke();

  // Body
  ctx.fillStyle = PALETTE.turkeyBody;
  ctx.beginPath();
  ctx.ellipse(0, 0 + bob, 20, ducking ? 13 : 17, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = PALETTE.turkeyWing;
  ctx.beginPath();
  ctx.ellipse(-3, -2 + bob, 12, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head
  ctx.fillStyle = PALETTE.turkeyHead;
  ctx.beginPath();
  ctx.ellipse(16, -16 + bob, 6, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(19, -26 + bob, 8, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = PALETTE.beak;
  ctx.beginPath();
  ctx.moveTo(25, -27 + bob);
  ctx.lineTo(34, -24 + bob);
  ctx.lineTo(25, -21 + bob);
  ctx.closePath();
  ctx.fill();

  // Wattle
  ctx.fillStyle = PALETTE.wattle;
  ctx.beginPath();
  ctx.ellipse(24, -19 + bob, 3, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(21, -28 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawFarmer(ctx, x, y, scale, runPhase, angry) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const bob = Math.sin(runPhase) * 2;
  const legSwing = Math.sin(runPhase) * 9;

  // Legs (overalls)
  ctx.strokeStyle = PALETTE.farmerOveralls;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-3, 6);
  ctx.lineTo(-3 + legSwing, 22);
  ctx.moveTo(4, 6);
  ctx.lineTo(4 - legSwing, 22);
  ctx.stroke();

  // Body: overalls + shirt
  ctx.fillStyle = PALETTE.farmerOveralls;
  ctx.fillRect(-11, -12 + bob, 22, 20);
  ctx.fillStyle = PALETTE.farmerShirt;
  ctx.fillRect(-11, -12 + bob, 22, 9);
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(-2, -12 + bob, 4, 8);

  // Arms reaching forward, holding a pitchfork
  ctx.strokeStyle = PALETTE.farmerShirt;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(8, -8 + bob);
  ctx.lineTo(24, -2 + bob);
  ctx.stroke();

  // Pitchfork
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(24, -14 + bob);
  ctx.lineTo(24, 16 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(19, -14 + bob);
  ctx.lineTo(19, -4 + bob);
  ctx.moveTo(24, -14 + bob);
  ctx.lineTo(24, -4 + bob);
  ctx.moveTo(29, -14 + bob);
  ctx.lineTo(29, -4 + bob);
  ctx.stroke();

  // Head
  ctx.fillStyle = PALETTE.farmerSkin;
  ctx.beginPath();
  ctx.arc(0, -24 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  // Straw hat
  ctx.fillStyle = PALETTE.farmerHat;
  ctx.beginPath();
  ctx.ellipse(0, -30 + bob, 15, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -32 + bob, 8, Math.PI, 0);
  ctx.fill();

  // Angry eyes / moustache
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(3, -27 + bob, 3, 2);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(2, -19 + bob, 8, 2.5);
  if (angry) {
    ctx.fillStyle = '#d43d2a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('!', 12, -34 + bob);
  }

  ctx.restore();
}

export function drawOven(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.ovenBody;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#33333a';
  ctx.fillRect(4, 4, w - 8, 12);
  // Glowing oven window with a roast silhouette
  const glow = ctx.createLinearGradient(0, 18, 0, h - 8);
  glow.addColorStop(0, '#ffd23e');
  glow.addColorStop(1, PALETTE.ovenGlow);
  ctx.fillStyle = glow;
  ctx.fillRect(8, 20, w - 16, h - 28);
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 16, w / 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d3413';
  ctx.beginPath();
  ctx.arc(w / 2 - 6, h - 20, 4, 0, Math.PI * 2);
  ctx.fill();
  // Danger sign
  ctx.fillStyle = '#d43d2a';
  ctx.beginPath();
  ctx.moveTo(w / 2, 24);
  ctx.lineTo(w / 2 + 7, 36);
  ctx.lineTo(w / 2 - 7, 36);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', w / 2, 34);
  ctx.restore();
}

export function drawCarvingKnife(ctx, x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle || 0);
  ctx.translate(-w / 2, -h / 2);
  // Blade
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.15);
  ctx.lineTo(w * 0.7, 0);
  ctx.lineTo(w * 0.7, h * 0.3);
  ctx.lineTo(0, h * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa5b1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, h * 0.28);
  ctx.lineTo(w * 0.65, h * 0.14);
  ctx.stroke();
  // Handle
  ctx.fillStyle = PALETTE.knifeHandle;
  ctx.fillRect(w * 0.7, h * 0.08, w * 0.3, h * 0.3);
  ctx.fillStyle = '#d43d2a';
  ctx.fillRect(w * 0.68, h * 0.08, 3, h * 0.3);
  ctx.restore();
}

export function drawFence(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#8a6d3b';
  ctx.fillRect(0, 0, 5, h);
  ctx.fillRect(w - 5, 0, 5, h);
  ctx.fillStyle = '#a5854f';
  ctx.fillRect(0, h * 0.25, w, 6);
  ctx.fillRect(0, h * 0.6, w, 6);
  ctx.restore();
}

export function drawHaystack(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.hay;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(w * 0.1, h * 0.15, w / 2, 0);
  ctx.quadraticCurveTo(w * 0.9, h * 0.15, w, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c9a13a';
  ctx.lineWidth = 2;
  for (let i = 1; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(w * 0.2 * i, h * 0.85);
    ctx.quadraticCurveTo(w * (0.2 * i + 0.05), h * 0.4, w * (0.2 * i + 0.1), h * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCorn(ctx, x, y, bob) {
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = PALETTE.corn;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 13, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a13a';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 4 - 2, -10);
    ctx.lineTo(i * 4 + 1, 10);
    ctx.stroke();
  }
  ctx.fillStyle = '#7da23c';
  ctx.beginPath();
  ctx.moveTo(-6, 10);
  ctx.lineTo(6, 10);
  ctx.lineTo(0, 18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPumpkin(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#e8703a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c95a24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 12);
  ctx.moveTo(-8, -11);
  ctx.quadraticCurveTo(-10, 0, -8, 11);
  ctx.moveTo(8, -11);
  ctx.quadraticCurveTo(10, 0, 8, 11);
  ctx.stroke();
  ctx.fillStyle = '#7da23c';
  ctx.fillRect(-2, -16, 4, 5);
  ctx.restore();
}

export function drawScenery(ctx, width, height, groundY, stage, scrollX, time) {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  if (stage === 3) {
    sky.addColorStop(0, '#8a4a2a');
    sky.addColorStop(1, '#c97b2d');
  } else {
    sky.addColorStop(0, PALETTE.skyTop);
    sky.addColorStop(0.55, PALETTE.skyMid);
    sky.addColorStop(1, PALETTE.skyLow);
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, groundY);

  // Sun
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(width - 130, 70, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 243, 196, 0.35)';
  ctx.beginPath();
  ctx.arc(width - 130, 70, 52, 0, Math.PI * 2);
  ctx.fill();

  // Clouds drift slowly
  ctx.fillStyle = 'rgba(255, 244, 214, 0.85)';
  for (let i = 0; i < 3; i += 1) {
    const cx = ((i * 340 - scrollX * 0.05 + time * 6) % (width + 200) + width + 200) % (width + 200) - 100;
    const cy = 55 + i * 38;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 46, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy + 5, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hills
  ctx.fillStyle = PALETTE.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= width; x += 40) {
    ctx.lineTo(x, groundY - 60 - Math.sin((x + scrollX * 0.15) * 0.008) * 26);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();

  if (stage === 3) {
    // Kitchen: wall, window, hanging pans, table edge
    ctx.fillStyle = '#a5653a';
    ctx.fillRect(0, groundY - 190, width, 190);
    ctx.fillStyle = '#e8c98f';
    ctx.fillRect(60, 60, 150, 120);
    ctx.fillStyle = '#9ec7e8';
    ctx.fillRect(70, 70, 130, 100);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(150, 105, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 3; i += 1) {
      const px = 300 + i * 90;
      ctx.beginPath();
      ctx.arc(px, 120, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a6a6a';
      ctx.beginPath();
      ctx.arc(px, 120, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a3a3a';
    }
    ctx.fillStyle = '#7a4a21';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('THE KITCHEN — no turning back now!', 480, 34);
  } else {
    // Farmyard: barn and trees
    const barnX = 120 - (scrollX * 0.2 % 1400);
    ctx.fillStyle = '#a83226';
    ctx.fillRect(barnX, groundY - 130, 130, 130);
    ctx.fillStyle = '#7a241a';
    ctx.beginPath();
    ctx.moveTo(barnX - 10, groundY - 130);
    ctx.lineTo(barnX + 65, groundY - 175);
    ctx.lineTo(barnX + 140, groundY - 130);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(barnX + 45, groundY - 70, 40, 70);
    ctx.fillStyle = '#5d3413';
    ctx.fillRect(barnX + 45, groundY - 70, 40, 6);
    for (let i = 0; i < 3; i += 1) {
      const tx = 420 + i * 260 - (scrollX * 0.3 % 780);
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(tx - 4, groundY - 90, 8, 90);
      ctx.fillStyle = '#c96a1e';
      ctx.beginPath();
      ctx.arc(tx, groundY - 105, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8703a';
      ctx.beginPath();
      ctx.arc(tx - 14, groundY - 115, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    drawPumpkin(ctx, 700 - (scrollX * 0.4 % 900), groundY - 8, 1);
    drawPumpkin(ctx, 300 - (scrollX * 0.4 % 900), groundY - 6, 0.7);
  }

  // Ground
  ctx.fillStyle = PALETTE.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = PALETTE.grass;
  ctx.fillRect(0, groundY, width, 10);
  // Dirt speckles scrolling by
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 24; i += 1) {
    const sx = ((i * 173 - scrollX) % (width + 60) + width + 60) % (width + 60) - 30;
    const sy = groundY + 22 + ((i * 37) % (height - groundY - 30));
    ctx.beginPath();
    ctx.ellipse(sx, sy, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

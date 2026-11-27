// Gobble Dash — A Turkey's Great Escape
// The main game: states, player physics, collisions, scoring, HUD and menus.
// The turkey auto-runs from the farmyard to the kitchen; the farmer chases
// from behind. Jump the fences and ovens, dodge the falling and swinging
// carving knives, grab corn, and hide in a haystack when the farmer closes in.
// Reach 1200 m and the turkey escapes to the woods. Get caught and it is dinner.
import { SoundEngine } from './audio.js';
import { InputHandler } from './input.js';
import { drawFarmer, drawScenery, drawTurkey } from './art.js';
import { FarmerChase, ObstacleField } from './entities.js';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const GROUND_Y = 452;
const TURKEY_X = 190;
const GRAVITY = 1800;
const JUMP_SPEED = 780;
const ESCAPE_DISTANCE = 1200;
const STAGE_NAMES = ['', '1 · THE FARMYARD', '2 · THE BARNYARD', '3 · THE KITCHEN'];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sound = new SoundEngine();
const input = new InputHandler(canvas);
const field = new ObstacleField(CANVAS_WIDTH, GROUND_Y);
const farmer = new FarmerChase();

const game = {
  state: 'title',
  endKind: 'caught',
  score: 0,
  distance: 0,
  lives: 3,
  speed: 260,
  scrollX: 0,
  time: 0,
  runPhase: 0,
  best: 0,
  buttons: [],
  flashMessage: '',
  flashTimer: 0,
  demoMode: false,
};

const turkey = {
  y: GROUND_Y,
  vy: 0,
  onGround: true,
  ducking: false,
  hiding: false,
  hideTimer: 0,
  invulnerable: 0,
  width: 44,
  height: 52,
};

function stageForDistance(distance) {
  if (distance >= 800) return 3;
  if (distance >= 400) return 2;
  return 1;
}

function speedForStage(stage) {
  return 260 + (stage - 1) * 55;
}

function resetRun() {
  game.score = 0;
  game.distance = 0;
  game.lives = 3;
  game.speed = 260;
  game.scrollX = 0;
  game.runPhase = 0;
  game.flashMessage = '';
  game.flashTimer = 0;
  turkey.y = GROUND_Y;
  turkey.vy = 0;
  turkey.onGround = true;
  turkey.ducking = false;
  turkey.hiding = false;
  turkey.hideTimer = 0;
  turkey.invulnerable = 0;
  field.reset();
  farmer.reset();
}

function startGame() {
  resetRun();
  game.state = 'play';
  sound.ensureContext();
  sound.playGobble();
}

function endGame(kind) {
  game.state = 'end';
  game.endKind = kind;
  if (game.distance > game.best) game.best = Math.floor(game.distance);
  if (kind === 'escaped') {
    sound.playEscaped();
  } else {
    sound.playCaught();
  }
}

function turkeyBox() {
  const height = turkey.ducking ? 34 : 52;
  return {
    x: TURKEY_X - 22,
    y: turkey.y - height,
    width: 44,
    height,
  };
}

function obstacleBox(obstacle) {
  if (obstacle.kind === 'knifeFall') {
    if (obstacle.telegraph > 0 || obstacle.fallY < obstacle.y) {
      return null;
    }
    return { x: obstacle.x + 14, y: obstacle.y, width: 42, height: obstacle.height };
  }
  if (obstacle.kind === 'knifeSwing') {
    const swing = Math.sin(obstacle.swingPhase) * 0.5;
    const drop = swing > 0 ? 18 : 0;
    return { x: obstacle.x + 6, y: obstacle.y + drop, width: 78, height: 40 };
  }
  if (obstacle.kind === 'haystack') {
    return { x: obstacle.x + 6, y: obstacle.y + 10, width: obstacle.width - 12, height: obstacle.height - 10 };
  }
  return { x: obstacle.x + 4, y: obstacle.y, width: obstacle.width - 8, height: obstacle.height };
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function loseLife(reason) {
  if (turkey.invulnerable > 0) return;
  game.lives -= 1;
  turkey.invulnerable = 1.6;
  farmer.gap = Math.max(30, farmer.gap - 45);
  sound.playStumble();
  game.flashMessage = reason;
  game.flashTimer = 1.4;
  if (game.lives <= 0) {
    endGame('caught');
  }
}

function updatePlay(dt, pressed, pointers) {
  const stage = stageForDistance(game.distance);
  game.speed = speedForStage(stage);
  game.distance += (game.speed * dt) / 9;
  game.score += game.speed * dt * 0.12;
  game.scrollX += game.speed * dt;
  game.runPhase += dt * 14;
  game.time += dt;

  const jumpPressed = pressed.includes('Space') || pressed.includes('ArrowUp') || pressed.includes('KeyW') || pointers.length > 0;
  turkey.ducking = input.isDown('ArrowDown') || input.isDown('KeyS');

  // Demo mode (?scene=play): the turkey plays itself so a screenshot
  // catches a real mid-run moment — jump the next obstacle, duck the
  // swinging knives. Human input still works on top of it.
  // Jump timing: the turkey must be above an obstacle's top for the whole
  // time the obstacle slides under it, so tall wide obstacles (the oven)
  // are jumped late and short ones early.
  let demoJump = false;
  if (game.demoMode) {
    let nearest = null;
    let nearestGap = Infinity;
    for (const obstacle of field.obstacles) {
      const gap = obstacle.x - TURKEY_X;
      if (gap > -40 && gap < nearestGap) {
        nearest = obstacle;
        nearestGap = gap;
      }
    }
    if (nearest) {
      if (nearest.kind === 'knifeSwing' && nearestGap < 170) {
        turkey.ducking = true;
      } else if (turkey.onGround && nearest.kind !== 'knifeSwing') {
        const tall = nearest.height > 60;
        const trigger = tall ? 100 : 150;
        if (nearestGap < trigger) demoJump = true;
      }
    }
  }

  if ((jumpPressed || demoJump) && turkey.onGround && !turkey.hiding) {
    turkey.vy = -JUMP_SPEED;
    turkey.onGround = false;
    sound.playJump();
  }

  // Gravity and landing
  turkey.vy += GRAVITY * dt;
  turkey.y += turkey.vy * dt;
  if (turkey.y >= GROUND_Y) {
    turkey.y = GROUND_Y;
    turkey.vy = 0;
    turkey.onGround = true;
  }

  if (turkey.invulnerable > 0) turkey.invulnerable -= dt;
  if (game.flashTimer > 0) game.flashTimer -= dt;

  // Hide in a haystack: ducking while overlapping one hides the turkey
  turkey.hiding = false;
  if (turkey.ducking && turkey.onGround) {
    const box = turkeyBox();
    for (const obstacle of field.obstacles) {
      if (obstacle.kind === 'haystack') {
        const hayBox = obstacleBox(obstacle);
        if (hayBox && boxesOverlap(box, hayBox)) {
          turkey.hiding = true;
          if (turkey.hideTimer <= 0) {
            farmer.startSearching(1.4);
            sound.playGobble();
            game.flashMessage = 'Hidden in the hay — the farmer lost you!';
            game.flashTimer = 1.4;
          }
          turkey.hideTimer = 0.4;
          break;
        }
      }
    }
  }
  if (turkey.hideTimer > 0) turkey.hideTimer -= dt;

  const stumbling = turkey.invulnerable > 0.4;
  const caught = farmer.update(dt, game.speed, stumbling, turkey.hiding, true);
  if (caught) {
    endGame('caught');
    return;
  }

  field.update(dt, game.speed, stage, () => sound.playKnifeWhistle());

  // Collisions
  const box = turkeyBox();
  if (turkey.invulnerable <= 0 && !turkey.hiding) {
    for (const obstacle of field.obstacles) {
      if (obstacle.hit) continue;
      const ob = obstacleBox(obstacle);
      if (!ob) continue;
      if (boxesOverlap(box, ob)) {
        if (obstacle.kind === 'haystack') {
          // Tripping over hay: no life lost, the farmer closes in.
          obstacle.hit = true;
          farmer.gap = Math.max(20, farmer.gap - 35);
          sound.playStumble();
          game.flashMessage = 'Tripped on the haystack!';
          game.flashTimer = 1.2;
        } else if (obstacle.kind === 'knifeSwing' && turkey.ducking) {
          // Ducking slips under a swinging knife.
          continue;
        } else {
          obstacle.hit = true;
          const reason = obstacle.kind === 'oven'
            ? 'Too hot! The oven singed your tail feathers!'
            : obstacle.kind === 'knifeFall' || obstacle.kind === 'knifeSwing'
              ? 'Ouch! The carving knife nicked you!'
              : 'Smack! Straight into the fence!';
          loseLife(reason);
        }
      }
    }
  }

  // Corn pickup
  for (const corn of field.corns) {
    if (corn.taken) continue;
    const cornBox = { x: corn.x - 10, y: corn.y - 14, width: 20, height: 28 };
    if (boxesOverlap(box, cornBox)) {
      corn.taken = true;
      game.score += 50;
      sound.playCorn();
    }
  }

  // Passed obstacles pay a little
  for (const obstacle of field.obstacles) {
    if (!obstacle.passed && obstacle.x + obstacle.width < TURKEY_X - 24) {
      obstacle.passed = true;
      game.score += 10;
    }
  }

  if (game.distance >= ESCAPE_DISTANCE) {
    game.score += 500;
    endGame('escaped');
  }
}

function drawHud() {
  const stage = stageForDistance(game.distance);
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Top bar
  ctx.fillStyle = 'rgba(43, 26, 14, 0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 58);

  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`SCORE ${Math.floor(game.score)}`, 16, 12);

  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(`${Math.floor(game.distance)} m / ${ESCAPE_DISTANCE} m`, 16, 38);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3c4';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(STAGE_NAMES[stage], CANVAS_WIDTH / 2, 14);
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Gobble Dash — escape Thanksgiving dinner!', CANVAS_WIDTH / 2, 36);

  // Lives as hearts
  ctx.textAlign = 'right';
  ctx.font = '24px Georgia, serif';
  let hearts = '';
  for (let i = 0; i < 3; i += 1) hearts += i < game.lives ? '♥' : '♡';
  ctx.fillStyle = '#ff6b5e';
  ctx.fillText(hearts, CANVAS_WIDTH - 16, 10);

  // Farmer proximity meter
  const meterX = CANVAS_WIDTH - 220;
  const meterY = 40;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(meterX, meterY, 204, 10);
  const danger = 1 - farmer.gap / farmer.maxGap;
  ctx.fillStyle = danger > 0.66 ? '#d43d2a' : danger > 0.33 ? '#f2a541' : '#7da23c';
  ctx.fillRect(meterX, meterY, 204 * danger, 10);
  ctx.fillStyle = '#f5e6c8';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText('FARMER', meterX - 8, meterY - 1);

  // Flash message
  if (game.flashTimer > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.strokeStyle = 'rgba(43,26,14,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText(game.flashMessage, CANVAS_WIDTH / 2, 74);
    ctx.fillText(game.flashMessage, CANVAS_WIDTH / 2, 74);
  }
  ctx.restore();
}

function drawButton(button) {
  ctx.save();
  ctx.fillStyle = button.hover ? '#f2a541' : '#ffd23e';
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(button.x, button.y, button.width, button.height, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a220e';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2 + 1);
  ctx.restore();
}

function pointInButton(point, button) {
  return point.x >= button.x && point.x <= button.x + button.width
    && point.y >= button.y && point.y <= button.y + button.height;
}

function drawTitle() {
  const stage = 1;
  drawScenery(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, stage, game.scrollX, game.time);
  drawTurkey(ctx, 300, GROUND_Y, 1.4, game.runPhase, false, false);
  drawFarmer(ctx, 130, GROUND_Y, 1.25, game.runPhase, true);

  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 8;
  ctx.strokeText('GOBBLE DASH', CANVAS_WIDTH / 2, 78);
  ctx.fillText('GOBBLE DASH', CANVAS_WIDTH / 2, 78);

  ctx.fillStyle = '#fff3c4';
  ctx.font = 'italic bold 26px Georgia, serif';
  ctx.fillText("A Turkey's Great Escape", CANVAS_WIDTH / 2, 152);

  ctx.fillStyle = '#f5e6c8';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Thanksgiving is coming — and YOU are the main course.', CANVAS_WIDTH / 2, 196);
  ctx.fillText('Outrun the farmer, dodge the oven and the carving knives,', CANVAS_WIDTH / 2, 222);
  ctx.fillText('grab the corn, hide in the hay — and reach the woods, 1200 m away.', CANVAS_WIDTH / 2, 246);

  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillStyle = '#ffd23e';
  ctx.fillText('SPACE / ↑ / CLICK — jump      ↓ — duck & hide in hay      R — restart      M — mute', CANVAS_WIDTH / 2, 292);

  game.buttons = [{
    id: 'play', label: '▶  START THE ESCAPE', x: CANVAS_WIDTH / 2 - 150, y: 330, width: 300, height: 56,
  }];
  for (const button of game.buttons) drawButton(button);

  ctx.fillStyle = '#e8c98f';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('3 lives · corn is +50 · every obstacle dodged is +10 · escape at 1200 m for +500', CANVAS_WIDTH / 2, 414);
  if (game.best > 0) {
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`Best escape so far: ${game.best} m`, CANVAS_WIDTH / 2, 442);
  }
  ctx.restore();
}

function drawEnd() {
  const stage = stageForDistance(game.distance);
  drawScenery(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, stage, game.scrollX, game.time);
  if (game.endKind === 'escaped') {
    drawTurkey(ctx, 620, GROUND_Y, 1.4, game.runPhase, false, false);
  } else {
    drawTurkey(ctx, 420, GROUND_Y, 1.2, 0, false, false);
    drawFarmer(ctx, 330, GROUND_Y, 1.25, 0, true);
  }

  ctx.save();
  ctx.fillStyle = 'rgba(43, 26, 14, 0.62)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  if (game.endKind === 'escaped') {
    ctx.fillStyle = '#7da23c';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.strokeStyle = '#2b4a12';
    ctx.lineWidth = 8;
    ctx.strokeText('ESCAPED!', CANVAS_WIDTH / 2, 80);
    ctx.fillText('ESCAPED!', CANVAS_WIDTH / 2, 80);
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'italic bold 24px Georgia, serif';
    ctx.fillText('You made it to the woods — no Thanksgiving dinner this year!', CANVAS_WIDTH / 2, 152);
  } else {
    ctx.fillStyle = '#d43d2a';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.strokeStyle = '#5d130a';
    ctx.lineWidth = 8;
    ctx.strokeText('CAUGHT!', CANVAS_WIDTH / 2, 80);
    ctx.fillText('CAUGHT!', CANVAS_WIDTH / 2, 80);
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'italic bold 24px Georgia, serif';
    ctx.fillText('The farmer got you… the oven was already warm.', CANVAS_WIDTH / 2, 152);
  }

  ctx.fillStyle = '#f5e6c8';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`Final score: ${Math.floor(game.score)}`, CANVAS_WIDTH / 2, 205);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Distance: ${Math.floor(game.distance)} m of ${ESCAPE_DISTANCE} m   ·   Best: ${game.best} m`, CANVAS_WIDTH / 2, 238);
  ctx.fillText(`Lives left: ${game.lives}   ·   Stage reached: ${STAGE_NAMES[stage]}`, CANVAS_WIDTH / 2, 268);

  game.buttons = [{
    id: 'restart', label: '↻  RUN AGAIN', x: CANVAS_WIDTH / 2 - 130, y: 310, width: 260, height: 56,
  }];
  for (const button of game.buttons) drawButton(button);

  ctx.fillStyle = '#e8c98f';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Press R or click RUN AGAIN to try another escape.', CANVAS_WIDTH / 2, 400);
  ctx.restore();
}

function drawPlay() {
  const stage = stageForDistance(game.distance);
  drawScenery(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, stage, game.scrollX, game.time);
  field.draw(ctx, game.time);
  // Farmer runs behind the turkey, gap in pixels behind TURKEY_X
  const farmerX = TURKEY_X - farmer.gap;
  drawFarmer(ctx, farmerX, GROUND_Y, 1.25, game.runPhase, farmer.gap < 90);
  if (turkey.invulnerable > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    drawTurkey(ctx, TURKEY_X, turkey.y, 1.25, game.runPhase, turkey.ducking, turkey.hiding);
    ctx.restore();
  } else {
    drawTurkey(ctx, TURKEY_X, turkey.y, 1.25, game.runPhase, turkey.ducking, turkey.hiding);
  }
  drawHud();
}

function applySceneParam() {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  if (scene === 'play') {
    game.demoMode = true;
    startGame();
    game.demoMode = true;
    game.distance = 520;
    game.score = 2450;
    game.lives = 2;
    field.spawnTimer = 0.4;
    field.cornTimer = 0.2;
    farmer.gap = 150;
    // Seed a mid-run moment: an oven, a fence and corn already on screen.
    field.obstacles.push({
      kind: 'oven', x: 700, y: GROUND_Y - 88, width: 96, height: 88,
      passed: false, hit: false, fallState: 'falling', fallY: 0, swingPhase: 0, telegraph: 0,
    });
    field.obstacles.push({
      kind: 'fence', x: 990, y: GROUND_Y - 46, width: 54, height: 46,
      passed: false, hit: false, fallState: 'falling', fallY: 0, swingPhase: 0, telegraph: 0,
    });
    for (let i = 0; i < 4; i += 1) {
      field.corns.push({ x: 560 + i * 34, y: GROUND_Y - 34, taken: false });
    }
  } else if (scene === 'end') {
    startGame();
    game.distance = 640;
    game.score = 3120;
    game.lives = 0;
    endGame('caught');
  } else if (scene === 'escaped') {
    startGame();
    game.distance = 1200;
    game.score = 9840;
    game.lives = 2;
    endGame('escaped');
  }
}

let lastTimestamp = 0;
function frame(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0.016);
  lastTimestamp = timestamp;
  game.time += dt;

  const pressed = input.consumePressed();
  const pointers = input.consumePointers();

  if (pressed.includes('KeyM')) {
    sound.toggleMute();
  }

  if (game.state === 'title') {
    game.runPhase += dt * 10;
    game.scrollX += 40 * dt;
    for (const point of pointers) {
      for (const button of game.buttons) {
        if (pointInButton(point, button) && button.id === 'play') {
          sound.playClick();
          startGame();
        }
      }
    }
    if (pressed.includes('Space') || pressed.includes('Enter') || pressed.includes('ArrowUp')) {
      startGame();
    }
    drawTitle();
  } else if (game.state === 'play') {
    if (pressed.includes('KeyR')) {
      startGame();
    } else {
      updatePlay(dt, pressed, pointers);
      if (game.state === 'play') drawPlay();
      else drawEnd();
    }
  } else if (game.state === 'end') {
    game.runPhase += dt * 6;
    for (const point of pointers) {
      for (const button of game.buttons) {
        if (pointInButton(point, button) && button.id === 'restart') {
          sound.playClick();
          startGame();
        }
      }
    }
    if (pressed.includes('KeyR') || pressed.includes('Space') || pressed.includes('Enter')) {
      startGame();
    }
    drawEnd();
  }

  requestAnimationFrame(frame);
}

applySceneParam();
requestAnimationFrame(frame);

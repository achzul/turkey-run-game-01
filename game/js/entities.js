// Entities: the things that chase, block and feed the turkey.
// Obstacles: fences, haystacks, ovens and carving knives.
// Corn: the collectible. Farmer: the chaser whose gap decides "caught".
import { drawCarvingKnife, drawCorn, drawFence, drawHaystack, drawOven } from './art.js';

export const OBSTACLE_KINDS = {
  fence: { width: 54, height: 46 },
  haystack: { width: 78, height: 58 },
  oven: { width: 96, height: 88 },
  knifeFall: { width: 70, height: 90 },
  knifeSwing: { width: 90, height: 46 },
};

export class ObstacleField {
  constructor(width, groundY) {
    this.width = width;
    this.groundY = groundY;
    this.obstacles = [];
    this.corns = [];
    this.spawnTimer = 0;
    this.cornTimer = 0;
  }

  reset() {
    this.obstacles = [];
    this.corns = [];
    this.spawnTimer = 1.1;
    this.cornTimer = 0.4;
  }

  pickKind(stage) {
    const roll = Math.random();
    if (stage === 1) {
      if (roll < 0.45) return 'fence';
      if (roll < 0.8) return 'haystack';
      return 'knifeFall';
    }
    if (stage === 2) {
      if (roll < 0.3) return 'fence';
      if (roll < 0.55) return 'haystack';
      if (roll < 0.8) return 'knifeFall';
      return 'knifeSwing';
    }
    if (roll < 0.2) return 'fence';
    if (roll < 0.35) return 'haystack';
    if (roll < 0.6) return 'oven';
    if (roll < 0.82) return 'knifeFall';
    return 'knifeSwing';
  }

  spawnObstacle(stage) {
    const kind = this.pickKind(stage);
    const size = OBSTACLE_KINDS[kind];
    const obstacle = {
      kind,
      x: this.width + 40,
      y: this.groundY - size.height,
      width: size.width,
      height: size.height,
      passed: false,
      hit: false,
      fallState: 'falling',
      fallY: -120,
      swingPhase: Math.random() * Math.PI * 2,
      telegraph: 0,
    };
    if (kind === 'knifeFall') {
      obstacle.y = this.groundY - size.height;
      obstacle.fallY = -140;
      obstacle.telegraph = 0.55;
    }
    if (kind === 'knifeSwing') {
      obstacle.y = this.groundY - 110;
    }
    this.obstacles.push(obstacle);
    return obstacle;
  }

  spawnCornRow() {
    const count = 3 + Math.floor(Math.random() * 3);
    const startX = this.width + 40;
    const arcHigh = Math.random() < 0.5;
    for (let i = 0; i < count; i += 1) {
      const lift = arcHigh ? Math.sin((i / (count - 1)) * Math.PI) * 70 : 0;
      this.corns.push({
        x: startX + i * 34,
        y: this.groundY - 34 - lift,
        taken: false,
      });
    }
  }

  update(dt, speed, stage, onKnifeWhistle) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnObstacle(stage);
      const baseGap = stage === 1 ? 1.15 : stage === 2 ? 0.95 : 0.8;
      this.spawnTimer = baseGap + Math.random() * 0.7;
    }
    this.cornTimer -= dt;
    if (this.cornTimer <= 0) {
      this.spawnCornRow();
      this.cornTimer = 1.6 + Math.random() * 1.4;
    }

    for (const obstacle of this.obstacles) {
      obstacle.x -= speed * dt;
      if (obstacle.kind === 'knifeFall') {
        if (obstacle.telegraph > 0) {
          obstacle.telegraph -= dt;
          if (obstacle.telegraph <= 0 && onKnifeWhistle) onKnifeWhistle();
        } else if (obstacle.fallY < obstacle.y) {
          obstacle.fallY += 900 * dt;
          if (obstacle.fallY >= obstacle.y) obstacle.fallY = obstacle.y;
        }
      }
      if (obstacle.kind === 'knifeSwing') {
        obstacle.swingPhase += dt * 5;
      }
    }
    for (const corn of this.corns) {
      corn.x -= speed * dt;
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -80);
    this.corns = this.corns.filter((c) => c.x > -40);
  }

  draw(ctx, time) {
    for (const corn of this.corns) {
      if (!corn.taken) drawCorn(ctx, corn.x, corn.y, Math.sin(time * 4 + corn.x * 0.05) * 3);
    }
    for (const obstacle of this.obstacles) {
      if (obstacle.kind === 'fence') {
        drawFence(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.kind === 'haystack') {
        drawHaystack(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.kind === 'oven') {
        drawOven(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else if (obstacle.kind === 'knifeFall') {
        if (obstacle.telegraph > 0) {
          // Telegraph: flashing shadow where the knife will land
          ctx.fillStyle = `rgba(212, 61, 42, ${0.25 + 0.25 * Math.sin(time * 18)})`;
          ctx.fillRect(obstacle.x, this.groundY - 6, obstacle.width, 6);
          ctx.fillStyle = '#d43d2a';
          ctx.font = 'bold 16px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.fillText('!', obstacle.x + obstacle.width / 2, this.groundY - 16);
        } else {
          drawCarvingKnife(ctx, obstacle.x, obstacle.fallY, obstacle.width, obstacle.height, 0.5);
        }
      } else if (obstacle.kind === 'knifeSwing') {
        const swing = Math.sin(obstacle.swingPhase) * 0.5;
        drawCarvingKnife(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, swing);
        // Swinging knife hangs from a rope
        ctx.strokeStyle = '#6b4423';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, 0);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + 4);
        ctx.stroke();
      }
    }
  }
}

export class FarmerChase {
  constructor() {
    this.gap = 150;
    this.maxGap = 260;
    this.minGap = 0;
    this.searching = false;
    this.searchTimer = 0;
  }

  reset() {
    this.gap = 150;
    this.searching = false;
    this.searchTimer = 0;
  }

  // Returns true when the farmer catches the turkey.
  update(dt, speed, stumbling, hiding, cleanRunning) {
    if (this.searching) {
      this.searchTimer -= dt;
      this.gap += speed * 0.55 * dt;
      if (this.searchTimer <= 0) {
        this.searching = false;
      }
      return false;
    }
    if (hiding) {
      this.gap += speed * 0.35 * dt;
    } else if (stumbling) {
      this.gap -= 30 * dt;
    } else if (cleanRunning) {
      this.gap += 14 * dt;
    } else {
      this.gap -= 6 * dt;
    }
    if (this.gap > this.maxGap) this.gap = this.maxGap;
    if (this.gap < this.minGap) this.gap = this.minGap;
    return this.gap <= 2;
  }

  startSearching(seconds) {
    this.searching = true;
    this.searchTimer = seconds;
  }
}

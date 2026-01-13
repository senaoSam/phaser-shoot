import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Missile } from '../objects/Missile';
export enum PowerUpType {
  MISSILE = 'missile',         
  AREA_ATTACK = 'area_attack', 
  SPREAD_SHOT = 'spread_shot', 
  TIME_SLOW = 'time_slow',     
  DAMAGE_BOOST = 'damage_boost', 
  CLEAR_BULLETS = 'clear_bullets' 
}
export interface PowerUpState {
  type: PowerUpType;
  level: number; 
}
export class PowerUpManager {
  private scene: Phaser.Scene;
  private player: Phaser.GameObjects.GameObject;
  private powerUps: Map<PowerUpType, PowerUpState> = new Map();
  private missileGroup!: Phaser.Physics.Arcade.Group;
  private missileCooldown: number = 0;
  private missileFireRate: number = 500; 
  private originalMissileFireRate: number = 500; 
  private baseMissilesPerSecond: number = 2; 
  private areaAttackCooldown: number = 0;
  private areaAttackInterval: number = 5000; 
  private originalAreaAttackInterval: number = 5000; 
  private areaAttackType: 'lightning' | 'fire' = 'lightning';
  private clearBulletsCooldown: number = 0;
  private clearBulletsInterval: number = 10000; 
  private testMode: boolean = false;
  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.GameObject) {
    this.scene = scene;
    this.player = player;
    this.missileGroup = scene.physics.add.group({
      classType: Missile,
      maxSize: 100,
      runChildUpdate: false
    });
    this.precreateMissiles();
  }
  private precreateMissiles() {
    for (let i = 0; i < 100; i++) {
      const missile = new Missile(this.scene, -1000, -1000);
      this.missileGroup.add(missile);
      missile.setActive(false);
      missile.setVisible(false);
    }
  }
  addPowerUp(type: PowerUpType) {
    const current = this.powerUps.get(type);
    const maxLevel = this.getPowerUpMaxLevel(type);
    if (current) {
      if (current.level >= maxLevel) {
        return; 
      }
      current.level = Math.min(current.level + 1, maxLevel);
    } else {
      this.powerUps.set(type, { type, level: 1 });
    }
    this.initializePowerUp(type);
    this.updatePowerUp(type);
  }
  private initializePowerUp(type: PowerUpType) {
    const state = this.powerUps.get(type);
    if (!state) return;
    switch (type) {
      case PowerUpType.MISSILE:
        break;
      case PowerUpType.AREA_ATTACK:
        break;
      case PowerUpType.TIME_SLOW:
      case PowerUpType.SPREAD_SHOT:
      case PowerUpType.DAMAGE_BOOST:
      case PowerUpType.CLEAR_BULLETS:
        break;
    }
  }
  private updatePowerUp(type: PowerUpType) {
    const state = this.powerUps.get(type);
    if (!state) return;
    switch (type) {
      case PowerUpType.MISSILE:
        break;
      case PowerUpType.AREA_ATTACK:
        break;
      case PowerUpType.TIME_SLOW:
      case PowerUpType.SPREAD_SHOT:
      case PowerUpType.DAMAGE_BOOST:
      case PowerUpType.CLEAR_BULLETS:
        break;
    }
  }
  private fireMissile() {
    const state = this.powerUps.get(PowerUpType.MISSILE);
    if (!state) return;
    const maxLevel = Math.min(state.level, 8); 
    const enemies = this.scene.data.get('enemies') as Phaser.Physics.Arcade.Group;
    if (!enemies || enemies.children.size === 0) return;
    const player = this.player as any;
    const activeEnemies: any[] = [];
    enemies.children.entries.forEach((enemy: any) => {
      if (enemy.active) {
        activeEnemies.push(enemy);
      }
    });
    if (activeEnemies.length === 0) return;
    activeEnemies.sort((a: any, b: any) => {
      const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
      const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
      return distA - distB;
    });
    const targetEnemy = activeEnemies[0];
    const missile = this.missileGroup.getFirstDead() as Missile;
    if (missile) {
      missile.fire(player.x, player.y - 10, targetEnemy);
      this.scene.events.emit('missile-fired');
    } else {
      console.warn('沒有可用的飛彈，可能需要增加 maxSize');
    }
  }
  private executeAreaAttack() {
    const state = this.powerUps.get(PowerUpType.AREA_ATTACK);
    if (!state) return;
    const player = this.player as any;
    const enemies = this.scene.data.get('enemies') as Phaser.Physics.Arcade.Group;
    if (!enemies) return;
    const baseRadius = 100;
    const radiusPerLevel = 50;
    const maxRadius = 300;
    const radius = Math.min(baseRadius + (state.level - 1) * radiusPerLevel, maxRadius);
    let damage = 50;
    if (state.level >= 5) {
      damage = 50 + (state.level - 5) * 50;
    }
    const damageMultiplier = this.getDamageMultiplier();
    damage = Math.floor(damage * damageMultiplier);
    this.areaAttackType = this.areaAttackType === 'lightning' ? 'fire' : 'lightning';
    this.createAreaAttackEffect(player.x, player.y, radius);
    enemies.children.entries.forEach((enemy: any) => {
      if (enemy.active && enemy.takeDamage) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          enemy.takeDamage(damage);
        }
      }
    });
    this.scene.events.emit('area-attack', this.areaAttackType);
  }
  private createAreaAttackEffect(x: number, y: number, radius: number) {
    if (this.areaAttackType === 'lightning') {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const endX = x + Math.cos(angle) * radius;
        const endY = y + Math.sin(angle) * radius;
        const line = this.scene.add.line(0, 0, x, y, endX, endY, 0x00ffff, 1);
        line.setDepth(GameConfig.DEPTH.PARTICLE);
        line.setLineWidth(3);
        this.scene.tweens.add({
          targets: line,
          alpha: 0,
          duration: 200,
          onComplete: () => line.destroy()
        });
      }
      const circle = this.scene.add.circle(x, y, radius, 0x00ffff, 0.3);
      circle.setDepth(GameConfig.DEPTH.PARTICLE);
      this.scene.tweens.add({
        targets: circle,
        alpha: 0,
        scale: 1.5,
        duration: 300,
        onComplete: () => circle.destroy()
      });
    } else {
      const circle = this.scene.add.circle(x, y, 0, 0xff4400, 0.8);
      circle.setDepth(GameConfig.DEPTH.PARTICLE);
      this.scene.tweens.add({
        targets: circle,
        radius: radius,
        alpha: 0,
        duration: 400,
        onComplete: () => circle.destroy()
      });
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const offsetX = Math.cos(angle) * radius * 0.8;
        const offsetY = Math.sin(angle) * radius * 0.8;
        const flame = this.scene.add.circle(x + offsetX, y + offsetY, 10, 0xff8800, 0.9);
        flame.setDepth(GameConfig.DEPTH.PARTICLE);
        this.scene.tweens.add({
          targets: flame,
          alpha: 0,
          scale: 2,
          duration: 300,
          onComplete: () => flame.destroy()
        });
      }
    }
  }
  getTimeSlowFactor(): number {
    const timeSlowState = this.powerUps.get(PowerUpType.TIME_SLOW);
    if (!timeSlowState) {
      return 1.0; 
    }
    const level = Math.min(timeSlowState.level, 5); 
    return 1.0 - (level * 0.1); 
  }
  getDamageMultiplier(): number {
    const state = this.powerUps.get(PowerUpType.DAMAGE_BOOST);
    if (!state) return 1.0;
    return 1.5 + state.level * 0.5;
  }
  hasDamageBoost(): boolean {
    return this.powerUps.has(PowerUpType.DAMAGE_BOOST);
  }
  update(_time: number, delta: number) {
    const missileState = this.powerUps.get(PowerUpType.MISSILE);
    if (missileState) {
      const maxLevel = Math.min(missileState.level, 8);
      const missilesPerSecond = this.baseMissilesPerSecond + (maxLevel - 1);
      if (!this.testMode) {
        this.missileFireRate = 1000 / missilesPerSecond; 
      }
      this.missileCooldown -= delta;
      if (this.missileCooldown <= 0) {
        this.fireMissile();
        this.missileCooldown = this.missileFireRate;
      }
      this.missileGroup.children.entries.forEach((missile: any) => {
        if (missile.active && missile.update) {
          missile.update();
        }
      });
    }
    const areaState = this.powerUps.get(PowerUpType.AREA_ATTACK);
    if (areaState) {
      if (areaState.level >= 10 && !this.testMode) {
        this.areaAttackInterval = 3000; 
      } else if (!this.testMode) {
        this.areaAttackInterval = this.originalAreaAttackInterval; 
      }
      this.areaAttackCooldown -= delta;
      if (this.areaAttackCooldown <= 0) {
        this.executeAreaAttack();
        this.areaAttackCooldown = this.areaAttackInterval;
      }
    }
    const clearBulletsState = this.powerUps.get(PowerUpType.CLEAR_BULLETS);
    if (clearBulletsState) {
      const intervals = [10000, 8000, 6000];
      const level = Math.min(clearBulletsState.level, 3);
      this.clearBulletsInterval = intervals[level - 1];
      this.clearBulletsCooldown -= delta;
      if (this.clearBulletsCooldown < 0) {
        this.clearBulletsCooldown = 0;
      }
    } else {
      this.clearBulletsCooldown = 0;
    }
  }
  getPowerUpStates(): PowerUpState[] {
    return Array.from(this.powerUps.values());
  }
  getPowerUpState(type: PowerUpType | string): PowerUpState | null {
    return this.powerUps.get(type as PowerUpType) || null;
  }
  getPowerUpMaxLevel(type: PowerUpType): number {
    switch (type) {
      case PowerUpType.MISSILE:
        return 8; 
      case PowerUpType.AREA_ATTACK:
        return 10; 
      case PowerUpType.SPREAD_SHOT:
        return 5; 
      case PowerUpType.TIME_SLOW:
        return 5; 
      case PowerUpType.DAMAGE_BOOST:
        return 5; 
      case PowerUpType.CLEAR_BULLETS:
        return 3; 
      default:
        return Infinity;
    }
  }
  getMissileGroup(): Phaser.Physics.Arcade.Group {
    return this.missileGroup;
  }
  toggleTestMode() {
    this.testMode = !this.testMode;
    if (this.testMode) {
      this.missileFireRate = 2000;
      this.areaAttackInterval = 2000;
      this.missileCooldown = 0;
      this.areaAttackCooldown = 0;
    } else {
      this.missileFireRate = this.originalMissileFireRate;
      this.areaAttackInterval = this.originalAreaAttackInterval;
    }
    return this.testMode;
  }
  isTestMode(): boolean {
    return this.testMode;
  }
  canClearBullets(): boolean {
    const clearBulletsState = this.powerUps.get(PowerUpType.CLEAR_BULLETS);
    if (!clearBulletsState) {
      return false;
    }
    return this.clearBulletsCooldown <= 0;
  }
  clearBullets(): void {
    const clearBulletsState = this.powerUps.get(PowerUpType.CLEAR_BULLETS);
    if (!clearBulletsState) {
      return;
    }
    if (this.clearBulletsCooldown > 0) {
      return; 
    }
    this.scene.events.emit('clear-bullets');
    const intervals = [10000, 8000, 6000];
    const level = Math.min(clearBulletsState.level, 3);
    this.clearBulletsInterval = intervals[level - 1];
    this.clearBulletsCooldown = this.clearBulletsInterval;
  }
  getClearBulletsCooldown(): number {
    return Math.max(0, this.clearBulletsCooldown);
  }
  getClearBulletsInterval(): number {
    return this.clearBulletsInterval;
  }
  destroy() {
    if (this.missileGroup) {
      this.missileGroup.destroy(true);
    }
  }
}
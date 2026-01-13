import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number = GameConfig.BULLET_HELL.BASE_SPEED;
  private hasHitPlayer: boolean = false; 
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet-enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDepth(GameConfig.DEPTH.BULLET_ENEMY);
    this.setActive(false);
    this.setVisible(false);
  }
  markHitPlayer() {
    this.hasHitPlayer = true;
  }
  getHasHitPlayer(): boolean {
    return this.hasHitPlayer;
  }
  fire(x: number, y: number, velocityX: number, velocityY: number, speed?: number) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.hasHitPlayer = false; 
    if (this.body) {
      this.body.enable = true;
    }
    if (speed) {
      this.speed = speed;
    }
    if (velocityY < 0) {
      velocityY = -velocityY;
      velocityX = -velocityX;
    }
    if (velocityY === 0) {
      velocityY = 1; 
    }
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (length > 0) {
      const normalizedX = (velocityX / length) * this.speed;
      let normalizedY = (velocityY / length) * this.speed;
      if (normalizedY < 0) {
        console.warn(`子彈速度異常（正規化後仍為負）: vy=${normalizedY}, 強制反轉`);
        normalizedY = -normalizedY; 
      }
      if (normalizedY === 0) {
        normalizedY = this.speed; 
      }
      this.setAlpha(1);
      (this as any)._originalSpeed = {
        x: normalizedX,
        y: normalizedY
      };
      this.setVelocity(normalizedX, normalizedY);
    } else {
      const defaultSpeed = this.speed;
      (this as any)._originalSpeed = {
        x: 0,
        y: defaultSpeed
      };
      this.setVelocity(0, defaultSpeed);
    }
  }
  update() {
    if (
      this.x < -50 || 
      this.x > GameConfig.WIDTH + 50 ||
      this.y < -50 || 
      this.y > GameConfig.HEIGHT + 50
    ) {
      this.kill();
    }
  }
  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    if (this.body) {
      this.body.enable = false;
    }
  }
}
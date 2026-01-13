import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
  private hasHit: boolean = false; 
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet-player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(GameConfig.DEPTH.BULLET_PLAYER);
    this.setActive(false);
    this.setVisible(false);
    this.setOrigin(0.5, 0.5);
  }
  fire(x: number, y: number, _maxPenetration: number = 0, velocityX?: number, velocityY?: number, scale?: number, tint?: number) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.hasHit = false; 
    const finalScale = scale !== undefined ? scale : 1.0;
    this.setScale(finalScale, finalScale);
    if (this.body) {
      const baseSize = 8;
      const newSize = baseSize * finalScale;
      this.body.setSize(newSize, newSize);
    }
    if (tint !== undefined) {
      this.setTint(tint);
    } else {
      this.clearTint();
    }
    if (velocityX !== undefined && velocityY !== undefined) {
      this.setVelocity(velocityX, velocityY);
    } else {
      this.setVelocity(0, -GameConfig.BULLET.SPEED);
    }
  }
  update() {
    if (this.y < -10 || this.y > GameConfig.HEIGHT + 10) {
      this.kill();
    }
  }
  kill() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.hasHit = false; 
  }
  getHasHit(): boolean {
    return this.hasHit;
  }
  markAsHit() {
    this.hasHit = true;
  }
}
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class TreasureBox extends Phaser.Physics.Arcade.Sprite {
  private fallSpeed: number = 50; 
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'treasure-box');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDepth(GameConfig.DEPTH.PLAYER - 1); 
    scene.time.delayedCall(0, () => {
      if (this.body) {
        this.body.setCircle(12); 
        this.setVelocity(0, this.fallSpeed);
      }
    });
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.5 },
      duration: 500,
      repeat: -1,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    scene.tweens.add({
      targets: this,
      rotation: { from: 0, to: Math.PI * 2 },
      duration: 2000,
      repeat: -1,
      ease: 'Linear'
    });
  }
  update() {
    if (!this.active) return;
    const centerY = GameConfig.HEIGHT / 2;
    if (this.y < centerY) {
      if (this.body && this.body.enable) {
        this.setVelocityX(0); 
        this.setVelocityY(this.fallSpeed); 
      }
    } else {
      if (this.body && this.body.enable) {
        this.setVelocity(0, 0); 
      }
    }
    if (this.y > GameConfig.HEIGHT + 50) {
      this.destroy();
    }
  }
  destroy() {
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this);
    }
    super.destroy();
  }
}
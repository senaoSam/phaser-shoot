import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class Missile extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 400;
  private target: Phaser.GameObjects.GameObject | null = null;
  private sceneRef: Phaser.Scene;
  private trailParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet-player'); 
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.sceneRef = scene;
    this.setOrigin(0.5, 0.5);
    this.setDepth(GameConfig.DEPTH.BULLET_PLAYER);
    this.setActive(false);
    this.setVisible(false);
    this.setTint(0xff4400); 
    this.setScale(2.0, 2.0); 
    this.setAlpha(1);
    this.createTrail();
  }
  private createTrail() {
    this.trailParticles = this.sceneRef.add.particles(-1000, -1000, 'particle', {
      speed: { min: 20, max: 40 },
      scale: { start: 0.8, end: 0 },
      tint: [0xff4400, 0xff8800, 0xffff00],
      lifespan: 150,
      frequency: 5,
      follow: this,
      followOffset: { x: 0, y: 5 }
    });
    this.trailParticles.setDepth(GameConfig.DEPTH.BULLET_PLAYER - 1);
    this.trailParticles.stop(); 
    this.trailParticles.setVisible(false); 
  }
  fire(x: number, y: number, target?: Phaser.GameObjects.GameObject) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.target = target || null;
    if (this.trailParticles) {
      this.trailParticles.setVisible(true); 
      this.trailParticles.start();
    }
    if (!target) {
      this.setVelocity(0, -this.speed);
      return;
    }
    const dx = (target as any).x - x;
    const dy = (target as any).y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      this.setVelocity((dx / distance) * this.speed, (dy / distance) * this.speed);
    } else {
      this.setVelocity(0, -this.speed);
    }
  }
  update() {
    if (!this.active) return;
    if (this.target && (this.target as any).active) {
      const dx = (this.target as any).x - this.x;
      const dy = (this.target as any).y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const currentVx = this.body!.velocity.x;
        const currentVy = this.body!.velocity.y;
        const targetVx = (dx / distance) * this.speed;
        const targetVy = (dy / distance) * this.speed;
        const lerpFactor = 0.1;
        const newVx = currentVx + (targetVx - currentVx) * lerpFactor;
        const newVy = currentVy + (targetVy - currentVy) * lerpFactor;
        this.setVelocity(newVx, newVy);
      }
    }
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
    this.target = null;
    if (this.trailParticles) {
      this.trailParticles.stop();
      this.trailParticles.setVisible(false);
    }
  }
  destroy() {
    if (this.trailParticles) {
      this.trailParticles.destroy();
      this.trailParticles = null;
    }
    super.destroy();
  }
}
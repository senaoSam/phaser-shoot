import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class ParticleManager {
  private scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  createExplosion(x: number, y: number, intensity: number = 1) {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50 * intensity, max: 150 * intensity },
      scale: { start: 1 * intensity, end: 0 },
      lifespan: 500,
      quantity: Math.floor(15 * intensity),
      tint: [0xffff00, 0xff6600, 0xff0000],
      blendMode: 'ADD',
      emitting: true
    });
    particles.setDepth(GameConfig.DEPTH.PARTICLE);
    this.scene.time.delayedCall(100, () => {
      particles.stop();
    });
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }
  createHit(x: number, y: number) {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: [0x00ffff, 0x0088ff],
      blendMode: 'ADD',
      emitting: true
    });
    particles.setDepth(GameConfig.DEPTH.PARTICLE);
    this.scene.time.delayedCall(50, () => {
      particles.stop();
    });
    this.scene.time.delayedCall(400, () => {
      particles.destroy();
    });
  }
  createCollect(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const particle = this.scene.add.circle(x, y, 3, 0x00ff00, 1);
      particle.setDepth(GameConfig.DEPTH.PARTICLE);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scale: 0,
        duration: 400,
        onComplete: () => particle.destroy()
      });
    }
  }
  createEnergyWave(x: number, y: number, radius: number = 50) {
    const wave = this.scene.add.circle(x, y, 0, 0x00ffff, 0.5);
    wave.setStrokeStyle(2, 0x00ffff, 1);
    wave.setDepth(GameConfig.DEPTH.PARTICLE);
    this.scene.tweens.add({
      targets: wave,
      radius: radius,
      alpha: 0,
      duration: 500,
      onComplete: () => wave.destroy()
    });
  }
  createBulletTrail(x: number, y: number, color: number = 0x00ffff) {
    const trail = this.scene.add.circle(x, y, 2, color, 0.6);
    trail.setDepth(GameConfig.DEPTH.PARTICLE);
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }
}
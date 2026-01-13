import Phaser from 'phaser';
import { EnemyBullet } from '../objects/EnemyBullet';
export class BulletPattern {
  private patternAngle: number = 0; 
  straight(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    count: number = 3
  ) {
    const spacing = 20;
    const startX = source.x - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const bullet = bulletGroup.get(startX + i * spacing, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(startX + i * spacing, source.y, 0, 1);
      }
    }
  }
  fan(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    count: number = 5,
    spreadAngle: number = Math.PI / 4
  ) {
    const baseAngle = Math.PI / 2;
    const startAngle = baseAngle - spreadAngle / 2;
    const angleStep = spreadAngle / (count - 1);
    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      const velocityX = Math.cos(angle);
      const velocityY = Math.sin(angle);
      const finalVelocityY = Math.abs(velocityY); 
      const finalVelocityX = velocityX * (velocityY >= 0 ? 1 : -1); 
      const bullet = bulletGroup.get(source.x, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(source.x, source.y, finalVelocityX, finalVelocityY);
      }
    }
  }
  spiral(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    count: number = 8,
    time: number = 0
  ) {
    const angleStep = (Math.PI * 2) / count;
    const baseAngle = Math.PI / 2 + this.patternAngle + (time * 0.001);
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + angleStep * i;
      const velocityX = Math.cos(angle);
      const velocityY = Math.sin(angle);
      const finalVelocityY = Math.abs(velocityY); 
      const finalVelocityX = velocityX * (velocityY >= 0 ? 1 : -1); 
      const bullet = bulletGroup.get(source.x, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(source.x, source.y, finalVelocityX, finalVelocityY);
      }
    }
    this.patternAngle += 0.1;
  }
  homing(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    targetX: number,
    targetY: number,
    count: number = 3
  ) {
    const dx = targetX - source.x;
    const dy = targetY - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;
    const spread = 0.2; 
    const spacing = spread / (count - 1);
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spacing;
      const baseAngle = Math.atan2(dy, dx);
      const angle = baseAngle + offset;
      let velocityX = Math.cos(angle);
      let velocityY = Math.sin(angle);
      if (dy > 0 && velocityY < 0) {
        velocityY = -velocityY;
        velocityX = -velocityX;
      }
      const bullet = bulletGroup.get(source.x, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(source.x, source.y, velocityX, velocityY);
      }
    }
  }
  circle(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    count: number = 12
  ) {
    const angleStep = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const angle = angleStep * i;
      const velocityX = Math.cos(angle);
      const velocityY = Math.sin(angle);
      const finalVelocityY = Math.abs(velocityY); 
      const finalVelocityX = velocityX * (velocityY >= 0 ? 1 : -1); 
      const bullet = bulletGroup.get(source.x, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(source.x, source.y, finalVelocityX, finalVelocityY);
      }
    }
  }
  wave(
    source: any,
    bulletGroup: Phaser.Physics.Arcade.Group,
    count: number = 5,
    waveAmplitude: number = 50,
    time: number = 0
  ) {
    const spacing = 30;
    const startX = source.x - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const x = startX + i * spacing;
      const waveOffset = Math.sin(time * 0.01 + i) * waveAmplitude;
      const velocityX = waveOffset * 0.01;
      const velocityY = 1;
      const bullet = bulletGroup.get(x, source.y) as EnemyBullet;
      if (bullet) {
        bullet.fire(x, source.y, velocityX, velocityY);
      }
    }
  }
}
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { BulletPattern } from '../utils/BulletPattern';
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private speed: number;
  private sceneRef: Phaser.Scene;
  private patternType: number;
  private bulletPattern!: BulletPattern;
  private shootCooldown: number = 0;
  private shootInterval: number = 2000; 
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  constructor(scene: Phaser.Scene, x: number, y: number, patternType: number = 0, health: number = GameConfig.ENEMY.BASE_HEALTH) {
    super(scene, x, y, 'enemy');
    this.sceneRef = scene;
    this.patternType = patternType;
    this.bulletPattern = new BulletPattern();
    if (!scene.textures.exists('enemy')) {
      console.warn('敵人 texture 不存在，正在創建臨時 texture');
      const graphics = scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xff0000);
      graphics.fillRect(0, 0, 30, 30);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeRect(0, 0, 30, 30);
      graphics.generateTexture('enemy', 30, 30);
      graphics.destroy();
    }
    this.maxHealth = health;
    this.health = this.maxHealth;
    this.speed = GameConfig.ENEMY.BASE_SPEED;
    this.setOrigin(0.5, 0.5);
    this.setScale(1, 1);
    this.setRotation(0);
    this.setAlpha(1);
    this.setTint(0xffffff); 
    this.setDepth(GameConfig.DEPTH.ENEMY);
    scene.add.existing(this);
    this.setActive(true);
    this.setVisible(true);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(false);
    if (this.body) {
      this.body.setSize(30, 30);
      this.body.setOffset(0, 0);
    }
    scene.time.delayedCall(0, () => {
      this.setupMovement();
    });
    this.shootCooldown = Phaser.Math.Between(500, this.shootInterval);
  }
  setBulletGroup(bulletGroup: Phaser.Physics.Arcade.Group) {
    this.enemyBullets = bulletGroup;
  }
  private setupMovement() {
    if (!this.body) {
      console.warn('敵人物理體尚未創建，延遲設置速度');
      this.sceneRef.time.delayedCall(10, () => {
        this.setupMovement();
      });
      return;
    }
    const movePattern = Phaser.Math.Between(0, 2);
    if (movePattern === 0) {
      this.setVelocity(0, this.speed);
    } else if (movePattern === 1) {
      this.setVelocity(Phaser.Math.Between(-50, 50), this.speed);
    } else {
      this.setVelocity(Phaser.Math.Between(-80, 80), this.speed);
    }
  }
  update(_time: number, delta: number) {
    if (!this.active) return; 
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }
    if (this.shootCooldown <= 0 && this.enemyBullets && this.y > 0) {
      this.shoot();
      this.shootCooldown = this.shootInterval;
    }
    if (this.y > GameConfig.HEIGHT + 50) {
      this.destroy();
      return;
    }
    if (this.x < 0 || this.x > GameConfig.WIDTH) {
      this.setVelocityX(-this.body!.velocity.x);
    }
  }
  private shoot() {
    if (!this.enemyBullets || !this.active) return;
    const player = this.sceneRef.data.get('player');
    if (!player || (player as any).isDead) return;
    const playerX = player.x;
    const playerY = player.y;
    switch (this.patternType % 5) {
      case 0:
        this.bulletPattern.straight(this, this.enemyBullets, 3);
        break;
      case 1:
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        this.shootFanTowardsPlayer(playerX, playerY, 5, Math.PI / 3);
        break;
      case 2:
        this.bulletPattern.homing(this, this.enemyBullets, playerX, playerY, 3);
        break;
      case 3:
        this.bulletPattern.circle(this, this.enemyBullets, 8);
        break;
      case 4:
        this.bulletPattern.spiral(this, this.enemyBullets, 8, this.sceneRef.time.now);
        break;
      default:
        this.bulletPattern.straight(this, this.enemyBullets, 3);
        break;
    }
  }
  private shootFanTowardsPlayer(targetX: number, targetY: number, count: number, spreadAngle: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;
    const baseAngle = Math.atan2(dy, dx);
    const startAngle = baseAngle - spreadAngle / 2;
    const angleStep = spreadAngle / (count - 1);
    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      const velocityX = Math.cos(angle);
      let velocityY = Math.sin(angle);
      if (dy > 0 && velocityY < 0) {
        velocityY = -velocityY;
      }
      const bullet = this.enemyBullets.get(this.x, this.y) as any;
      if (bullet) {
        bullet.fire(this.x, this.y, velocityX, velocityY);
      }
    }
  }
  takeDamage(amount: number = 1) {
    if (!this.active) return; 
    this.health -= amount;
    this.sceneRef.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (this.active) {
          this.setAlpha(1);
        }
      }
    });
    if (this.health <= 0) {
      this.die();
    }
  }
  private die() {
    if (!this.active) return; 
    this.setActive(false);
    this.sceneRef.events.emit('enemy-killed', this);
    this.createExplosion();
    this.sceneRef.time.delayedCall(100, () => {
      if (this.scene && this.scene.children.exists(this)) {
        this.destroy();
      }
    });
  }
  private createExplosion() {
  }
  getHealth(): number {
    return this.health;
  }
  getMaxHealth(): number {
    return this.maxHealth;
  }
  destroy() {
    super.destroy();
  }
}
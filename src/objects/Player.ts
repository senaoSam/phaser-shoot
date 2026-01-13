import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { PlayerBullet } from './PlayerBullet';
import { PowerUpManager, PowerUpType } from '../utils/PowerUpManager';
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private shootCooldown: number = 0;
  private isDead: boolean = false;
  private bullets!: Phaser.Physics.Arcade.Group;
  private sceneRef: Phaser.Scene;
  private powerUpManager!: PowerUpManager;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    this.sceneRef = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(GameConfig.DEPTH.PLAYER);
    this.setOrigin(0.5, 0.5);
    this.setVisible(true);
    this.setAlpha(1);
    scene.time.delayedCall(0, () => {
      if (this.body) {
        this.body.setCircle(12); 
      }
    });
    this.bullets = scene.physics.add.group({
      classType: PlayerBullet,
      maxSize: 200, 
      runChildUpdate: true
    });
    this.setupInput();
    this.powerUpManager = new PowerUpManager(scene, this);
    scene.data.set('playerBullets', this.bullets);
  }
  private setupInput() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }
  update(time: number, delta: number) {
    if (this.isDead) {
      return;
    }
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }
    this.powerUpManager.update(time, delta);
    this.handleMovement();
    this.handleShooting();
  }
  private handleMovement() {
    const speed = GameConfig.PLAYER.SPEED;
    let velocityX = 0;
    let velocityY = 0;
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = speed;
    }
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = speed;
    }
    this.setVelocity(velocityX, velocityY);
    if (velocityX !== 0 || velocityY !== 0) {
      this.setRotation(Math.atan2(velocityY, velocityX) + Math.PI / 2);
    }
  }
  private handleShooting() {
    if (this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = GameConfig.PLAYER.SHOOT_COOLDOWN;
    }
  }
  private shoot() {
    const powerUpManager = this.powerUpManager;
    if (!powerUpManager) return;
    const spreadState = powerUpManager.getPowerUpState(PowerUpType.SPREAD_SHOT);
    const spreadLevel = spreadState ? spreadState.level : 0;
    const hasDamageBoost = powerUpManager.hasDamageBoost();
    const bulletCount = spreadLevel > 0 ? 1 + spreadLevel * 2 : 1;
    const baseAngle = -Math.PI / 2; 
    const spreadAngle = spreadLevel > 0 ? Math.PI / 6 : 0; 
    const angleStep = spreadLevel > 0 ? spreadAngle / (bulletCount - 1) : 0;
    for (let i = 0; i < bulletCount; i++) {
      let bullet = this.bullets.getFirstDead() as PlayerBullet;
      if (!bullet) {
        bullet = this.bullets.get(this.x, this.y - 20) as PlayerBullet;
      }
      if (!bullet) {
        console.warn(`無法獲取子彈，當前子彈池大小: ${this.bullets.children.size}/${this.bullets.maxSize}`);
        continue; 
      }
      const angle = bulletCount > 1 
        ? baseAngle - spreadAngle / 2 + angleStep * i 
        : baseAngle;
      const speed = GameConfig.BULLET.SPEED;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed; 
      let bulletScale = 1.0;
      let bulletTint: number | undefined = undefined;
      if (hasDamageBoost) {
        bulletScale = 2.0;
        bulletTint = 0x0088ff; 
      }
      bullet.fire(this.x, this.y - 20, 0, velocityX, velocityY, bulletScale, bulletTint);
    }
    this.sceneRef.events.emit('player-shoot');
  }
  takeDamage() {
    if (this.isDead) {
      return;
    }
    this.die();
  }
  private die() {
    if (this.isDead) return;
    this.isDead = true;
    this.setVelocity(0, 0);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => {
        this.setAlpha(0.3);
        this.setScale(1);
      }
    });
    this.scene.events.emit('player-death');
  }
  getIsDead(): boolean {
    return this.isDead;
  }
  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
  getPowerUpManager(): PowerUpManager {
    return this.powerUpManager;
  }
  destroy() {
    if (this.powerUpManager) {
      this.powerUpManager.destroy();
    }
    this.bullets.destroy(true);
    super.destroy();
  }
}
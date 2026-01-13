import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { EnemyBullet } from '../objects/EnemyBullet';
import { TreasureBox } from '../objects/TreasureBox';
import { ParticleManager } from '../utils/ParticleManager';
import { AudioManager } from '../utils/AudioManager';
import { PowerUpType } from '../utils/PowerUpManager';
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private treasureBoxes!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private comboTimeout: number = 2000; 
  private treasureBoxCount: number = 0; 
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private powerUpTexts: Phaser.GameObjects.Text[] = [];
  private enemySpawnTimer: number = 0;
  private gameTime: number = 0; 
  private cameraShakeIntensity: number = 0;
  private particleManager!: ParticleManager;
  private audioManager!: AudioManager;
  constructor() {
    super({ key: 'GameScene' });
  }
  create() {
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.enemySpawnTimer = 0;
    this.gameTime = 0; 
    this.treasureBoxCount = 0; 
    this.player = new Player(this, GameConfig.WIDTH / 2, GameConfig.HEIGHT - 100);
    this.data.set('player', this.player);
    this.enemies = this.physics.add.group();
    this.data.set('enemies', this.enemies);
    this.enemyBullets = this.physics.add.group({
      classType: EnemyBullet,
      maxSize: 200, 
      runChildUpdate: false 
    });
    this.treasureBoxes = this.physics.add.group({
      classType: TreasureBox,
      maxSize: 50,
      runChildUpdate: false
    });
    for (let i = 0; i < 20; i++) {
      const box = new TreasureBox(this, -1000, -1000);
      this.treasureBoxes.add(box);
      box.setActive(false);
      box.setVisible(false);
    }
    this.particleManager = new ParticleManager(this);
    this.audioManager = new AudioManager(this);
    this.data.set('particleManager', this.particleManager);
    this.data.set('enemyBullets', this.enemyBullets);
    this.createUI();
    this.powerUpTexts = [];
    this.setupCollisions();
    this.setupEvents();
    this.events.on('player-shoot', () => {
      this.audioManager.playSound('shoot', 0.3);
    });
    this.setupInput();
    this.createBackground();
  }
  private createUI() {
    this.scoreText = this.add.text(10, 10, '分數: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.scoreText.setDepth(GameConfig.DEPTH.UI);
    this.comboText = this.add.text(10, 40, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.comboText.setDepth(GameConfig.DEPTH.UI);
    this.comboText.setVisible(false);
  }
  private setupCollisions() {
    if (this.player && this.player.body) {
      this.player.body.enable = true;
      this.player.body.checkCollision.none = false;
    }
    this.physics.add.overlap(
      this.player.getBullets(),
      this.enemies,
      (bullet: any, enemy: any) => {
        if (!bullet || !bullet.active || !enemy || !enemy.active) {
          return;
        }
        this.particleManager.createHit(enemy.x, enemy.y);
        this.audioManager.playSound('hit');
        const powerUpManager = this.player.getPowerUpManager();
        const damageMultiplier = powerUpManager.getDamageMultiplier();
        const finalDamage = Math.floor(GameConfig.BULLET.DAMAGE * damageMultiplier);
        enemy.takeDamage(finalDamage);
        if (bullet.kill) {
          bullet.kill();
        } else {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.enemies,
      this.player,
      (enemy: any) => {
        if (!enemy || !enemy.active || !this.player || !this.player.active) {
          return;
        }
        if (this.player.getIsDead && this.player.getIsDead()) {
          return;
        }
        enemy.takeDamage(999);
        this.player.takeDamage();
        this.cameraShake(10, 300);
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.enemyBullets,
      this.player,
      (bullet: any, _player: any) => {
        if (!bullet || !bullet.active || !this.player || !this.player.active) {
          return;
        }
        if (bullet.body && !bullet.body.enable) {
          return;
        }
        if (this.player.getIsDead && this.player.getIsDead()) {
          return;
        }
        this.player.takeDamage();
        this.cameraShake(8, 200);
        this.particleManager.createHit(this.player.x, this.player.y);
        this.audioManager.playSound('hit');
        if (bullet.kill) {
          bullet.kill();
        } else {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      },
      undefined,
      this
    );
    const missileGroup = this.player.getPowerUpManager().getMissileGroup();
    this.physics.add.overlap(
      missileGroup,
      this.enemies,
      (missile: any, enemy: any) => {
        if (!missile || !missile.active || !enemy || !enemy.active) {
          return;
        }
        if (missile.kill) {
          missile.kill();
        }
        this.particleManager.createHit(enemy.x, enemy.y);
        this.audioManager.playSound('hit');
        const powerUpManager = this.player.getPowerUpManager();
        const damageMultiplier = powerUpManager.getDamageMultiplier();
        const missileBaseDamage = GameConfig.BULLET.DAMAGE * 2;
        const finalDamage = Math.floor(missileBaseDamage * damageMultiplier);
        enemy.takeDamage(finalDamage);
      },
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.treasureBoxes,
      (_player: any, box: any) => {
        if (!box || !box.active || !this.player || !this.player.active) {
          return;
        }
        if (this.player.getIsDead && this.player.getIsDead()) {
          return;
        }
        this.collectTreasureBox(box);
      },
      undefined,
      this
    );
  }
  private setupEvents() {
    this.events.on('player-death', () => {
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', {
          score: this.score,
          combo: this.combo
        });
      });
    });
    this.events.on('enemy-killed', (enemy: Enemy) => {
      this.addScore(GameConfig.SCORE.ENEMY_KILL);
      this.addCombo();
      this.particleManager.createExplosion(enemy.x, enemy.y, 1.5);
      this.audioManager.playSound('explosion');
      this.spawnTreasureBox(enemy.x, enemy.y);
    });
    this.events.on('clear-bullets', () => {
      this.clearAllEnemyBullets();
    });
  }
  private setupInput() {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      const powerUpManager = this.player.getPowerUpManager();
      const powerUpTypes: Array<{ type: PowerUpType; maxLevel: number }> = [
        { type: PowerUpType.MISSILE, maxLevel: 8 },
        { type: PowerUpType.AREA_ATTACK, maxLevel: 10 },
        { type: PowerUpType.SPREAD_SHOT, maxLevel: 5 },
        { type: PowerUpType.TIME_SLOW, maxLevel: 5 },
        { type: PowerUpType.DAMAGE_BOOST, maxLevel: 5 },
        { type: PowerUpType.CLEAR_BULLETS, maxLevel: 3 }
      ];
      powerUpTypes.forEach(({ type, maxLevel }) => {
        const currentState = powerUpManager.getPowerUpState(type);
        const currentLevel = currentState ? currentState.level : 0;
        if (currentLevel < maxLevel) {
          for (let i = currentLevel; i < maxLevel; i++) {
            powerUpManager.addPowerUp(type);
          }
        }
      });
      this.updatePowerUpUI();
      const text = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 
        '所有效果已滿級！',
        {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 3
        });
      text.setOrigin(0.5, 0.5);
      text.setDepth(GameConfig.DEPTH.UI);
      this.time.delayedCall(2000, () => {
        text.destroy();
      });
    });
  }
  private updatePowerUpUI() {
    const states = this.player.getPowerUpManager().getPowerUpStates();
    const powerUpManager = this.player.getPowerUpManager();
    this.powerUpTexts.forEach(text => text.destroy());
    this.powerUpTexts = [];
    if (states.length === 0) {
      return;
    }
    const startX = 10; 
    const startY = 100; 
    const lineHeight = 30; 
    states.forEach((state, index) => {
      let name = '';
      const maxLevel = powerUpManager.getPowerUpMaxLevel(state.type);
      switch (state.type) {
        case 'missile':
          name = '飛彈';
          break;
        case 'area_attack':
          name = '範圍攻擊';
          break;
        case 'spread_shot':
          name = '散射射擊';
          break;
        case 'time_slow':
          name = '時間緩慢';
          break;
        case 'damage_boost':
          name = '傷害加成';
          break;
        case 'clear_bullets':
          name = '清除子彈';
          break;
        default:
          return; 
      }
      let displayText = '';
      if (maxLevel !== Infinity) {
        displayText = `${name} x${state.level}/${maxLevel}`;
      } else {
        displayText = `${name} x${state.level}`;
      }
      const text = this.add.text(startX, startY + index * lineHeight, displayText, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      });
      text.setDepth(GameConfig.DEPTH.UI);
      text.setScrollFactor(0, 0);
      text.setOrigin(0, 0);
      this.powerUpTexts.push(text);
    });
  }
  private createBackground() {
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GameConfig.WIDTH);
      const y = Phaser.Math.Between(0, GameConfig.HEIGHT);
      const star = this.add.circle(x, y, 1, 0xffffff, 0.5);
      star.setDepth(GameConfig.DEPTH.BACKGROUND);
      this.tweens.add({
        targets: star,
        y: y + GameConfig.HEIGHT + 50,
        duration: Phaser.Math.Between(3000, 8000),
        repeat: -1,
        onRepeat: () => {
          star.y = -50;
        }
      });
    }
  }
  update(time: number, delta: number) {
    this.gameTime += delta;
    if (this.player && this.player.body) {
      this.player.body.enable = true;
      this.player.body.checkCollision.none = false;
    }
    this.player.update(time, delta);
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.active && enemy.update) {
        enemy.update(time, delta);
      }
    });
    this.player.getBullets().children.entries.forEach((bullet: any) => {
      if (bullet.active && bullet.update) {
        bullet.update();
      }
    });
    this.treasureBoxes.children.entries.forEach((box: any) => {
      if (box.active && box.update) {
        box.update();
      }
    });
    const powerUpManager = this.player.getPowerUpManager();
    const timeSlowFactor = powerUpManager.getTimeSlowFactor();
    this.enemyBullets.children.entries.forEach((bullet: any) => {
      if (bullet.active && bullet.update) {
        bullet.update();
        if (bullet.body && bullet.body.enable && bullet._originalSpeed) {
          bullet.setVelocity(
            bullet._originalSpeed.x * timeSlowFactor,
            bullet._originalSpeed.y * timeSlowFactor
          );
        }
      }
    });
    if (powerUpManager.canClearBullets()) {
      powerUpManager.clearBullets();
    }
    this.updatePowerUpUI();
    if (this.combo > 0) {
      this.comboTimer += delta;
      if (this.comboTimer >= this.comboTimeout) {
        this.resetCombo();
      }
    }
    const baseSpawnRate = GameConfig.ENEMY.SPAWN_RATE; 
    const minSpawnRate = 500; 
    const timeReductionRate = 150; 
    const reductionInterval = 15000; 
    const timeReduction = Math.floor(this.gameTime / reductionInterval) * timeReductionRate;
    const currentSpawnRate = Math.max(minSpawnRate, baseSpawnRate - timeReduction);
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer >= currentSpawnRate) {
      let spawnCount = 2; 
      if (this.treasureBoxCount >= 20) {
        spawnCount = 10; 
      } else if (this.treasureBoxCount >= 10) {
        spawnCount = 5; 
      }
      for (let i = 0; i < spawnCount; i++) {
        this.spawnEnemy();
      }
      this.enemySpawnTimer = 0;
      console.log(`生成${spawnCount}個敵人，當前敵人數量: ${this.enemies.children.size}，生成間隔: ${currentSpawnRate.toFixed(0)}ms，寶箱數: ${this.treasureBoxCount}`);
    }
    if (this.cameraShakeIntensity > 0) {
      this.cameraShakeIntensity *= 0.9;
      if (this.cameraShakeIntensity < 0.1) {
        this.cameraShakeIntensity = 0;
        this.cameras.main.setScroll(0, 0);
      } else {
        const offsetX = (Math.random() - 0.5) * this.cameraShakeIntensity;
        const offsetY = (Math.random() - 0.5) * this.cameraShakeIntensity;
        this.cameras.main.setScroll(offsetX, offsetY);
      }
    }
  }
  private spawnEnemy() {
    try {
      const x = Phaser.Math.Between(50, GameConfig.WIDTH - 50);
      const patternType = Phaser.Math.Between(0, GameConfig.BULLET_HELL.PATTERN_COUNT - 1);
      const health = 1 + Math.floor(this.gameTime / 6000);
      const enemy = new Enemy(this, x, -50, patternType, health);
      enemy.setBulletGroup(this.enemyBullets);
      if (!enemy.active) {
        enemy.setActive(true);
      }
      if (!enemy.visible) {
        enemy.setVisible(true);
      }
      this.enemies.add(enemy);
    } catch (error) {
      console.error('生成敵人時發生錯誤:', error);
      console.error(error);
    }
  }
  private addScore(points: number) {
    const multiplier = 1 + (this.combo * 0.1);
    const finalPoints = Math.floor(points * multiplier);
    this.score += finalPoints;
    this.scoreText.setText(`分數: ${this.score}`);
  }
  private addCombo() {
    this.combo++;
    this.comboTimer = 0;
    if (this.combo > 1) {
      this.comboText.setVisible(true);
      this.comboText.setText(`連擊 x${this.combo}!`);
      this.tweens.add({
        targets: this.comboText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true
      });
    }
  }
  private resetCombo() {
    if (this.combo > 0) {
      this.combo = 0;
      this.comboTimer = 0;
      this.comboText.setVisible(false);
    }
  }
  private cameraShake(intensity: number, duration: number) {
    this.cameraShakeIntensity = intensity;
    this.time.delayedCall(duration, () => {
      if (this.cameraShakeIntensity === intensity) {
        this.cameraShakeIntensity = 0;
        this.cameras.main.setScroll(0, 0);
      }
    });
  }
  private spawnTreasureBox(x: number, y: number) {
    let box = this.treasureBoxes.getFirstDead() as TreasureBox;
    if (!box) {
      box = this.treasureBoxes.get(x, y) as TreasureBox;
    }
    if (box) {
      box.setActive(true);
      box.setVisible(true);
      box.setPosition(x, y);
      box.setAlpha(1);
      if (box.body) {
        box.body.enable = true;
        box.body.setCircle(12);
        box.setVelocity(0, 50); 
      }
    } else {
      console.warn('無法創建寶箱，對象池可能已滿');
    }
  }
  private collectTreasureBox(box: TreasureBox) {
    box.setActive(false);
    box.setVisible(false);
    this.treasureBoxCount++;
    const availablePowerUps = [
      PowerUpType.MISSILE,
      PowerUpType.AREA_ATTACK,
      PowerUpType.SPREAD_SHOT,
      PowerUpType.TIME_SLOW,
      PowerUpType.DAMAGE_BOOST,
      PowerUpType.CLEAR_BULLETS
    ];
    const randomPowerUp = Phaser.Math.RND.pick(availablePowerUps);
    this.player.getPowerUpManager().addPowerUp(randomPowerUp);
    this.updatePowerUpUI();
    this.audioManager.playSound('hit');
    this.particleManager.createHit(box.x, box.y);
    const powerUpNames: { [key: string]: string } = {
      'missile': '飛彈',
      'area_attack': '範圍攻擊',
      'spread_shot': '散射射擊',
      'time_slow': '時間緩慢',
      'damage_boost': '傷害加成',
      'clear_bullets': '清除子彈'
    };
    const powerUpName = powerUpNames[randomPowerUp] || '效果';
    const text = this.add.text(box.x, box.y - 30, `+1 ${powerUpName}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(GameConfig.DEPTH.UI);
    this.tweens.add({
      targets: text,
      y: box.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }
  private clearAllEnemyBullets() {
    let clearedCount = 0;
    this.enemyBullets.children.entries.forEach((bullet: any) => {
      if (bullet.active) {
        this.particleManager.createHit(bullet.x, bullet.y);
        if (bullet.body) {
          bullet.body.enable = false;
        }
        if (bullet.kill) {
          bullet.kill();
        } else {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
        clearedCount++;
      }
    });
    if (clearedCount > 0) {
      this.audioManager.playSound('explosion');
      const text = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 
        `清除 ${clearedCount} 發子彈！`,
        {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#00ff00',
          stroke: '#000000',
          strokeThickness: 3
        });
      text.setOrigin(0.5, 0.5);
      text.setDepth(GameConfig.DEPTH.UI);
      this.time.delayedCall(1500, () => {
        text.destroy();
      });
    }
  }
}
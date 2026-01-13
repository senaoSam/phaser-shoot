import Phaser from 'phaser';
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }
  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: '載入中...',
      style: {
        font: '20px Arial',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px Arial',
        color: '#00ffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.round(value * 100) + '%');
    });
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    this.loadAssets();
  }
  private loadAssets() {
    this.createPlayerSprite();
    this.createEnemySprite();
    this.createBulletSprites();
    this.createParticleSprites();
    this.createTreasureBoxSprite();
  }
  private createPlayerSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00ffff);
    graphics.fillCircle(12, 12, 12);
    graphics.generateTexture('player', 24, 24);
    graphics.destroy();
  }
  private createEnemySprite() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff0000);
    graphics.fillRect(0, 0, 30, 30);
    graphics.lineStyle(2, 0xffffff);
    graphics.strokeRect(0, 0, 30, 30);
    graphics.generateTexture('enemy', 30, 30);
    graphics.destroy();
    console.log('敵人 sprite 已創建: enemy (30x30)');
  }
  private createBulletSprites() {
    const playerBullet = this.make.graphics({ x: 0, y: 0 });
    playerBullet.fillStyle(0x00ffff);
    playerBullet.fillCircle(0, 0, 4);
    playerBullet.generateTexture('bullet-player', 8, 8);
    playerBullet.destroy();
    const enemyBullet = this.make.graphics({ x: 0, y: 0 });
    enemyBullet.fillStyle(0xff00ff);
    enemyBullet.fillCircle(0, 0, 4);
    enemyBullet.generateTexture('bullet-enemy', 8, 8);
    enemyBullet.destroy();
  }
  private createParticleSprites() {
    const particle = this.make.graphics({ x: 0, y: 0 });
    particle.fillStyle(0xffff00);
    particle.fillCircle(0, 0, 2);
    particle.generateTexture('particle', 4, 4);
    particle.destroy();
  }
  private createTreasureBoxSprite() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xffd700); 
    graphics.fillRect(0, 0, 24, 24);
    graphics.lineStyle(2, 0xffaa00); 
    graphics.strokeRect(0, 0, 24, 24);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(12, 8, 4);
    graphics.generateTexture('treasure-box', 24, 24);
    graphics.destroy();
    console.log('寶箱 sprite 已創建: treasure-box (24x24)');
  }
  create() {
    this.scene.start('MenuScene');
  }
}
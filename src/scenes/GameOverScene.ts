import Phaser from 'phaser';
export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private combo: number = 0;
  constructor() {
    super({ key: 'GameOverScene' });
  }
  init(data: { score?: number; combo?: number }) {
    this.score = data.score || 0;
    this.combo = data.combo || 0;
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
    overlay.setDepth(1000);
    const gameOverText = this.add.text(width / 2, height / 2 - 150, '遊戲結束', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(1001);
    const scoreText = this.add.text(width / 2, height / 2 - 50, `最終分數: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ffff'
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(1001);
    const comboText = this.add.text(width / 2, height / 2, `最高連擊: ${this.combo}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    comboText.setOrigin(0.5);
    comboText.setDepth(1001);
    const restartButton = this.add.text(width / 2, height / 2 + 100, '重新開始', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.setDepth(1001);
    restartButton.on('pointerover', () => {
      restartButton.setStyle({ backgroundColor: '#555555' });
    });
    restartButton.on('pointerout', () => {
      restartButton.setStyle({ backgroundColor: '#333333' });
    });
    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    const menuButton = this.add.text(width / 2, height / 2 + 160, '返回主選單', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    });
    menuButton.setOrigin(0.5);
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.setDepth(1001);
    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#555555' });
    });
    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#333333' });
    });
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
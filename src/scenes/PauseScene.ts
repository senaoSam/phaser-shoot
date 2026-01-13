import Phaser from 'phaser';
export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setDepth(1000);
    const pauseText = this.add.text(width / 2, height / 2 - 50, '遊戲暫停', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    pauseText.setOrigin(0.5);
    pauseText.setDepth(1001);
    const resumeButton = this.add.text(width / 2, height / 2 + 50, '繼續遊戲', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    });
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive({ useHandCursor: true });
    resumeButton.setDepth(1001);
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ backgroundColor: '#555555' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ backgroundColor: '#333333' });
    });
    resumeButton.on('pointerdown', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
    const menuButton = this.add.text(width / 2, height / 2 + 100, '返回主選單', {
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
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
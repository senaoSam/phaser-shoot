import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const title = this.add.text(width / 2, height / 2 - 150, '射擊遊戲', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    const subtitle = this.add.text(width / 2, height / 2 - 100, 'Phaser 3 + TypeScript', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    subtitle.setOrigin(0.5);
    const startButton = this.add.text(width / 2, height / 2, '開始遊戲', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#555555' });
    });
    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#333333' });
    });
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    const controls = this.add.text(width / 2, height / 2 + 100, 
      '方向鍵/WASD: 移動\nESC: 暫停', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    controls.setOrigin(0.5);
    this.createBackgroundEffects();
  }
  private createBackgroundEffects() {
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, GameConfig.WIDTH);
      const y = Phaser.Math.Between(0, GameConfig.HEIGHT);
      const star = this.add.circle(x, y, 1, 0xffffff, 0.5);
      this.tweens.add({
        targets: star,
        y: y + Phaser.Math.Between(100, 300),
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        yoyo: false,
        onComplete: () => {
          star.y = -10;
        }
      });
    }
  }
}
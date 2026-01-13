import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameConfig } from './config/GameConfig';
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000011',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, MenuScene, GameScene, PauseScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
new Phaser.Game(config);
import Phaser from 'phaser';
export class AudioManager {
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;
  constructor(_scene: Phaser.Scene) {
  }
  setupSounds() {
  }
  playSound(key: string, volume: number = 1) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.play({ volume: volume * this.sfxVolume });
    }
  }
  playMusic(_key: string = 'bgm') {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
  setMusicVolume(volume: number) {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.backgroundMusic) {
      (this.backgroundMusic as any).setVolume(this.musicVolume);
    }
  }
  setSfxVolume(volume: number) {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }
  getMusicVolume(): number {
    return this.musicVolume;
  }
  getSfxVolume(): number {
    return this.sfxVolume;
  }
}
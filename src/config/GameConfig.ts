export const GameConfig = {
  WIDTH: 800,
  HEIGHT: 600,
  PLAYER: {
    SPEED: 200,
    SLOW_SPEED: 100, 
    SHOOT_COOLDOWN: 100, 
    MAX_HEALTH: 3,
    INVINCIBLE_DURATION: 2000 
  },
  BULLET: {
    SPEED: 500,
    DAMAGE: 1,
    COLOR: 0x00ffff
  },
  ENEMY: {
    SPAWN_RATE: 2000, 
    BASE_HEALTH: 1, 
    BASE_SPEED: 50
  },
  BULLET_HELL: {
    BASE_SPEED: 100,
    PATTERN_COUNT: 5 
  },
  SCORE: {
    ENEMY_KILL: 100,
    COMBO_MULTIPLIER: 1.2 
  },
  DEPTH: {
    BACKGROUND: 0,
    ENEMY: 10,
    BULLET_ENEMY: 25, 
    PLAYER: 30,
    BULLET_PLAYER: 40,
    PARTICLE: 50,
    UI: 100
  }
};
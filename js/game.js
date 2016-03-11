
/**
 * Player
 */
var Player = function (game) {
  this.alive = true;
  game.spaceShip.anchor.setTo(0.5, 0.5);
  game.physics.enable(game.spaceShip, Phaser.Physics.ARCADE);
};
var youloose = false;
var score = 0;
var enemyQuantity = 4;
var SpaceWar = {
  particleTextures: []
};

var Enemy = function (game) {
  var x = game.world.randomX;
  var y = game.world.randomY;
};

SpaceWar.Preloader = function () {};

SpaceWar.Preloader.prototype = {
  preload: function () {
    this.load.atlas('stars', 'assets/images/stars.png', 'assets/images/stars.json');
    this.load.image('spaceShip', 'assets/images/space_01.png');
    this.load.image('enemy', 'assets/images/enemy.png');
    this.load.image('bullet', 'assets/images/bullet.png');
    this.load.spritesheet('kaboom', 'assets/images/explosion.png', 64, 64, 23);
  },
  init: function () {
    this.input.maxPointers = 1;
    this.scale.pageAlignHorizontally = true;
  },
  create: function () {
    this.state.start('SpaceWar.Game');
  }
};

SpaceWar.Game = function () {
    this.score = 0;
    this.scoreText = null;

    this.speed = 300;
    this.lazerSpeed = 100;

    this.player = null;
    this.scoreText = null;
    //this.enemies = [];

    this.lazers = null;
    this.emitter = null;
    this.bulletTime = 0;
};
SpaceWar.Game.prototype = {
  create: function () {
    var fireButton, enemy, explosions;
    this.land = game.add.tileSprite(0, 0, 800, 600, 'stars', 'stars.png');
    this.stage.backgroundColor = '#040380';
    //ENEMIES
    this.enemies = this.add.group();
    this.enemies.enableBody = true;
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemies.setAll('anchor.x', 0.5);
    this.enemies.setAll('anchor.y', 1);
    this.enemies.setAll('outOfBoundsKill', true);
    this.enemies.setAll('checkWorldBounds', true);

    for (var i = 0; i < enemyQuantity; i++) {
      enemy = this.enemies.create(10 + (200 * i), -200 + this.rnd.realInRange(0, 100), 'enemy');
      enemy.body.velocity.y = 40;
      enemy.body.acceleration.y = 10;
    }

    //PLAYER
    this.spaceShip = this.add.sprite(400, 500, 'spaceShip');
    this.player = new Player(this);
    this.cursors = this.input.keyboard.createCursorKeys();

    // BULLETS
    this.bullets = this.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'bullet');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 1);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    // Explosion
    this.explosions = game.add.group();
    for(var i = 0; i < 10; i++) {
      var explosionAnimation = this.explosions.create(0, 0, 'kaboom', [0], false);
      explosionAnimation.anchor.setTo(0.5, 0.5);
      explosionAnimation.animations.add('kaboom');
    }

    fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    fireButton.onDown.add(this.shootBullet, this);
    this.spaceShip.body.collideWorldBounds = true;
  },
  hitToEnemy: function (bullet, enemy) {
    var explosionAnimation = this.explosions.getFirstExists(false);
    bullet.kill();
    enemy.kill();
    explosionAnimation.reset(enemy.x + 50, enemy.y + 50);
    explosionAnimation.play('kaboom', 30, false, true);
  },
  shootBullet: function () {
    var bullet;
    if (this.time.now > this.bulletTime) {
      bullet = this.bullets.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.spaceShip.x, this.spaceShip.y - 45);
        bullet.body.velocity.y = -400;
        bulletTime = game.time.now + 200;
      }
    }
  },
  checkUserWon: function () {
    if (this.enemies.countDead() === enemyQuantity && !youloose) {
      document.getElementById('youwin').style.display = 'block';
      document.getElementById('score').innerHTML = this.enemies.countDead();
    }
  },
  update: function () {
    this.land.tilePosition.y +=2;
    this.spaceShip.body.velocity.set(0);

    if (this.cursors.left.isDown) {
      this.spaceShip.body.velocity.x = -this.speed;
    } else if (this.cursors.right.isDown) {
      this.spaceShip.body.velocity.x = this.speed;
    }
    if (this.cursors.up.isDown) {
      this.spaceShip.body.velocity.y = -this.speed;
    } else if (this.cursors.down.isDown){
      this.spaceShip.body.velocity.y = this.speed;
    }
    this.physics.arcade.overlap(this.bullets, this.enemies, this.hitToEnemy, null, this);
    this.physics.arcade.overlap(this.spaceShip, this.enemies, this.enemyAndPlayerCollision, null, this);
    this.checkUserWon();
  },
  enemyAndPlayerCollision: function (player, enemy) {
    var explosionAnimation = this.explosions.getFirstExists(false);
    player.kill();
    enemy.kill();
    explosionAnimation.reset(player.x, player.y - 100);
    explosionAnimation.play('kaboom', 30, false, true);
    document.getElementById('youloose').style.display = 'block';
    youloose = true;
  },
  init: function () {
    this.score = 0;
    this.speed = 300;
    this.lazerSpeed = 100;
    this.showDebug = false;
  }
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.state.add('SpaceWar.Preloader', SpaceWar.Preloader);
game.state.add('SpaceWar.Game', SpaceWar.Game);

game.state.start('SpaceWar.Preloader');

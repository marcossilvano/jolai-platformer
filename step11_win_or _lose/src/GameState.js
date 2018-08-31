/**
 * Main state. Represents the game screen.
 */
class GameState extends Phaser.State {

    create() {
        // enable physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        this.game.physics.arcade.gravity.y = config.GRAVITY;
        
        this.createBackgrounds()
        this.createTileMap()
        this.createCoins()
        this.createDroids()
        
        this.player = new Player(this.game, 100, 100, 'player')
        this.game.add.existing(this.player)
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05); // smooth        
        
        this.createHud()
        this.updateHud()
        this.game.camera.flash(0x000000)
    }

    createHud() {
        this.hud = {
            gameover: this.createText(this.game.width/2, 200, 'GAME OVER', 60, '#ff0000', true),
            gamewin:  this.createText(this.game.width/2, 200, 'LEVEL CLEAR', 60, '#00dd00', true),
            lifeIcon: this.game.add.sprite(20, 25, 'life-icon'),
            lifeText: this.createText(75, 50, 'x 0', 20),
            coinIcon: this.game.add.sprite(23, 60, 'coin'),
            coinText: this.createText(75, 80, 'x 0', 20)
        }
        this.hud.gameover.alpha = 0
        this.hud.gameover.scale.setTo(1.5, 1.5)
        this.hud.gamewin.scale.setTo(1.5, 0)
        this.hud.lifeIcon.scale.setTo(0.8, 0.8)
        this.hud.lifeIcon.fixedToCamera = true
        this.hud.coinIcon.fixedToCamera = true
    }

    createText(x, y, string, size=16, color='white', shadow=false) {
        let style = { font: `bold ${size}px Arial`, fill: color }
        let text = this.game.add.text(x, y, string, style)
        if (shadow)
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
        text.stroke = '#000000';
        text.strokeThickness = 4;
        text.anchor.setTo(0.5, 0.5)
        text.fixedToCamera = true
        return text
    }

    createBackgroundLayer(img) {
        let bg = this.game.add.tileSprite(
            -10, 0, this.game.width+20, this.game.height, img)
        bg.fixedToCamera = true       
        bg.tileScale.setTo(2, 3)
        return bg
    }

    createBackgrounds() {
        this.bgSky = this.createBackgroundLayer('background-sky')
        this.bgMountain = this.createBackgroundLayer('background-mountain')
    }

    createTileMap() {
        this.map = this.game.add.tilemap('level1'); 
        this.map.addTilesetImage('tiles1');

        this.mapLayer = this.map.createLayer('Tile Layer 1');
        this.map.setCollisionBetween(1, 11, true, 'Tile Layer 1')
        this.map.setTileIndexCallback(29, this.hitPlayer, this)
        
        this.mapLayer.resizeWorld(); // resize world to fit tilemap size
    }

    createDroids() {
        this.droids = this.game.add.group()
        this.map.createFromObjects('Object Layer 1', 73, 'droid', 0, true, true, this.droids, Droid);
    }

    createCoins() {
        this.coinCount = 0
        this.coins = this.game.add.group()
        this.map.createFromObjects('Object Layer 1', 67, 'coin', 0, true, true, this.coins, Coin);
    }

    update() {
        this.bgSky.tilePosition.x -= 0.2
        this.bgMountain.tilePosition.x = -this.camera.x/5

        // check collision between player and tilemap
        this.game.physics.arcade.collide(this.player, this.mapLayer);

        // check collision between player and coins group
        this.game.physics.arcade.overlap(this.player, this.coins, this.collectCoin, null, this)
        
        // check collision between player and droids group
        this.game.physics.arcade.overlap(this.player, this.droids, this.hitDroid, null, this)
    }

    collectCoin(player, coin) {
        coin.kill()
        this.coinCount++;
        this.updateHud()
        if (this.coins.countLiving() == 0) {
            this.gameWin()
        }            
    }

    hitPlayer() {
        // return to start position
        this.player.damage(1)
        this.player.x = this.player.startX
        this.player.y = this.player.startY

        this.updateHud()
        if (!this.player.alive) {
            this.gameOver()
        }
    }

    hitDroid(player, droid) {
        if (!player.alive)
            return;        

        // player can jump on droids
        if (player.body.velocity.y > 0) {
            droid.hit()
            player.attackJump()
        } else {
            this.hitPlayer()
        }
    }

    restartGame() {
        this.camera.fade(0x000000)
        this.camera.onFadeComplete.addOnce(() => this.state.restart(true), this)
    }

    gameWin() {  
        this.player.body.enable = false
        this.game.camera.follow(null)

        // show 'LEVEL CLEAR' with a scale tweening
        this.game.add.tween(this.hud.gamewin.scale)
            .to( { y: 1.5 }, 150)
            .to( { y: 0 }, 150, 'Linear', false, 3000)
            .start()
            .onComplete.add(this.restartGame, this);
    }    

    gameOver() {  
        this.game.camera.shake(0.005, 200);
        this.game.camera.follow(null)

        // show 'GAME OVER' with a 'fade in' tweening
        this.game.add.tween(this.hud.gameover)
            .to( { alpha: 1 }, 150)
            .to( { alpha: 0 }, 150, 'Linear', false, 3000)
            .start()
            .onComplete.add(this.restartGame, this);
    }

    updateHud() {
        this.hud.lifeText.text = `x ${this.player.health}`
        this.hud.coinText.text = `x ${this.coinCount}`
    }

    // for debug purposes
    // render() {
    //     this.droids.forEach((obj) => this.game.debug.body(obj), this)
    //     this.game.debug.body(this.player)
    // }
}
/**
 * First state of the game. Load all the game assets prior to game execution.
 */
class BootState extends Phaser.State {
    preload() {
        this.game.load.image('background-sky', 'assets/bg01.png')
        this.game.load.image('background-mountain', 'assets/bg02.png')
        this.game.load.image('life-icon', 'assets/life-icon.png')
        
        // load characters and effects sprite sheets
        this.game.load.spritesheet('player', 'assets/player.png', 49, 72)
        this.game.load.spritesheet('droid', 'assets/droid.png', 64, 64)
        this.game.load.spritesheet('coin', 'assets/coin.png', 32, 32)
        
        // load tile map data and image
        this.game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tiles1','assets/tileset-42x42.png');
    }
    
    create() {
        this.game.scale.scaleMode = config.SCALE_MODE;
        this.game.renderer.renderSession.roundPixels = config.ROUND_PIXELS
        this.game.stage.smoothed = false // "retro" style (still antialiased)
        this.game.input.gamepad.start()  // init the game pad support (Xbox 360)
        this.state.start('Game')         // start the game scene (Phaser.State)
    }
}
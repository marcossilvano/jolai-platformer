/**
 * Enemy that moves from one side to another, in a loop.
 */
class Droid extends Phaser.Sprite {
    constructor(game, x, y, asset) {
        super(game, x, y, asset)
        this.game.physics.arcade.enable(this)
        this.body.allowGravity = false
        this.body.immovable = true
        this.body.setSize(50, 28, 6, 30);        
        this.anchor.setTo(0.5, 0.5)
        this.animations.add('move', [0, 1, 2, 3], 10, true)        
        this.animations.play('move')
        this.smoothed = false
        // droid moves from one point to another in a loop
        this.game.add.tween(this)
            .to( { x: this.x - 200 }, 3000, "Quart.easeInOut")
            .to( { x: this.x }, 3000, "Quart.easeInOut")
            .loop(-1)
            .start();    
    }
    hit() {
        this.body.enable = false // avoid a new collision while fading out

        this.game.add.tween(this.scale)
            .to( { y: 1.5, x: 1.5 }, 300)
            .start()
            
        this.game.add.tween(this)
            .to( { alpha: 0 }, 300)
            .start()
            .onComplete.add(this.kill, this)
    }
}
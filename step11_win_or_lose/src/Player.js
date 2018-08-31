/**
 * Player avatar on the game.
 */
class Player extends Phaser.Sprite {
    constructor(game, x, y, img) {
        // 1. setup general properties
        super(game, x, y, img)
        this.health = config.PLAYER_LIVES
        this.anchor.setTo(0.5, 0.5)
        
        // 2. setup animations        
        this.animations.add('idle', [0, 1], 5, true);
        this.animations.add('run', [2, 3, 4, 5], 5, true);
        this.animations.add('jump', [6], 5, true);
        this.animations.add('fall', [7], 5, true);
        
        // 3. setup character physics
        game.physics.arcade.enable(this)
        this.body.collideWorldBounds = true
        this.body.setSize(this.width-14, this.height-11, 11, 6)

        // 4. create and setup fields for player logic        
        this.isDoubleJump = false
        this.startX = this.x
        this.startY = this.y
        
        // 5. setup keyboard keys
        this.keys = this.game.input.keyboard.addKeys({
            left: Phaser.KeyCode.LEFT,
            right: Phaser.KeyCode.RIGHT,
            jump: Phaser.KeyCode.CONTROL
        })
        // one time press event for jump
        this.keys.jump.onDown.add(function () {
            this.jump()
        }, this);

        // 6. setup xbox 360 controller buttons
        this.pad = this.game.input.gamepad.pad1
        this.pad.onDownCallback = this.gamepadJump
        this.pad.callbackContext = this
    }

    movePlayer() {
        // check keys and define player velocity
        if (this.keys.left.isDown || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
            this.body.velocity.x = -config.PLAYER_VELOCITY
        } else
        if (this.keys.right.isDown || this.pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
            this.body.velocity.x = config.PLAYER_VELOCITY
        } else {
            this.body.velocity.x = 0
        }
        // limit the jump and fall velocity
        this.body.velocity.y = Phaser.Math.clamp(this.body.velocity.y, 
            -config.PLAYER_DOUBLE_JUMP_VELOCITY, config.PLAYER_FALL_VELOCITY)

        // turn and animate the player sprite
        this.animate()
    }

    gamepadJump() {
        if (this.pad.justPressed(Phaser.Gamepad.XBOX360_A)) {
            this.jump()            
        }        
    }

    attackJump() {
        this.isDoubleJump = false
        this.jump(true)
    }

    jump(isAttack = false) {
        // check if there is any solid tile below the sprite
        let onFloor = this.body.onFloor()

        if (onFloor || !this.isDoubleJump || isAttack) {
            // not on floor: can be a double jump or an attack jump
            if (!onFloor) {
                this.body.velocity.y = -config.PLAYER_DOUBLE_JUMP_VELOCITY
                // if is not a attack jump, then is a double jump
                if (!isAttack) {
                    this.isDoubleJump = true
                }
            }
            // normal jump
            else {
                this.body.velocity.y = -config.PLAYER_JUMP_VELOCITY
                this.isDoubleJump = false
            }
        }    
    }

    animate() {
        // if has no movement and it's on floor: idle
        let anim = 'idle'

        // on floor and moving
        if (this.body.velocity.x != 0 && this.body.onFloor())
            anim = 'run'
        // on air and moving up: jumping
        else if (this.body.velocity.y < 0 && !this.body.onFloor())
            anim = 'jump'
        // on air and falling
        else if (this.body.velocity.y > 0 && !this.body.onFloor())
            anim = 'fall'
        // play animation on the sprite
        this.animations.play(anim)

        // use negative scale to flip the sprite
        if (this.body.velocity.x > 0)
            this.scale.x = 1    
        else 
        if (this.body.velocity.x < 0)
            this.scale.x = -1
    }    

    update() {
        if (!this.body.enable) { // do nothing if body is disabled
            this.frame = 0
            return
        }

        this.movePlayer()
    }
}

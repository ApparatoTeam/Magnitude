var game = new Phaser.Game(800, 600, Phaser.AUTO, 'magnitude-game');
var fireballs, fireRate = 300, nextFire = 0, nextJump = 0, player; 
var left=false, right=false, duck= false, fire=false, jump=false;

var MagnitudeGame = function () {
    this.sprite;
    this.pad;
    this.stick;
};

MagnitudeGame.prototype = {
    init: function () {
    },
    preload: function () {
        //spritesheet for animations
        game.load.spritesheet('player', 'assets/newplayer1.png',50,50); // key, sourcefile, framesize x, framesize y
       
        //background, ground, fireball images
        game.load.image('ground', 'assets/2048x48-ground.png');
        game.load.image('clouds', 'assets/scene1.png');
        game.load.image('fireball', 'assets/fireball.png',40,30);

        //gamepad buttons
        game.load.spritesheet('buttonvertical', 'assets/button-vertical.png',64,64);
        game.load.spritesheet('buttonhorizontal', 'assets/button-vertical.png',64,64);
        game.load.spritesheet('buttondiagonal', 'assets/button-diagonal.png',64,64);
        game.load.spritesheet('buttonfire', 'assets/button-round-a.png',96,96);
        game.load.spritesheet('buttonjump', 'assets/button-round-b.png',96,96);

        // fullscreen setup
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        game.load.image('star', 'assets/star.png');

    },
    create: function () {

        if (!game.device.desktop){ game.input.onDown.add(gofull, this); }
        
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 1200;
        game.world.setBounds(0, 0, 2000, 600);
        game.physics.p2.setBoundsToWorld(true, true, false, true, false);
        game.physics.p2.friction = 5;

        game.physics.p2.setImpactEvents(true);

        clouds = game.add.tileSprite(0, 0, 2048,700, 'clouds');
        ground = game.add.sprite(game.world.width/2, game.world.height-24,'ground');
        game.physics.p2.enable(ground);
        ground.body.static=true;

        fireballs = game.add.group();
        fireballs.createMultiple(500, 'fireball', 0, false);

        //setup our player
        player = game.add.sprite(350, game.world.height - 150, 'player');
        game.physics.p2.enable(player);
        player.body.setCircle(22);
        player.body.fixedRotation=true; 
        player.body.mass = 4;

        // add some animations 
        player.animations.add('walk', [1,2,3,4], 10, true);  // (key, framesarray, fps,repeat)
        player.animations.add('duck', [11], 0, true);
        player.animations.add('duckwalk', [10,11,12], 3, true);
        game.camera.follow(player); //always center player

        // create our virtual game controller buttons 
        /*
        buttonfire = game.add.button(700, 500, 'buttonfire', null, this, 0, 1, 0, 1); //fire ball
        buttonfire.fixedToCamera = true;
        buttonfire.events.onInputOver.add(function(){fire=true;});
        buttonfire.events.onInputOut.add(function(){fire=false;});
        buttonfire.events.onInputDown.add(function(){fire=true;});
        buttonfire.events.onInputUp.add(function(){fire=false;});        
        */

        buttonleft = game.add.button(32, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1); //left
        buttonleft.fixedToCamera = true;
        buttonleft.events.onInputOver.add(function(){left=true;});
        buttonleft.events.onInputOut.add(function(){left=false;});
        buttonleft.events.onInputDown.add(function(){left=true;});
        buttonleft.events.onInputUp.add(function(){left=false;});

    
        buttonright = game.add.button(160, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1); //right
        buttonright.fixedToCamera = true;
        buttonright.events.onInputOver.add(function(){right=true;});
        buttonright.events.onInputOut.add(function(){right=false;});
        buttonright.events.onInputDown.add(function(){right=true;});
        buttonright.events.onInputUp.add(function(){right=false;});

        buttondown = game.add.button(96, 536, 'buttonvertical', null, this, 0, 1, 0, 1); //go down
        buttondown.fixedToCamera = true;
        buttondown.events.onInputOver.add(function(){duck=true;});
        buttondown.events.onInputOut.add(function(){duck=false;});
        buttondown.events.onInputDown.add(function(){duck=true;});
        buttondown.events.onInputUp.add(function(){duck=false;});

        buttonjump = game.add.button(96, 410, 'buttonvertical', null, this, 0, 1, 0, 1); //go up
        buttonjump.fixedToCamera = true;
        buttonjump.events.onInputOver.add(function(){jump=true;});
        buttonjump.events.onInputOut.add(function(){jump=false;});
        buttonjump.events.onInputDown.add(function(){jump=true;});
        buttonjump.events.onInputUp.add(function(){jump=false;});


        buttonbottomright = game.add.button(160, 536, 'buttondiagonal', null, this, 5, 5, 5, 5);
        buttonbottomright.fixedToCamera = true;
        // buttonbottomright = game.add.button(160, 536, 'buttondiagonal', null, this, 7, 5, 7, 5);
        // buttonbottomright.events.onInputOver.add(function(){right=true;duck=true;});
        // buttonbottomright.events.onInputOut.add(function(){right=false;duck=false;});
        // buttonbottomright.events.onInputDown.add(function(){right=true;duck=true;});
        // buttonbottomright.events.onInputUp.add(function(){right=false;duck=false;});

        buttonbottomleft = game.add.button(32, 536, 'buttondiagonal', null, this, 4, 4, 4, 4);
        buttonbottomleft.fixedToCamera = true;
        // buttonbottomleft = game.add.button(32, 536, 'buttondiagonal', null, this, 6, 4, 6, 4);
        // buttonbottomleft.events.onInputOver.add(function(){left=true;duck=true;});
        // buttonbottomleft.events.onInputOut.add(function(){left=false;duck=false;});
        // buttonbottomleft.events.onInputDown.add(function(){left=true;duck=true;});
        // buttonbottomleft.events.onInputUp.add(function(){left=false;duck=false;});

        var buttonupright = game.add.button(160, 408, 'buttondiagonal', null, this, 1, 1, 1, 1);
        buttonupright.fixedToCamera = true;
        // var buttonupright = game.add.button(160, 408, 'buttondiagonal', null, this, 3, 1, 3, 1);
        // buttonupright.events.onInputOver.add(function(){left=true;duck=true;});
        // buttonupright.events.onInputOut.add(function(){left=false;duck=false;});
        // buttonupright.events.onInputDown.add(function(){left=true;duck=true;});
        // buttonupright.events.onInputUp.add(function(){left=false;duck=false;});

        var buttonupleft = game.add.button(32, 408, 'buttondiagonal', null, this, 0,0,0,0);
        buttonupleft.fixedToCamera = true;
        // var buttonupleft = game.add.button(32, 408, 'buttondiagonal', null, this, 2,0,2,0);
        // buttonupleft.events.onInputOver.add(function(){left=true;duck=true;});
        // buttonupleft.events.onInputOut.add(function(){left=false;duck=false;});
        // buttonupleft.events.onInputDown.add(function(){left=true;duck=true;});
        // buttonupleft.events.onInputUp.add(function(){left=false;duck=false;});

    },
    update: function () {
        fall_now();
        // define what should happen when a button is pressed
        if (left && !duck) {
            player.scale.x = -1;
            player.body.moveLeft(500);
            player.animations.play('walk');
        }
        else if (right && !duck) {
            player.scale.x = 1;
            player.body.moveRight(500);
            player.animations.play('walk');
        } 
        else if (duck && !left && !right) {
            player.body.velocity.x=0;
            player.animations.play('duck');
        } 
        else if (duck && right) {
            player.scale.x = 1;
            player.body.moveRight(200);
            player.animations.play('duckwalk');
        }
        else if (duck && left) {
            player.scale.x = -1;
            player.body.moveLeft(200);
            player.animations.play('duckwalk');
        }
        else {
            player.loadTexture('player', 0);
        }
        if (jump){ jump_now(); player.loadTexture('player', 5);}  //change to another frame of the spritesheet
        if (fire){fire_now(); player.loadTexture('player', 8); }
        if (duck){ player.body.setCircle(16,0,6);}else{ player.body.setCircle(22);}  //when ducking create a smaller hitarea - (radius,offsetx,offsety)
        if (game.input.currentPointers == 0 && !game.input.activePointer.isMouse){ fire=false; right=false; left=false; duck=false; jump=false;} //this works around a "bug" where a button gets stuck in pressed state
    },
    render: function () {
        //game.debug.text('jump:' + jump + ' duck:' + duck + ' left:' + left + ' right:' + right + ' fire:' + fire, 20, 20);
    },
 };
game.state.add('Game', MagnitudeGame, true);

//some useful functions
function gofull(){ 
    game.scale.startFullScreen(false);
}

function jump_now(){  //jump with small delay
    if (game.time.now > nextJump ){
        player.body.moveUp(600);
        nextJump = game.time.now + 1000;
    }
}

function fall_now(){
    if (game.time.now > nextFire){
        nextFire = game.time.now + fireRate;
        var fireball = fireballs.getFirstExists(false); // get the first created fireball that no exists atm
        var rand1 = game.rnd.realInRange(0,2000);
        if (fireball){
            fireball.exists = true;  // come to existance !
            fireball.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance

            fireball.reset(rand1, 0);
            game.physics.p2.enable(fireball);
            fireball.body.moveRight(00);
            fireball.body.moveDown(180);

            fireball.body.setCircle(10);
        }
    }
}
var game = new Phaser.Game(800, 700, Phaser.AUTO, 'magnitude-game');
var fireballs, fireRate = 300, nextFire = 0, nextJump = 0, player; 
var left=false, right=false, duck= false, fire=false, jump=false;
var life = 3;
var grounds = [];

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
        game.load.spritesheet('player', 'assets/player.png',200,200); // key, sourcefile, framesize x, framesize y
       
        //background, ground, fireball images
        game.load.image('ground', 'assets/2048x48-ground.png');
        game.load.image('clouds', 'assets/scene1.gif');
        game.load.image('fireball', 'assets/fireball.png',100,100);

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
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        if (!game.device.desktop){ game.input.onDown.add(process.fullscreen, this); }
        
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 1200;
        game.world.setBounds(0, 0, 5000, 600);
        game.physics.p2.setBoundsToWorld(true, true, false, true, false);
        game.physics.p2.friction = 5;

        game.physics.p2.setImpactEvents(true);

        clouds = game.add.tileSprite(0, 0, 5000,600, 'clouds');


        for(var i = 0; i < (5000 / 100); i=i+100){
            ground = game.add.sprite(i, game.world.height+80,'ground');//game.world.width/2 ,game.world.height-24
            //ground.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance
            game.physics.p2.enable(ground);
            grounds.push(ground);
            //ground.body.static=true;
            console.log('x');
        }

        fireballs = game.add.group();
        fireballs.createMultiple(500, 'fireball', 0, false);

        //setup our player
        player = game.add.sprite(350, game.world.height - 150, 'player');
        game.physics.p2.enable(player);
        player.body.setCircle(22);
        player.body.fixedRotation=true; 
        player.body.mass = 4;

        // add some animations 
        player.animations.add('walk', [1,2,3,4,5,6], 10, true);  // (key, framesarray, fps,repeat)
        player.animations.add('duck', [7], 0, true);
        player.animations.add('duckwalk', [7,7,7], 3, true);
        player.animations.add('dead', [8,8,8], 3, true);
        game.camera.follow(player); //always center player

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

        //disabled buttons but also a part of the joystick control
        buttonbottomright = game.add.button(160, 536, 'buttondiagonal', null, this, 5, 5, 5, 5);
        buttonbottomright.fixedToCamera = true;
        buttonbottomleft = game.add.button(32, 536, 'buttondiagonal', null, this, 4, 4, 4, 4);
        buttonbottomleft.fixedToCamera = true;
        var buttonupright = game.add.button(160, 408, 'buttondiagonal', null, this, 1, 1, 1, 1);
        buttonupright.fixedToCamera = true;
        var buttonupleft = game.add.button(32, 408, 'buttondiagonal', null, this, 0,0,0,0);
        buttonupleft.fixedToCamera = true;

        lifeText = game.add.text(16, 16, 'Life: '+life, { fontSize: '32px', fill: '#000' });
        lifeText.fixedToCamera = true;

        player.body.onBeginContact.add(function(body, bodyB, shapeA, shapeB, equation){
            if(body){
                if(body.sprite.key == 'fireball'){
                    console.log('You last hit: ' + body.sprite.key);
                    process.lifeHandler();
                }
                console.log('You last hit: ' + body.sprite.key);
            }
        }, this);

    },
    update: function () {
        process.debris();
        if(left && !duck){
            player.scale.x = -1;
            player.body.moveLeft(500);
            player.animations.play('walk');
        }
        else if(right && !duck){
            player.scale.x = 1;
            player.body.moveRight(500);
            player.animations.play('walk');
        } 
        else if(duck && !left && !right){
            player.body.velocity.x=0;
            player.animations.play('duck');
        } 
        else if(duck && right){
            player.scale.x = 1;
            player.body.moveRight(200);
            player.animations.play('duckwalk');
        }
        else if(duck && left){
            player.scale.x = -1;
            player.body.moveLeft(200);
            player.animations.play('duckwalk');
        }
        else if(jump){
            process.jump();
            player.loadTexture('player', 5);
        }   
        else{
            player.loadTexture('player', 0);
        }
    },
    render: function () {
        //game.debug.text('jump:' + jump + ' duck:' + duck + ' left:' + left + ' right:' + right + ' fire:' + fire, 20, 20);
    },
};
game.state.add('Game', MagnitudeGame, true);

var process = function () {
    //"use strict";
    return {
        fullscreen:function(){
            game.scale.startFullScreen(false);
        },
        lifeHandler: function(){
            life = life - 1;
            lifeText.text = 'Life: ' + life;
        },
        dead:function(){

        },
        nextLevel:function(){
        },
        debris:function(){
            if (game.time.now > nextFire){
                nextFire = game.time.now + fireRate;
                var fireball = fireballs.getFirstExists(false); // get the first created fireball that no exists atm
                var rand1 = game.rnd.realInRange(0,5000);
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
        },
        jump:function(){
            if (game.time.now > nextJump ){
                player.body.moveUp(600);
                nextJump = game.time.now + 1000;
            }
        }
    };
}();    
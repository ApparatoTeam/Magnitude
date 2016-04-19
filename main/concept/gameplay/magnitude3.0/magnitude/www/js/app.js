

var fireballs, fireRate = 1000, nextFire = 0, nextJump = 0, player; 
var left=false, right=false, duck= false, fire=false, jump=false;
var life = 3;
var level = 1;
var deathgrounds = [];
var roads = [];
var height = 414;
var width = 736;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'magnitude-game');
//var grounds = [];
var style = { font: "quake", fill: "#ff0044", align: "center" };


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
        game.load.spritesheet('bg', 'assets/scenes.png',512,600); // key, sourcefile, framesize x, framesize y
       
        //background, ground, fireball images
        game.load.image('road', 'assets/road.png',200,200);
        game.load.image('deathground', 'assets/lava.png',100,100);
        game.load.image('clouds', 'assets/scene2.png');
        game.load.image('fireball', 'assets/debris.png',200,200);

        game.load.spritesheet('btn-left', 'assets/btn-left.png',100,100);
        game.load.spritesheet('btn-right', 'assets/btn-right.png',100,100);
        game.load.spritesheet('btn-up', 'assets/btn-up.png',100,100);
        game.load.spritesheet('btn-down', 'assets/btn-down.png',100,100);
        game.load.spritesheet('safePlace', 'assets/btn-right.png',100,100);

        game.load.bitmapFont('quake', 'assets/font/font.png', 'assets/font/font.fnt');
    },
    create: function () {

        var bound = 10000;
        // fullscreen setup

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.world.width = window.screen.width;
        game.world.height = window.screen.height;
        width = window.screen.width;
        height = window.screen.height;
        game.scale.refresh();

        game.input.addPointer();
        game.input.addPointer();
        
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 1200;
        game.world.setBounds(0, 0, bound, game.world.height);
        game.physics.p2.setBoundsToWorld(true, true, false, true, false);
        game.physics.p2.friction = 10;

        game.physics.p2.setImpactEvents(true);

        scene = game.add.tileSprite(0, -200, bound,game.world.height+200, 'bg');
        scene.animations.add('scene1', [0,1], 1, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene2', [2,3], 2, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene3', [4,5], 3, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene4', [6,7], 4, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene5', [8,9], 5, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene6', [10,11], 6, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene7', [12,13], 7, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene8', [14,15], 8, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene9', [16,17], 9, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene10', [18,19], 10, true);  // (key, framesarray, fps,repeat)

        safePlace = game.add.sprite(9940, game.world.height-200,'safePlace');//game.world.width/2 ,game.world.height-24
        //deathground.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance
        game.physics.p2.enable(safePlace);
        safePlace.body.static=true;

        for(var i = (Math.round(bound/200)); i >= 0; i--){ //50 roads
            road = game.add.sprite((200*i)-(20*i), game.world.height-40,'road');//game.world.width/2 ,game.world.height-24
            //deathground.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance
            game.physics.p2.enable(road);
            roads.push(road);
            road.body.static=true;
        }

        for(var i = 0; i <= (Math.round(bound/100)); i++){
            deathground = game.add.sprite(100*i, game.world.height+80,'deathground');//game.world.width/2 ,game.world.height-24
            //deathground.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance
            game.physics.p2.enable(deathground);
            deathgrounds.push(deathground);
            deathground.body.static=true;
        }

        fireballs = game.add.group();
        fireballs.createMultiple(500, 'fireball', 0, false);

        //setup our player
        player = game.add.sprite(350, game.world.height - 100, 'player');
        game.physics.p2.enable(player);
        player.body.setCircle(20);
        player.body.fixedRotation=true; 
        player.body.mass = 100;
        player.scale.x = 0.5;
        player.scale.y = 0.5;

        // add some animations 
        player.animations.add('walk', [1,2,3,4,5,6], 10, true);  // (key, framesarray, fps,repeat)
        player.animations.add('duck', [7], 0, true);
        player.animations.add('duckwalk', [7], 0, true);
        player.animations.add('dead', [8],0, true);
        game.camera.follow(player); //always center player

        process.buttonHandler();
        lifeText = game.add.bitmapText(16, 16,'quake', 'Life: '+life ,32);
        lifeText.fixedToCamera = true;

        levelText = game.add.bitmapText(width-110, 16,'quake', 'Level: '+level ,32);
        levelText.fixedToCamera = true;

        process.core_game(level);
    },
    update: function () {
        process.debris();

        if(left && !duck){
            player.scale.x = -0.5;
            player.body.moveLeft(600);
            player.animations.play('walk');
            // scene.tilePosition.x += 5; setting parallax
        }
        else if(right && !duck){
            player.scale.x = 0.5;
            player.body.moveRight(600);
            player.animations.play('walk');
            // scene.tilePosition.x -= 5; setting parallax
        } 
        else if(duck && !left && !right){
            player.body.velocity.x=0;
            player.animations.play('duck');
        } 
        else if(duck && right){
            player.scale.x = 0.5;
            player.body.moveRight(200);
            player.animations.play('duckwalk');
        }
        else if(duck && left){
            player.scale.x = -0.5;
            player.body.moveLeft(200);
            player.animations.play('duckwalk');
        }
        else if(jump){
            process.jump();
            player.loadTexture('player', 6);
        }   
        else{
            player.loadTexture('player', 0);
        }
    }
};
game.state.add('Game', MagnitudeGame, true);

var process = function () {
    //"use strict";
    return {
        fullscreen:function(){
            game.scale.startFullScreen(true);
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        },
        lifeHandler: function(){
            life = life - 1;
            lifeText.text = 'Life: ' + life;
            player.animations.play('dead');
            //game.paused = true;
            lifeNotif = game.add.bitmapText(100 ,150, 'quake', 'Fuck!\n Respawn in 3 seconds. ', 32);
            lifeNotif.fixedToCamera = true;
            var respawn = setTimeout(function(){
                //game.paused = false;
                //player.body.reset(100, 100);
                lifeNotif.destroy();
            },3000);
            if(life>0){
            }
            else{
                //game.state.restart();
                lifeNotif = game.add.bitmapText(100 ,150, 'quake', 'Fuck!\n No life left. :(', 32);
            }
            lifeNotif.fixedToCamera = true;
        },
        levelHandler: function(){
            level = level + 1;
            levelText.text = 'Level: ' + level;
            game.paused = true;
            levelNotif = game.add.bitmapText(100 ,150, 'quake', 'You passed level: '+(level-1), 32);
            levelNotif.fixedToCamera = true;
            var respawn = setTimeout(function(){
                game.paused = false;
                player.body.reset(100, 100);
                levelNotif.destroy();
            },3000);
            levelNotif.fixedToCamera = true;

            return level;
        },
        dead:function(){
        },
        dead:function(){
        },
        nextLevel:function(){
        },
        debris:function(){
            if (game.time.now > nextFire){
                nextFire = game.time.now + fireRate;
                var fireball = fireballs.getFirstExists(false); // get the first created fireball that no exists atm
                var rand1 = game.rnd.realInRange(1000,9900);
                if (fireball){
                    fireball.exists = true;  // come to existance !
                    fireball.lifespan=2500;  // remove the fireball after 2500 milliseconds - back to non-existance
                    fireball.scale.x = 0.5;
                    fireball.scale.y = 0.5;
                    fireball.reset(rand1, 0);
                    game.physics.p2.enable(fireball);
                    fireball.body.moveDown(180);
                    fireball.body.mass = 1000;
                    fireball.body.setCircle(20);
                }
            }
        },
        jump:function(){
            if (game.time.now > nextJump ){
                player.body.moveUp(600);
                nextJump = game.time.now + 1000;
            }
        },
        buttonHandler:function(){
            buttonleft = game.add.button(10, game.world.height-150, 'btn-left', null, this, 1, 0, 1, 0); //left
            buttonleft.fixedToCamera = true;
            buttonleft.events.onInputOver.add(function(){left=true;});
            buttonleft.events.onInputOut.add(function(){left=false;});
            buttonleft.events.onInputDown.add(function(){left=true;});
            buttonleft.events.onInputUp.add(function(){left=false;});
        
            buttonright = game.add.button(100, game.world.height-150, 'btn-right', null, this, 1, 0, 1, 0); //right
            buttonright.fixedToCamera = true;
            buttonright.events.onInputOver.add(function(){right=true;});
            buttonright.events.onInputOut.add(function(){right=false;});
            buttonright.events.onInputDown.add(function(){right=true;});
            buttonright.events.onInputUp.add(function(){right=false;});

            buttondown = game.add.button(width-100, game.world.height-150, 'btn-down', null, this, 1, 0, 1, 0); //go down
            buttondown.fixedToCamera = true;
            buttondown.events.onInputOver.add(function(){duck=true;});
            buttondown.events.onInputOut.add(function(){duck=false;});
            buttondown.events.onInputDown.add(function(){duck=true;});
            buttondown.events.onInputUp.add(function(){duck=false;});

            buttonjump = game.add.button(width-10, game.world.height-150, 'btn-up', null, this, 1, 0, 1, 0); //go up
            buttonjump.fixedToCamera = true;
            buttonjump.events.onInputOver.add(function(){jump=true;});
            buttonjump.events.onInputOut.add(function(){jump=false;});
            buttonjump.events.onInputDown.add(function(){jump=true;});
            buttonjump.events.onInputUp.add(function(){jump=false;});
        },
        core_game:function(level){
            scene.animations.play('scene'+level);
            console.log(level);
            //roads[25].lifespan=2500; //removing the ground
            //roads[26].lifespan=3000; //removing the ground
            /*
            roads[45].lifespan=5000; //removing the ground
            roads[30].lifespan=4500; //removing the ground
            roads[32].lifespan=4000; //removing the ground

            roads[0].lifespan=2500;
            roads[0].body.moveUp(-100);

            */
            player.body.onBeginContact.add(function(body, bodyB, shapeA, shapeB, equation){
                if(body){
                    if((body.sprite.key == 'fireball') || (body.sprite.key == 'deathground')){
                        process.lifeHandler();
                    }
                    else if((body.sprite.key == 'safePlace')){
                        level = process.levelHandler();
                        scene.animations.play('scene'+level);
                    }
                }
            }, this);
        }
    };
}();    
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
        game.load.spritesheet('bg', 'assets/scenes-lava.png',512,600); // key, sourcefile, framesize x, framesize y
       
        //background, ground, fireball images
        game.load.image('life', 'assets/life.png',32,32);
        game.load.image('pad', 'assets/pad.png',500,500);
        game.load.image('road', 'assets/road.png',200,200);
        game.load.image('deathground', 'assets/lava.png',100,100);
        game.load.image('fireball', 'assets/debris.png',200,200);

        game.load.spritesheet('debris', 'assets/debris-sprite.png',100,100);
        game.load.spritesheet('btn-left', 'assets/btn-left.png',100,100);
        game.load.spritesheet('btn-right', 'assets/btn-right.png',100,100);
        game.load.spritesheet('btn-up', 'assets/btn-up.png',100,100);
        game.load.spritesheet('btn-down', 'assets/btn-down.png',100,100);
        game.load.spritesheet('safePlace', 'assets/btn-right.png',100,100);

        game.load.bitmapFont('quake', 'assets/font/font.png', 'assets/font/font.fnt');

        game.load.audio('bgSounds', 'assets/audio/earthquake.mp3');
        game.load.audio('cry', 'assets/audio/cry.mp3');
        game.load.audio('gotLife', 'assets/audio/buttons.mp3');
        game.load.audio('button', 'assets/audio/buttons.mp3');
    },
    create: function () {
        cry = game.add.audio('cry');
        bgSounds = game.add.audio('bgSounds');
        bgSounds.loopFull(0.6);

        var bound = 5000;
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

        scene = game.add.tileSprite(0, -200, bound+100,game.world.height+200, 'bg');
        scene.animations.add('scene1', [0], 1, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene2', [2], 2, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene3', [4], 3, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene4', [6], 4, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene5', [8], 5, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene6', [10], 6, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene7', [12], 7, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene8', [14], 8, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene9', [16], 9, true);  // (key, framesarray, fps,repeat)
        scene.animations.add('scene10', [18], 10, true);  // (key, framesarray, fps,repeat)
      
        safePlace = game.add.sprite(bound-60, game.world.height-200,'safePlace');//game.world.width/2 ,game.world.height-24
        game.physics.p2.enable(safePlace);
        safePlace.body.static=true;

        for(var i = (Math.round((bound+500)/200)); i >= 0; i--){ 
            road = game.add.sprite((200*i)-(20*i), game.world.height-40,'road');//game.world.width/2 ,game.world.height-24
            game.physics.p2.enable(road);
            roads.push(road);
            road.body.static=true;
        }

        for(var i = 0; i <= (Math.round(bound/100)); i++){
            deathground = game.add.sprite(100*i, game.world.height+80,'deathground');//game.world.width/2 ,game.world.height-24
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

        //life text
        var padLife = game.add.sprite((width*0.15), 30, 'pad');
        padLife.scale.x = 0.4;
        padLife.scale.y = 0.1;
        padLife.anchor.x = 0.5;
        padLife.anchor.y = 0.5;
        lifeText = game.add.bitmapText(25, 16,'quake', 'Life: '+life ,32);
        padLife.fixedToCamera = true;
        lifeText.fixedToCamera = true;

        //level text
        var padlevel = game.add.sprite((width*0.97), 30, 'pad');
        padlevel.scale.x = 0.5;
        padlevel.scale.y = 0.1;
        padlevel.anchor.x = 0.5;
        padlevel.anchor.y = 0.5;
        levelText = game.add.bitmapText(width-110, 16,'quake', 'Level: '+level ,32);
        padlevel.fixedToCamera = true;
        levelText.fixedToCamera = true;
        process.core_game(level);
        

                                var die = game.add.tween(player).to({ y:500,x:1000}, 1000, Phaser.Easing.Bounce.InOut, false, 1000, 4, true);
                        die.start();

    },
    update: function () {
        process.debris(level);
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
            cry.play();
            process.vibrate(3000);

            life = life - 1;
            lifeText.text = 'Life: ' + life;
            process.modal('Respawn in: \n3',true,1000);
            game.physics.p2.pause();

            if(life<=0){
                life = 3;
                level = 1;
                process.modal('Game Over',true,1000);
                game.physics.p2.resume();
                game.state.restart();
            }
            else{
                var x = 3;
                var respawn = setInterval(function(){
                    x--;
                    process.modal("Respawn in: \n"+x,true,1000);
                    if(x==0){
                        game.physics.p2.resume();
                        player.body.reset(100, 100);
                        clearInterval(respawn);
                    }
                },1000);                
            }
        },
        levelHandler: function(){
            level = level + 1;
            levelText.text = 'Level: ' + level;
            process.modal('You passed\nlevel: '+(level-1),true,3000);
            game.physics.p2.pause();
            var respawn = setTimeout(function(){
                game.physics.p2.resume();
                player.body.reset(100, 100);
            },3000);

            if(level>=10){
                life = 3;
                level = 1;
                game.state.restart();
                process.modal('You made it!\nYou finished\nthe\nMAGNITUDE\nChallenge',true,1000);
            }

            return level;
        },
        debris:function(level){
            if (game.time.now > nextFire){
                if(level >= 5){
                    fireRate = 1000-(level*50);
                }
                else{
                    fireRate = 1000-(level*20);
                }
                nextFire = game.time.now + fireRate;
                var fireball = fireballs.getFirstExists(false); // get the first created fireball that no exists atm
                var rand1 = game.rnd.realInRange(1000,4440);
                if (fireball){
                    fireball.exists = true;  // come to existance !
                    fireball.lifespan=3000;  // remove the fireball after 2500 milliseconds - back to non-existance
                    fireball.scale.x = 0.5;
                    fireball.scale.y = 0.5;
                    fireball.reset(rand1, -100);
                    game.physics.p2.enable(fireball);
                    fireball.body.moveDown(500);
                    fireball.body.mass = 1000;
                    fireball.body.setRectangle(20);
                }
            }
        },
        bonusLife:function(){
            var rand1 = game.rnd.realInRange(200,4440);
            var bonusLife = game.add.sprite(rand1, 0,'life');
            game.physics.p2.enable(bonusLife);
            bonusLife.body.moveDown(180);
            bonusLife.body.mass = 1000;
            bonusLife.body.setCircle(20);
            bonusLife.body.fixedRotation=true;
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
        bgQuake:function(){
            var ease = Phaser.Easing.Bounce.InOut;
            var autoStart = false;
            var yoyo = false;
            var duration = 100; // slower  > 100 < faster
            var repeat = 0;
            var delay = 1000/level;
            var shakeLength = -5*level;

            //scene.animations.play('scene'+level);
            var quake = game.add.tween(scene).to({ x: shakeLength}, duration, ease, autoStart, delay, 4, true);

            quake.onComplete.addOnce(process.bgQuake);
            quake.start();
        },
        crackRoad:function(index,time){
            var respawn = setTimeout(function(){
                roads[index].body.moveDown(180); //removing the ground
            },time);
        },
        vibrate:function(time){
            navigator.vibrate(time);
        },
        core_game:function(level){
            process.bgQuake();
            player.body.onBeginContact.add(function(body, bodyB, shapeA, shapeB, equation){
                if(body){
                    if((body.sprite.key == 'fireball') || (body.sprite.key == 'deathground')){
                        process.lifeHandler();
                    }
                    else if((body.sprite.key == 'life')){
                        body.sprite.destroy()
                        life++;
                        lifeText.text = "Life: "+life;
                    }
                    else if((body.sprite.key == 'safePlace')){
                        level = process.levelHandler();
                        process.debris(level);
                        scene.animations.play('scene'+level);
                        if(level >= 5){
                            process.bonusLife();
                            var rand1 = Math.round(game.rnd.realInRange(5,25));
                            // console.log(rand1);
                            process.crackRoad(rand1,3000);
                        }
                    }
                }
            }, this);
        },
        modal:function(text,update,close){
            var pad = game.add.sprite((width*0.5)+50, 200, 'pad');
            pad.scale.x = 0.7;
            pad.scale.y = 0.6;
            pad.anchor.x = 0.5;
            pad.anchor.y = 0.5;
            pad.fixedToCamera = true;
            // pad.alpha = 0.95;

            padText = game.add.bitmapText((width*0.5)+50, 200,'quake', text ,32);
            padText.fixedToCamera = true;
            padText.anchor.x = 0.5;
            padText.anchor.y = 0.5;

            padText.align='center';

            if(update){
                padText.text=text;
            }

            if(close){
                padText.lifespan = close;
                pad.lifespan = close;
                // pad.lifespan = close;
            }
        }
    };
}();    
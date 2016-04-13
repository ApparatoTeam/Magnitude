define([], function(){
    
    return window.app.gameplay = window.app.gameplay || {
        
        time  : 0,
        level : 0,
        lives : 0,
        interval : 0,
        intervalHandler : null,
        scene : 0,
        tilt : 0.1,
        _debris : 1,
        
        tween : {
            dyn : {},
            stc : {}
        },
        
        initialize : function( config, self ){
            self = this;
            
            self.time = config.time;
            self.level = config.level;
            self.lives = config.lives;
            self.interval = config.interval;
            self.scene = config.scene;
            self.tilt = config.tilt;
            self._debris = config._debris;
            
            self.preparation.init(function(){
                
                self.timer.init(function(){
                    if( self.lives > 0 )
                        self.endGame.init( true );
                 });
                
                self.backButton();
                self.activeGameAbortion.init();
                self.inGameQuit.init();
                
                self.audio.init();
                self.background.init();
                self.character.init();
                self.debris.init();
                
             });
            
         },
        
        activeGameAbortion : {
            init : function(){
                this.routeToIndex();
            },
            
            routeToIndex : function( self ){
                self = this;

                document.addEventListener('pause', function(){
                    window.app.gameplay_aborted = true;
                    app.gameplay.indexRouting();
                 });
             }
            
        },
        
        /*--@preparation--*/
        preparation : {
            callback : null,
            
            init : function( callback ){
                this.callback = callback;
                this.animate( false );
             },
            
            animate : function( start, self, t, navbar, prep ){
                self = this;
                
                if( !start ){
                    app.gameplay.topbarDynamic.init();
                    $('#prep-wrap').hide();
                    
                    TweenLite.set('.navbar-inner', {
                        autoAlpha : 1    
                     });
                    
                    self.callback();
                    return;
                 }
                
                app.gameplay.tween.dyn['preparation'] = new TimelineMax({
                    onStart : function(){
                       app.gameplay.topbarDynamic.init(); 
                     },
                    onComplete : function(){
                        self.callback();    
                     }
                 });
                
                navbar = $('.scenes').find('.navbar-inner');
                prep = $('.prep-roller');
                
                app.gameplay.tween.dyn['preparation']
                /*- defaults -*/
                .set( navbar, {
                    autoAlpha : 0
                 })
                .set( '#prep-wrap', {
                    display : 'block'
                 })
                .set( prep, {
                    autoAlpha : 0,
                    y : 70
                 })
                /*- proper -*/
                .to( prep, 0.2, {
                    delay : 0.8,
                    autoAlpha : 1,
                    y : 0
                 }, 'three')
                .to( prep, 0.2, {
                    delay : 0.8,
                    y : -70
                 }, 'two')
                .to( prep, 0.2, {
                    delay : 0.8,
                    y : -140
                 }, 'one')
                .to( prep.closest('#prep-wrap'), 0.3, {
                    delay: 0.8,
                    autoAlpha : 0,
                    onComplete : function(){
                        prep.closest('#prep-wrap').css({ display : 'none' });
                     }
                 }, 'init')
                .to( navbar, 0.3, {
                    delay: 0.8,
                    autoAlpha : 1
                 }, 'init')
                ;
                
             }
            
         }, /*-- preparation --*/
        
        /*--@timer--*/
        timer : {
            callback : null,
            
            handler : null,
            
            init : function( callback ){
                this.callback = callback;
                this.iterate();
             },
            
            iterate : function( self, duration, interval ){
                self = this;
                
                requirejs(['js/lib/moment'], function( moment ){
                    duration = moment.duration( app.gameplay.time, 'milliseconds');
                    interval = 1000;

                    self.handler = window.setInterval(function(){
                        duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');

                        $('.timer-value').html(
                            moment( duration.asMilliseconds() ).format('mm:ss')
                        );

                        self.out( parseInt(duration._milliseconds / 1000) );

                     }, interval );
                });
                    
             },
            
            out : function( ms ){
                
                if( ms == 0 ){
                    window.clearInterval( this.handler );
                    window.setTimeout( this.callback, 500);
                 }
                
                 return;
             }
            
         }, /*-- timer --*/
        
        /*--@topbarDynamic--*/
        topbarDynamic : {
            
            init : function(){
                this.level();
                this.lives( false );
             },
            
            level : function(){
                $('#level-value').html( app.gameplay.level );
             },
            
            lives : function( updater ){
                if( updater ){
                    
                    if( app.gameplay.lives > 0 ){
                        app.gameplay.lives = app.gameplay.lives - 1;
                        app.gameplay.topbarDynamic.lives( false );
                     }
                    
                    if( app.gameplay.lives == 0 )
                        app.gameplay.endGame.init( false );
                 }else{
                     $('.lives-value').html( app.gameplay.lives );
                  }
             }
         },
        
        /*--@endGame--*/
        endGame : {
            result : false,
            callback : null,
            
            clearTimers : function( audio ){
                
                window.cancelAnimationFrame( app.gameplay.collision.raf );
                
                window.clearTimeout( app.gameplay.collision.immunityHandler );
                window.clearTimeout( app.gameplay.debris.batchCleaner );
                
                window.clearInterval( app.gameplay.intervalHandler );
                window.clearInterval( app.gameplay.timer.handler );
                
                app.gameplay.audio._background.stop();
                
                if( $('.debris').length ){
                    $('.debris').each(function(){
                        $(this).remove();
                    });
                 }
                
                app.gameplay.tween.dyn['bg-tilt'].kill();
                
                if( typeof audio == 'boolean'){
                    app.gameplay.audio._button.unload();
                    app.gameplay.audio._button = null;
                    
                    app.gameplay.audio._background.unload();
                    app.gameplay.audio._background = null;
                 }
             },
            
            init : function( result, callback ){
                this.result = result;
                this.callback = callback;
                this.easeIn();
             },
            
            easeIn : function( self ){
                self = this;
                
                app.gameplay.tween.dyn['end-game-overlay'] = new TimelineMax({
                    onStart : function(){
                        self.action.prop();
                     },
                    onComplete : function(){
                        self.action.redirect();
                     }
                 });
                
                app.gameplay.tween.dyn['end-game-overlay']
                .set( '#end-game-ui', {
                    autoAlpha : 0
                 })
                .set( '#egu-slider', {
                    y : '100%'
                 })
                .to( '#end-game-ui', 0.3, {
                    autoAlpha : 1
                 })
                .to( '#egu-slider', 0.8, {
                    y : '0%',
                    ease : Elastic.easeInOut
                 });
                
             },
            
            action : {
                
                prop : function( self, config ){
                    self = this;
                    config = {
                        theme : ( app.gameplay.endGame.result ) ? 'egu-completed' : 'egu-gameover',
                        header : ( app.gameplay.endGame.result ) ? '<span>level<i class="fa fa-trophy"></i></span> <span>passed</span>' : '<span>game</span> <span>over</span>',
                        action : ( app.gameplay.endGame.result ) ? 'next&nbsp;<i class="fa fa-fw fa-play"></i>' : 'retry&nbsp;<i class="fa fa-fw fa-refresh"></i>'
                     };
                    
                    app.gameplay.endGame.clearTimers();
                    
                    $('#end-game-ui').removeAttr('class').addClass( config.theme );
                    $('#egu-header').html( config.header );
                    $('#egu-action-ingame').html( config.action );
                 },
                
                redirect : function( mode ){
                    mode = {
                        url : {
                            dom : 'views/scenes/router.html',
                            script : 'js/mod/level-config/'
                         },
                        config : {
                            level : app.gameplay.level,
                            lives : app.gameplay.lives,
                            interval : app.gameplay.interval,
                            scene : app.gameplay.scene,
                            tilt : app.gameplay.tilt,
                            _debris : app.gameplay._debris
                         }
                     };
                    
                    $('#egu-action-home')
                    .on('click', function(){
                        app.gameplay.indexRouting();
                     });
                    
                    $('#egu-action-ingame')
                    .on('click', function(){
                        
                        if( app.gameplay.endGame.result ){
                            mode.url.script = mode.url.script + 'optimize';
                            mode.config = {
                                level : app.gameplay.level,
                                lives : app.gameplay.lives,
                                interval : app.gameplay.interval,
                                scene : app.gameplay.scene,
                                time : app.gameplay.time,
                                tilt : app.gameplay.tilt,
                                _debris : app.gameplay._debris
                             };
                         }else{
                            mode.url.script = mode.url.script + 'normalize';
                            mode.config = {
                                level : 1,
                                lives : 3,
                                interval : 7 * 1000,
                                scene : 1,
                                time : app.gameplay.time,
                                tilt : 1.0,
                                _debris : 1
                             };
                          }
                        
                        (app.f7.view).router.load({
                            url : mode.url.dom
                         });
                        
                        requirejs([mode.url.script], function(obj){
                            obj.initialize( mode.config );
                         });

                        $(this).off('click');
                        
                        //(app.f7.dom)(document).on('pageInit', '.page[data-page=router]', function(){
                        //    console.log('router config page');
                        // });
                        
                        return false;
                     });
                    
                 }
             },
            
         }, /*-- endGame --*/
        
        /*--@indexRouting--*/
        indexRouting : function(){
            app.gameplay.endGame.clearTimers(true);
            
            (app.f7.view).router.load({
                url : 'index.html'
             });
            
            (app.f7.dom)(document).on('pageInit', '.page[data-page=index]', function(){
                requirejs(['js/initialize'], function(obj){
                    require.undef('js/mod/gameplay');
                    require.undef('js/lib/moment');

                    app.gameplay = null;

                    $('[data-page=scenes]').remove();

                    TweenMax.killAll();

                    obj.initialize();
                 });
            })
            
         },
        
        /*--@inGameQuit--*/
        inGameQuit : {
            timeoutHandler : null,
            status : false,
            
            init : function(){
                this.animate();
             },
            
            animate : function( self, trigger ){
                self = this;
                trigger = $('#ingame-quit-trigger');
                app.gameplay.tween.dyn['in-game-quit'] = new TimelineLite();
                
                app.gameplay.tween.dyn['in-game-quit']
                .to( '#ingame-quit', 0.3, {
                    autoAlpha : 1,
                    x : '0%'
                 })
                .pause()
                ;
                
                trigger.on('click', function(){
                    if( status ){
                        app.gameplay.tween.dyn['in-game-quit'].reverse();
                        self.status = false;
                     }else{
                        app.gameplay.tween.dyn['in-game-quit'].play();
                        self.status = true;
                        
                        self.action();
                      }
                    
                    return false;
                 });
                
                return;
             },
            
            action : function( self ){
                self = this;
                
                $('#ingame-quit-no').on('click', function(){
                    app.gameplay.tween.dyn['in-game-quit'].reverse();
                    self.status = false;
                 });
                
                $('#ingame-quit-yes').on('click', function(){
                    app.gameplay.indexRouting();

                    $(this).off('click');
                 });
                
             }
            
         }, /*-- inGameQuit --*/
        
        /*--@collision --*/
        collision : {
            immunityHandler : null,
            __immunity__ : true,
            raf : null,

            init : function(){
                this.detection();
             },

            detection : function( self ){
                self = this;
                var iterator = function(){
                    
                    if( $('.debris').length ){
                        $('.debris').each( function(){
                            self.calculate( $(this), $('#character-wrap') );
                         });
                     }
                    
                    this.raf = window.requestAnimationFrame( iterator );
                };

                iterator();
            },
            
            calculate : function( debris, character ){
                var cc_debris = { // rect1
                        width : debris.width(),
                        height : debris.height(),
                        x : debris.offset().left,
                        y : debris.offset().top
                     }
                ,   cc_character = { // rect2
                        width : character.width(),
                        height : character.height(),
                        x : character.offset().left,
                        y : character.offset().top
                     }
                ;

                if( cc_debris.x < cc_character.x + cc_character.width &&
                    cc_debris.x + cc_debris.width > cc_character.x &&
                    cc_debris.y < cc_character.y + cc_character.height &&
                    cc_debris.height + cc_debris.y > cc_character.y && this.__immunity__
                ){
                    if( debris.data('hit') != 1 ){
                        app.gameplay.topbarDynamic.lives(true);
                        navigator.vibrate([300, 100, 300, 100, 300]);
                        this.immunity();
                     }

                    debris.data('hit', 1);
                 }
                
             },
            
            immunity : function( timeout, self ){
                self = this;
                timeout = 3000;
                
                app.gameplay.character.animate.strucked();
                self.__immunity__ = false;
                console.log('immunity on');
                
                self.immunityHandler = window.setTimeout(function(){
                    self.__immunity__ = true;
                    console.log('immunity off');
                }, timeout );
                
             },
            
         }, /*-- collision --*/
        
        /*--@debris--*/
        debris : {
            batchCleaner : null,
            
            init : function(){
                this.build();
             },
            
            randomize : {
                debrisPosition : {
                    batch : [],
                    
                    x : function( min, max, x, grid ){
                        grid = app.gameplay.character.steps;
                        min = 0;
                        max =  grid - 1;
                        x = Math.floor(Math.random() * (max - min + 1)) + min;
                        
                        for( var a = 0; a < grid; a+=1 ){
                            if( this.batch.indexOf( x ) == -1 ){
                                this.batch.push( x );
                                return x;
                            }else{
                                x += 1;
                                if( x > max )
                                    x = 0;    
                             }
                         }
                    },
                    
                    y : function( min, max ){
                        min = 0;
                        max = 1;
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    },
                 },
                
                debrisBackground : function(min, max){
                    min = 1;
                    max = 6;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                 }
                
             },
            
            build : function( self, container, dom ){
                self = this;
                container = $('#debris-wrap');
                
                function iterate(){
                    dom = '';
                    for(var d = 0; d < app.gameplay._debris; d+=1 ){
                        dom += '<div data-hit="0"';
                        dom += 'class="debris" style="'; 
                        dom += 'background-image: url(dist/img/scenes/debris/'+ self.randomize.debrisBackground() +'.png); ';
                        dom += 'width: '+ ( $(window).innerWidth() / app.gameplay.character.steps ) +'px; ';
                        dom += 'height: '+ ( $(window).innerWidth() / app.gameplay.character.steps ) +'px; ';
                        dom += 'top: '+ ( $(window).innerWidth() / app.gameplay.character.steps ) * self.randomize.debrisPosition.y() + 'px; ';
                        dom += 'left: '+ ( $( window).innerWidth() / app.gameplay.character.steps ) * self.randomize.debrisPosition.x() + 'px; ';
                        dom += '"><span class="pulse"></span><span class="pulse"></span>';
                        dom += '</div>';
                     }

                    container.append( dom );
                    
                    container.children('.debris').each(function(n){
                        var $this = $(this);
                        
                        TweenMax
                        .to( $this, ( app.gameplay.interval / 1000 ), {
                            y : window.screen.height - $this.height(),
                            ease : Linear.easeNone,
                            onStart : function(){
                                TweenMax.staggerTo( $this.children('.pulse'), 0.7, {
                                    scale: 1,
                                    autoAlpha : 1,
                                    repeat : -1,
                                    yoyo : true,
                                    onCompleteParams : ['{self}'],
                                    onComplete : function( tween ){
                                        tween.kill();
                                     }
                                }, 0.3 );
                             },
                            onCompleteParams : ['{self}'],
                            onComplete : function( tween ){
                                $this.remove();
                                tween.kill();
                             }
                         }, 0 );
                     });
                    
                    self.batchCleaner = window.setTimeout(function(){
                        self.randomize.debrisPosition.batch = [];
                     }, (app.gameplay.interval - 100) );
                    
                 } /*- iterate -*/
                
                iterate();
                app.gameplay.intervalHandler = setInterval( iterate, app.gameplay.interval );
                
                app.gameplay.collision.init();
                
                return this;
             }
            
         }, /*-- debris --*/
        
        /*--@background--*/
        background : {
            dom : null,
            
            init : function(){
                this.setImage();
                
            },
            
            transition : {
                ps_forward : 0,
                ps_backward : 0,
                widthChecker : 0,
                perWidth : 0,
                totalWidth : 0,
                
                setStackWidth : function( inner, img, self ){
                    self = this;
                    inner = $('#background-inner');
                    img = $('.background');
                    
                    this.perWidth = img.width();
                    this.totalWidth += this.perWidth;
                    
                    inner.width( self.totalWidth );
                    
                    return;
                 },
                
                x : function( self ){
                    self = this;
                    
                    if( this.widthChecker > 1 ){
                        self.setStackWidth();
                        this.widthChecker = 0;
                     }
                    
                    if( app.gameplay.character.position == 4 ){ // bg move forward
                        console.log('move forward');
                        
                        if( this.ps_forward > 3 ){
                            $('#background-inner').append('<img class="background" src="dist/img/scenes/backgrounds/scene-'+ app.gameplay.scene +'.svg">');
                            this.ps_forward = 0;
                         }
                        
                        TweenLite.to('#background-inner', 0.3, {
                            x : "-="+app.gameplay.character.movement.stepAmount(),
                            onComplete : function(){
                                self.ps_forward+=1;    
                             }
                         });
                        
                     }

                    if( app.gameplay.character.position == -4 && $('#background-inner').offset().left < 0 ){ // bg move backward
                        console.log('move backward');

                        TweenLite.to('#background-inner', 0.3, {
                           x : "+="+app.gameplay.character.movement.stepAmount()
                        });
                     }
                    
                    this.widthChecker += 1;
                    
                }
                
             },
            
            setImage : function( index, self ){
                self = this;
                
                TweenLite.set( '.background', {
                    attr : { 'src' : 'dist/img/scenes/backgrounds/scene-'+ app.gameplay.scene +'.svg' },
                    onComplete : function(){
                        //self.sceneEffect();
                        self.animate();
                    }
                });
             },
            
            sceneEffect : function( bg ){
                bg = $('[data-page=scenes]');
                
                if( app.gameplay.level >= 1 && app.gameplay.level <= 3 ){
                    bg.removeClass('scene-afternoon scene-nightfall').addClass('scene-daylight');
                 }else if( app.gameplay.level >= 4 && app.gameplay.level <= 7 ){
                    bg.removeClass('scene-daylight scene-nightfall').addClass('scene-afternoon');
                  }else if( app.gameplay.level >= 8 ){
                    bg.removeClass('scene-afternoon scene-daylight').addClass('scene-nightfall');
                   }
            },
            
            animate : function(){
                /*- whole svg view -*/
                app.gameplay.tween.dyn['bg-tilt'] = new TimelineMax({ 
                    repeat: -1,
                    yoyo: true
                });
                
                app.gameplay.tween.dyn['bg-tilt']
                .fromTo('#background-wrap', 0.2, {
                    y: 1 * app.gameplay.tilt
                 }, {
                     y: -1 * app.gameplay.tilt
                  });
             }
            
         }, /*-- background --*/
        
        /*-- @audio --*/
        audio : {
            _button : null,
            _background : null,
            
            init : function(){
                this.buttonSFX();
                this.backgroundSFX();
            },
            
            buttonSFX : function( btn, self ){
                self = this;
                this._button = new Howl({
                    urls: ['dist/audio/buttons.mp3']
                 });  

                $('.button-sfx').on('click', function(){
                    if( window.localStorage.getItem('audio-sfx-setting') !== 'disabled'){
                        self._button.play();
                     }
                 });
            },
            
            backgroundSFX : function( bgsfx, self ){
                self = this;
                this._background = new Howl({
                    urls: ['dist/audio/earthquake.mp3'],
                    loop: true
                 });
                
                ( window.localStorage.getItem('audio-sfx-setting') !== 'disabled') ? self._background.play() : null;
             }
        }, /*-- audio --*/
        
        /*--@backButton--*/
        backButton : function(){
            
            document.addEventListener('backbutton', function(){
                if( (app.f7.view.activePage.name).match(/scenes/) ){
                    $('#ingame-quit-trigger').trigger('click');
                    return false;
                 }
             });
            
         }, /*-- backButton --*/
        
        /*--@character--*/
        character : {
            
            position : 0,
            strucked : false,
            steps : ( 8 + 1 ),
            
            init : function( self ){
                self = this;
                
                this.controlActivation( true, function(){
                    self.movement.tap();
                 });
                
             }, /*-- character.init --*/
            
            movement : {
                tap : function( self ){
                    self = this;
                    
                    $('.move-key')
                    .on('click', function(event){
                        if( !(event.originalEvent) ){
                            return;
                         }
                        
                        app.gameplay.character.animate.controlTap( $(this) );
                        self.set( $(this).index() );
                        
                     });
                    
                    return this;
                 },
                
                set : function( direction, self ){
                    self = this;
                    var min, max;
                    
                    if( direction < 1 ){ // left
                        app.gameplay.character.position -= 1;
                     }else{ // right
                        app.gameplay.character.position += 1;
                      }
                    
                    app.gameplay.character.animate.running( direction );
                    
                    min = ( (app.gameplay.character.steps - 1) / 2) * -1;
                    max = ( (app.gameplay.character.steps - 1) / 2);
                    
                    if( app.gameplay.character.position >= min && app.gameplay.character.position <= max ){
                        
                        app.gameplay.character.animate.translate( 
                            app.gameplay.character.position, 
                            self.stepAmount() 
                         ); 
                        
                     }else if( app.gameplay.character.position < min ){
                        app.gameplay.character.position = -4;
                      }else if( app.gameplay.character.position > max ){
                        app.gameplay.character.position = 4;
                       }
                    
                    app.gameplay.background.transition.x();
                    
                 },
                
                stepAmount : function(){
                    return $(window).innerWidth() / app.gameplay.character.steps;
                 }
                
             }, /*-- character.movement --*/
            
            animate : {
                running : function( direction ){
                    app.gameplay.tween.dyn['char-stance'] = new TimelineLite();
                    
                    app.gameplay.tween.dyn['char-stance']
                    .set('#character', {
                        scaleX : ( direction < 1 ) ? -1 : 1
                     }).addPause()
                    .set('#character', {
                        attr : { 'class' : 'played' }
                     })
                    .to('#character', 0.8, {
                        attr : { 'class' : 'paused' }
                     });
                 },
                
                translate : function( amount, stepAmount ){
                    TweenMax.to('#character-wrap', 0.2, {
                        x : amount * stepAmount,
                        ease : Linear.easeNone
                     })
                 },

                strucked : function(dim, duration){
                    duration = 0.5;
                    dim = 0.3;
                    
                    app.gameplay.tween.dyn['char-strucked'] = new TimelineMax({
                        repeat : 3
                     });
                     
                    app.gameplay.tween.dyn['char-strucked']
                    /*- flash character-*/
                    .to('#character-wrap', duration, {
                        autoAlpha : dim
                     }, 'flash-out')
                    .to('#character-wrap', duration, {
                        autoAlpha : 1
                     }, 'flash-in')
                    
                    /*- life indicator -*/
                    .to('#lives-wrap', duration, {
                        autoAlpha : dim
                     }, 'flash-out')
                    .to('#lives-wrap', duration, {
                        autoAlpha : 1
                     }, 'flash-in');
                 },

                controlTap : function(target){
                    app.gameplay.tween.dyn['tap-control'] = new TimelineLite();
                    
                    app.gameplay.tween.dyn['tap-control']
                    .to(target, 0.2, {
                        backgroundColor : 'rgba(255, 235, 59, 0.5)'
                     })
                    .to(target, 0.2, {
                        backgroundColor : 'rgba(0, 0, 0, 0.8)'
                     });
                 }
                
             }, /*-- character.animate --*/
            
            controlActivation : function( status, callback ){
                
                app.gameplay.tween.dyn['control-activation'] = new TimelineMax({
                    onComplete : ( typeof callback == 'function' ) ? callback : null
                 });
                 
                app.gameplay.tween.dyn['control-activation']
                .to('.move-key', 0.9, {
                    scale: ( status ) ? 1 : 0,
                    autoAlpha: ( status ) ? 1 : 0,
                    ease : Bounce.easeInOut
                 }, 'keys-visible')
                .set('#character', {
                   attr : { 'class' : 'played' }
                 }, 'keys-visible')
                .to('#character', 0.2, {
                   attr : { 'class' : 'paused' },
                   autoAlpha : 1    
                 }, 'keys-visible+=0.7');
                    
                
                return this;
             }/*-- character.controlActivation --*/
            
         } /*-- character --*/
        
     }; /*-- app.gameplay --*/
});
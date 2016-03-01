define([], function(){
    
    return window.app.gameplay = window.app.gameplay || {
        
        time  : 60 * 1000,
        level : 1,
        lives : 3,
        interval : 5000,
        intervalHandler : null,
        
        initialize : function( config, self ){
            self = this;
            
            self.time = 60 * 1000;
            self.level = config.level;
            self.lives = config.lives;
            self.interval = config.interval;
            
            self.preparation.init(function(){
                
                self.timer.init(function(){
                    if( self.lives > 0 )
                        self.endGame.init( true );
                 });
                
                self.backButton();
                self.inGameQuit.init();
                self.character.init();
                self.debris.init();
                
             });
            
         },
        
        removeConfigurators : {
            init : function(){
                this.set();
             },
            
            set : function( configs ){
                configs = ['normalize','optimize'];
                
                (['normalize','optimize']).forEach(function(x, y){
                    if( require.defined('js/mod/level-config/'+y ) ){
                        
                     }
                 });
             }
         },
        
        preparation : {
            callback : null,
            
            init : function( callback ){
                this.callback = callback;
                this.animate( true );
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
                
                t = new TimelineMax({
                    onStart : function(){
                       app.gameplay.topbarDynamic.init(); 
                     },
                    onComplete : function(){
                        self.callback();    
                     }
                 });
                
                navbar = $('.scenes').find('.navbar-inner');
                prep = $('.prep-roller');
                
                t
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

                        console.log( duration._milliseconds );

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
        
        endGame : {
            result : false,
            callback : null,
            
            clearTimers : function(){
                //--* window.clearTimeout( app.gameplay.inGameQuit.timeoutHandler );
                window.clearInterval( app.gameplay.intervalHandler );
                window.clearInterval( app.gameplay.timer.handler );
             },
            
            init : function( result, callback ){
                this.result = result;
                this.callback = callback;
                
                this.easeIn();
             },
            
            easeIn : function( self ){
                self = this;
                
                (new TimelineMax({
                    onStart : function(){
                        self.action.prop();
                     },
                    onComplete : function(){
                        self.action.redirect();
                     }
                 }))
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
                            interval : app.gameplay.interval
                         }
                     };
                    
                    $('#egu-action-home')
                    .on('click', function(){
                        app.gameplay.indexRouting();
                        
                        return false;
                     });
                    
                    $('#egu-action-ingame')
                    .on('click', function(){
                        
                        if( app.gameplay.endGame.result ){
                            mode.url.script = mode.url.script + 'optimize';
                            mode.config = {
                                level : app.gameplay.level,
                                lives : app.gameplay.lives,
                                interval : app.gameplay.interval
                             };
                         }else{
                            mode.url.script = mode.url.script + 'normalize';
                            mode.config = {
                                level : 1,
                                lives : 3,
                                interval : 10 * 1000
                             };
                          }
                        
                        (app.f7.view).router.load({
                            url : mode.url.dom
                         });

                        requirejs([mode.url.script], function(obj){
                            obj.initialize( mode.config );
                         });
                        
                        $(this).off('click');
                        
                        return false;
                     });
                    
                 }
             },
            
         }, /*-- endGame --*/
        
        indexRouting : function(){
            app.gameplay.endGame.clearTimers();

            (app.f7.view).router.load({
                url : 'index.html'
             });

            requirejs(['js/initialize'], function(obj){
                obj.initialize();
             });
         },
        
        inGameQuit : {
            timeoutHandler : null,
            timeline : new TimelineLite(),
            status : false,
            
            init : function(){
                this.animate();
             },
            
            animate : function( self, trigger ){
                self = this;
                trigger = $('#ingame-quit-trigger');
                
                this.timeline
                .to( '#ingame-quit', 0.3, {
                    autoAlpha : 1,
                    x : '0%'
                 })
                .pause()
                ;
                
                trigger.on('click', function(){
                    if( status ){
                        self.timeline.reverse();
                        self.status = false;
                     }else{
                        self.timeline.play();
                        self.status = true;
                        /*
                        self.timeoutHandler = window.setTimeout(function(){
                            self.timeline.reverse();
                            self.status = false;
                         }, 3000);
                        */
                        self.action();
                      }
                    
                    return false;
                 });
                
                return;
             },
            
            action : function( self ){
                self = this;
                
                $('#ingame-quit-no').on('click', function(){
                    self.timeline.reverse();
                    self.status = false;
                 });
                
                $('#ingame-quit-yes').on('click', function(){
                    app.gameplay.indexRouting();

                    $(this).off('click');
                 });
                
             }
            
         }, /*-- inGameQuit --*/
        
        debris : {
            
            init : function(){
                this.build();
             },
            
            randomize : {
                debrisPosition : function( min, max ){
                    min = 0;
                    max = app.gameplay.character.steps;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                 },
                
                debrisSpeed : function( min, max ){
                    min = app.gameplay.interval - 1000;
                    max = app.gameplay.interval;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                 },
                
                debrisBackground : function(min, max){
                    min = 1;
                    max = 7;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                 },
                
                debrisRotation : function(min, max){
                    min = -10;
                    max = 10;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                 }
             },
            
            collision : {
                timeout : 0,
                detection : function( debris, character, hit ){
                    var cc_debris = {
                            radius : (debris.innerWidth() / 2),
                            x : debris.offset().left + (debris.innerWidth() / 2),
                            y : debris.offset().top + (debris.innerWidth() / 2)
                         }
                    ,   cc_character = {
                            radius : (character.innerWidth() / 2),
                            x : character.offset().left + (debris.innerWidth() / 2),
                            y : character.offset().top + (debris.innerWidth() / 2)
                         }
                    
                    ,   dx = cc_character.x  - cc_debris.x
                    ,   dy = cc_character.y - cc_debris.y
                    ,   distance = Math.sqrt(dx * dx + dy * dy)
                    ;

                    if ( distance < cc_debris.radius + cc_character.radius ) {
                        app.gameplay.character.animate.strucked();
                        
                        /*-
                        hit = parseInt( debris.data('hit') );
                        if( hit <= 1 ){
                            app.gameplay.character.animate.strucked();
                            app.gameplay.topbarDynamic.lives( true );
                         }
                        hit = hit + 1;
                        -*/
                     }
                    
                 }
             },
            
            build : function( self, container, dom ){
                self = this;
                container = $('#debris-wrap');
                
                function iterate(){
                    dom = '';
                    for(var d = 0; d < (app.gameplay.level + 1); d+=1 ){
                        dom += '<div data-hit="0"';
                        dom += 'class="debris" style="'; 
                        dom += 'background-image: url(dist/img/scenes/debris/'+ self.randomize.debrisBackground() +'.png); ';
                        dom += 'width: '+($(window).innerWidth() / app.gameplay.character.steps)+'px; ';
                        dom += 'height: '+($(window).innerWidth() / app.gameplay.character.steps)+'px; ';
                        dom += 'left: '+ ($(window).innerWidth() / app.gameplay.character.steps) * self.randomize.debrisPosition()+'px; ';
                        dom += '"></div>';
                     }

                    container.append( dom );

                    container.children('.debris').each(function(n){

                        var $this = $(this);

                        TweenMax.to( $this, (self.randomize.debrisSpeed() / 1000), {
                            y : window.screen.height,
                            rotationZ : ( self.randomize.debrisRotation() * 10 ),
                            onUpdate : function(){
                                self.collision.detection( $this, $('#character-wrap') );
                             },
                            onComplete : function(){
                                $this.remove();
                             }
                         }, 0);
                     });
                 }
                
                iterate();
                
                app.gameplay.intervalHandler = setInterval( iterate, app.gameplay.interval );
                
                // window.clearInterval( app.gameplay.intervalHandler );
                
                return this;
             }
            
            
         }, /*-- debris --*/
        
        background : {
            
         }, /*-- background --*/
        
        backButton : function(){
            
            document.addEventListener('backbutton', function(){
            
                if( (app.f7.view.activePage.name).match(/scenes/) ){
                    app.gameplay.indexRouting();
                 }else if( (app.f7.view.activePage.name).match(/index/) ){
                    navigator.app.exitApp();
                  }
                
             });
            
         }, /*-- backButton --*/
        
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
                    
                    $('#character-wrap').on('click', function(){
                        app.gameplay.topbarDynamic.lives( true );
                     });
                    
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
                    
                 },
                
                stepAmount : function(){
                    return $(window).innerWidth() / app.gameplay.character.steps;
                 }
                
             }, /*-- character.movement --*/
            
            animate : {
                running : function( direction ){
                    (new TimelineLite)
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
                    duration = 0.3;
                    dim = 0.3;
                    
                    ( new TimelineMax({
                        repeat : 3,
                        onComplete : function(){
                            
                         }
                     }) )
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
                     }, 'flash-in')
                 },

                controlTap : function(target){
                    ( new TimelineLite )
                    .to(target, 0.2, {
                        backgroundColor : 'rgba(255, 235, 59, 0.5)'
                     })
                    .to(target, 0.2, {
                        backgroundColor : 'rgba(0, 0, 0, 0.3)'
                     });
                 }
                
             }, /*-- character.animate --*/
            
            controlActivation : function( status, callback ){
                
                (new TimelineMax({
                    onComplete : ( typeof callback == 'function' ) ? callback : null
                 }))
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
        
     };
    
});
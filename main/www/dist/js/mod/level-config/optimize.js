define([], function(){
    
    return window.app.routerOptimizer = window.app.routerOptimizer || {
        
        config : {
            level : 0,
            lives  : 0,
            time : 0,
            interval : 0,
            scene : 1,
            tilt : 0.1,
            _debris : 1
         },
        
        initialize : function( ref ){
            this.assess( ref );
         },
        
        assess : function( param, self ){
            self = this;
            
            this.config.level = param.level;
            this.config.lives = param.lives;
            this.config.time = param.time;
            this.config.interval = param.interval;
            this.config.scene = param.scene;
            this.config.tilt = param.tilt;
            this.config._debris = param._debris;
            
            require.undef('js/mod/gameplay');
            require.undef('js/lib/moment');
            
            app.gameplay = null;
            $('[data-page=scenes]').remove();
            
            window.setTimeout( function(){
                self.organize();
             }, 350 );
         },
        
        calibrate : {
            init : function(){
                this.level();
                this.debris.init();
                this.background.init();
            },
            
            level : function(){
                if( app.routerOptimizer.config.lives < 1 ) return;
            
                app.routerOptimizer.config.level = app.routerOptimizer.config.level + 1; 
            },
            
            debris : {
                init : function(){
                    this.speed();
                    this.count();
                },
                
                speed : function(){
                    if( app.routerOptimizer.config.level <= 10 ){
                        app.routerOptimizer.config.interval = app.routerOptimizer.config.interval - 500; 
                     }else if( app.routerOptimizer.config.level > 10 ){
                        app.routerOptimizer.config.interval = app.routerOptimizer.config.interval - 100
                      }
                },
                
                count : function(){
                    if( app.routerOptimizer.config._debris < 9 ){
                        app.routerOptimizer.config._debris = Math.round( app.routerOptimizer.config.level * 0.7 );
                    }else{
                        app.routerOptimizer.config._debris = 8;    
                     }
                 },
            },
            
            background : {
                init : function(){
                    this.image();
                    this.tilt();
                },
                
                image : function( min, max ){
                    min = 1;
                    max = 3;
                    app.routerOptimizer.config.scene = Math.floor(Math.random() * (max - min + 1)) + min;
                },
                
                tilt : function(){
                    if( app.routerOptimizer.config.tilt <= 10.5 )
                        app.routerOptimizer.config.tilt += 0.5;
                    else
                        app.routerOptimizer.config.tilt = 10.5;
                },
                
                panorama : function(){}
            }
            
        }, /*-- calibrate --*/
        
        organize : function( self ){
            self = this; 
            
            self.calibrate.init();
            
            window.setTimeout( function(){
                self.route();
             }, 350);
         }, /*-- organize --*/
        
        route : function( self ){
            self = this;
            
            (app.f7.view).router.load({
                url : 'views/scenes/scenes.html'
             });
            
            requirejs(['js/mod/gameplay'], function(obj){
                obj.initialize( self.config );
             });
            
            return;
         } /*-- route --*/
     };
    
});
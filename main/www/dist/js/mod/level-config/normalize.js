define([], function(){
    
    return window.app.routerNormalize = window.app.routerNormalize || {
        
        config : {
            level : 1,
            lives  : 3,
            time : 1 * 30000,
            interval : 7 * 1000,
            scene : 3,
            tilt : 1.0,
            _debris : 1
         },
        
        initialize : function( ref ){
            this.assess( ref );
         },
        
        assess : function( param, self ){
            self = this;
            
            this.config.level = param.level || this.config.level;
            this.config.lives = param.lives || this.config.lives;
            this.config.time = param.time || this.config.time;
            this.config.interval = param.interval || this.config.interval;
            this.config.scene = param.scene || this.config.scene;
            this.config.tilt = param.tilt || this.config.tilt;
            this.config._debris = param._debris || this.config._debris;
            
            /*- neutralize -*/
            require.undef('js/initialize');
            require.undef('js/mod/gameplay');
            require.undef('js/lib/moment');

            app.core = null;
            app.gameplay = null;

            $('[data-page=index]').remove();
            $('[data-page=scenes]').remove();
            
            window.setTimeout( function(){
                self.route();
             }, 700 );
         },
        
        route : function( self ){
            self = this; 
            
            (app.f7.view).router.load({
                url : 'views/scenes/scenes.html'
             });
            
            requirejs(['js/mod/gameplay'], function(obj){
                obj.initialize( self.config );
             });
            
         }
     };
    
});
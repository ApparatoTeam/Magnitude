define([], function(){
    
    return window.app.routerNormalize = window.app.routerNormalize || {
        
        config : {
            level : 1,
            lives  : 3,
            time : 60 * 1000,
            interval : 6 * 1000
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
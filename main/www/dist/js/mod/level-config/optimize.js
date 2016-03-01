define([], function(){
    
    return window.app.routerOptimizer = window.app.routerOptimizer || {
        
        config : {
            level : 0,
            lives  : 0,
            time : 0,
            interval : 0
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
            
            require.undef('js/mod/gameplay');
            require.undef('js/lib/moment');
            
            app.gameplay = null;
            $('[data-page=scenes]').remove();
            
            window.setTimeout( function(){
                self.organize();
             }, 350 );
         },
        
        organize : function( self ){
            self = this; 
            
            if( this.config.lives < 1 ) return;
            
            this.config.level = this.config.level + 1; 
            
            if( this.config.level <= 10 ){
                this.config.interval = this.config.interval - 500; 
             }else if( this.config.level > 10 ){
                this.config.interval = this.config.interval - 100
              }
            
            window.setTimeout( function(){
                self.route();
             }, 350);
         },
        
        route : function( self ){
            self = this;
            
            (app.f7.view).router.load({
                url : 'views/scenes/scenes.html'
             });
            
            requirejs(['js/mod/gameplay'], function(obj){
                obj.initialize( self.config );
             });
            
            return;
         }
     };
    
});
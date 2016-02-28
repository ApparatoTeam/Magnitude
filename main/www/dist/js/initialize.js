define(function(require){
    
    require('text');
    require('jQuery');
    require('lettering');
    require('f7');
    require('GSAP');
    
    return window.app.core = window.app.core || {
        
        initialize : function(){
            this.framework7.init();
         },
        
        framework7 : {
            app : null,
            view: null,
            dom : Dom7,
            
            init : function( self ){
                this.app = new Framework7({
                    material : true
                 });
                
                this.view = (this.app).addView('.view-main', {
                    dynamicNavbar : true
                 });
                
                this.debug(this.view, './views/scenes/scenes.html');
                
                //this.pages();
                
                return this;
             },
            
            intro : function( self, param ){
                self = this;
                
                
                return this;
             },
            
            debug : function( view, page ){
                (view).router.load({
                    url : page,
                    animatePages : true
                 });
                
                requirejs(['js/mod/gameplay'], function(obj){
                    obj.initialize({
                        time  : 3000,
                        level : 1,
                        lives : 3,
                        interval : 10000
                     });
                 });
                
             },
            
            pages : function( pages ){
                var self = this
                ,   $$ = self.dom
                ;
                
                pages = [
                    'settings',
                    'instructions',
                    'scene-1'
                 ];
                
                for(var a = 0; a < pages.length; a++){
                    $$( document ).on('pageAfterAnimation', '.page[data-page='+pages[a]+']', function(page){
                        console.log( page.detail.page.name );
                        //app.core.mod.init( page.detail.page.name );
                     });
                 }
                
                return this;
             }
         },
        
        mod : {
            
            init : function(page){
                
                console.log( page );
                
                requirejs([ 'js/mod/'+page ], function(obj){
                    obj.initialize();
                 });
                
                return this;
             }
            
         }
    };
    
});
define([], function(){
    
    return window.app.core = window.app.core || {
        
        initialize : function(){
            this.routing.scenes();
         },
        
        routing : {
            
            scenes : function(){
                $('#menu-link-scene').on('click', function(){
                    (app.f7.view).router.load({
                        url : './views/scenes/router.html',
                        animatePages : true
                     });
                    requirejs(['js/mod/level-config/normalize'], function(obj) {
                        obj.initialize({
                            level : 1
                         });
                     });
                });
                
             }
            
         }, /*-- routing --*/
        
        
    };
    
});
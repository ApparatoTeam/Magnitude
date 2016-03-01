define(function(require){

    require('text');
    require('jQuery');
    require('lettering');
    require('f7');
    require('GSAP');
    
    return window.app.f7 = window.app.f7 || {
        app : null,
        view: null,
        dom : Dom7,
        
        initialize : function(){
            
            this.app = new Framework7({
                material : true
             });

            this.view = (this.app).addView('.view-main', {
                dynamicNavbar : true
             });
            
            this.routeAction();
         },
        
        routeAction : function(){
            requirejs(['js/initialize'], function( obj ){
                obj.initialize();
             });
         }
     };
    
});
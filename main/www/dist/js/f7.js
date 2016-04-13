define(function(require){

    require('text');
    require('jQuery');
    require('lettering');
    require('f7');
    require('GSAP');
    require('howler');
    
    return window.app.f7 = window.app.f7 || {
        app : null,
        view: null,
        dom : Dom7,
        
        initialize : function( self ){
            self = this;
            
            this.app = new Framework7({
                material : true
             });

            this.view = (this.app).addView('.view-main', {
                dynamicNavbar : true
             });
            
            this.preloader.init( self.routeAction );
         },
        
        preloader : {
            callback : null,
            
            init : function( callback ){
                this.callback = callback;
                this._1_checkVersion();
            },
            
            _1_checkVersion : function( self ){
                self = this; 
                
                if( parseFloat( (navigator.userAgent).match(/Android\s+([\d\.]+)/)[1] ) >= 4.2 || true ){
                    
                    if( 'Audio' in window ){
                        this.callback();
                        return;
                    }else{
                        ( app.f7.app ).addNotification({
                            message: 'Game audio is not supported on this device, please update your driver.',
                            button: {
                                text: 'Proceed',
                                color: 'yellow',
                                onClick : function(){
                                    self.callback();
                                }
                             }
                        }); 
                     }
                    
                }else{
                    ( app.f7.app ).addNotification({
                        message: 'Minminum version of 4.4+ required',
                        button: {
                            text: 'Close',
                            color: 'yellow',
                            onClick : function(){
                                navigator.app.exitApp();
                            }
                         }
                    });
                 }
            }
            
        },
        
        routeAction : function(){
            requirejs(['js/initialize'], function( obj ){
                TweenLite.to('#progressbar-wrap', 0.2, {
                    autoAlpha : 0,
                    onComplete : function(){
                        obj.initialize();
                    }
                });
             });
         }
     };
    
});
define([], function(){
    
    return window.app.core = window.app.core || {
        
        initialize : function(){
            this.preloaderDONE();
            this.routing.boot();
            this.cacheBackground();
            this.audio.init();
            this.activeGameAbortionNotification();
         },
        
        cacheBackground : function( bg ){
            bg = [
                'text!img/scenes/backgrounds/scene-1.svg',
                'text!img/scenes/backgrounds/scene-2.svg',
                'text!img/scenes/backgrounds/scene-3.svg'
            ];
            
            for( var x = 1; x < bg.length + 1; x+=1 ){
                if( window.localStorage.getItem('background-'+x) != undefined )
                    return;
            }
            
            requirejs(bg, function( b1, b2, b3 ){
                app.core.storage({
                    'background-1': b1,
                    'background-2': b2,
                    'background-3': b3
                });
            });
            
         }, /*-- cacheBackground --*/
        
        preloaderDONE : function(){
            $('#progressbar-wrap').remove();
         },
        
        activeGameAbortionNotification : function(){
            if( window.app.gameplay_aborted ){
                document.addEventListener('resume', function(){
                    app.f7.app.modal({
                        title : 'Game Aborted',
                        text : 'A game left, is a game gone',
                        buttons : [
                            {
                                text : 'Got it',
                                onClick : function(){
                                    window.app.gameplay_aborted = false;
                                }
                            }
                        ]

                    });
                });
             }
            
            return;
        }, /*-- activeGameAbortionNotification --*/
        
        audio : {
            init : function(){
                this.buttons();       
             },
            
            buttons : function( btn ){
                
                var button = new Howl({
                    urls: ['dist/audio/buttons.mp3']
                 });  
                
                $('[data-menu-alias], .button-sfx').on('click', function(){
                    if( window.localStorage.getItem('audio-sfx-setting') !== 'disabled'){
                        button.play();
                    }
                    
                    $('.modal-button').on('click', function(){
                        ( window.localStorage.getItem('audio-sfx-setting') !== 'disabled') ? button.play() : null;
                     });
                 });
                
                return;
            }
        },
        
        routing : {
            boot : function(){
                this.index.init();
                this.funFacts.init();
                this.instructions.init();
                this.physicalBackButton();
             },
            
            physicalBackButton : function(){
                document.addEventListener('backbutton', function(){
                    if( (app.f7.view.activePage.name).match(/index/) ){
                        app.f7.app.modal({
                            title : 'Exit magnitude?',
                            buttons : [
                                {
                                    text : 'No'
                                },
                                {
                                    text : 'Yes',
                                    onClick : function(){
                                        navigator.app.exitApp();
                                    }
                                }
                            ]
                        });
                    }
                    
                    return false;
                });
            },
            
            instructions : {
                init : function(){
                    this.activation();
                 },
                
                activation : function(){
                     self = this;
                    ( app.f7.dom )(document).on('pageInit', '.page[data-page=instructions]', function(){
                        app.core.audio.init();
                        self.ds_physicalButton();
                    });
                 },
                
                ds_physicalButton : function(){
                    document.addEventListener('backbutton', function(){
                        if( (app.f7.view.activePage.name).match(/instructions/) ){
                            return false;
                         }
                     });
                 }
             },
            
            funFacts : {
                init : function(){
                    this.activation();
                 },
                
                activation : function( self ){
                    self = this;
                    ( app.f7.dom )(document).on('pageInit', '.page[data-page=fun-facts]', function(){
                        app.core.audio.init();
                        self._swiper();
                        self.ds_physicalButton();
                    });
                },
                
                _swiper : function(){
                    new Swiper('.swiper-container', {
                        speed: 400,
                        //direction: 'vertical',
                        loop: true,
                        pagination : '.swiper-pagination'
                    });
                 },
                
                ds_physicalButton : function(){
                    document.addEventListener('backbutton', function(){
                        if( (app.f7.view.activePage.name).match(/instructions/) ){
                            return false;
                         }
                     });
                 }
            },
            
            index : {
                init : function(){
                    this.scenes();
                    this.exitApp();
                    this.settings();
                },

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

                 },

                settings : function( self, dom ){
                    if( window.localStorage.getItem('audio-sfx-setting') == null )
                        window.localStorage.setItem('audio-sfx-setting', 'enabled');
                    
                    $('[data-menu-alias=settings]').on('click', function(){
                        dom = '<div class="list-block">';
                        dom += '<ul>';
                        dom += '<li>';
                        dom += '  <label class="label-radio item-content">';
                        dom += '    <input type="radio" name="audio-sfx-setting" value="enabled" '+ ( ( window.localStorage.getItem('audio-sfx-setting') == 'enabled' ) ? 'checked="checked"' : '' ) +' >';
                        dom += '    <div class="item-media">';
                        dom += '      <i class="icon icon-form-radio"></i>';
                        dom += '    </div>';
                        dom += '    <div class="item-inner">';
                        dom += '      <div class="item-title">Enable</div>';
                        dom += '    </div>';
                        dom += '  </label>';
                        dom += ' </li>';

                        dom += '<li>';
                        dom += '  <label class="label-radio item-content">';
                        dom += '    <input type="radio" name="audio-sfx-setting" value="disabled" '+ ( ( window.localStorage.getItem('audio-sfx-setting') == 'disabled' ) ? 'checked="checked"' : '' ) +' >';
                        dom += '    <div class="item-media">';
                        dom += '      <i class="icon icon-form-radio"></i>';
                        dom += '    </div>';
                        dom += '    <div class="item-inner">';
                        dom += '      <div class="item-title">Disable</div>';
                        dom += '    </div>';
                        dom += '  </label>';
                        dom += '</li>';
                        dom += '</ul>';
                        dom += '</div>';
                        
                        app.f7.app.modal({
                            title : 'Audio & SFX',
                            text : dom,
                            buttons : [
                                {
                                    text : 'I\'m done',
                                    onClick : function(){
                                        if( $('input[name=audio-sfx-setting]').length ){
                                            window.localStorage['audio-sfx-setting'] = $('input[name=audio-sfx-setting]:checked').val();
                                        }
                                    }
                                }
                            ]

                        });
                    });

                },

                exitApp : function(){
                    $('[data-menu-alias=exit]').on('click', function(){
                        app.f7.app.modal({
                            title : 'Exit magnitude?',
                            buttons : [
                                {
                                    text : 'No'
                                },
                                {
                                    text : 'Yes',
                                    onClick : function(){
                                        navigator.app.exitApp();
                                    }
                                }
                            ]
                        });
                    });
                }
            } /*-- routing.index --*/
            
         }, /*-- routing --*/
        
        storage : function( p ){
            for( key in p ){
                window.localStorage.setItem(key, p[key]);
             }
        }
        
    }; /*-- app.core --*/
    
});
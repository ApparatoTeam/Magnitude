window.app = window.app || new Object;

require.config({
    baseUrl : 'dist',
    paths : {
        text : '../base/require.text',
        jQuery : 'js/lib/jquery-2.1.4.min',
        lettering : 'js/lib/require.lettering',
        f7 : 'js/lib/framework7.min',
        GSAP   : 'js/lib/TweenMax.min',
        howler   : 'js/lib/howler.min'
     }
});

requirejs(['dist/js/f7.js'], function( mod ){
    mod.initialize();
});

let message = $( '.messages' );
if ( message.length ) {
    setTimeout( function() {
        message.fadeOut( 'slow' );
    }, 2000 );
}
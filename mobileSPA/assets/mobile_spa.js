;(function($) {
    "use strict";

    $('body').addClass('js');

    // using the data attr fetch the tiddler from the server
    // render=1 is required so that the wikitext is compiled and 
    // the HTML output is returned
    function fetchTiddler( el ) {
        var uri = $(el).data("friendly-uri");
        $.ajax({
            dataType: 'jsonp',
            data: { 'render': 1 },
            url: uri + ".json",
            success: function(tiddler) {
                $("#tid-contents").empty().append( tiddler.render );
            }
        });
    }

    $(function() {
        var hostname = window.tiddlyweb.status.server_host.host;
        var sourceURI = '/search?q=;sort=-modified;limit=10';
        var $container = $(".tiddlers");
        // we are using handlebars as the templating engine
        var tid_tmpl = Handlebars.compile( $("#tiddler-info-template").html() );

        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-ControlView", "false");
            }
        });

        $.ajax({
            dataType: 'json',
            url: sourceURI,
            success: function(tiddlers) {
                $.each(tiddlers, function(index, tiddler) {
                    // see https://github.com/colmjude/_ts.js
                    // if you want to have a closer look at the _ts utility
                    // library
                    var data = $.extend( tiddler, {
                        friendlyuri: _ts.friendlyURI( tiddler.uri ),
                        date: _ts.toDate( tiddler.modified ).toISOString(),
                        usericon: _ts.getSiteIconURL( tiddler.modifier ),
                        spaceuri: _ts.generateSpaceUri( hostname, tiddler.bag ),
                        space: _ts.spaceFromBag( tiddler.bag ),
                        useruri: _ts.generateSpaceUri( hostname, tiddler.modifier ),
                    });
                    var item = $( tid_tmpl( data ) ).appendTo( $container );
                    item.find("abbr.timeago").timeago();
                });
            }
        });

        $('.tiddlers').on('click', "li", function(e) {
            e.preventDefault();
            fetchTiddler(e.currentTarget);
            $('.navigation').toggleClass('off-canvas--hide off-canvas--show');
            $('.header').toggleClass('off-canvas--hide off-canvas--show');
            $('.navigation').attr('aria-hidden', 'false');
        });
        
        $('.tiddler-close').on('click', function() {
            $('.navigation').toggleClass('off-canvas--hide off-canvas--show');
            $('.header').toggleClass('off-canvas--hide off-canvas--show');
            $('.navigation').attr('aria-hidden', 'true');
        });

        $(window).resize(function() {
          if($(window).width() > 640) {
            $('.navigation').removeClass('off-canvas--show');
            $('.navigation').attr('aria-hidden', 'false');
          } else {
            $('.navigation').addClass('off-canvas--hide');
            $('.navigation').attr('aria-hidden', 'true');
          }
        });

    });
}(jQuery));
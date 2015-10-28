/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// create namespace
if (typeof window.Mozilla === 'undefined') {
    window.Mozilla = {};
}

;(function($) {
    'use strict';

    var $window = $(window);
    var $document = $(document);
    var $body = $('body');
    var $header = $('.smarton-header');
    if ($header.length > 0) {
        var headTop = $header.offset();
        var headHeight = $header.height();
    }

    if (window.isFirefox()) {
        $body.addClass('is-firefox');
    } else {
        $body.addClass('not-firefox');
    }

    // Sticky navigation
    var fixed = false;
    var didScroll = false;

    $window.scroll(function() {
        didScroll = true;
    });

    if ($header.length > 0) {
        $(document).ready(function() {
            var scrollTop = $window.scrollTop();
            if (scrollTop >= headTop.top) {
                didScroll = true;
            }
        });
    }

    function adjustScrollbar() {
        if (didScroll) {
            didScroll = false;
            var scrollTop = $window.scrollTop();
            if ($header.length > 0) {
                if( scrollTop >= headTop.top ) {
                    if(!fixed) {
                        fixed = true;
                        $header.addClass('fixed');
                        $('#ask').css({ paddingTop: headHeight });
                    }
                } else {
                    if(fixed) {
                        fixed = false;
                        $header.removeClass('fixed');
                        $('#ask').removeAttr('style');
                        $header.find('.nav-steps li').removeClass();
                    }
                }
            }
        }
    }

    // Check for an adjusted scrollbar every 100ms.
    setInterval(adjustScrollbar, 100);

    //Scroll to the linked section
    $document.on('click', '.nav-steps a[href^="#"]', function(e) {
        e.preventDefault();
        // Extract the target element's ID from the link's href.
        var elem = $(this).attr('href').replace( /.*?(#.*)/g, "$1" );
        $('html, body').animate({
            scrollTop: $(elem).offset().top - 83
        }, 1000, function() {
            $(elem).attr('tabindex','100').focus().removeAttr('tabindex');
        });
    });

    var $footer = $('#footer-cta');
    var footHeight = $footer.height();
    var tallMode = false;
    var queryHeight = matchMedia('(min-height: 650px)');

    if (queryHeight.matches) {
        tallMode = true;
    } else {
        tallMode = false;
    }

    queryHeight.addListener(function(mq) {
        if (mq.matches) {
            tallMode = true;
        } else {
            tallMode = false;
        }
    });

    var buttonClose = '<button type="button" class="close" title="'+ window.trans('global-close') +'">'+ window.trans('global-close') +'</button>';
    var footerDetails = $('.footer-cta #form-details, .footer-cta .form-details');

    function initStickyFooter() {
        if (tallMode) {
            $('#do').waypoint(function(direction){
                if ((direction === 'down') && (!$body.hasClass('footer-closed')) ) {
                    $footer.addClass('fixed').css({ bottom: '-' + footHeight + 'px' }).animate({ bottom: '0' }, 750).append(buttonClose);
                    initFooterClose();
                } else if (direction === 'up') {
                    $footer.animate({ bottom: '-' + footHeight + 'px' }, 500, function(){
                        $footer.removeClass('fixed').removeAttr('style').find('.close').remove();
                    });
                }
            }, { offset: '10%' });

            $('#colophon').waypoint(function(direction){
                if (direction === 'down') {
                    $footer.removeClass('fixed').removeAttr('style').find('.close').remove();
                } else if (direction === 'up') {
                    if (!$body.hasClass('footer-closed')) {
                        $footer.addClass('fixed').removeAttr('style').append(buttonClose);
                        initFooterClose();
                    }
                }
            }, { offset: '100%' });
        } else {
            $footer.removeClass('fixed').removeAttr('style').find('.close').remove();
        }
    }
    // Call it to initialize
    initStickyFooter();


    function initFooterClose() {
        $('.footer-cta .close').on('click', function(){
            if (tallMode) {
                $footer.animate({ bottom: '-' + footHeight + 'px' }, 500, function(){
                    $footer.removeClass('fixed').removeAttr('style').find('.close').remove();
                });
            } else {
                $footer.removeClass('fixed').removeAttr('style').find('.close').remove();
            }

            if (footerDetails.is(':visible')) {
                footerDetails.slideUp('fast');
            }

            $body.addClass('footer-closed');
        });
    }

    // Change the navbar current item to match the section waypoint
    function navState(current, previous) {
        return function(direction) {
            if (fixed) {
                if (direction === 'down') {
                    $header.find('.nav-steps li').removeClass();
                    $('#nav-step-' + current).addClass('current');
                }
                else {
                    $header.find('.nav-steps li').removeClass();
                    $('#nav-step-' + previous).addClass('current');
                }
            }
        };
    }

    if ($header.length > 0) {
        //Fire the waypoints for each section, passing classes for the current and previous sections
        $('#ask').waypoint(navState('ask', 'ask'), { offset: $header.height() });
        $('#know').waypoint(navState('know', 'ask'), { offset: $header.height() });
        $('#do').waypoint(navState('do', 'know'), { offset: $header.height() });
        $('#chat').waypoint(navState('chat', 'do'), { offset: $header.height() });
    }

    function drawCircle(circleId, circleVal){
        Circles.create({
          id:                  circleId,
          value:               circleVal,
          radius:              70,
          maxValue:            100,
          width:               12,
          text:                function(value){return value + '%';},
          duration:            850,
          wrpClass:            'circles-wrap',
          textClass:           'circles-text',
          valueStrokeClass:    'circles-valueStroke',
          maxValueStrokeClass: 'circles-maxValueStroke',
          styleWrapper:        false,
          styleText:           false
        });
    }

    $('.callout .chart .number').each(function(){
        var circleId = $(this).attr('id');
        var circleVal = $(this).text();
        var waypoint = new Waypoint({
            element: $(this),
            handler: function(direction) {
                if (direction == 'down') {
                    drawCircle(circleId, circleVal);
                }
            },
            offset: '95%'
        });
    });

    // track user scrolling through each section down the page
    $('.main .section').each(function() {
        var sectionId = $(this).attr('id');
        var waypoint = new Waypoint({
            element: $(this),
            handler: function(direction) {
                if (direction == 'down') {
                  window.dataLayer.push({event: 'scroll-tracking', section: sectionId});
                }
            },
            offset: '100%'
        });
    });

/*
    var fullVideoWrap = $('.video-full .video-wrap');
    var fullVideoOverlay = $('<div class="video-play"></div>');

    function fullVideoExpand() {
        fullVideoOverlay.insertAfter(fullVideoWrap);
        fullVideoOverlay.on('click', function(){
            $(this).parents('.video-full').animate({ width: '100%' }).append(buttonClose);
            $(this).remove();
            fullVideoContract();
        });
    }

    function fullVideoContract() {
        $('.video-full .close').on('click', function(){
            $('.video-full').removeAttr('style');
            $(this).remove();
        });
    }

    if (fullVideoWrap.length > 0) {
        fullVideoExpand();
    }
*/

})(window.jQuery);


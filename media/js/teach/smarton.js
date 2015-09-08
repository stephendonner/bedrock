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
        stickyFooter();
    } else {
        tallMode = false;
        stickyFooter();
    }

    queryHeight.addListener(function(mq) {
        if (mq.matches) {
            tallMode = true;
            stickyFooter();
        } else {
            tallMode = false;
            stickyFooter();
        }
    });

    function stickyFooter() {
        if (tallMode) {
            $('#do').waypoint(function(direction) {
                if (direction === 'down') {
                    $footer.addClass('fixed').css({ bottom: '-' + $footer.height() + 'px' }).animate({ bottom: '0' }, 750);
                } else if (direction === 'up') {
                    $footer.animate({ bottom: '-' + footHeight + 'px' }, 500, function(){
                        $footer.removeClass('fixed');
                    });
                }
            }, { offset: '50%' });

            $('#colophon').waypoint(function(direction) {
                if (direction === 'down') {
                    $footer.removeClass('fixed');
                } else if (direction === 'up') {
                    $footer.addClass('fixed');
                }
            }, { offset: '100%' });
        } else {
            $footer.removeClass('fixed');
        }
    }

    // Change the navbar current item to match the section waypoint
    function navState(current, previous) {
        return function(dir) {
            if (fixed) {
                if (dir === 'down') {
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

})(window.jQuery);


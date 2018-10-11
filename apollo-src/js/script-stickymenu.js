/*
 * This program is part of the OpenCms Apollo Template.
 *
 * Copyright (c) Alkacon Software GmbH & Co. KG (http://www.alkacon.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Module implemented using the "revealing module pattern", see
// https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript
// https://www.christianheilmann.com/2007/08/22/again-with-the-module-pattern-reveal-something-to-the-world/
var ApolloStickyMenu = function (jQ) {

    function init() {

        if (DEBUG) console.info("ApolloStickyMenu.init()");

        if ($('.ap-header.stickyHeader').length) {
            if (DEBUG) console.info("ApolloStickyMenu --> hasStickyMenu");
            var $head = $('.ap-header.stickyHeader .head');
            var $breadCrumbs = $('.ap-header.stickyHeader .breadcrumbs');
            var headOffset = $head.offset();
            var elementHeight = $head.height();
            $(window).scroll(function () {
                if (window.pageYOffset > headOffset.top + elementHeight) {
                    $head.addClass("sticky-menu");
                    $breadCrumbs.css("padding-top", elementHeight);
                } else {
                    $head.removeClass("sticky-menu");
                    $breadCrumbs.css("padding-top", 0);
                }
                if (DEBUG) console.log(window.pageYOffset > headOffset.top, window.pageYOffset, headOffset);
            });
        }
    }

    // public available functions
    return {
        init: init
    }

}(jQuery);


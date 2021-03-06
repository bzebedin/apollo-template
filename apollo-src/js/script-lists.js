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
var ApolloList = function(jQ) {

    // all initialized lists by unique instance id
    this.m_lists = {};

    // all initialized list archive filters by unique instance id
    this.m_archiveFilters = {};

    // groups of lists by element id (potentially more then one on a page)
    this.m_listGroups = {};

    // groups of archive filters lists by list element id (potentially more then one on a page)
    this.m_archiveFilterGroups = {};

    // all auto loading lists as array for easy iteration
    this.m_autoLoadLists = [];

    // multifilter
    this.m_multiFilters = {};


    function facetFilter(id, triggerId, searchStateParameters) {

        listFilter(id, triggerId, null, searchStateParameters);
    }


    function archiveFilter(id, triggerId, searchStateParameters) {

        var filter = m_archiveFilters[id];
        listFilter(filter.elementId, triggerId, id, searchStateParameters);
    }


    function archiveSearch(id, searchStateParameters) {

        var filter = m_archiveFilters[id];
        listFilter(filter.elementId, null, filter.id, searchStateParameters + filter.$textsearch.val());
    }

    function multiFilter(id,triggerId,blockId,catValue,searchStateParameters) {

        var filter = m_multiFilters[id];

        if(!filter.filterData[blockId]) {
            filter.filterData[blockId] = {};
        }

        if(!filter.filterData[blockId][triggerId]) {
            filter.filterData[blockId][triggerId] = catValue;
        } else {
            delete filter.filterData[blockId][triggerId];
        }

        if(Object.keys(filter.filterData[blockId]).length == 0) {
            delete filter.filterData[blockId];
        }
        if (DEBUG) console.info("multiFilter.filter:",filter);
        listMultiFilter(filter.filterObject.elementId, triggerId, id, searchStateParameters);

    }

    function listMultiFilter(id, triggerId, filterId, searchStateParameters) {

        if (DEBUG) console.info("listMultiFilter() called elementId=" + id);

        // reset filters of not sorting
        var filterGroup = m_archiveFilterGroups[id];
        var multiFilter = m_multiFilters[filterId];

        if ((triggerId != "SORT") && (typeof filterGroup != "undefined")) {
            // potentially the same filter may be on the same page
            // here we make sure to reset them all
            for (i=0; i<filterGroup.length; i++) {
                var fi = filterGroup[i];
                // remove all active / highlighted filters
                fi.$element.find("li.active").removeClass("active");

                jQ.each(multiFilter.filterData, function(key,value) {
                    jQ.each(value, function (cKey, cValue) {
                        fi.$element.find("#" + cKey).addClass("active");
                    })
                });
                fi.$textsearch.val('');
            }
        }

        var listGroup = m_listGroups[id];
        for (i=0; i<listGroup.length; i++) {
            if (DEBUG) console.info("listMultiFilter() -> listGroup -> in der schleife aufrufen");
            updateInnerList(listGroup[i].id, searchStateParameters, true, true, filterId);
        }
    }

    function listFilter(id, triggerId, filterId, searchStateParameters) {

        if (DEBUG) console.info("listFilter() called elementId=" + id);

        // reset filters of not sorting
        var filterGroup = m_archiveFilterGroups[id];
        if ((triggerId != "SORT") && (typeof filterGroup != "undefined")) {
            // potentially the same filter may be on the same page
            // here we make sure to reset them all
            for (i=0; i<filterGroup.length; i++) {
                var fi = filterGroup[i];
                // remove all active / highlighted filters
                fi.$element.find("li.active").removeClass("active");
                if (triggerId != null) {
                    // activate / highlight clicked filter
                    fi.$element.find("#" + triggerId).addClass("active");
                    fi.$textsearch.val('');
                } else if (fi.id != filterId) {
                    // clear text search input in other filter instances
                    fi.$textsearch.val('');
                }
            }
        }

        var listGroup = m_listGroups[id];
        for (i=0; i<listGroup.length; i++) {
            if (DEBUG) console.info("listFilter() -> listGroup -> in der schleife aufrufen");
            updateInnerList(listGroup[i].id, searchStateParameters, true, false, null);
        }
    }


    function updateList(id, searchStateParameters, reloadEntries) {
        if (DEBUG) console.info("updateList() -> updateInnerList aufrufen");
        updateInnerList(id, searchStateParameters, reloadEntries == "true", false, null);
    }

    function updateMultiList(id, searchStateParameters, reloadEntries, multiFilterId) {
        if (DEBUG) console.info("updateMultiList() -> updateInnerList aufrufen");
        updateInnerList(id, searchStateParameters, reloadEntries == "true", true, multiFilterId);
    }


    function updateInnerList(id, searchStateParameters, reloadEntries, useMultiFilter, multiFilterId) {
        searchStateParameters = searchStateParameters || "";
        reloadEntries = reloadEntries || false;

        var list = m_lists[id];

        if (DEBUG) console.info("updateInnerList() called instanceId=" + list.id + " multiFilterId=" + multiFilterId + " elementId=" + list.elementId + " parameters=" + searchStateParameters);

        if (!list.locked) {
            list.locked = true;

            var ajaxOptions = "&";
            if (reloadEntries) {
                // hide the "no results found" message during search
                list.$editbox.hide();
            } else {
                // fade out the load more button
                list.$element.find('.loadMore').addClass("fadeOut");
                // we don't need to calculate facets again if we do not reload all entries
                ajaxOptions = "&hideOptions=true&";
            }

            // calculate the spinner position in context to the visible list part
            var scrollTop = jQ(window).scrollTop();
            var windowHeight = jQ(window).height();
            var elementTop = list.$element.offset().top;
            var elementHeight = list.$element.outerHeight(true);
            var topOffset = Math.max(scrollTop - elementTop, 0);
            var visibleHeight = Math.min(scrollTop + windowHeight, elementTop + elementHeight) - Math.max(scrollTop, elementTop);
            var spinnerPos = (visibleHeight * (reloadEntries ? 0.5 : 0.8)) + topOffset - 15;
            // show the spinner
            list.$spinner.hide().removeClass("fadeOut").addClass("fadeIn").css("top", spinnerPos).show();

            var facetOptions = jQ('#facets_' + list.elementId);
            var ajaxLink = buildAjaxLink(list, ajaxOptions, searchStateParameters);
            if (DEBUG) console.info('buildAjaxLink:'+ajaxLink);

            var ajaxConfig = {
                method: "GET",
                url: ajaxLink
            };

            if(useMultiFilter) {
                ajaxConfig.method = "POST";

                var multiFilterData = {};

                jQ.each( m_multiFilters[multiFilterId].filterData, function(key,value) {
                    multiFilterData[key] = [];
                    jQ.each(value, function(vKey,vValue) {
                        multiFilterData[key].push(vValue);
                    });
                    multiFilterData[key] = JSON.stringify(multiFilterData[key]);
                });

                ajaxConfig.data = multiFilterData;
            }

            if (DEBUG) console.info("Ajax Search with method: "+ ajaxConfig.method,ajaxConfig);

            var ajaxRequest= jQ.ajax(ajaxConfig);

            ajaxRequest.done(function(resultList) {

                var $result = jQ(resultList);
                // collect information about the search result
                var resultData = $result.filter('#resultdata').first().data('result');
                if (DEBUG) console.info("Search result: list=" + list.id + ", start=" + resultData.start + ", end=" + resultData.end + ", entries=" + resultData.found + ", pages=" + resultData.pages);

                // append all results from the ajax call to a new element that is not yet displayed
                var $entries = $result.filter(".list-entry");
                var $newPage = jQ('<div class="list-entry-page"></div>');
                $entries.appendTo($newPage);

                // clear the pagination element
                list.$pagination.empty();

                if (reloadEntries) {
                    // remove the old entries when list is relaoded
                    var $oldPage = list.$entrybox.find(".list-entry-page");
                    // set min-height of list to avoid screen flicker
                    list.$entrybox.css("min-height", list.$entrybox.height() + 'px');
                    $oldPage.remove();
                }

                // add the new elements to the list
                $newPage.appendTo(list.$entrybox);

                // set pagination element with new content
                $result.filter('.list-append-position').appendTo(list.$pagination);

                if (reloadEntries) {
                    // reset the list option box
                    facetOptions.find(".list-options").remove();
                    $result.filter(".list-options").appendTo(facetOptions);

                    // check if we have found any results
                    if ($entries.length == 0) {
                        // show the "no results found" message
                        list.$editbox.show();
                        // no results means we don't need any pagination element
                        list.$pagination.hide();
                    } else {
                        // show the pagination element
                        list.$pagination.show();
                    }
                    // reset the min-height of the list now that the elements are visible
                    list.$entrybox.animate({'min-height': "0px"}, 500);
                }

                // fade out the spinner
                list.$spinner.removeClass("fadeIn").addClass("fadeOut");

                // reset the OpenCms edit buttons
                _OpenCmsReinitEditButtons();
                list.locked = false;

                if ((list.appendOption == "clickfirst") && list.notclicked && !reloadEntries) {
                    // this is a auto loading list that is activated on first click
                    m_autoLoadLists.push(list);
                    list.notclicked = false;
                    if (m_autoLoadLists.length == 1) {
                        // enable scroll listener because we now have one autoloading gallery
                        jQ(window).bind('scroll', handleAutoLoaders);
                    }
                    handleAutoLoaders();
                } else if (reloadEntries && list.autoload) {
                    // check if we can render more of this automatic loading list
                    handleAutoLoaders();
                }
            });
        }
    }


    function buildAjaxLink(list, ajaxOptions, searchStateParameters) {

        var params = "?contentpath=" + list.path
            + "&instanceId="
            + list.id
            + "&elementId="
            + list.elementId
            + "&sitepath="
            + list.sitepath
            + "&subsite="
            + list.subsite
            + "&__locale="
            + list.locale
            + "&loc="
            + list.locale;

        var facets = jQ("#facets_" + list.elementId);
        if (facets.length != 0) {
            params = params + "&facets=" + facets.data("facets");
        }
        params = params + "&option=" + list.option;

        if (DEBUG) console.info("buildAjaxLink:"+list.ajax + params + ajaxOptions + searchStateParameters);
        return list.ajax + params + ajaxOptions + searchStateParameters;
    }


    function handleAutoLoaders() {
        if (DEBUG) console.info("ApolloList.handleAutoLoaders()");
        if (m_autoLoadLists != null) {
            for (i=0; i<m_autoLoadLists.length; i++) {

                var list = m_autoLoadLists[i];
                var appendPosition = list.$element.find(".list-append-position");

                if (appendPosition.length
                    && !list.locked
                    && appendPosition.data("dynamic")
                    // NOTE: jQuery.visible() is defined in script-jquery-extensions.js
                    && appendPosition.visible()) {

                    if (DEBUG) console.info("ApolloList.handleAutoLoaders()->updateInnerList()");
                    updateInnerList(list.id, list.$element.find('.loadMore').attr('data-load'), false, false, null);
                }
            }
        }
    }


    function init() {

        if (DEBUG) console.info("ApolloList.init()");

        var $listElements = jQ('.ap-list-entries');
        if (DEBUG) console.info(".ap-list-entries elements found: " + $listElements.length);

        if ($listElements.length > 0 ) {
            $listElements.each(function() {

                // initialize lists with values from data attributes
                var $list = jQ(this);

                if (typeof $list.data("list") != 'undefined') {
                    // read list data
                    var list = $list.data("list");
                    // add more data to list
                    list.$element = $list;
                    list.id = $list.attr("id");
                    list.elementId = $list.data("id");
                    list.$editbox = $list.find(".editbox");
                    list.$entrybox = $list.find(".ap-list-box");
                    list.$spinner = $list.find(".spinner");
                    list.$pagination = $list.find(".ap-list-pagination");
                    list.locked = false;
                    list.autoload = false;
                    list.notclicked = true;
                    if (list.appendSwitch.indexOf(Apollo.gridInfo().grid) != -1) {
                        // I think this is a cool way for checking the screen size ;)
                        list.option = "append";
                    } else {
                        list.option = "paginate";
                    }
                    if ((list.option == "append") && (list.appendOption == "noclick")) {
                        // list automatically loads in scrolling
                        list.autoload = true;
                        m_autoLoadLists.push(list);
                    };
                    // store list data in global array
                    m_lists[list.id] = list;
                    // store list in global group array
                    var group = m_listGroups[list.elementId];
                    if (typeof group != 'undefined') {
                        group.push(list);
                    } else {
                        m_listGroups[list.elementId] = [list];
                    }
                    if (DEBUG) console.info("List data found: id=" + list.id + ", elementId=" + list.elementId + " option=" + list.option);
                }

                // load the initial list
                if (DEBUG) console.info("ApolloList.init() --> load the initial list");
                updateInnerList(list.id, "", true, false, null);
            });

            if (m_autoLoadLists.length > 0) {
                // only enable scroll listener if we have at least one autoloading gallery
                jQ(window).on('scroll', handleAutoLoaders);
            }
        }

        var $listArchiveFilters = jQ('.ap-list-archive');
        if (DEBUG) console.info(".ap-list-archive elements found: " + $listArchiveFilters.length);

        if ($listArchiveFilters.length > 0 ) {
            $listArchiveFilters.each(function() {

                // initialize filter archives
                var $archiveFilter = jQ(this);

                var filter = $archiveFilter.data("filter");
                filter.$element = $archiveFilter;
                filter.id = $archiveFilter.attr("id");
                filter.elementId = $archiveFilter.data("id");
                filter.$form = $archiveFilter.find("#queryform");
                filter.$textsearch = $archiveFilter.find("#textsearch");

                // store filter data in global array
                m_archiveFilters[filter.id] = filter;
                m_multiFilters[filter.id] = {
                    filterObject : filter,
                    filterData : {}
                };

                // store filter in global group array
                var group = m_archiveFilterGroups[filter.elementId];
                if (typeof group != 'undefined') {
                    group.push(filter);
                } else {
                    m_archiveFilterGroups[filter.elementId] = [filter];
                }
                if (DEBUG) console.info("Archive filter data found: id=" + filter.id + ", elementId=" + filter.elementId);
            });
        }

    }

    // public available functions
    return {
        init: init,
        update: updateList,
        updateMultiList: updateMultiList,
        facetFilter: facetFilter,
        archiveFilter: archiveFilter,
        archiveSearch: archiveSearch,
        multiFilter: multiFilter
    }

}(jQuery);

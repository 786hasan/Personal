// ** btst module
// AngularJS directives for Bootstrap components, including tabs, accordion, popovers, and typeahead.
// ** requires Bootstrap
// <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css" 
//       rel="stylesheet" type="text/css"/>
// <script src="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js" 
//       type="text/javascript" ></script>
angular.module("btst", [])

// bootstrap services (shared code)
.factory("btstUtil", function () {

    // our utilities class
    return {

        // calculate placement for popup (popover or tooltip)
        getPopupPlacement: function (element) {
            var rc = element[0].getBoundingClientRect();
            var height = $(window).height();
            return rc.top < height - rc.bottom ? "bottom" : "top";
        },

        // get popup content (if starts with '#', look it up in other elements)
        getContent: function (content) {
            content = content.toString();
            if (content != null && content[0] == "#") {
                var el = $(content);
                if (el != null && el.length > 0) {
                    return el.html();
                }
            }
            return content;
        },

        // watch for changes in scope variables, call update function when all have been initialized
        watchScope: function (scope, props, fn) {
            var cnt = props.length;
            for (var i = 0; i < props.length; i++) {
                scope.$watch(props[i], function () {
                    cnt--;
                    if (cnt <= 0) fn();
                })
            }
        }
    }
})

// ** btst-tab directive
// - Creates a tabbed interface.
// - Contains <code>btst-pane</code> elements, each with a 'header' attribute and its own content.
// - Adapted from http://angularjs.org/#components-js.
// ** example
// <btst-tab tab-position="left">
//   <btst-tab-pane header="First Tab">
//     <div>This is the content of the first tab.</div>
//   </btst-tab-pane>
//   <btst-tab-pane header="Second Tab">
//     <div>This is the content of the second tab.</div>
//   </btst-tab-pane>
// </btst-tab>
// ** see
// - Bootstrap tabs: http://twitter.github.io/bootstrap/javascript.html#tabs
// - Original implementation: http://angularjs.org/#components-js
.directive("btstTab", function () {
    return {
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {
            tabPosition: "@" // Determines the position of the tabs (above, below, left, or right of the content).
        },
        template:
            "<div class='tabbable'>" +
                "<ul class='nav nav-tabs'>" +
                    "<li ng-repeat='pane in panes' ng-class='{active:pane.selected}'>" +
                        "<a href='' ng-click='select(pane)' ng-bind-html-unsafe='pane.header'></a>" + // html in header
        // "<a href='' ng-click='select(pane)'>{{pane.header}}</a>" + // plain text in header
                    "</li>" +
                "</ul>" +
                "<div class='tab-content' ng-transclude></div>" +
            "</div>",
        controller: ["$scope", function ($scope) {
            var panes = $scope.panes = [];
            $scope.select = function (pane) {
                angular.forEach(panes, function (pane) {
                    pane.selected = false;
                });
                pane.selected = true;
            }
            this.addPane = function (pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        } ],
        link: function (scope, element, attrs) {
            scope.$watch("tabPosition", function () {
                element.removeClass("tabs-below");
                element.removeClass("tabs-left");
                element.removeClass("tabs-right");
                if (scope.tabPosition && scope.tabPosition != "above") {
                    element.addClass("tabs-" + scope.tabPosition);
                }
            });
        }
    };
})
// ** btst-tab-pane directive
// - Provides content for <code>btst-tab</code> elements.
// - Adapted from http://angularjs.org/#components-js.
// ** example
// <btst-tab tab-position="left">
//   <btst-tab-pane header="<b>First</b> Tab">
//     <div>This is the content of the first tab.</div>
//   </btst-tab-pane>
//   <btst-tab-pane header="<b>Second</b> Tab">
//     <div>This is the content of the second tab.</div>
//   </btst-tab-pane>
// </btst-tab>
// ** see
// - Bootstrap tabs: http://twitter.github.io/bootstrap/javascript.html#tabs
// - Original implementation: http://angularjs.org/#components-js
.directive("btstTabPane", function () {
    return {
        require: "^btstTab",
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {
            header: "@" // Html content that appears in the tab.
        },
        template: "<div class='tab-pane' ng-class='{active: selected}' ng-transclude></div>",
        link: function (scope, element, attrs, btstTab) {
            btstTab.addPane(scope);
        }
    };
})

// ** btst-accordion directive
// - Creates an interface with collapsible panes.
// - Expanding one pane automatically collapses all other panes.
// - Contains <code>btst-accordion-pane</code> elements, each with a 'header' attribute and its own content.
// ** example
// <btst-accordion>
//   <btst-accordion-pane header="<b>First</b> Accordion Pane">
//     <div>This is the content of the first accordion pane.</div>
//   </btst-accordion-pane>
//   <btst-accordion-pane header="<b>Second</b> Accordion Pane">
//     <div>This is the content of the second accordion pane.</div>
//   </btst-accordion-pane>
// </btst-accordion>
// ** see
// - Bootstrap collapse: http://twitter.github.io/bootstrap/javascript.html#collapse
.directive("btstAccordion", function () {
    return {
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {},
        template:
            "<div class='accordion' ng-transclude></div>",
        link: function (scope, element, attrs) {

            // give this element a unique id
            var id = element.attr("id");
            if (!id) {
                id = "btst-acc" + scope.$id;
                element.attr("id", id);
            }

            // set data-parent on accordion-toggle elements
            var arr = element.find(".accordion-toggle");
            for (var i = 0; i < arr.length; i++) {
                $(arr[i]).attr("data-parent", "#" + id);
                $(arr[i]).attr("href", "#" + id + "collapse" + i);
            }
            arr = element.find(".accordion-body");
            for (var i = 0; i < arr.length; i++) {
                $(arr[i]).attr("id", id + "collapse" + i);
                if (i == 0) {
                    $(arr[i]).addClass("in"); // expand first pane
                }
            }
        },
        controller: function ($scope) { }
    };
})
// ** btst-accordion-pane directive
// - Provides content for <code>btst-accordion</code> elements.
// ** example
// <btst-accordion>
//   <btst-accordion-pane header="<b>First</b> Accordion Pane">
//     <div>This is the content of the first accordion pane.</div>
//   </btst-accordion-pane>
//   <btst-accordion-pane header="<b>Second</b> Accordion Pane">
//     <div>This is the content of the second accordion pane.</div>
//   </btst-accordion-pane>
// </btst-accordion>
// ** see
// - Bootstrap collapse: http://twitter.github.io/bootstrap/javascript.html#collapse
.directive("btstAccordionPane", function () {
    return {
        require: "^btstAccordion",
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {
            header: "@" // Html content that appears in the pane header.
        },
        template:
          "<div class='accordion-group'>" +
            "<div class='accordion-heading'>" +
              "<a class='accordion-toggle' data-toggle='collapse'>{{header}}</a>" +
            "</div>" +
            "<div class='accordion-body collapse'>" +
              "<div class='accordion-inner' ng-transclude></div>" +
            "</div>" +
          "</div>",
        link: function (scope, element, attrs) {
            scope.$watch("header", function () {
                var hdr = element.find(".accordion-toggle");
                hdr.html(scope.header);
            });
        }
    };
})

// ** btst-popover directive
// - Shows extra information about an element in a tooltip-style popup with a header.
// - Auto-positions pop-overs to avoid clipping near the edges of the screen.
// - Supports html and document elements in the pop-over.
// - Automatically switches default trigger on desktop and touch devices (hover/click).
// ** example
// <div>
//   This is regular text, but 
//   <btst-popover html="true" header="<b>title<b>" content="detail with <b>HTML</b> goes here" >
//     this has a pop-over
//   </btst-popover>
//   and this is regular text again...</div>
// ** see
// - Bootstrap popovers: http://twitter.github.io/bootstrap/javascript.html#popovers
.directive("btstPopover", ["btstUtil", function (btstUtil) {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            header: "@",    // Pop-over header (caption).
            content: "@",   // Pop-over content.
            html: "@",      // Whether the header and content are html or plain text.
            trigger: "@"    // When to display the pop-over (by default, the trigger is 'hover' on the desktop and 'click' on mobile devices).
        },
        template: "<a ng-transclude></a>",
        link: function (scope, element, attrs) {

            // listen to changes in attributes and update the control
            btstUtil.watchScope(scope, ["header", "content", "html", "trigger"], updateControl);

            // update control parameters
            function updateControl() {
                var options = {
                    title: getTitle,
                    content: getContent,
                    placement: getPlacement,
                    trigger: scope.trigger ? scope.$eval(scope.trigger) : isMobile() ? "click" : "hover",
                    html: scope.html ? scope.$eval(scope.html) : true
                };
                element.popover(options);
            }

            // check whether we are running on a mobile device
            // http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser
            function isMobile() {
                return window.orientation != null;
            }

            // get popover title
            function getTitle() {
                return scope.header;
            }

            // get popover content
            function getContent() {
                return btstUtil.getContent(scope.content);
            }

            // get popover placement to avoid showing off-screen
            function getPlacement() {
                return btstUtil.getPopupPlacement(element);
            }
        }
    };
} ])

// ** btst-tooltip directive
// - Auto-positions tooltips to avoid clipping near the edges of the screen.
// - Supports html and document elements in the tooltip.
// ** example
// <div>
//   This is regular text, but 
//   <btst-tooltip content="this is the tooltip!" html="true">
//     this has a tooltip with <b>HTML</b> in it!
//   </btst-tooltip>
//   and this is regular text again...</div>
// ** see
// - Bootstrap tooltips: http://twitter.github.io/bootstrap/javascript.html#tooltips
.directive("btstTooltip", ["btstUtil", function (btstUtil) {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            content: "@",   // Tooltip content.
            html: "@"       // Whether the content is html or plain text.
        },
        template: "<a ng-transclude></a>",
        link: function (scope, element, attrs) {

            // listen to changes in attributes and update the control
            btstUtil.watchScope(scope, ["content", "html"], updateControl);

            // update control parameters
            function updateControl() {
                var options = {
                    title: getContent,
                    placement: getPlacement,
                    html: scope.html != null ? scope.$eval(scope.html) : true
                };
                element.tooltip(options);
            }

            // get tooltip content
            function getContent() {
                return btstUtil.getContent(scope.content);
            }

            // get tooltip placement to avoid showing off-screen
            function getPlacement() {
                return btstUtil.getPopupPlacement(element);
            }
        }
    };
} ])

// ** btst-progress directive
// - Active and progress attribute determine animation and progress (between 0 and 100).
// ** example
// <btst-progress progress="50%"></btst-progress>
// ** see
// - Bootstrap progress: http://twitter.github.io/bootstrap/components.html#progress
.directive("btstProgress", ["btstUtil", function (btstUtil) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            active: "@",    // Whether the progress bar is currently active (animated).
            progress: "@"   // Progress percentage (between zero and 100).
        },
        template:
            "<div class='progress progress-striped active'>" +
            "  <div class='bar' style='width: 100%;'></div>" +
            "</div>",
        link: function (scope, element, attrs) {

            // listen to changes in attributes and update the control
            btstUtil.watchScope(scope, ["active", "progress"], updateControl);

            // update control parameters
            function updateControl() {
                if (!scope.active || scope.$eval(scope.active)) {
                    if (!element.hasClass("active"))
                        element.addClass("active");
                } else {
                    if (element.hasClass("active"))
                        element.removeClass("active");
                }
                if (scope.progress) {
                    var width = scope.progress.toString();
                    if (width.lastIndexOf("%") < 0) width += "%";
                    var bar = $(element.children(".bar"));
                    bar.css("width", width);
                }
            }
        }
    }
} ])

// ** btst-menu directive
// - Creates a button that shows a drop-down containing <code>btst-menu-item</code> elements.
// ** example
// <btst-menu header="Navigate" >
//   <btst-menu-item href="#/home">Home</btst-menu-item>
//   <btst-menu-item href="#/bootstrap/input">Input</btst-menu-item>
//   <btst-menu-item class="disabled">Commands</btst-menu-item>
//   <btst-menu-item href="#/bootstrap/layout">Layout</btst-menu-item>
//   <btst-divider/>
//   <btst-menu-item command="say" param="home: 12 * 12 = {{12*12}}">Home</btst-menu-item>
// </btst-menu>
// ** see
// - Bootstrap drop-down: http://twitter.github.io/bootstrap/javascript.html#dropdowns
.directive("btstMenu", function () {
    return {
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {
            header: "@"     // Content that goes in the button.
        },
        template:
            "<div class='btn-group'>" +
                "<button class='btn dropdown-toggle' data-toggle='dropdown'>" +
                    "{{header}} <b class='caret'></b>" +
                "</button>" +
                "<ul class='dropdown-menu ng-transclude'>" +
                "</ul>" +
            "</div>",
        controller: function ($scope) { }
    }
})
// ** btst-menu-item directive
// - Creates an item that goes in a <code>btst-menu</code> element.
// - May contain HTML.
// - May invoke methods or navigate to other views.
// ** example
// <btst-menu header="Navigate" >
//   <btst-menu-item href="#/home">Home</btst-menu-item>
//   <btst-menu-item href="#/bootstrap/layout">Layout</btst-menu-item>
//   <btst-menu-item class="disabled">Commands</btst-menu-item>
//   <btst-divider/>
//   <btst-menu-item command="say('hello!')">Home</btst-menu-item>
//  </btst-menu>
// ** see
// - Bootstrap drop-down: http://twitter.github.io/bootstrap/javascript.html#dropdowns
.directive("btstMenuItem", function () {
    return {
        require: "^btstMenu",
        restrict: "E",
        transclude: true,
        replace: true,
        scope: {
            command: "&",   // Command to execute when the item is clicked.
            href: "@"       // Address to navigate to when the item is clicked.
        },
        template:
            "<li>" +
              "<a href='{{href}}' ng-transclude ></a>" +
            "</li>",
        link: function (scope, element, attrs) {
            element.click(function () {
                if (scope.command) {
                    scope.command();
                }
            });
        }
    };
})
// ** btst-divider directive
// - Provides a divider between <code>btst-menu-item</code> elements.
.directive("btstDivider", function () {
    return {
        require: "^btstDd",
        restrict: "E",
        transclude: false,
        replace: true,
        template: "<li class='divider'></li>"
    };
})

// ** btst-typeahead directive
// - Contains a list of elements to choose from.
// - Shows options for auto-complete as the user types.
// - Allows customization of the items, matching, sorting, and highlighting.
// ** example
// <btst-typeahead 
//   value="selectedState" 
//   source="['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Wyoming']"
//   min-length="2"></btst-typeahead>
// ** see
// - Bootstrap typeahead: http://twitter.github.io/bootstrap/javascript.html#typeahead
.directive("btstTypeahead", ["btstUtil", function (btstUtil) {
    return {
        restrict: "E",
        replace: true, // important!
        scope: {
            value: "=",         // Current value.
            source: "@",        // List of valid choices (array of strings).
            items: "@",         // Maximum number of items to display on drop-down.
            minLength: "@",     // Minimum length of input to start looking for matches.
            sourceFn: "&",      // Source function (takes two arguments, 'query' and 'process').
            sorter: "&",        // Item sort function (takes one argument, 'items', returns the sorted array).
            matcher: "&",       // Item match function (takes one argument, 'item', returns true if it is a match).
            updater: "&",       // Returns the selected item (takes one argument, 'item', returns the selected item).
            highlighter: "&"    // Formats an item as html (takes one argument, 'item', returns an html string - search item is available as 'this.query').
        },
        template: "<input type='text' ng-model='value' ></input>",
        link: function (scope, element, attrs, controller) {

            // listen to changes in attributes and update the control
            btstUtil.watchScope(scope, ["source", "items", "minLength"], updateControl);

            // update value when control content changes or when it gets/loses focus
            element.on("change input blur focus", function () {
                if (element.val() != scope.value) {
                    scope.value = element.val();
                    if (!scope.$$phase) scope.$apply("value");
                }
            });

            // update control parameters
            function updateControl() {

                // build options
                var options = {};
                if (scope.source) {
                    options.source = typeof (scope.source) == "string"
                        ? scope.$eval(scope.source)
                        : scope.source;
                } else if (scope.sourceFn()) {
                    options.source = scope.sourceFn();
                }
                if (scope.items) options.items = scope.items;
                if (scope.minLength) options.minLength = scope.minLength;
                if (scope.matcher()) options.matcher = scope.matcher();
                if (scope.sorter()) options.sorter = scope.sorter();
                if (scope.highlighter()) options.highlighter = scope.highlighter();
                if (scope.updater()) options.updater = scope.updater();

                // assign to control
                element.typeahead(options);
            }
        }
    };
} ])

// ** btst-numeric-input directive
// - Input element for entering numbers with range validation.
// - Works on all browsers.
// - Provides large spinner buttons (good for mobile apps).
// ** example
// <btst-numeric-input value="numberOfTravelers" min="0" max="5">
// </btst-numeric-input>
.directive("btstNumericInput", function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            value: "=",     // Current value.
            min: "@",       // Minumum valid value.
            max: "@"        // Maxumum valid value.
        },
        template:
            "<div class='input-append control-group'>" +
                "<input " +
                    "class='text-center span3' type='tel' ng-model='value' min='min' max='max'/>" +
                "<button class='btn' type='button' " +
                    "ng-disabled='max && value >= max' " +
                    "ng-click='value = value + 1'>+</button>" +
                "<button class='btn' " +
                    "ng-disabled='min && value <= min' " +
                    "ng-click='value = value - 1'>-</button>" +
            "</div>",
        link: function (scope, element, attrs, controller) {
            var input = $(element.find("input")[0]);

            // validate content on changes
            input.on("change input", function () {
                var value = input.val();
                if (value.length == 0 || isNaN(value * 1)) {
                    value =
                        scope.min ? scope.min * 1 :
                        scope.max ? scope.max * 1 :
                        0;
                }
                setValue(value);
            });

            // validate content when losing focus
            input.on("blur", function () {
                var value = input.val() * 1;
                if (isNaN(value)) {
                    value = 0;
                }
                if (scope.min && value < scope.min * 1) {
                    value = scope.min * 1;
                }
                if (scope.max && value > scope.max * 1) {
                    value = scope.max * 1;
                }
                setValue(value);
            });

            // update value (if necessary)
            function setValue(newValue) {

                // apply new value
                if (newValue !== scope.value) {
                    scope.value = newValue;
                    if (!scope.$$phase) scope.$apply("value");
                }

                // update validation css
                var value = scope.value * 1;
                if (isNaN(value) || (scope.min && value < scope.min * 1) || (scope.max && value > scope.max * 1)) {
                    element.addClass("error");
                } else {
                    element.removeClass("error");
                }
            }
        }
    };
})

// ** btst-toggle-button directive
// - Directive for radio and checkbox buttons.
// - Provides bindings for ative state, selected, and changed events.
// ** example
// <div class="btn-group" data-toggle="buttons-radio" >
//   <btst-toggle-button 
//     selected="setTripClass('economy')"
//     active="{{trip.class== 'economy'}}">Economy</btst-toggle-button>
//   <btst-toggle-button 
//     selected="setTripClass('business')" 
//     active="{{trip.class=='business'}}">Business</btst-toggle-button>
// </div>
// <div class="btn-group" data-toggle="buttons-checkbox">
//   <btst-toggle-button 
//     changed="toggleTripExtra(1)" 
//     active="{{getTripExtra(1)}}">Hotel</btst-toggle-button>
//   <btst-toggle-button 
//     changed="toggleTripExtra(2)" 
//     active="{{getTripExtra(2)}}">Car</btst-toggle-button>
// </div>
.directive("btstToggleButton", ["btstUtil", function (btstUtil) {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        template:
            "<button type='button' class='btn' ng-transclude></button>",
        scope: {
            active: "@",
            selected: "&",
            changed: "&"
        },
        link: function (scope, element, attrs) {

            // emphasis added to active buttons
            var selClass = "btn-inverse";

            // update the control when scope parameters are updated
            // (but not while handling click event, which handles this automatically)
            var clicking = false;
            scope.$watch("active", function () {
                if (!clicking) {
                    var clsActive = "active " + selClass;
                    if (scope.active && scope.$eval(scope.active) == true) {
                        element.addClass(clsActive);
                    } else {
                        element.removeClass(clsActive);
                    }
                }
            });

            // fire selected, changed events
            element.click("click", function () {
                clicking = true;
                if (scope.changed) {
                    scope.changed();
                }
                if (scope.selected && !element.hasClass("active")) {
                    scope.selected();
                }
                if (element.hasClass("active")) {
                    element.removeClass(selClass);
                } else {
                    element.addClass(selClass);
                }
                clicking = false;
            });
        }
    }
} ]);


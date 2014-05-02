/**
 * jQuery AJAX Navigation Menu plugin
 *
 * Set up a navigation menu to retrieve new content via AJAX without doing a
 * new page load.
 */

jQuery(function($) {

    /**
     * Create AJAX navigation menu.
     *
     * @param $contentContainer Container element for new content.
     * @param options Array of configurable options such as initialModel.
     */
    $.fn.ajaxNav = function($contentContainer, options) {
        var $nav = $(this);
        var ajaxNav = new AjaxNav($nav, $contentContainer, options);
        ajaxNav.init();
        return ajaxNav;
    };

    var defaults = {
        initialModel: null
    };

    /**
     * Construct a new AjaxNav object.
     */
    function AjaxNav($nav, $contentContainer, options)
    {
        // Handle arguments.
        this.$nav = $nav;
        this.$contentContainer = $contentContainer;
        this.settings = $.extend( {}, defaults, options );

        // Set other properties.
        this.$listItems = $("li", this.$nav);
        this.$links = $("a", this.$listItems);
        this.hasInitialModel = this.settings.initialModel != null;
    }

    /**
     * Initialize AJAX navigation behavior.
     */
    AjaxNav.prototype.init = function() {
        this.bindToClick();
        this.bindToStatechange();
        if (this.hasInitialModel) {
            this.renderInitialPage();
        }
    };

    /**
     * Bind custom behavior to link clicks.
     */
    AjaxNav.prototype.bindToClick = function() {
        this.$links.click(function(event){
            // Prevent default click action.
            event.preventDefault();

            // Trigger history state change.
            var $this = $(this);
            History.pushState(null, $this.attr('data-title-tag'), $this.attr('href'));
        });
    };

    /**
     * Bind custom behavior to History state changes.
     */
    AjaxNav.prototype.bindToStatechange = function() {

        // Bind to StateChange Event
        History.Adapter.bind(window,'statechange', $.proxy(function(){ // Note: We are using statechange instead of popstate
            var State = History.getState(); // Note: We are using History.getState() instead of event.state

            // If url matches one of our ajax links, then keep going. Otherwise do a normal page load.
            this.updateActiveData(State.url);
            if (this.$activeLink != null) {
                this.triggerAjaxNav();

            } else {
                window.location = State.url;
            }
        }, this));
    };

    /**
     * Format data into HTML content.
     */
    AjaxNav.prototype.formatData = function(data) {
        // Compile active template and return formatted data.
        var template = Handlebars.compile($("#" + this.activeTemplateId).html());
        return template(data.content);
    };

    /**
     * Render initial page.
     */
    AjaxNav.prototype.renderInitialPage = function() {
        this.updateActiveData($(location).attr('pathname'));
        var useInitialModel = true;
        this.updateContent(useInitialModel);
        this.updateNav();
        this.updateTitle();
    };

    /**
     * Reset data related to active menu item.
     */
    AjaxNav.prototype.resetActiveData = function() {
        this.$activeLink = null;
        this.$activeListItem = null;
        this.activeContent = null;
        this.activeTemplateId = null;
        this.activeTitle = null;
        this.activeUrl = null;
    };

    /**
     * Trigger AJAX navigation behavior.
     */
    AjaxNav.prototype.triggerAjaxNav = function() {
        this.updateContent();
        this.updateNav();
    };

    /**
     * Update data related to active menu item.
     */
    AjaxNav.prototype.updateActiveData = function(url) {
        this.resetActiveData();
        var thisAjaxNav = this;
        this.$links.each(function() {
            var $link = $(this);
            if (url.match($link.attr('href') + "$") != null) {
                thisAjaxNav.$activeLink = $link;
                return false;
            }
        });

        // Skip if url doesn't match one of our ajax links.
        if (this.$activeLink != null) {
            this.activeUrl = url;
            this.activeTemplateId = this.$activeLink.attr('data-template-id');
            this.activeTitle = this.$activeLink.attr('data-title-tag');
            this.$activeListItem = this.$activeLink.closest("li");
        }
    };

    /**
     * Update content container.
     */
    AjaxNav.prototype.updateContent = function(useInitialModel) {

        useInitialModel = typeof useInitialModel !== 'undefined' ? useInitialModel : false;

        if (!useInitialModel) {

            var getNewContent = $.proxy(function() {
                // Need return statement for when-done logic below.
                return $.ajax({
                    // Disable ajax browser caching on Internet Explorer.
                    cache: false,
                    headers: {
                        Accept : "application/json"
                    },
                    url: this.activeUrl
                }).done($.proxy(function(data, textStatus, jqXHR) {
                        this.activeContent = this.formatData(data);
                    }, this));
            }, this);

            // Hide old content and get new content, then update UI when both are done.
            $.when( this.$contentContainer.fadeOut(), getNewContent() ).done($.proxy(function( a1, a2 ) {
                this.$contentContainer.empty();
                this.$contentContainer.append(this.activeContent);
                this.$contentContainer.fadeIn();
            }, this));

        } else {
            this.activeContent = this.formatData(this.settings.initialModel);
            this.$contentContainer.append(this.activeContent);
        }
    };

    /**
     * Update which navigation menu item has active class.
     */
    AjaxNav.prototype.updateNav = function() {
        this.$listItems.not(this.$activeListItem).removeClass('active');
        this.$activeListItem.addClass('active');
    };

    /**
     * Update title tag.
     */
    AjaxNav.prototype.updateTitle = function() {
        document.title = this.activeTitle;
    };
});
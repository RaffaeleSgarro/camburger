Camburger = {};

Camburger.Sidebar = function(options) {
    var self = this;

    this.open = options.open;
    this.showUnicorns = options.showUnicorns;
    this.animationsDuration = options.animationsDuration || 'fast';

    this.history = new Camburger.History({sidebar: self});
    this.dim = $('<div class="camburger-dim"></div>');
    this.el = $('<div class="camburger-sidebar"></div>');
    this.header = new Camburger.Header({sidebar: self});
    this.searchBar = new Camburger.SearchBar({sidebar: self});
    this.panels = new Camburger.Panels({sidebar: self});
    this.searchIndex = new Camburger.SearchIndex({});

    this.dim.appendTo($('body'));
    this.el.appendTo($('body'));
    this.header.el.appendTo(this.el);
    this.searchBar.el.appendTo(this.el);
    this.panels.el.appendTo(this.el);
    this.unicorns = new Unicorns({
        howMany: options.howManyUnicorns || 10,
        unicornImgSrc: options.unicornImgSrc
    });

    this.unicorns.el.appendTo($('body'));

    this.subscribe('item:click', function(ctx, item){
        self.hide();
    });

    this.subscribe('search', function(ctx, searchText){
        self.onSearch(searchText);
    });

    this.dim.click(function(e){
        self.hide();
    });

    if (this.open) {
        this.dim.css({visibility: 'visible'});
        this.el.css({left: 0});
        this.publish('show');
    }

    if (this.showUnicorns) {
        this.unicorns.start();
    }
};

Camburger.Sidebar.prototype.onSearch = function(searchText) {
    var self = this;

    if (searchText && searchText.length > 0) {
        if (searchText != self.lastSearchText) {
            self.lastSearchText = searchText;
            self.searchResult = self.searchIndex.search(searchText);
            self.header.showSearchResult(searchText);
            self.panels.showSearchResult(self.searchResult);
        }
    } else {
        self.header.clearSearchResult();
        self.panels.clearSearchResult();
    }
};

Camburger.Sidebar.prototype.setMenu = function(menu) {
    this.panels.setMenu(menu);
    this.searchIndex.rebuild(menu);
};

Camburger.Sidebar.prototype.show = function() {
    var self = this;
    if (!self.open) {
        self.dim.css({visibility: 'visible'});
        self.dim.fadeIn();
        self.lastSearchText = false;
        self.setMenu(self.history.beginning());
        self.publish('show');
        self.el.animate({left: 0}, {
            duration: self.animationsDuration,
            complete: function() {
                self.open = true;
            }
        });
        if (self.showUnicorns) {
            self.unicorns.start();
        }
    }
};

Camburger.Sidebar.prototype.hide = function() {
    var self = this;
    var width = this.el.width();
    if (this.open) {
        this.dim.fadeOut();
        this.publish('hide');
        this.el.animate({left: -width + 'px'}, {
            duration: self.animationsDuration,
            complete: function onHideAnimationCompleted() {
                self.open = false;
                self.dim.css({visibility: 'visible'});
            }
        });
        if (self.showUnicorns) {
            self.unicorns.stop();
        }
    }
};

Camburger.Sidebar.prototype.toggle = function() {
    var self = this;
    if (self.animating) {
        return;
    }

    self.animating = true;

    if (self.open) {
        self.hide();
    } else {
        self.show();
    }

    setTimeout(function(){
        self.animating = false;
    }, 400);
};

Camburger.Sidebar.prototype.publish = function(topic, data) {
    EventBus.dispatch(topic, this, data);
};

Camburger.Sidebar.prototype.subscribe = function(topic, callback) {
    EventBus.addEventListener(topic, callback);
};

Camburger.SearchIndex = function(options) {
    this.titleIndex = [];
};

Camburger.SearchIndex.prototype.rebuild = function(items) {
    var self = this;
    self.titleIndex = [];

    $.each(items, function(i, childItem){
        indexMenuItem(childItem);
    });

    function indexMenuItem(menuItem) {
        if (menuItem.title && (!menuItem.children || menuItem.children.length == 0)) {
            self.titleIndex.push({
                text: menuItem.title.toLowerCase(),
                menuItem: menuItem
            });
        } else {
            $.each(menuItem.children, function(i, childItem){
                indexMenuItem(childItem);
            });
        }
    }
};

Camburger.SearchIndex.prototype.search = function(text) {
    if (!text || text.length < 2) {
        return [];
    }

    var self = this;
    var result = [];
    var normalized = text.toLowerCase();
    $.each(self.titleIndex, function(i, indexed){
        if (indexed.text.indexOf(normalized) > -1) {
            result.push(indexed.menuItem);
        }
    });

    result.sort(function(thisHit, thatHit){
        var thisScore = thisHit.favourite ? 1 : 0;
        var thatScore = thatHit.favourite ? 1 : 0;
        return thatScore - thisScore;
    });

    return result;
};

Camburger.Header = function(options) {
    var self = this;
    this.sidebar = options.sidebar;
    this.el = $(
      '<div class="header">'
    + '  <span class="toggle-sidebar">'
    + '    <i class="fa fa-bars fa-spacing icon"></i><span class="text"><span>'
    + '  </span>'
    + '</div>');
    this.sidebar.subscribe('history:openDirectory', function(directory){
        self.render();
    });
    this.sidebar.subscribe('history:back', function(directory){
        self.render();
    });
    this.sidebar.subscribe('hide', function(){
        self.searchText = false;
    });
    this.el.click(function(e){ self.onClick(e); });
    this.render();
};

Camburger.Header.prototype.onClick = function(e) {
    if (this.sidebar.history.isEmpty()) {
        this.sidebar.hide();
    } else {
        this.sidebar.history.back();
    }
};

Camburger.Header.prototype.showSearchResult = function(searchText) {
    this.searchText = searchText;
    this.render();
};

Camburger.Header.prototype.clearSearchResult = function(searchText) {
    this.searchText = false;
    this.render();
};

Camburger.Header.prototype.render = function() {
    var $text = this.el.find('.text');
    var $icon = this.el.find('.icon');

    $icon.removeClass('fa-arrow-left fa-bars fa-search');

    if (this.searchText) {
        $text.text('Cerca: "' + this.searchText + '"');
        $icon.addClass('fa-search');
    } else {
        if (this.sidebar.history.isEmpty()) {
            $text.text('Camilla');
            $icon.addClass('fa-bars');
        } else {
            $text.text(this.sidebar.history.currentPage().title);
            $icon.addClass('fa-arrow-left');
        }
    }
};

Camburger.History = function(options) {
    this.sidebar = options.sidebar;
    this.history = [];
};

Camburger.History.prototype.start = function(items) {
    this.history = [];
    this.openDirectory(items);
};

Camburger.History.prototype.currentPage = function() {
    if (this.length < 1) {
        throw "History is empty. Current element is undefined";
    }

    var page = {};
    var historyItem = this.history[this.history.length - 1];

    if (this.isEmpty()) {
        page.menu = historyItem;
    } else {
        page.title = historyItem.title();
        page.menu = historyItem.children();
    }

    return page;
};

Camburger.History.prototype.beginning = function() {
    return this.history[0];
};

Camburger.History.prototype.openDirectory = function(item) {
    this.history.push(item);
    this.sidebar.publish('history:openDirectory', this);
};

Camburger.History.prototype.back = function(item) {
    if (this.isEmpty()) {
        throw { message: "Cannot go back!", history: this.history };
    }
    var removed = this.history.pop();
    this.sidebar.publish('history:back', this);
    return removed;
};

Camburger.History.prototype.isEmpty = function() {
    return this.history.length <= 1;
};

Camburger.SearchBar = function(options) {
    var self = this;
    this.sidebar = options.sidebar;
    this.el = $(
      '<div class="search-bar">'
    + '  <input type="text" class="search-field" name="search-field" placeholder="Cerca" />'
    + '</div>');
    this.searchField = this.el.find('.search-field');
    this.sidebar.subscribe('show', function(){
        self.searchField.focus();
        self.searchField.val('');
    });
    this.sidebar.subscribe('hide', function(){
        self.searchField.blur();
    });
    this.searchField.keyup(function(e){
        self.onKeyup(e);
    });
};

Camburger.SearchBar.prototype.onKeyup = function(e) {
    var self = this;
    if (!self.sidebar.open) {
        return;
    }

    if (e.which == 27) { // e.key == 'Escape'
        self.sidebar.hide();
        return;
    }

    self.lastSearchText = self.searchField.val();

    setTimeout(function(){
        if (self.searchField.val() === self.lastSearchText) {
            self.sidebar.publish('search', self.lastSearchText);
        }
    }, 200);
};

Camburger.Panels = function(options) {
    var self = this;
    this.currentPanel = null;
    this.sidebar = options.sidebar;
    this.el = $('<div class="panels"></div>');
    this.sidebar.subscribe('directory:click', function(ctx, directory){
        var panel = new Camburger.Panel({
            sidebar: self.sidebar
          , items: directory.children
        });

        self.swapToLeft(panel);
    });
    this.sidebar.subscribe('history:back', function(ctx, history){
        var panel = new Camburger.Panel({
            sidebar: self.sidebar
          , items: history.currentPage().menu
        });

        self.swapToRight(panel);
    });

    $(document).keydown(function(e){ self.onKeyboardEvent(e); });
};

Camburger.Panels.prototype.showSearchResult = function(children) {
    var self = this;

    if (self.searchPanel) {
        self.searchPanel.setItems(children);
        self.searchPanel.resetKeyboardSelection();
    } else {
        self.searchPanel = new Camburger.Panel({
            sidebar: self.sidebar
          , items: children
        });

        self.swapToLeft(self.searchPanel);
    }
};

Camburger.Panels.prototype.clearSearchResult = function() {
    var self = this;
    if (self.searchPanel) {
        var panel = new Camburger.Panel({
            sidebar: self.sidebar
          , items: self.sidebar.history.currentPage().menu
        });
        self.searchPanel = false;
        self.swapToRight(panel);
    }
};

Camburger.Panels.prototype.onKeyboardEvent = function(e) {
    if (!this.sidebar.open || !this.currentPanel)
        return;

    switch (e.which) { // e.key
        case 38: // 'ArrowUp'
            this.currentPanel.moveKeyboardSelection(-1);
            break;
        case 40: // 'ArrowDown'
            this.currentPanel.moveKeyboardSelection(+1);
            break;
        case 13: // 'Enter'
            this.currentPanel.keyboardSelection().onClick();
            break;
    }
};

Camburger.Panels.prototype.setCurrentPanel = function(panel) {
    this.currentPanel = panel;
    this.currentPanel.resetKeyboardSelection();
};

Camburger.Panels.prototype.setMenu = function(menu) {
    var self = this;
    this.el.empty();
    this.el.scrollTop(0);
    this.rootPanel = new Camburger.Panel({
        sidebar: self.sidebar
      , items: menu
    });
    this.rootPanel.el.appendTo(this.el);
    this.setCurrentPanel(this.rootPanel);
    this.sidebar.history.start(menu);
    this.searchPanel = false;
};

Camburger.Panels.prototype.swapToLeft = function(panel) {
    var width = this.sidebar.el.width();
    this.swap(panel
      , {left:  width + 'px', right: -width + 'px'}
      , {left: -width + 'px', right: width + 'px'}
    );
};

Camburger.Panels.prototype.swapToRight = function(panel) {
    var width = this.sidebar.el.width();
    this.swap(panel
      , {left:  -width + 'px', right: width + 'px'}
      , {left:   width + 'px', right: -width + 'px'}
    );
};

Camburger.Panels.prototype.swap = function(panel, inInitial, outAnimation) {
    var self = this;

    panel.el.css(inInitial);

    panel.el.appendTo(this.el);

    panel.el.animate({
        left: 0,
        right: 0,
    }, {
        duration: self.sidebar.animationsDuration,
        complete: function() {
            self.el.scrollTop(0);
        }
    });

    this.currentPanel.el.animate(outAnimation, {
        duration: self.sidebar.animationsDuration,
        complete: function() {
            this.remove();
            self.setCurrentPanel(panel);
        }
    });
};

Camburger.Panel = function(options) {
    var self = this;

    this.sidebar = options.sidebar;

    this.el = $('<div class="panel"></div>');
    this.items = [];
    this.selectionIndex = -1;

    this.setItems(options.items);
};

Camburger.Panel.prototype.setItems = function(items) {
    var self = this;
    self.items = [];
    self.el.empty();
    $.each(items, function(index, itemOptions){
        var menuItem = new Camburger.MenuItem({
            data: itemOptions
          , sidebar: self.sidebar
        });
        menuItem.el.appendTo(self.el);
        self.items.push(menuItem);
    });
};

Camburger.Panel.prototype.setKeyboardSelectionIndex = function(index) {
    if (index >= 0 && index < this.items.length) {
        if (this.keyboardSelection()) {
            this.keyboardSelection().keyboardSelect(false);
        }
        this.selectionIndex = index;
        this.keyboardSelection().keyboardSelect(true);
    }
};

Camburger.Panel.prototype.resetKeyboardSelection = function() {
    this.setKeyboardSelectionIndex(0);
};

Camburger.Panel.prototype.moveKeyboardSelection = function(delta) {
    this.setKeyboardSelectionIndex(this.selectionIndex + delta);
};

Camburger.Panel.prototype.keyboardSelection = function() {
    if (this.selectionIndex >= 0 || this.selectionIndex < this.items.length) {
        return this.items[this.selectionIndex];
    }
};

Camburger.MenuItem = function(options) {
    var self = this;

    this.sidebar = options.sidebar;

    this.el = $(
      '<div class="item">'
    + '  <span class="fa-stack">'
    + '    <i class="fa fa-circle fa-stack-2x"></i>'
    + '    <i class="fa fa-stack-1x fa-inverse icon"></i>'
    + '  </span>'
    + '  <span class="text"></span>'
    + '  <div class="toggle-favourite"><i class="fa fa-star-o"></i></div>'
    + '</div>');

    this.data = options.data;

    this.el.click(function(e){ self.onClick(e); });

    this.el.find(".toggle-favourite").click(function(e){ self.onToggleFavourite(e); });

    this.render();
};

Camburger.MenuItem.prototype.isLeaf = function() {
    return this.data.children == null || this.data.children.length == 0;
};

Camburger.MenuItem.prototype.render = function() {
    var indicator = this.el.find(".toggle-favourite i");

    $(".icon", this.el).addClass("fa-" + this.data.icon);
    $(".text", this.el).text(this.data.title);

    if (this.data.favourite) {
        indicator.addClass('fa-star');
        indicator.removeClass('fa-star-o');
    } else {
        indicator.addClass('fa-star-o');
        indicator.removeClass('fa-star');
    }
};

Camburger.MenuItem.prototype.keyboardSelect = function(selected) {
    if (selected) {
        this.el.addClass('kbd-selection');
        this.el[0].scrollIntoView();
    } else {
        this.el.removeClass('kbd-selection');
    }
};

Camburger.MenuItem.prototype.onClick = function(e) {
    if (this.isLeaf()) {
        this.sidebar.publish('item:click', this.data);
    } else {
        this.sidebar.history.openDirectory(this);
        this.sidebar.publish('directory:click', this.data);
    }
};

Camburger.MenuItem.prototype.onToggleFavourite = function(e) {
    this.data.favourite = !this.data.favourite;
    this.render();
    this.sidebar.publish('favourite:toggle', this.data);
    e.stopPropagation();
};

Camburger.MenuItem.prototype.title = function() {
    return this.data.title;
};

Camburger.MenuItem.prototype.children = function() {
    return this.data.children;
};

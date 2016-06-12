Camburger = {};

Camburger.Sidebar = function(options) {
    var self = this;
    
    this.open = true;
    
    this.history = new Camburger.History({sidebar: self});
    this.dim = $('<div class="camburger-dim"></div>');
    this.el = $('<div class="camburger-sidebar"></div>');
    this.header = new Camburger.Header({sidebar: self});
    this.searchBar = new Camburger.SearchBar({sidebar: self});
    this.panels = new Camburger.Panels({sidebar: self});
    
    this.dim.appendTo($('body'));
    this.el.appendTo($('body'));
    this.header.el.appendTo(this.el);
    this.searchBar.el.appendTo(this.el);
    this.panels.el.appendTo(this.el);
    
    this.subscribe('item:click', function(ctx, item){
        self.hide();
    });
    
    this.dim.click(function(e){
        self.hide();
    });

    if (this.open) {
        this.publish('show');
    }
};

Camburger.Sidebar.prototype.setMenu = function(menu) {
    this.panels.setMenu(menu);
};

Camburger.Sidebar.prototype.show = function() {
    if (!this.open) {
        this.dim.fadeIn();
        this.el.animate({left: 0});
        this.open = true;
        this.setMenu(this.history.beginning());
        this.publish('show');
    }
};

Camburger.Sidebar.prototype.hide = function() {
    var width = this.el.width();
    if (this.open) {
        this.dim.fadeOut();
        this.el.animate({left: -width + 'px'});
        this.open = false;
    }
};

Camburger.Sidebar.prototype.toggle = function() {
    // TODO debounce
    if (this.open) {
        this.hide();
    } else {
        this.show();
    }
};

Camburger.Sidebar.prototype.publish = function(topic, data) {
    EventBus.dispatch(topic, this, data);
};

Camburger.Sidebar.prototype.subscribe = function(topic, callback) {
    EventBus.addEventListener(topic, callback);
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

Camburger.Header.prototype.render = function() {
    var $text = this.el.find('.text');
    var $icon = this.el.find('.icon');
    if (this.sidebar.history.isEmpty()) {
        $text.text('Camilla');
        $icon.addClass('fa-bars');
        $icon.removeClass('fa-arrow-left');
    } else {
        $text.text(this.sidebar.history.current().title());
        $icon.addClass('fa-arrow-left');
        $icon.removeClass('fa-bars');
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

Camburger.History.prototype.current = function() {
    if (this.length < 1) {
        throw "History is empty. Current element is undefined";
    }
    return this.history[this.history.length - 1];
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
    this.sidebar.subscribe('show', function(){
        var searchField = self.el.find('.search-field');
        searchField.focus();
        searchField.val('');
    });
};

Camburger.Panels = function(options) {
    var self = this;
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
          , items: history.isEmpty() ? history.current() : history.current().children
        });
        
        self.swapToRight(panel);
    });
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
    this.currentPanel = this.rootPanel;
    this.sidebar.history.start(menu);
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
        complete: function() {
            self.el.scrollTop(0);
        }
    });
    
    this.currentPanel.el.animate(outAnimation, {
        complete: function() {
            this.remove();
        }
    });
    
    this.currentPanel = panel;
};

Camburger.Panel = function(options) {
    var self = this;
    
    this.sidebar = options.sidebar;
    
    this.el = $('<div class="panel"></div>');
    
    $.each(options.items, function(index, itemOptions){
        var menuItem = new Camburger.MenuItem({
            data: itemOptions
          , sidebar: self.sidebar
        });
        menuItem.el.appendTo(self.el);
    });
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

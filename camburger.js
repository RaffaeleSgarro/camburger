Camburger = {};

Camburger.Sidebar = function(options) {
    var self = this;
    
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
};

Camburger.Sidebar.prototype.setMenu = function(menu) {
    this.panels.setMenu(menu);
};

Camburger.Header = function(options) {
    this.sidebar = options.sidebar;
    this.el = $(
      '<div class="header">'
    + '  <span class="toggle-sidebar">'
    + '    <i class="fa fa-bars fa-spacing"></i>Camilla'
    + '  </span>'
    + '</div>');
};

Camburger.SearchBar = function(options) {
    this.sidebar = options.sidebar;
    this.el = $(
      '<div class="search-bar">'
    + '  <input type="text" class="search-field" name="search-field" placeholder="Cerca" />'
    + '</div>');
};

Camburger.Panels = function(options) {
    this.sidebar = options.sidebar;
    this.el = $('<div class="panels"></div>');
};

Camburger.Panels.prototype.setMenu = function(menu) {
    var self = this;
    
    this.el.empty();
    this.rootPanel = new Camburger.Panel({
        sidebar: self.sidebar
      , items: menu
    });
    this.rootPanel.el.appendTo(this.el);
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
        console.log(this.data.title);
    } else {
        // TODO
    }
};

Camburger.MenuItem.prototype.onToggleFavourite = function(e) {
    this.data.favourite = !this.data.favourite;
    this.render();
    e.stopPropagation();
};

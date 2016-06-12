Camburger = {};

Camburger.Sidebar = function(options) {
    this.dim = $('<div class="camburger-dim"></div>');
    this.el = $('<div class="camburger-sidebar"></div>');
    this.header = new Camburger.Header({});
    this.searchBar = new Camburger.SearchBar({});
    this.panels = new Camburger.Panels({});
    
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
    this.el = $(
      '<div class="header">'
    + '  <span class="toggle-sidebar">'
    + '    <i class="fa fa-bars fa-spacing"></i>Camilla'
    + '  </span>'
    + '</div>');
};

Camburger.SearchBar = function(options) {
    this.el = $(
      '<div class="search-bar">'
    + '  <input type="text" class="search-field" name="search-field" placeholder="Cerca" />'
    + '</div>');
};

Camburger.Panels = function(options) {
    this.el = $('<div class="panels"></div>');
};

Camburger.Panels.prototype.setMenu = function(menu) {
    this.el.empty();
    this.rootPanel = new Camburger.Panel({items: menu});
    this.rootPanel.el.appendTo(this.el);
};

Camburger.Panel = function(options) {
    var self = this;
    
    this.el = $('<div class="panel"></div>');
    
    $.each(options.items, function(index, itemOptions){
        var menuItem = new Camburger.MenuItem({data: itemOptions});
        menuItem.el.appendTo(self.el);
    });
};

Camburger.MenuItem = function(options) {
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
    
    $(".icon", this.el).addClass("fa-" + this.data.icon);
    $(".text", this.el).text(this.data.title);
    $(".toggle-favourite i").addClass(this.data.favourite ? "fa-star" : "fa-star-o");
};

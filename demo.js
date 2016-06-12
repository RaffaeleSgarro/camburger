$(function() {
    var menu = [];
    var i;
    
    for (i = 0; i < 25; i++) {
        level1Item = {
            icon: "flag",
            id: i,
            title: "Item #" + i,
            terms: [],
            favourite: false,
            children: []
        };
        
        menu.push(level1Item);
    }
    
    window.sidebar = new Camburger.Sidebar({});
    sidebar.setMenu(menu);
});

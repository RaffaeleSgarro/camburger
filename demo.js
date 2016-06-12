$(function() {
    var menu = [];
    var i;
    
    appendItems(25, menu);
    
    $.each(menu, function(i, item){
        appendItems(10, item.children);
    });
    
    function appendItems(howManyItems, children) {
        for (i = 0; i < howManyItems; i++) {
            item  = {
                icon: "flag",
                id: i,
                title: "Item #" + i,
                terms: [],
                favourite: false,
                children: []
            };
            
            children.push(item);
        }
    }
    
    window.sidebar = new Camburger.Sidebar({});
    sidebar.setMenu(menu);
    
    sidebar.subscribe('item:click', function(ctx, item){
        console.log('Clicked ' + item.title);
    });
});

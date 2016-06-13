$(function() {
    var menu = [];
    var i;

    window.sidebar = new Camburger.Sidebar({});
    sidebar.setMenu(window.tz.children);

    $('.toggle-sidebar').click(function(e){
        window.sidebar.show();
    });

    sidebar.subscribe('item:click', function(ctx, item){
        console.log('Clicked ' + item.title);
    });

    $(document).keypress(function(e){
        if (e.key == ' ' && e.ctrlKey) {
            window.sidebar.toggle();
        }
    });
});

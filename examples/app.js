$(function() {
    var menu = [];
    var i;

    window.sidebar = new Camburger.Sidebar(window.camburgerOptions || {});

    sidebar.setMenu(window.tz.children);

    $('.toggle-sidebar').click(function(e){
        window.sidebar.show();
    });

    sidebar.subscribe('item:click', function(ctx, item){
        console.log('Clicked ' + item.title);
    });

    $(document).keypress(function(e){
        var focused = $(document.activeElement);

        if (focused
            && focused[0].nodeName.toLowerCase() == 'input'
            && focused.attr("type") == 'text') {
            return;
        }

        if (e.key == 'c') {
            window.sidebar.toggle();
            return false;
        }
    });
});

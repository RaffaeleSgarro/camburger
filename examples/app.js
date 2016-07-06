$(function() {

    window.sidebar = new Camburger.Sidebar(window.camburgerOptions || {});

    // Ugly. tz.json is included in HTML and evaluated. The resulting object
    // is stored in a global "tz"
    sidebar.setRootMenu({
        children: window.tz.children
      , quickStart: [174, 325, 587, 463]
    });

    $('.toggle-sidebar').click(function(e){
        window.sidebar.show();
    });

    sidebar.subscribe('item:click', function(ctx, item){
        console.log('Clicked ' + item.title);
    });

    sidebar.subscribe('quickstart:change', function(ctx, e){
        console.log('Quickstart changed: ' + e.quickStart);
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

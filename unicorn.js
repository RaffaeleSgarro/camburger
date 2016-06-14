var Unicorns = function(options) {
    this.unicorns = [];
};

Unicorns.prototype.start = function() {
    var unicorn;
    var i;
    var self = this;

    self.stop();

    for (i = 0; i < 10; i++) {
        unicorn = new Unicorn({});
        unicorn.el.appendTo($('body'));
        unicorn.moveRandom();
        self.unicorns.push(unicorn);
    }
};

Unicorns.prototype.stop = function() {
    $.each(this.unicorns, function(i, unicorn){
        unicorn.destroy();
    });

    this.unicorns = [];
};

var Unicorn = function(options) {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.el = $('<div class="unicorn"></div>');
    self.el.css(self.generateRandomStyle());
};

Unicorn.prototype.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Unicorn.prototype.generateRandomStyle = function() {
    var self = this;
    return {
        top: self.randomInt(0, $(window).height()) + 'px'
      , left: self.randomInt(0, $(window).width()) + 'px'
      , zoom: Math.random()
      , 'font-size': self.randomInt(0, 360) + 'px' // hack: use a random valid property
    };
};

Unicorn.prototype.moveRandom = function() {
    this.el.animate({opacity: 1});
    this.nextMove();
};

Unicorn.prototype.nextMove = function() {
    var self = this;

    if (self.destroyed) {
        self.el.animate({opacity: 0}, {
            complete: function() {
                self.el.remove();
            }
        });
    } else {
        self.el.animate(self.generateRandomStyle(), {
            complete: self.nextMove.bind(self)
          , duration: self.randomInt(1000, 2000)
          , step: function(now, fx) {
              // font-size is passed as fontSize. Not a typo
              if (fx.prop == 'fontSize') {
                  self.el.css('transform', 'rotate(' + now + 'deg)');
              }
          }
        });
    }
};

Unicorn.prototype.destroy = function() {
    this.destroyed = true;
};

var Unicorns = function(options) {};

Unicorns.prototype.start = function() {
    var unicorn;
    var i;
    for (i = 0; i < 10; i++) {
        unicorn = new Unicorn({});
        unicorn.el.appendTo($('body'));
        unicorn.moveRandom();
    }
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
    var side = self.randomInt(0, 250) ;
    return {
        top: self.randomInt(0, $(window).height() - side) + 'px'
      , left: self.randomInt(0, $(window).width() - side) + 'px'
      , width: side + 'px'
      , height: side + 'px'
    };
};

Unicorn.prototype.moveRandom = function() {
    this.nextMove();
};

Unicorn.prototype.nextMove = function() {
    var self = this;
    self.el.animate(self.generateRandomStyle(), {
        complete: self.nextMove.bind(self)
      , duration: self.randomInt(400, 1000)
      , step: function(now, fx) {
          self.el.css('transform', 'rotate(' + now + 'deg)');
      }
    });
};

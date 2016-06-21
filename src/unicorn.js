var Unicorns = function(options) {
    var self = this;
    self.el = $('<canvas class="unicorns"></canvas>');
    self.img = $('<img src="' + options.unicornImgSrc + '" class="unicorn-bitmap">');
    self.ctx = self.el[0].getContext('2d');
    self.unicorns = [];
    self.howMany = options.howMany || 10;

    self.img.appendTo($('body'));

    self.resize();

    $(window).resize(function(){
        self.resize();
    });
};

Unicorns.prototype.resize = function() {
    var self = this;

    self.el[0].width = window.innerWidth;
    self.el[0].height = window.innerHeight;
};

Unicorns.prototype.start = function() {
    var unicorn;
    var i;
    var self = this;

    self.stop();

    self.stopped = false;

    for (i = 0; i < self.howMany; i++) {
        unicorn = new Unicorn({img: self.img[0]});
        self.unicorns.push(unicorn);
    }

    self.step();
};

Unicorns.prototype.step = function() {
    var self = this;

    self.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    $.each(self.unicorns, function(i, unicorn) {
        unicorn.move();
        unicorn.draw(self.ctx);
    });

    if (!self.stopped) {
        window.requestAnimationFrame(self.step.bind(self));
    }
};

Unicorns.prototype.stop = function() {
    var self = this;

    self.stopped = true;

    $.each(self.unicorns, function(i, unicorn){
        unicorn.destroy();
    });

    self.unicorns = [];

    self.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
};

var Unicorn = function(options) {
    var self = this;
    self.img = options.img;
    self.translateX = self.randomInt(0, window.innerWidth);
    self.translateY = self.randomInt(0, window.innerHeight);
    self.scale = Math.min(0.5, Math.random());
    self.alpha = 0;
    self.rotate = self.randomInt(0, 360);
};

Unicorn.prototype.draw = function(ctx) {
    var self = this;
    ctx.save();
    ctx.globalAlpha = self.alpha;
    ctx.translate(self.translateX, self.translateY);
    ctx.scale(self.scale, self.scale);
    ctx.rotate(self.rotate * Math.PI / 180);
    ctx.drawImage(self.img, 0, 0);
    ctx.restore();
};

Unicorn.prototype.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Unicorn.prototype.destroy = function() {
    if (this.currentMove) {
        this.currentMove.alpha.endValue = 0;
    }
};

Unicorn.prototype.move = function() {
    var self = this;

    if (!self.currentMove || Date.now() > self.currentMoveEnds) {
        self.currentMoveDuration = self.randomInt(1500, 2500);
        self.currentMoveEnds = Date.now() + self.currentMoveDuration;
        self.currentMove = {
            translateX: new Effect({startValue: self.translateX, endValue: self.randomInt(0, window.innerWidth), duration: self.currentMoveDuration})
          , translateY: new Effect({startValue: self.translateY, endValue: self.randomInt(0, window.innerHeight), duration: self.currentMoveDuration})
          , scale: new Effect({startValue: self.scale, endValue: Math.min(0.5, Math.random()), duration: self.currentMoveDuration})
          , rotate: new Effect({startValue: self.rotate, endValue: self.randomInt(0, 360), duration: self.currentMoveDuration})
          , alpha: new Effect({startValue: self.alpha, endValue: 1, duration: self.currentMoveDuration})
        };
    }

    self.translateX = self.currentMove.translateX.val();
    self.translateY = self.currentMove.translateY.val();
    self.scale = self.currentMove.scale.val();
    self.rotate = self.currentMove.rotate.val();
    self.alpha = self.currentMove.alpha.val();
};

var Effect = function(options) {
    this.startValue = options.startValue;
    this.endValue = options.endValue;
    this.duration = options.duration;
};

Effect.prototype.val = function() {
    var val;
    var currentTimeMillis = Date.now();

    if (this.start && (currentTimeMillis > this.start + this.duration)) {
        val = this.endValue;
    }

    if (this.start) {
        val = (this.endValue - this.startValue) / this.duration * (currentTimeMillis - this.start) + this.startValue;
    } else {
        this.start = currentTimeMillis;
        val = this.startValue;
    }

    return val;
};

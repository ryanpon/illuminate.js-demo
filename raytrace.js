

function circlePos(r, c, t) {
    return {
        "x": r * Math.cos(t) + c.x,
        "y": r * Math.sin(t) + c.y        
    }

}

function orbitTracker(degreesToOrbit, startingPos) {
    var pos = startingPos || 0; //degrees
    return function () {
        pos += degreesToOrbit;
        if (pos >= 360) {
            pos -= 360;
        }
        return pos;
    };
} 

/*
Input defaults:
     radius: 100 (pixels) 
     orbitCenter: {x: 100, y: 100}
     rotationPerTick: 1 (degree)
     center: Vec2(100, 100)
     orbitDist: 100
*/
function Planet(options) {
    this.orbitCenter = options.orbitCenter || {x: 100, y: 100};
    this.orbitFn = orbitTracker(options.rotationPerTick || 1, 0);
    this.orbitDist = options.orbitDist || 100;
    this.disc = new DiscObject({ 
        center: Vec2(0, 0), 
        radius: options.radius || 100
    });

    this.tick = function () {
        var angle = this.orbitFn() / 180 * Math.PI;
        this.pos = circlePos(this.orbitDist, this.orbitCenter, angle);
        this.disc.center = new Vec2(this.pos.x, this.pos.y);
    };
    this.tick();

    this.bounds = function () { return this.disc.bounds(); };
    this.contains = function (point) { return this.disc.contains(point); };
    this.path = function (ctx) { return this.disc.path(ctx); };
    this.cast = function (ctx, origin, bounds) { return this.disc.cast(ctx, origin, bounds); };
}


var canvas = document.getElementById("ssCanvas");
var ctx = canvas.getContext("2d");
var orbit = orbitTracker(.5);
var size, center;

var light = new Lamp({
    samples: 10
});

var planet = new Planet({});
var moon1 = new Planet({
    rotationPerTick: 3
});
var moon2 = new Planet({
    rotationPerTick: 2
});

var lighting = new Lighting({
    light: light,
    objects: [ planet, moon1, moon2 ]
});

function redraw() {
    lighting.compute(canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lighting.render(ctx);
}

function draw() {
    $("#ssCanvas").attr("height", $(window).height())
                  .attr("width", $(window).width());

    size = Math.min(canvas.width, canvas.height);
    center = {"x" : canvas.width / 2, "y" : canvas.height / 2};

    light.position = new Vec2(center.x, center.y);  
    light.distance = size / 1.5;
    light.radius = size / 15;

    planet.orbitCenter = center;
    planet.disc.radius = size / 40;
    planet.orbitDist = size / 4;

    moon1.disc.radius = planet.disc.radius / 7;
    moon1.orbitDist = planet.disc.radius * 2.5;

    moon2.disc.radius = planet.disc.radius / 3.4;
    moon2.orbitDist = planet.disc.radius * 1.6;

    redraw();
}
draw();

function animate() {
    planet.tick();

    moon1.orbitCenter = planet.pos;
    moon1.tick();

    moon2.orbitCenter = planet.pos;
    moon2.tick();

    redraw();
    setTimeout(animate, 15);
}
animate();
// deg = rad * 180 / pi
// rad = deg / 180 * pi
$(window).resize(function () {
    draw();
});



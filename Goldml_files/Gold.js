/*      Gold!!!      

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GAME CONSTANTS
var START_LIFES = 3;
var START_LEVEL = 1;

// GAME SCORES
var SCORE_BRICK = 2
var SCORE_KEY = 4
var SCORE_LOCK = 4
var SCORE_GOLD = 6
var SCORE_UNUSED_SECOND = 1
var SCORE_UNUSER_LIFE = 200

// GLOBAL VARIABLES

var ctx, empty, ball, world, control;


// ACTORS

var Actor = EXTENDS(JSRoot, {
	x: 0, y: 0,
	kind: null,
	color: null,
	INIT: function(x, y, kind, color) {
		this.x = x;
		this.y = y;
		this.kind = kind;
		this.color = color;
		this.show();
	},
	setColor: function(color) {
		this.color = color;
	},
	getColor: function() {
		return this.color;
	},
	show: function() {
		var image = GameImage.get(this.kind, this.color).image;
		world[this.x][this.y] = this;
		ctx.drawImage(image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
	},
	hide: function() {
		var image = GameImage.get("Empty", "").image;
		world[this.x][this.y] = empty;
		ctx.drawImage(image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
	},
	collision: function(){
		console.error("not implemented");
	}
});

var Empty = EXTENDS(Actor, {
	INIT: function() {
		this.SUPER(Actor.INIT, -1, -1, "Empty", "");
	},
	show: function() {},
	hide: function() {}
});

var Boundary = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Boundary", color);
	}
})

var Brick = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Brick", color);
	}
})

var Bucket = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Bucket", color);
	}
})

var Devil = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Devil", color);
	}
})

var Inverter = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Inverter", color);
	}
})

var Key = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Key", color);
	}
})

var Lock = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Lock", color);
	}
})

var Gold = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Gold", color);
	}
})

var Ball = EXTENDS(Actor, {
	deltaX: 0,
	deltaY: 0,
	color: "",
	// MORE FIELDS NEEDED
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, "Ball", "lightBlue");
		this.reset();
		this.show();
	},
	reset: function() {	// for starting/restarting a level
		this.deltaY = 1;
		this.x = INICIAL_BALL_X;
		this.y = INICIAL_BALL_Y;
		this.setColor("lightBlue");
	},
	show: function() {
		var image = GameImage.get(this.kind, this.color).image;
		ctx.drawImage(image, this.x * BALL_PIXELS_X, this.y * BALL_PIXELS_Y);
	},
	hide: function() {
		var image = GameImage.get(this.kind, "white").image;
		ctx.drawImage(image, this.x * BALL_PIXELS_X, this.y * BALL_PIXELS_Y);
	},
	move: function(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();		
	},
	setDeltaX: function(dx) {
		this.deltaX = dx;
	},
	getDeltaX: function(dx) {
		return this.deltaX;
	},
	checkHit: function(dx, dy) {
		var nextX = div(this.x + dx, FACTOR_X);
		var nextY = div(this.y + dy, FACTOR_Y);
		var hit = world[nextX][nextY] != empty;
		if( hit ) (world[nextX][nextY]).collision(this);
		return hit;
	},
	animation: function() {
		var dx = this.getDeltaX();
		var dy = this.deltaY;
		var hitX = false;
		var hitY = this.checkHit(0, dy);
		if( dx != 0 ) {
			hitX = this.checkHit(dx, 0);
			if( !hitX && !hitY )
				hitY = this.checkHit(dx, dy);
		}
		if( hitX ) dx *= -1;
		if( hitY ) dy = this.deltaY *= -1;	
		this.move(dx, dy);
	},
	die: function() {
		this.hide();
		this.reset();
	},
	collision: function(hit) {
		// TO DO
	}
})


// GAME CONTROL

var GameControl = EXTENDS(JSRoot, {
	INIT: function() {
		this.nBricks = 0; 
		this.nGold = 0;
		this.nKeys = 0;
		this.lives = 3;
		ctx = document.getElementById("canvas1").getContext("2d");
		empty = NEW(Empty);	// only one empty actor needed
		world = this.createWorld();
		this.loadLevel(START_LEVEL);
		ball = NEW(Ball); 
		this.setupEvents();
		control = this;

		this.lifes = START_LIFES;
	},
	createWorld: function () { // stored by columns
		var matrix = new Array(WORLD_WIDTH);
		for( var x = 0 ; x < WORLD_WIDTH ; x++ ) {
			var a = new Array(WORLD_HEIGHT);
			for( var y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	},
	loadLevel: function (level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		var map = MAPS[level-1];  // -1 because levels start at 1
		// INCOMPLETE: YOU NEED TO FILL THE ENTIRE WORLD

		for( var x = 0 ; x < WORLD_WIDTH ; x++ ) {
			for( var y = 0 ; y < WORLD_HEIGHT ; y++ ) {
				var code = map[y][x];  // x/y reversed because map stored by lines
				var gi = GameImage.getByCode(code);
				if( gi ){
					var actor = NEW(globalByName(gi.kind), x, y, gi.color)
					switch(actor.kind){
						case "Brick":
							this.nBricks++;
							actor.collision = function(whoHit) {
								if(whoHit.getColor() == this.getColor()){
									this.hide();
									control.nBricks--;
								}
							}
							break;

						case "Bucket":
							actor.collision = function (whoHit) {
								whoHit.setColor(this.getColor())
							}
							break;

						case "Gold":
							this.nGold++;
							actor.collision = function(whoHit) {
								if (control.nBricks == 0) {
									control.nGold--;
									this.hide();
								}
							}
							break;
						case "Key":
							actor.collision = function(whoHit) {
								control.nKeys++;
								this.hide();
							}
							break;
						case "Lock":
							actor.collision = function(whoHit) {
								if (control.nKeys == 0) {
									control.nKeys--;
									this.hide();
								}
							}
							break;
						case "Devil":
							actor.collision = function(whoHit) {
								if (control.lives > 0) {
									whoHit.die()
								} else {

								}
							}
					}
				}
			}
		}
	},
	win: function(){

	},
	setupEvents: function() {
		this.setSpeed(DEFL_SPEED);
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
	},
	animationEvent: function () {
		ball.animation();
	},
	keyDownEvent: function(k) {
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		var code = k.keyCode
		switch(code) {
			case 37: case 79: case 74:
				ball.setDeltaX(-1); break;	// LEFT, O, J
			case 38: case 81: case 73:
				/* ignore */ break;			// UP, Q, I
			case 39: case 80: case 76:
				ball.setDeltaX(1);  break;	// RIGHT, P, L
			case 40: case 65: case 75:
				/* ignore */ break;			// DOWN, A, K
			default: break;
		}
	},
	keyUpEvent: function(k) {
		ball.setDeltaX(0);
	},
	setSpeed: function (speed) {
		if( (speed < MIN_SPEED) || (MAX_SPEED < speed) )
			speed = MIN_SPEED;
		setInterval(this.animationEvent, (MAX_SPEED + 1 - speed) * 30);
	}
});


// HTML FORM

function onLoad() {
  // load images an then run the game
	GameImage.loadImages(function() {NEW(GameControl);});

}

function b1() { mesg("button1") }
function b2() { mesg("button2") }




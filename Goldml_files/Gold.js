/*      Gold!!!      

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GAME CONSTANTS
START_LIVES = 3;
START_LEVEL = 2;
MAX_LEVEL = 6;
START_TIME = 120;

// GAME SCORES
SCORE_BRICK = 2
SCORE_KEY = 4
SCORE_LOCK = 4
SCORE_GOLD = 6
SCORE_UNUSED_SECOND = 1
SCORE_UNUSER_LIFE = 200

INVENTARY_KEY = "KEY"


// GLOBAL VARIABLES

var ctx, empty, ball, world, control;

// ACTORS

var Actor = EXTENDS(JSRoot, {
	countable: false,
	INIT: function(x, y, kind, color) {
		this.x = x;
		this.y = y;
		this.kind = kind;
		this.color = color;
	},
	setColor: function(color) {
		this.color = color;
	},
	getColor: function() {
		return this.color;
	},
	setShowCallback: function(callback){
		this.showCallback = callback	
	},
	setHideCallback: function(callback){
		this.hideCallback = callback
	},
	show: function() {
		var image = GameImage.get(this.kind, this.color).image;
		world[this.x][this.y] = this;
		ctx.drawImage(image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);

		if(this.showCallback)
			this.showCallback()
	},
	hide: function() {
		var image = GameImage.get("Empty", "").image;
		world[this.x][this.y] = empty;
		ctx.drawImage(image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
		
		if(this.hideCallback)
			this.hideCallback()
	},
	collision: function(whoHit){
	},
	ballCollision: function(ball) {
		return null
	}
});

var Empty = EXTENDS(Actor, {
	kind: "Empty",
	INIT: function() {
		this.SUPER(Actor.INIT, -1, -1, this.kind, "");
	},
	show: function() {},
	hide: function() {}
});

var Boundary = EXTENDS(Actor, {
	kind: "Boundary",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	}
})

var Brick = EXTENDS(Actor, {
	kind: "Brick",
	countable: true,
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
		this.score = SCORE_BRICK
	},
	ballCollision: function(ball) {
		if (ball.getColor() == this.getColor()) {
			this.hide() 
			return this.score
		}
	}
})

var Bucket = EXTENDS(Actor, {
	kind: "Bucket",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		return ball.setColor(this.color)
	}
})

var Devil = EXTENDS(Actor, {
	kind: "Devil",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		ball.die()
	}
})

var Inverter = EXTENDS(Actor, {
	kind: "Inverter",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function() {
		control.invertControls()
	}
})

var Key = EXTENDS(Actor, {
	countable: true,
	kind: "Key",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		ball.addToInventary(INVENTARY_KEY)
		this.hide()
		return this.score
	}
})

var Lock = EXTENDS(Actor, {
	countable: true,
	kind: "Lock",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		if (ball.remToInventary(INVENTARY_KEY)) {
			this.hide()
			return this.score
		}
	}
})

var Gold = EXTENDS(Actor, {
	countable: true,
	kind: "Gold",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		if(control.getActorCount(Brick.kind) == 0){
			this.hide()
			return this.score
		}
	}
})

var Ball = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.pause()
		this.deltaX = 0
		this.deltaY = 1
		this.inventary = []
		this.lives = N_LIVES
		this.SUPER(Actor.INIT, x, y, "Ball", "lightBlue");
		this.reset();
		this.show()
	},
	reset: function() {	// for starting/restarting a level
		this.x = INICIAL_BALL_X;
		this.y = INICIAL_BALL_Y;
		this.setColor("lightBlue");
	},
	show: function() {
		var image = GameImage.get(this.kind, this.color).image;
		ctx.drawImage(image, this.x * BALL_PIXELS_X, this.y * BALL_PIXELS_Y);
		
		if(this.showCallback)
			this.showCallback()
	},
	hide: function() {
		var image = GameImage.get(this.kind, "white").image;
		ctx.drawImage(image, this.x * BALL_PIXELS_X, this.y * BALL_PIXELS_Y);
		
		if(this.hideCallback)
			this.hideCallback()
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
	getDeltaX: function() {
		return this.deltaX;
	},
	setDeltaY: function(dy) {
		this.deltaY = dy;
	},
	getDeltaY: function() {
		return this.deltaY;
	},
	checkHit: function(dx, dy) {
		var nextX = div(this.x + dx, FACTOR_X);
		var nextY = div(this.y + dy, FACTOR_Y);
		var hit = world[nextX][nextY] != empty;
		if( hit ) this.collision(world[nextX][nextY]);
		return hit;
	},
	animation: function() {
		if (!this.isPaused()) {
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
		}
	},
	getLives: function() {
		return this.lives	
	},
	die: function() {
		this.reposition();
		this.lives--;
		
		if(this.loseLiveCallback)
			this.loseLiveCallback();
		
		if(this.lives == 0 && this.dieCallback){
			this.dieCallback();
		}
	},
	pause: function() {
		this.paused = true
	},
	unpause: function() {
		this.paused = false
	},
	isPaused: function() {
		return this.paused
	},
	setDieCallback: function(func){
		this.dieCallback = func
	},
	setLoseCallback: function(func){
		this.loseLiveCallback = func
	},
	reposition: function() {
		this.hide();
		this.reset();
	},
	collision: function(hit) {
		control.incScore(hit.ballCollision(this) || 0)
	},
	addToInventary: function(item, qty){
		if(! qty) qty = 1
		
		if(!this.inventary[item])
			this.inventary[item] = 0
		
		this.inventary[item]+= qty
	},
	hasInInventary: function(item, qty){
		if(!qty) qty = 1
		
		return this.inventary[item] >= qty	
	},
	remFromInventary: function(item, qty){
		if(!qty) qty = 1
			
		if(hasInInventary(item, qty)){
			inventary[item]-= qty
			return item
		}
	}
})


// GAME CONTROL

var GameControl = EXTENDS(JSRoot, {
	INIT: function() {
		control = this;
		this.actorCount = {};

		this.currentLevel = START_LEVEL;
		this.score = 0;
		this.controlInverter = 1

		empty = NEW(Empty);	// only one empty actor needed
		world = this.createWorld();
		
		this.loadLevel(this.currentLevel);
		ball = NEW(Ball);
		ball.setDieCallback(function(){control.lose()})
		this.setupEvents();
		
		this.timer = new Timer(START_TIME, function(){
			ball.die()
			control.timer.setTime(START_TIME)
			control.timer.start()
		},
		function(){
			updateTimer(control.timer.getTime())
		})
		
		this.timer.start()
	},
	incActorCount: function(kind){
		if(!this.actorCount[kind])
			this.actorCount[kind] = 0
			
		this.actorCount[kind]++
	},
	decActorCount: function(kind){
		if(!this.actorCount[kind])
			this.actorCount[kind] = 0
		
		this.actorCount[kind]--
		this.checkEndGame()
	},
	checkEndGame: function() {
		if (this.getActorCount(Gold.kind) == 0) this.win()
	},
	getActorCount: function(kind){
		return this.actorCount[kind] || 0
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
	incScore: function(score){
		this.score += score
		updateScore(this.score)
	},
	loadLevel: function (level) {
		document.getElementById("canvas1").innerHTML = "sdfiajidsji"
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		var map = MAPS[level-1];  // -1 because levels start at 1
		for( var x = 0 ; x < WORLD_WIDTH ; x++ ) {
			for( var y = 0 ; y < WORLD_HEIGHT ; y++ ) {
				var code = map[y][x];  // x/y reversed because map stored by lines
				var gi = GameImage.getByCode(code);
				if (gi) {
					this.createGameObject(gi, x, y)
				}
			}
		}
	},
	createGameObject: function(gi, x, y) {
		var n = NEW(globalByName(gi.kind), x, y, gi.color)
		n.setHideCallback(function(){
			control.decActorCount(this.kind)
		})
		
		n.setShowCallback(function(){
			control.incActorCount(this.kind)
		})
		
		n.show()
	},
	nextLevel: function(){
		this.currentLevel++;
		ball.pause()
		ball.reposition();
		this.loadLevel(this.currentLevel);
	},
	setupEvents: function() {
		this.setSpeed(DEFL_SPEED);
		addEventListener("keypress", this.keyPressEvent, false)
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
	},
	animationEvent: function () {
		ball.animation();
	},
	invertControls: function() {
		this.controlInverter *= -1
	},
	keyPressEvent: function(k) {
		if (ball.isPaused()) { 
			ball.unpause()	
		}
	},
	keyDownEvent: function(k) {
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		var code = k.keyCode
		switch(code) {
			case 37: case 79: case 74:
				ball.setDeltaX(-1 * control.controlInverter); break;	// LEFT, O, J
			case 38: case 81: case 73:
				/* ignore */ break;			// UP, Q, I
			case 39: case 80: case 76:
				ball.setDeltaX(1 * control.controlInverter);  break;	// RIGHT, P, L
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
	},
	setWinCallback: function(func) {
		this.winCallback = func
	},
	setLoseCallback: function(func) {
		this.loseCallback = func
	},
	win: function() {
		if (this.winCallback) this.winCallback()
		this.nextLevel()
	},	
	lose: function() {
		if (this.loseCallback)this.loseCallback()
	}, 
	calcBonus: function() {
		
	}
});

// HTML FORM

function playCountdown(endCallback){
	ctx = document.getElementById("canvas1").getContext("2d");
	video = document.getElementById("countdown");
	
	video.addEventListener('play', function() {
	    var $this = this; //cache
	    (function loop() {
	      	if (!$this.paused && !$this.ended) {
	        	ctx.drawImage($this, 0, 0, 630, 420);
	        	setTimeout(loop, 1000 / 30); // drawing at 30fps
	      	}
	    })();
	}, 0);
	
	video.addEventListener('ended', function(){
		clearCanvas()
		endCallback()
	})
	
	video.play()
	//endCallback()
}

function clearCanvas(){
	var ctx = document.getElementById("canvas1").getContext("2d")
	ctx.fillStyle = "white"
	ctx.fillRect(0,0,630,420)
}

function startGame(){
  	NEW(GameControl);
	//Populate interface

	updateTimer(START_TIME, function(){})
	updateScore(0)
	updateLives.call(ball, ball.getLives)
	
	//ball.setDieCallback(createCallback(ball, updateLives, ball.getLives))
	ball.setLoseCallback(function(){updateLives.call(ball, ball.getLives)})
	
 	//control.setWinCallback()
 	control.setLoseCallback(function(){ console.log("GAME OVER") })
}

function onLoad(){
  	// load images an then run the game
	GameImage.loadImages(function() {
		playCountdown(startGame)		
	});
}


Timer = function(startTime, timeOutCallback, timeCallback){
	this.time = startTime;
	this.pause = false;
	
	this.timeOutCallback = timeOutCallback
	this.timeCallback = timeCallback
}
Timer.prototype.setTime = function(time) { this.time = time; this.timeCallback() }
Timer.prototype.getTime = function() {return this.time }
Timer.prototype.pause = function() { this.pause = true }
Timer.prototype.start = function() { this.pause = false; this.loop(this) }
Timer.prototype.incTime = function(time) { this.time += time }
Timer.prototype.loop = function(timer) {
	if(!timer.pause){
		timer.time--
		
		if(timer.time > 0){
			timer.timeCallback()
			setTimeout(function(){timer.loop.call(timer, timer)}, 1000)
		}
		else
			timer.timeOutCallback()
		
	}
}


function updateTimer(time){
	updateHTML.call(this, "lableTime", time)
}

function updateLives(lives){
	updateHTML.call(this,"lableLives", lives)
}

function updateScore(score){
	updateHTML("lableScore", score)
}

function updateHTML(lableName, innerHTML){
	if(typeof(innerHTML) === "function")
		innerHTML = innerHTML.call(this)
	
	document.getElementById(lableName).innerHTML = innerHTML;
}

function die() { ball.die()}
function reset() { control.reset() }




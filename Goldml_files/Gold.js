/*      Gold!!!      

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

RESOURCES_ROOT = "http://anotherguy.likesyou.org/resources/"
RESOURCES_VIDEO = RESOURCES_ROOT + "clip/"
RESOURCES_IMG = RESOURCES_ROOT + "img/"
RESOURCES_SOUND = RESOURCES_ROOT + "sound/"

// GAME CONSTANTS
START_LEVEL = 1;
MAX_LEVEL = 2;
START_TIME = 120;
MAX_VELOCITY_BUFF = 3;
MAX_ROUND_N_VELOCITY_INC = 5;

// GAME SCORES
SCORE_BRICK = 2
SCORE_KEY = 4
SCORE_LOCK = 4
SCORE_GOLD = 6
SCORE_UNUSED_SECOND = 1
SCORE_UNUSED_LIFE = 200

INVENTARY_KEY = "KEY"

RED_LIVES = 1
RED_TIME = 15


// GLOBAL VARIABLES

var ctx, empty, ball, world, control, animationInterval, canvas

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
		this.clear()
		
		if(this.hideCallback)
			this.hideCallback()
	},
	clear: function() {
		var image = GameImage.get("Empty", "").image;
		world[this.x][this.y] = empty;
		ctx.drawImage(image, this.x * ACTOR_PIXELS_X, this.y * ACTOR_PIXELS_Y);
	},
	collision: function(whoHit){
	},
	setBallCollisionCallback: function(func){
		this.ballCollisionCallback = func;
	},
	ballCollision: function(func){
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

		return null;
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
	soundOnHide: "brick.wav",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
		this.score = SCORE_BRICK
	},
	ballCollision: function(ball) {
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

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
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

		return ball.setColor(this.color)
	}
})

var Devil = EXTENDS(Actor, {
	kind: "Devil",
	soundOnBallCollision: "devil.wav",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

		ball.die()
	}
})

var Inverter = EXTENDS(Actor, {
	kind: "Inverter",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function() {
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

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
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

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
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

		if (ball.remFromInventary(INVENTARY_KEY)) {
			this.hide()
			return this.score
		}
	}
})

var Gold = EXTENDS(Actor, {
	countable: true,
	kind: "Gold",
	soundOnHide: "gold.wav",
	INIT: function(x, y, color) {
		this.SUPER(Actor.INIT, x, y, this.kind, color);
	},
	ballCollision: function(ball) {
		if(this.ballCollisionCallback)
			this.ballCollisionCallback()

		if(control.getActorCount(Brick.kind) == 0){
			this.hide()
			return this.score
		}
	}
})

var Ball = EXTENDS(Actor, {
	INIT: function(x, y, color) {
		this.deltaX = 0
		this.deltaY = 1
		this.inventary = []
		this.lives = N_LIVES
		this.SUPER(Actor.INIT, x, y, "Ball", "lightBlue");
		this.reposition()
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
			if (this.animate) {
				if( hitX ) dx *= -1;
				if( hitY ) dy = this.deltaY *= -1;	
				this.move(dx, dy);
			} else {
				this.animate = true
			}
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
		this.pause()
		this.animate = false
		this.hide();
		this.x = INICIAL_BALL_X;
		this.y = INICIAL_BALL_Y;
		this.setColor("lightBlue");
		this.show();
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
		this.nonEmptyGameObjects = []
		this.actorCount = {};
		this.score = undefined
		this.round = undefined
		this.animationInterval = undefined
		this.currentLevel = undefined
		this.controlInverter = undefined
		
		empty = NEW(Empty);	// only one empty actor needed
		world = this.createGameMatrix();

		ball = NEW(Ball);

		ball.setDieCallback(function(){control.lose()})
		this.setupEvents();
		
		this.timer = new Timer(START_TIME, function(){
			ball.die()
			control.timer.setTime(START_TIME)
			control.timer.start()
		},
		function(){
			//TODO: CHANGE TO CALLBACK
			updateTimer(control.timer.getTime())
		})
		
		this.timer.start()
		
		//Expose game control to console
		window.GAME_CONTROL = this
		
		//Create cheats
		createCheats()

		this.soundTrack = playSound("soundtrack.mp3")
	},
	setGameStartCallback: function(func) {
		this.gameStartCallback = func
	},
	restart: function() {
		this.score = 0;
		this.round = 1
		ball.lives = N_LIVES
		this.actorCount = {}
		this.currentLevel = START_LEVEL
		this.newLevel(this.currentLevel)
		this.gameStartCallback()
		showControls()
		this.soundTrack.play();
		this.soundtrack.loop = true;
	},
	newLevel: function(currentLevel) {
		this.timer.setTime(START_TIME)
		this.clearGameObjects()
		this.controlInverter = 1
		this.setSpeed(this.calcBallSpeed())
		ball.reposition()
		this.loadLevel(currentLevel);
	},
	getRound: function() {
		return this.round
	},
	getLevel: function() {
		return this.currentLevel
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
	createGameMatrix: function () { // stored by columns
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
		//TODO: CHANGE TO CALLBACK 
		updateScore(this.score)
	},
	loadLevel: function (level) {
		if( level < 1 || level > MAPS.length)
			fatalError("Invalid level " + level)
		var map = MAPS[level-1];  // -1 because levels start at 1
		for( var x = 0 ; x < WORLD_WIDTH ; x++ ) {
			for( var y = 0 ; y < WORLD_HEIGHT ; y++ ) {
				var code = map[y][x];  // x/y reversed because map stored by lines
				var gi = GameImage.getByCode(code);
				if (gi) {
					go = this.createGameObject(gi, x, y)
					if (gi.kind != Empty.kind) this.nonEmptyGameObjects.push(go)
				}
			}
		}
	},
	clearGameObjects: function() {
 		for (var i = 0; i < this.nonEmptyGameObjects.length; i++) {
			this.nonEmptyGameObjects[i].clear()
		}
		this.nonEmptyGameObjects = []
	},
	createGameObject: function(gi, x, y) {
		var n = NEW(globalByName(gi.kind), x, y, gi.color)
		n.setHideCallback(function(){
			control.decActorCount(this.kind)
			if(this.soundOnHide)
				playSound(this.soundOnHide)
		})
		
		n.setShowCallback(function(){
			control.incActorCount(this.kind)
		})

		n.setBallCollisionCallback(function(){
			if(this.soundOnBallCollision)
				playSound(this.soundOnBallCollision)
		})
		
		n.show()
		return n
	},
	nextLevel: function(){
		this.currentLevel++;
		if (this.currentLevel > MAX_LEVEL) {
			this.currentLevel = START_LEVEL
			this.round++
			this.incScore(this.calcEndRoundBonus())
		}
	},
	calcBallSpeed: function() {
		return DEFL_SPEED + (MAX_VELOCITY_BUFF * (this.round - 1)/(MAX_ROUND_N_VELOCITY_INC - 1))
	},
	setupEvents: function() {
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
		if (this.animationInterval) clearInterval(this.animationInterval)
		if( (speed < MIN_SPEED) || (MAX_SPEED < speed) )
			speed = MIN_SPEED;
		this.animationInterval = setInterval(this.animationEvent, (MAX_SPEED + 1 - speed) * 30);
	},
	setWinCallback: function(func) {
		this.winCallback = func
	},
	setLoseCallback: function(func) {
		this.loseCallback = func
	},
	win: function() {
		this.incScore(this.calcEndLevelBonus())
		this.nextLevel()
		this.newLevel(this.currentLevel)
		if (this.winCallback) this.winCallback()
	},	
	lose: function() {
		this.soundTrack.stop();

		if (this.loseCallback)this.loseCallback()
		else this.restart()
	}, 
	calcEndLevelBonus: function() {
		return control.timer.getTime() * SCORE_UNUSED_SECOND 
	},
	calcEndRoundBonus: function() {
		return ball.lives * SCORE_UNUSED_LIFE
	}
});

// HTML FORM

//TODO remove func
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
	
	//video.play()
	endCallback()
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
	updateRound(1)
	updateLevel(1)
	updateLives.call(ball, ball.getLives)
	
	//ball.setDieCallback(createCallback(ball, updateLives, ball.getLives))
	ball.setLoseCallback(function(){updateLives.call(ball, ball.getLives)})
	
 	//control.setWinCallback()
 	control.setGameStartCallback(
 		function() {updateScore(0)
					updateRound(1)
					updateLevel(1)
					updateLives.call(ball, ball.getLives)
				}
	)
 	control.setLoseCallback(function(){
 		clearInterval(control.animationInterval)
 		hideControls()
 		playVideo("game_over.mp4", "mp4", function(){
 			control.restart()
 		})
 		console.log("GAME OVER")
 	})

 	control.setWinCallback(function(){
 		updateRound.call(control, control.getRound)
 		updateLevel.call(control, control.getLevel)
 	})

 	control.restart()
}

function onLoad(){
	canvas = document.getElementById("canvas1")
	ctx = canvas.getContext("2d")

  	// load images an then run the game
	
	// GameImage.loadImages( startGame )
	
	hideControls()
	GameImage.loadImages(function() {
		playVideo("intro.mp4", "mp4", function(){
			playVideo("countdown.mp4", "mp4", startGame)	
		})	
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
Timer.prototype.stop = function() { this.pause = true }
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

function TimeWarning() {
	return control.timer.getTime() <= RED_TIME
}

function LifesWarning() {
	return ball.lives() <= RED_LIVES
}

function updateRound(round){
	updateHTML.call(this, "lableRound", round)
}

function updateLevel(level){
	updateHTML.call(this, "lableLevel", level)
}

function updateTimer(time){
	updateHTML.call(this, "lableTime", time)
}

function updateLives(lives){
//	updateHTML.call(this,"lableLives", lives)

//	var l = document.getElementById("lableLives")
//	l.appendChild(createImage("resources/img/lives.gif-c200", 30, 30))
	populateWithImgs(document.getElementById("lives"), "lives.gif", 30, 30, lives.call(this))
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
function restart() {control.restart()}

function createCheats(){

	var cheat = function(func){
		return function(){
			func()
			return "!! CHEATER !!"
		}
	}

	window["NEXT_LEVEL"] = cheat(function(){ control.win() })
	window["NEXT_LEVEL"].toString = window["NEXT_LEVEL"]

	window["MORE_TIME"] = cheat(function(){ control.timer.setTime(control.timer.getTime() + 100) })
	window["MORE_TIME"].toString = window["MORE_TIME"]

	window["MORE_LIVES"] = cheat(function(){ ball.lives += 5; updateLives(ball.lives) })
	window["MORE_LIVES"].toString = window["MORE_LIVES"]

	window["PAUSE_TIME"] = cheat(function(){ control.timer.stop() })
	window.PAUSE_TIME.toString = window.PAUSE_TIME
	
	window["RESUME_TIME"] = cheat(function(){ control.timer.start()})
	window.RESUME_TIME.toString = window.RESUME_TIME
}

function createImage(src, h, w){
	var img = document.createElement("img")
	img.src = RESOURCES_IMG + src
	img.height = h
	img.width = w
	return img
}

function populateWithImgs(elem, src, h, w, count){
	while(count > elem.getElementsByTagName("img").length){
		var img = createImage(src, h, w)
		img.style = "padding-left: 2px"
		elem.appendChild(img)
	}
	var col
	while(count < (col = elem.getElementsByTagName("img")).length )
		elem.removeChild(col[col.length-1])
}

VideoPlayer = function(src, type, ctx, fps, width, height, endCallback){
	this.ctx = ctx
	this.fps = fps

	this.video = document.createElement("video")
	this.video.width = width
	this.video.height = height
	this.video.style.display = "none"
	this.video.innerHTML = "Your browser does not support the video tag."

	this.source = document.createElement("source")
	this.source.src = src
	this.source.type = type

	this.video.appendChild(this.source)

	this.endCallback = endCallback;

	var $this = this
	
	this.video.addEventListener('play', function() {
	    //var $this = this; //cache
	    (function loop() {
	      	if (!$this.video.paused && !$this.video.ended) {
	        	$this.ctx.drawImage($this.video, 0, 0, $this.video.width, $this.video.height);
	        	setTimeout(loop, 1000 / 30); // drawing at 30fps
	      	}
	    })();
	}, 0);
	
	this.video.addEventListener('ended', function(){
		clearCanvas()
		endCallback()
	})
}
VideoPlayer.prototype.play = function(){ this.video.play() }
VideoPlayer.prototype.getVideo = function() {return this.video }

function playVideo(src, type, endCallback){
	var vplayer = new VideoPlayer(
			RESOURCES_VIDEO + src, 
			"video/" + type, 
			ctx,
			30,
			canvas.width,
			canvas.height,
			endCallback)
	vplayer.play()
	return vplayer;
}

function playSound(audio){
	var sound = new Audio(RESOURCES_SOUND + audio)
	sound.play()
	return sound;
}

/*
Resource = function(name, onPlay, onEnd){
	this.name = name
	this.onPlay = onPlay
	this.onEnd = onEnd
}
Resource.prototype.setOnPlayCallback = function(func){ this. onPlay = func }
Resource.prototype.setOnEndCallback = function(func){ this. onEnd = func }
Resource.prototype.play = function(func){ this.onPlay() }
Resource.prototype.load = function(func){ this.onLoad() }
Resource.prototype.getResource = function(){ return null }

VideoResource = function(name, src, type, onPlay, onEnd){
	Resource(name, onPlay, onEnd)
	this.vplayer = new VideoPlayer(
			RESOURCES_VIDEO + src, 
			"video/" + type, 
			ctx,
			30,
			canvas.width,
			canvas.height,
			onEnd)
}
VideoResource.prototype = Resource
VideoResource.prototype.play = function(func){this.prototype.play(); this.vplayer.play()}
VideoResource.prototype.getResource = function(){ return this.vplayer.getVideo() }

SoundResource = function(name, src, onPlay, onEnd){
	Resource(name, onPlay, onEnd)
	this.sound = new Audio(RESOURCES_SOUND + src)
	this.sound.addEventListener("ended", onEnd)
}
SoundResource.prototype = Resource
SoundResource.prototype.play = function(func){this.prototype.play(); this.sound.play() }
SoundResource.prototype.getResource = function(){ return this.sound }

ImageResource = function(name, src, onPlay, onEnd){
	Resource(name, onPlay, onEnd)
	this.img = document.createElement("img")
	this.img.src = RESOURCE_IMG + src
}
ImageResource.prototype.getResource = function(){ return this.img }

ResourceManager = function(){
	this.resources = {}
	this.length = 0
}
ResourceManager.prototype.addResource = function(res){
	if(!this.hasResource(res.name))
		this.length++;

	this.resources[res.name] = res
}
ResourceManager.prototype.play = function(name){this.resources[name].play()}
ResourceManager.prototype.getResource = function(name) { return this.resources[name].getResource()}
ResourceManager.prototype.hasResource = function(name) {
	for(var x in this.resources)
		if (x.name == name)
			return true

	return false
}
*/

function hideControls(){
	document.getElementById("controls1").style.display = "none"
	document.getElementById("controls2").style.display = "none"
}

function showControls(){
	document.getElementById("controls1").style.display = "initial"
	document.getElementById("controls2").style.display = "initial"
}
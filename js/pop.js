var POP = {
	width: 320,
	height: 480,
	ratio: null,
	currentWidth: null,
	currentHeight: null,
	canvas: null,
	ctx: null,
	scale:1,
	offset:{
		top:0,
		left:0
	},
	entities:[],
	nextBubble:100,
	score: {
		taps:0,
		hit:0,
		escaped:0,
		accuracy:0
	},
	wave: {
		x: -25,
		y: -40,
		r: 50,
		time: 0,
		offset: 0
	},
	init:function () {
		POP.ratio = POP.width / POP.height;
		POP.currentWidth = POP.width;
		POP.currentHeight = POP.height;
		POP.canvas = document.getElementsByTagName("canvas")[0];
		POP.canvas.width = POP.width;
		POP.canvas.height = POP.height;
		POP.ctx = POP.canvas.getContext('2d');
		POP.resize();
		POP.ua = navigator.userAgent.toLowerCase();
		POP.android = POP.ua.indexOf('android')?true:false;
		POP.ios = (POP.ua.indexOf('iphone') > -1 || POP.ua.indexOf('ipad') > -1 )?true:false;
		POP.draw.clear();
		POP.loop();
		POP.wave.total = Math.ceil(POP.width / POP.wave.r) + 1;
	},
	update:function(){
		var i,
		checkCollision = false;
		if(POP.Input.tapped){
			POP.entities.push(new POP.touch(POP.Input.x, POP.Input.y));
			POP.Input.tapped = false;
			checkCollision = true;
			POP.score.taps += 1;
		}
		for (i = 0;i < POP.entities.length; i++){
			POP.entities[i].update();
			if(POP.entities[i].type === 'bubble' && checkCollision) {
				hit = POP.collides(POP.entities[i],
					{x:POP.Input.x, y:POP.Input.y, r:7});
				if(hit) {
					//particle effect added here
					for(var n = 0;n<20;n++){
						POP.entities.push(new POP.particle(
							POP.entities[i].x,
							POP.entities[i].y,
							2,
							'rgba('+Math.floor(Math.random() * 256)+', ' + Math.floor(Math.random() * 256)+',' + Math.floor(Math.random() * 256)+', 1)'
						));
					}

					POP.score.hit += 1;
				}
				POP.entities[i].remove = hit;
			}
			if(POP.entities[i].remove){
				POP.entities.splice(i, 1);
			}
		}
		POP.nextBubble -= 1;
		if(POP.nextBubble < 0){
			POP.entities.push(new POP.bubble());
			POP.nextBubble = Math.floor(Math.random() * 100 ) + 100;
		}
		POP.score.accuracy = (POP.score.hit / POP.score.taps) * 100;
		POP.score.accuracy = isNaN(POP.score.accuracy)?0:~~(POP.score.accuracy);
		
		POP.wave.time = new Date().getTime() * 0.002;
		POP.wave.offset = Math.sin(POP.wave.time * 0.8) * 10;

	},
	render:function(){
		var i;
		POP.draw.rect(0, 0, POP.width, POP.height, '#036');
		for(i = 0; i < POP.entities.length; i++){
			POP.entities[i].render();
		}
		POP.draw.text('Hit: ' + POP.score.hit, 20, 30, 14, '#fff');
		// POP.draw.text('Escaped: ' + POP.score.escaped, 20, 50, 14, '#fff');
		POP.draw.text('Accuracy: ' + POP.score.accuracy + '%', 20, 50, 14, '#fff');
		//wave effect added here
		for(i = 0; i < POP.wave.total;i++){
			POP.draw.circle(
				POP.wave.x + POP.wave.offset + (i*POP.wave.r),
				POP.wave.y,
				POP.wave.r,
				'#fff'
			);
		}
	},
	loop:function(){
		requestAnimationFrame(POP.loop);
		POP.update();
		POP.render();
	},
	resize:function () {
		POP.currentHeight = window.innerHeight;
		POP.currentWidth = POP.currentHeight * POP.ratio;
		if (POP.android || POP.ios) {
			document.body.height = (window.innerHeight + 50) + 'px';
		}
		POP.canvas.style.width = POP.currentWidth + 'px';
		POP.canvas.style.height = POP.currentHeight + 'px';
		window.setTimeout(function () {
			// do something
			window.scrollTo(0,1);
		}, 1);
		POP.scale = POP.currentWidth / POP.width;
		POP.offset.top = POP.canvas.offsetTop;
		POP.offset.left = POP.canvas.offsetLeft;
	}
};
window.addEventListener('load', POP.init, false);
window.addEventListener('resize', POP.resize, false);

POP.draw = {
	clear:function () {
		POP.ctx.clearRect(0,0,POP.width,POP.height);
	},
	rect:function(x, y, w, h, col) {
		POP.ctx.fillStyle = col;
		POP.ctx.fillRect(x, y, w, h);
	},
	circle:function(x, y, r, col){
		POP.ctx.fillStyle = col;
		POP.ctx.beginPath();
		POP.ctx.arc(x+5, y+5, r, 0, Math.PI * 2, true);
		POP.ctx.closePath();
		POP.ctx.fill();
	},
	text:function(string, x, y, size, col){
		POP.ctx.font = 'bold ' + size + ' px Monospace';
		POP.ctx.fillStyle = col;
		POP.ctx.fillText(string, x, y);
	}
};

POP.Input = {
	x:0,
	y:0,
	tapped: false,
	set: function(data){
		this.x = (data.pageX - POP.offset.left) / POP.scale;
		this.y = (data.pageY - POP.offset.top) / POP.scale;
		this.tapped = true;
		POP.draw.circle(this.x, this.y, 10, 'red');
	}
};
POP.touch = function(x, y){
	this.type = 'touch';
	this.x = x;
	this.y = y;
	this.r = 5;
	this.opacity = 1;
	this.fade = 0.05;
	this.remove = false;
	this.update = function(){
		this.opacity -= this.fade;
		this.remove = (this.opacity < 0)?true:false;
	};
	this.render = function(){
		POP.draw.circle(this.x, this.y, this.r, 'rgba(255,0,0,' + this.opacity + ')');
	};
};
POP.bubble = function(){
	this.type = 'bubble';
	this.r = (Math.random() * 20) + 10;
	this.speed = (Math.random() * 1) + 1;
	this.x = (Math.random() * (POP.width - this.r * 2) + this.r);
	this.y = POP.height + (Math.random() * 100) + 10;
	
	this.waveSize = 5 + this.r;
	this.xContant = this.x;
	this.remove = false;
	this.update = function(){
		var time = new Date().getTime() * 0.002;
		this.y -= this.speed;
		this.x = this.waveSize * Math.sin(time) + this.xContant;
		if(this.y < -10){
			this.remove = true;
		}
	};
	this.render = function(){
		POP.draw.circle(this.x, this.y, this.r, 'rgba(255, 255, 255, 1)');
	};
};
POP.collides = function(a, b){
	var distance_squared = (((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));
	var radii_squared = (a.r + b.r) * (a.r + b.r);
	if(distance_squared < radii_squared) {
		return true;
	} else {
		return false;
	}
};
POP.particle = function(x, y, r, col){
	this.x = x;
	this.y = y;
	this.r = r;
	this.col = col;
	this.dir = (Math.random() * 2 > 1)?1:-1;
	this.vx = ~~(Math.random() * 4) * this.dir;
	this.vy = ~~(Math.random() * 7);
	this.remove = false;
	this.update = function(){
		this.x += this.vx;
		this.y -= this.vy;
		this.vx *= 0.99;
		this.vy *= 0.99;
		this.vy -=0.25;
		if(this.vy < 0) {
			this.remove = true;
		}
	};
	this.render = function(){
		POP.draw.circle(this.x, this.y, this.r, this.col);
	};
};

window.addEventListener('click', function(e) {
	e.preventDefault();
	POP.Input.set(e);
}, false);

window.addEventListener('touchstart', function(e) {
	e.preventDefault();
	POP.Input.set(e.touches[0]);
}, false);

window.addEventListener('touchmove', function(e){
	e.preventDefault();
},false);

window.addEventListener('touchend', function(e){
	e.preventDefault();
},false);

window.requestAnimationFrame =(function(){
	return window.requestAnimationFrame ||
	 window.webkitRequestAnimationFrame ||
	 window.mozRequestAnimationFrame ||
	  window.oRequestAnimationFrame ||
	 window.msRequestAnimationFrame ||
	 function(callback){
	 	window.setTimeout(callback, 1000 / 60);
	 };
})();

var myApp = {
	backTop: function(){
		$(window).scroll(function(){
			if($(this).scrollTop() > 100){
				$('#back-to-top').fadeIn();
			}else{
				$('#back-to-top').fadeOut();
			}
		});
		$('#back-to-top').on('click', function(e){
			e.preventDefault();
			$('html, body').animate({scrollTop : 0}, 1000);
			return false;
		})
	},
	slideOn: function(){
		// console.log($('#slideBox > ul').offset().left);
		var boxWidth = $('#slideBox').width();
		var liWidth = $('#slideBox > ul').children('li').width();
		var ulWidth = $('#slideBox > ul').children('li').length * liWidth;
		var maxNum = Math.floor((ulWidth - boxWidth)/liWidth);
		var i = 0;
		var timer = null;
		
		var slideNext = function(){
			var j = i + 1;
			j = j<(maxNum+1)?j:0;
			var curLeft = -j * liWidth;
			$('#slideBox > ul').animate({left: curLeft}, 1200);
			if(i < maxNum){
				i++;
			}else{
				i = 0;
			}
			// console.log(curLeft);
		};
		var slidePrev = function(){
			var j = i - 1;
			j = j>-1?j:maxNum
			var curLeft = -j * liWidth;
			$('#slideBox > ul').animate({left: curLeft}, 1200);
			if(i > 0){
				i--;
			}else{
				i = maxNum;
			}
			// console.log(curLeft);
		}
		clearInterval(timer);
		timer = setInterval(slideNext, 4200);
		$('#prevSlide').on('click', function(e){
			e.preventDefault();
			if($('#slideBox > ul').is(':animated')){
				return false;
			}
			clearInterval(timer);
			slidePrev();
			timer = setInterval(slideNext, 4200);
			return false;
		});
		$('#nextSlide').on('click', function(e){
			e.preventDefault();
			if($('#slideBox > ul').is(':animated')){
				return false;
			}
			clearInterval(timer);
			slideNext();
			timer = setInterval(slideNext, 4200);
			return false;
		})
	},
	init: function(){
		myApp.backTop();
		myApp.slideOn();
	}
}
$(document).ready(function(){
	myApp.init();
})
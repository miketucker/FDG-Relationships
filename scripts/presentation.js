var initPresentation = function(){
	var padding = 20;
	var ww = $(window).width();
	var wh = $(window).height();
	var wr = ww/wh;

	$("#overlay").hide();

	var imgs = [];

	function resizeImg(img)
	{
		var w = ww - 20;
		var h = wh - 20;
		var ow = $(v).width();
		var oh = $(v).height();

		if( w > ww && h > oh ){
			w = ow;
			h = oh;
		} else {
			var wr =  ww / ow;
			var hr = wh / oh;
			
			if(wr > hr){
				h = oh * hr;
				w = ow * hr;
			} else {
				h = oh * wr;
				w = ow * wr;
			}
		}

		$(img).attr("width",w);
		$(img).attr("height",h);
	}

	$("img").each(function(i,v){
		if($(v).width() > 0){
			resizeImg(v);
		} else {
			v.onLoad = function(){ resizeImg(this); }
		}

		imgs.push(v);
	});


	showOverlay = function(){
		$("#overlay").fadeIn();
	}

	hideOverlay = function(){
		$("#overlay").fadeOut();
	}

	Reveal.initialize({
		controls: false,
		progress: false,
		history: true,
		center: true,
		rollingLinks:false,
		keyboard: true,
		width:ww,
		height:wh,
		margin:0,  
		theme: Reveal.getQueryHash().theme, 
		transition: Reveal.getQueryHash().transition || 'default', 
		dependencies: [
			{ src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } }
			// { src: 'plugin/markdown/showdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			// { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			// { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
			// { src: 'plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } }
			, { src: 'plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
					// { src: 'socket.io/socket.io.js', async: true }
					// { src: 'plugin/notes-server/client.js', async: true }
			// { src: 'plugin/search/search.js', async: true, condition: function() { return !!document.body.classList; } }
			// { src: 'plugin/remotes/remotes.js', async: true, condition: function() { return !!document.body.classList; } }
		]
	});

	var revealReady = function(e){
		var id = e.currentSlide.id;
		if(se[id]) se[id]();
		if($(e.currentSlide).hasClass("show")) hideOverlay();
		if($(e.currentSlide).hasClass("hide")) showOverlay();
	}
	Reveal.addEventListener( 'ready', revealReady );
	Reveal.addEventListener( 'slidechanged', revealReady );

	$(window).keydown(function(e){
		console.log("key",e.keyCode);
		var vid = $("section .present video");
		

		switch(e.keyCode){
			case 219:// left bracket
				if(vid.length < 1) return;
				vid[0].currentTime = 0;
				break;
			case 18: // alt
				if(vid.length < 1) return;
				if(vid[0].paused) vid[0].play();
				else vid[0].pause();
				break;
			case 76:  $("#nav").fadeToggle(); break;
			case 81: $(".reveal").fadeToggle(); break;
			case 192: graph.removeAll(); break;
			case 87: $("#overlay").fadeToggle(); break;
		}
	});
}


	graph = new Graph(initPresentation);

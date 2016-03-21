function Sound() {
	var wavenames="bravo,endingstart,erase1,erase2,erase3,erase4,gameover,garbage,tspin0,tspin1,tspin2,tspin3".split(",");
	var waves={};
	var itworks=false;
	try{
		for(var i=0;i<wavenames.length;i++){
			var iname = wavenames[i];
			var wave = document.createElement("AUDIO");
			wave.setAttribute("src", "se/"+iname+".mp3");
			wave.setAttribute("preload", "auto");
			waves[iname] = wave;
		}
		itworks=true;
	}catch(e){
		console.log("sound doesn't work.")
	};
	
	this.playse=function(name,arg){
		if(itworks){
			if(typeof arg !== "undefined"){
				name+=arg;
			}
			if(typeof waves[name] !== "undefined"){
				if(settings.Sound){
					console.log(waves[name]);
					waves[name].volume=settings.Volume/100;
					waves[name].currentTime=0;
					waves[name].play();
				}
			}
		}
	}
}

var sound = new Sound();
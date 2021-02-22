
import Preloader from './preloader';
import FontsLoader from './fontsloader';
import View from './view';
import {Display, DisplayVars} from './display';
import {TextureMap} from './preloader';

class Main {
	private display:Display;
	private view:View;

	constructor(res:TextureMap){
		this.displayChange = this.displayChange.bind(this);
		this.setDisplayLock = this.setDisplayLock.bind(this);
		this.setTouchScroll = this.setTouchScroll.bind(this);

		this.display = new Display(this.displayChange);
		let dVars:DisplayVars = this.display.getDisplayVars();
		this.view = new View(res, dVars);
		this.display.initTicker(this.view);

		this.view.on('setdisplaylock', this.setDisplayLock);//b4 init
		this.view.on('settouchscroll', this.setTouchScroll);
	}

	fontsLoaded() {
		this.view.fontsLoaded();
	}

	init(){
		this.view.init();
	}

	displayChange(dVars:DisplayVars) {
		this.view.displayChange(dVars);
	}

	setDisplayLock(lock:boolean) {
		this.display.setDisplayLock(lock);
	}

	setTouchScroll(canScroll:boolean) {
		this.display.setTouchScroll(canScroll);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let fontsLoader=new FontsLoader();
	let preloader = new Preloader(function(res:TextureMap){
		let main = new Main(res);
		fontsLoader.addCallback(function(){
			main.fontsLoaded();
		})
		main.init();
	});
	preloader.startLoad();
	fontsLoader.loadFonts();
});

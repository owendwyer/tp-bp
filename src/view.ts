import PIXI from 'pixi.js';
import gsap from 'gsap';
import Background from './background';
import AudioPlayer from './general/audioplayer';
import { getHashObj, hashObjType } from './general/hashchecker';
import { DisplayVars } from './display';
import AbstractView from './abstractview';
import TitleView from './titleview';
import EndView from './endview';
import {TextureMap} from './preloader';

class View extends PIXI.Container {
	private background:Background;
	private audioPlayer:AudioPlayer;
	private hashObj:hashObjType;
	private fadeTween:GSAPTween | undefined;
	private currentView:AbstractView;
	private nextView:AbstractView;
	private titleView:TitleView;
	private endView:EndView;

	constructor(res:TextureMap, dVars:DisplayVars) {
		super();

		this.audioContextCheck = this.audioContextCheck.bind(this);
		this.addNextView = this.addNextView.bind(this);

		this.hashObj = getHashObj();
		this.background = new Background(res, dVars);
		this.scale.set(dVars.scale);
		this.audioPlayer = new AudioPlayer(res);

		this.addChild(this.background);
		this.addChild(this.audioPlayer);

		this.currentView = new AbstractView();
		this.nextView = new AbstractView();
		this.titleView = new TitleView(res, dVars);
		this.endView = new EndView(res, dVars);

		this.setupDisplay(dVars);
		this.addLists();
	}

	setupDisplay(dVars:DisplayVars) {
		if (dVars.orient === 0) {
			this.audioPlayer.position.set(763, 37);
		} else {
			this.audioPlayer.position.set(513, 37);
		}
	}

	displayChange(dVars:DisplayVars) {
		this.scale.set(dVars.scale);
		if (dVars.orient !== null) {
			this.setupDisplay(dVars);
			this.background.displayChange(dVars);
			this.titleView.displayChange(dVars);
			this.endView.displayChange(dVars);
		}
	}

	fontsLoaded() {
		//check want to do it like this
		this.titleView.fontsLoaded();
		this.endView.fontsLoaded();
	}

	init(){
		this.showFirstView(this.titleView);
	}

	/////////////////////////////////////////////////////////////////////////////
	//views
	showFirstView(view:AbstractView) {
		//task stuff
		this.currentView = view;
		this.addChild(this.currentView);
		this.currentView.alpha = 0;
		this.fadeTween = gsap.to(this.currentView, { duration: 0.4, delay: 0.3, alpha: 1 });
		this.currentView.init();
	}

	showTitle() {
		this.audioPlayer.show();
		// this.nextView = this.titleView;
		// this.showNextView();
		this.emit('setdisplaylock', false);//for when coming from endview
		this.emit('settouchscroll', true);//for when coming from gameview
	}

	showNextView() {
		this.currentView.deit();
		this.fadeTween = gsap.to(this.currentView, { duration: 0.15, alpha: 0, onComplete: this.addNextView });
	}

	addNextView() {
		this.removeChild(this.currentView);
		this.currentView = this.nextView;
		this.addChild(this.currentView);
		this.currentView.alpha = 0;
		this.fadeTween = gsap.to(this.currentView, { duration: 0.4, alpha: 1 });
		this.currentView.init();
	}
	//////////////////////////////////////////////////////////////////////////////

	audioContextCheck() {
		this.audioPlayer.checkSuspended();
		this.interactive = false;
		this.off('pointertap');
	}

	addLists() {
		this.interactive = true;
		this.on('pointertap', this.audioContextCheck);
	}
}

export default View;

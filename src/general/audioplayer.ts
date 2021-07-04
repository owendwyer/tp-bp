import PIXI from 'pixi.js';
import { Howl, Howler } from 'howler';
import {BuildModeType} from '../preloader';
import { TextureMap } from '../types';
// import { getAudioSprite } from '../contentview/audioframes';

const RES_URL:BuildModeType = {
	dev: './res/audio/',
	prod: './res/audio/'
	// prod: 'https://www.gamestolearnenglish.com/games/questions/res/audio/'
};
declare const OPD_ENV:string;

interface audioSpriteType{
	// [name: string] : number[];
	[name: string] : [number, number];
}

const AUD_ICON_FRAME:string='audioIcon.png';
const AUDBLACK_ICON_FRAME:string='audioIconBlack.png';

class AudioPlayer extends PIXI.Container {

	private showPlayAudioBut:boolean=true;
	private isAudioOn:boolean=true;
	private isAudioLoaded:boolean=false;
	private isAudioLoading:boolean=false;

	private retryCount:number=3;
	private myAudio:Howl|null;

	private audioBut : PIXI.Container;
	private audioBack : PIXI.Graphics;
	private audioIcon : PIXI.Sprite;
	private playIcon : PIXI.Sprite;

	private playAudioBut:PIXI.Container;
	private playBack : PIXI.Graphics;
	private disabledCross : PIXI.Graphics;
	private loadingText : PIXI.Text

	private isUserAudio:boolean=false;
	private userAudio:(Howl|null)[]=[];

	constructor(res:TextureMap) {
		super();

		this.myAudio = null;

		this.toggleAudio = this.toggleAudio.bind(this);

		let wid = 48;
		let fill = 0xcc3300;
		let stroke = 0x333333;
		let rnd = 16;
		this.audioBut = new PIXI.Container();
		this.audioBack = new PIXI.Graphics();
		this.audioBack.beginFill(fill);
		this.audioBack.lineStyle(1, stroke);
		this.audioBack.drawRoundedRect(-wid / 2, -wid / 2, wid, wid, rnd);
		this.audioIcon = new PIXI.Sprite(res[AUD_ICON_FRAME]);
		this.audioIcon.anchor.set(0.5, 0.5);
		this.audioBut.addChild(this.audioBack, this.audioIcon);

		let rad = 22;
		let marg = 4;
		this.playAudioBut = new PIXI.Container();
		this.playBack = new PIXI.Graphics();
		this.playBack.beginFill(0xcccccc);
		this.playBack.lineStyle(1, 0x333333);
		this.playBack.drawCircle(0, 0, rad);
		this.playBack.beginFill(0xffffff);
		this.playBack.lineStyle(1, 0xaaaaaa);
		this.playBack.drawCircle(0, 0, rad - marg);
		this.playIcon = new PIXI.Sprite(res[AUDBLACK_ICON_FRAME]);
		this.playIcon.anchor.set(0.5, 0.5);
		this.playIcon.position.set(-1, -1);
		this.playAudioBut.addChild(this.playBack, this.playIcon);
		this.playAudioBut.position.set(-50, 0);

		this.disabledCross = new PIXI.Graphics();
		this.disabledCross.beginFill(0xffffff);
		this.disabledCross.lineStyle(1, 0x2e2e2e);
		this.disabledCross.drawRoundedRect(-5 / 2, -36 / 2, 5, 36, 2);
		this.disabledCross.rotation = -45;
		this.disabledCross.alpha = 0;

		this.loadingText = new PIXI.Text('loading', {
			fontFamily: 'Arial',
			fontSize: 16,
			fill: 0x333333,
			fontWeight: 'bold'
		});
		this.loadingText.anchor.set(0.5, 0.5);
		this.loadingText.position.set(-10, 0);

		this.audioBut.interactive = true;
		this.audioBut.buttonMode = true;
		this.playAudioBut.interactive = true;
		this.playAudioBut.buttonMode = true;
		this.audioBut.on('pointertap', this.toggleAudio);

		this.loadingText.visible = false;

		this.addChild(this.audioBut, this.playAudioBut, this.loadingText, this.disabledCross);
	}

	playAudio(ind:number):void{
		this.stopAudio();
		if (this.isAudioOn) {
			if (this.isAudioLoaded) {
				let snd = 's_' + ind;
				if(!this.isUserAudio){
					this.myAudio?.play(snd);
				}else{
					this.userAudio[ind]?.play();
				}
			}
		}
	}

	stopAudio():void{
		this.myAudio?.stop();
	}

	toggleAudio():void{
		if (this.isAudioOn) {
			this.isAudioOn = false;
		} else {
			this.isAudioOn = true;
		}
		this.updateDisplay();
		this.stopAudio();
		this.emit('audiostateupdated', this.isAudioOn);
	}

	updateDisplay():void{
		if (this.isAudioOn) {
			this.audioIcon.alpha = 1;
			this.disabledCross.alpha = 0;
		} else {
			this.disabledCross.alpha = 1;
			this.audioIcon.alpha = 0.5;
		}
	}

	show():void{
		this.visible = true;
	}

	hide():void{
		this.visible = false;
	}

	showPlayBut():void{
		this.showPlayAudioBut = true;
		this.playAudioBut.visible = true;
	}

	hidePlayBut():void{
		this.showPlayAudioBut = false;
		this.playAudioBut.visible = false;
	}

	checkLoaded():void{
		if (this.isAudioLoaded) {
			this.unshowLoading();
		} else {
			this.showLoading();
		}
	}

	showLoading():void{
		this.audioBut.visible = false;
		this.playAudioBut.visible = false;
		this.loadingText.visible = true;
		this.loadingText.text = 'loading';
		this.checkFailed();
	}

	unshowLoading():void{
		this.audioBut.visible = true;
		if (this.showPlayAudioBut) this.playAudioBut.visible = true;
		this.loadingText.visible = false;
	}

	checkFailed():void{
		//
	}

	getAudioStatus():boolean{
		return this.isAudioOn;
	}

	setAudioStatus(status:boolean):void{
		this.isAudioOn=status;
		this.updateDisplay();
	}

	checkSuspended():void{
		if ('ctx' in Howler && Howler.ctx !== null) {
			Howler.ctx.resume();
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//user
	setIsUserContent(isUserAudio:boolean):void{
		this.isUserAudio=isUserAudio;
	}

	setUserContent(userAudio:(Howl|null)[]):void{
		this.userAudio=userAudio;
		this.isAudioLoaded=true;
	}

	//////////////////////////////////////////////////////////////////////////////
	//loading

	loadAudio(ind:number):void{
		this.isAudioLoaded=false;
		if(this.isAudioLoading)this.stopCurrentLoad();
		this.isAudioLoading=true;
		this.tryLoad(ind);
	}

	tryLoad(ind:number):void{
		this.unsetAudio();
		let audPath = RES_URL[OPD_ENV] + 's_' + ind;
		// let mySprite:audioSpriteType = getAudioSprite(ind);
		this.myAudio = new Howl({
			src: [audPath + '.ogg', audPath + '.mp3'],
			// sprite: mySprite,
			onload: () => {
				this.audioLoaded();
			},
			onloaderror: () => {
				this.retryCount -= 1;
				if (this.retryCount < 1) {
					this.audioFailed();
				} else {
					this.tryLoad(ind);
				}
			}
		});
	}

	audioLoaded():void{
		this.myAudio?.off('load');
		this.myAudio?.off('loaderror');
		this.isAudioLoaded = true;
		this.isAudioLoading=false;
		this.checkLoaded();
	}

	audioFailed():void{
		this.isAudioLoading=false;
		this.unsetAudio();
		this.loadingText.text = '';
	}

	unsetAudio():void{
		this.myAudio?.off('load');
		this.myAudio?.off('loaderror');
		this.myAudio?.unload();
		//here need to add a myAudio.delete or whatever howl does - unload is probably way to do this but check the docs
		// this.myAudio = null;
	}

	stopCurrentLoad():void{
		//need to check this
		this.unsetAudio();
		this.isAudioLoading=false;
	}
}

export default AudioPlayer;

import PIXI from 'pixi.js';
import { Howl, Howler } from 'howler';
import {BuildModeType} from '../preloader';
import {TextureMap} from '../preloader';

const NUM_SETS = 10;

const RES_URL:BuildModeType = {
	dev: './res/audio/',
	prod: 'https://www.gamestolearnenglish.com/games/questions/res/audio/'
};
declare const OPD_ENV:string;

interface audioSpriteType{
	[name: string] : [number, number];
}

const aFrames:number[][] = [];
aFrames[0] = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 1.5, 2, 2, 1.5, 1.5, 2.5];
aFrames[1] = [1.5, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 2, 1.5, 2, 2, 1.5, 1.5, 1.5];
aFrames[2] = [1.5, 1.5, 1.5, 2, 1.5, 1, 2, 2, 1.5, 3.5, 2, 1.5, 2, 2, 1.5, 1.5];
aFrames[3] = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 1.5, 2, 2, 1.5];
aFrames[4] = [1.5, 2, 1, 2, 1.5, 1.5, 1.5, 1.5, 2, 2, 2, 2, 2, 2, 2, 1.5];
aFrames[5] = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 4, 2, 1.5, 2, 1.5];
aFrames[6] = [2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 2, 1, 1.5, 2, 1.5, 1.5, 2.5, 2];
aFrames[7] = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 2, 2, 1.5, 2.5, 1.5, 1.5, 2];
aFrames[8] = [2, 1.5, 1.5, 1, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 2, 2, 1.5, 1.5, 2, 2];
aFrames[9] = [1, 1.5, 1, 1.5, 1, 2, 1.5, 1.5, 2, 2, 1.5, 3, 2, 2, 1.5, 4];

const AUD_ICON_FRAME:string='audioIcon.png';
const AUDBLACK_ICON_FRAME:string='audioIconBlack.png';

class AudioPlayer extends PIXI.Container {

	private showPlayAudioBut:boolean;
	private isAudioOn:boolean;
	private curGameInd:number;

	private retryCounts:number[];
	private myAudios:Howl[] | null[];
	private isAudioLoaded:boolean[];

	private audioBut : PIXI.Container;
	private audioBack : PIXI.Graphics;
	private audioIcon : PIXI.Sprite;
	private playIcon : PIXI.Sprite;

	private playAudioBut:PIXI.Container;
	private playBack : PIXI.Graphics;
	private disabledCross : PIXI.Graphics;
	private loadingText : PIXI.Text

	constructor(res:TextureMap) {
		super();
		this.showPlayAudioBut = true;
		this.isAudioOn = true;
		this.curGameInd = 0;

		this.retryCounts = [];
		this.myAudios = [];
		this.isAudioLoaded = [];

		this.toggleAudio = this.toggleAudio.bind(this);

		for (let i = 0; i < NUM_SETS; i++) {
			this.isAudioLoaded[i] = false;
			this.retryCounts[i] = 3;
			this.myAudios[i] = null;
		}

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

	playAudio(ind:number, t:string) {
		this.stopAudio(this.curGameInd);
		if (this.isAudioOn) {
			if (this.isAudioLoaded[this.curGameInd]) {
				let myInd = t === 'q' ? ind : ind + 8;
				let snd = 's_' + myInd;
				this.myAudios[this.curGameInd]?.play(snd);
			}
		}
	}

	stopAudio(ind:number) {
		this.myAudios[ind]?.stop();
	}

	toggleAudio() {
		if (this.isAudioOn) {
			this.isAudioOn = false;
			this.disabledCross.alpha = 1;
			this.audioIcon.alpha = 0.5;
		} else {
			this.isAudioOn = true;
			this.audioIcon.alpha = 1;
			this.disabledCross.alpha = 0;
		}
		this.stopAudio(this.curGameInd);
		this.emit('audiostateupdated', this.isAudioOn);
	}

	updateAudioState(state:boolean) {
		this.isAudioOn = !state;
		this.toggleAudio();
	}

	show() {
		this.visible = true;
	}

	hide() {
		this.visible = false;
	}

	showPlayBut() {
		this.showPlayAudioBut = true;
		this.playAudioBut.visible = true;
	}

	hidePlayBut() {
		this.showPlayAudioBut = false;
		this.playAudioBut.visible = false;
	}

	setGameInd(ind:number) {
		this.curGameInd = ind;
		this.checkLoaded();

		//this is just a backup check for the audio load
		//audio is loaded from a call in view
		//this will normally do nothing as either audioLoaded[ind] will be true or myAudios[ind] will be non null
		this.loadAudio(this.curGameInd);
	}

	checkLoaded() {
		if (this.isAudioLoaded[this.curGameInd]) {
			this.unshowLoading();
		} else {
			this.showLoading();
		}
	}

	showLoading() {
		this.audioBut.visible = false;
		this.playAudioBut.visible = false;
		this.loadingText.visible = true;
		this.loadingText.text = 'loading';
		this.checkFailed();
	}

	unshowLoading() {
		this.audioBut.visible = true;
		if (this.showPlayAudioBut) this.playAudioBut.visible = true;
		this.loadingText.visible = false;
	}

	checkFailed() {
		//
	}

	checkAudioOn() {
		return this.isAudioOn;
	}

	checkSuspended() {
		if ('ctx' in Howler && Howler.ctx !== null) {
			Howler.ctx.resume();
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	//loading

	loadAudio(ind:number) {
		if (!this.isAudioLoaded[ind] && this.myAudios[ind] === null) {
			this.tryLoad(ind);
		}
	}

	tryLoad(ind:number) {
		this.unsetAudio(ind);
		let audPath = RES_URL[OPD_ENV] + 'aud_' + ind;
		let mySprite:audioSpriteType = this.getSprite(ind);
		this.myAudios[ind] = new Howl({
			src: [audPath + '.ogg', audPath + '.mp3'],
			sprite: mySprite,
			onload: () => {
				this.audioLoaded(ind);
			},
			onloaderror: () => {
				this.retryCounts[ind] -= 1;
				if (this.retryCounts[ind] < 1) {
					this.audioFailed(ind);
				} else {
					this.tryLoad(ind);
				}
			}
		});
	}

	audioLoaded(ind:number) {
		this.myAudios[ind]?.off('load');
		this.myAudios[ind]?.off('loaderror');
		this.isAudioLoaded[ind] = true;
		this.checkLoaded();
	}

	audioFailed(ind:number) {
		this.unsetAudio(ind);
		this.loadingText.text = '';
	}

	unsetAudio(ind:number) {
		this.myAudios[ind]?.off('load');
		this.myAudios[ind]?.off('loaderror');
		this.myAudios[ind]?.unload();
		this.myAudios[ind] = null;
	}

	getSprite(ind:number) {
		let cum = 0;
		let myFrames = aFrames[ind];
		let mySprite={} as audioSpriteType;
		for (let i = 0; i < myFrames.length; i++) {
			let myLen = myFrames[i] * 1000;
			let spriteRef:string='s_' + i;
			mySprite[spriteRef] = [cum, myLen];
			cum += myLen;
		}
		return mySprite;
	}
}

export default AudioPlayer;

/// <reference path="opdPreloader.d.ts"/>
import * as opdPreloader from 'opdPreloader';
import PIXI from 'pixi.js';
import {TextureMap} from './types';
import mySpriteData from './jsons/mySprite.json';

export interface BuildModeType{
	[name: string] : string;
}

declare const OPD_ENV:string;

export const RES_URL:BuildModeType = {
	dev: './res/',
	// prod: 'https://www.gamestolearnenglish.com/games/[dirhere]/res/'
	prod: './res/'
};
const MAIN_SPRITE_PATH:string = 'mainSprite.0.0.png';

class Preloader {
	private callBack:Function;
	private tryTimes:number;
	private loader:PIXI.Loader;
	private onErrorId:PIXI.Loader.ICallbackID;
	private onCompleteId:PIXI.Loader.ICallbackID;

	constructor(callBack:Function) {
		this.callBack = callBack;
		this.tryTimes = 3;
		this.loader = new PIXI.Loader();
		this.loaded = this.loaded.bind(this);
		this.gotError = this.gotError.bind(this);
	}

	startLoad() {
		let myPath:string = RES_URL[OPD_ENV] + MAIN_SPRITE_PATH;
		this.loader.add('main', myPath);
		this.onErrorId=this.loader.onError.add(this.gotError);
		this.onCompleteId=this.loader.onComplete.add(this.loaded);
		this.loader.load();
	}

	gotError(e:string) {
		this.clearUp();
		this.tryTimes -= 1;
		if (this.tryTimes > 0) {
			this.startLoad();
			console.log('load error, retrying', e);
		} else {
			console.log('load error, giving up', e);
			opdPreloader.loadFailed();
		}
	}

	loaded() {
		opdPreloader.clearAll();
		let mySheet = new PIXI.Spritesheet(
			this.loader.resources.main.texture.baseTexture, mySpriteData
		);
		mySheet.parse((map:TextureMap) => {
			this.callBack(map);
			this.clearUp();
		});
	}

	clearUp() {
		this.loader.onError.detach(this.onErrorId);
		this.loader.onComplete.detach(this.onCompleteId);
		this.loader.destroy();
	}
}

export default Preloader

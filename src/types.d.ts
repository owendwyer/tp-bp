
export interface DisplayVars{
	scale:number;
	orient: number;
	textRes: number;
}

export interface TextureMap{
	[name: string] : PIXI.Texture;
}

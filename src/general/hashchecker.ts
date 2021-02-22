
interface hashObjType{
	contentType:string;
	contentTitle:string;
	contentCode:number;
	taskTitle:string;
	contentUser:string;
	contentDate:string;
};

function getHashType(firstPart:string) {
	if (firstPart === 'user') return 'user';
	if (firstPart === 'task') return 'task';
	return 'site';
}

// eg. - #animals
function processSiteHash(myHash:string, hashObj:hashObjType) {
	hashObj.contentType = 'site';
	hashObj.contentTitle = myHash;
}

// eg. - #user/fg/09/odwyer/testy
function processUserHash(myHash:string, hashObj:hashObjType) {
	//add more validity checking here
	//check not fg with @gmail.com
	//check date is valid
	//more stuff
	let hashSplit = myHash.split('/');
	for (let i = 0; i < hashSplit.length; i++) {
		//dont do this because some user emails have chars in
		//hashSplit[i]=hashSplit[i].replace(/[^a-zA-Z0-9]/g, '');
	}
	if (hashSplit.length !== 5) return;
	if (hashSplit[3].length < 3 || hashSplit[4].length < 3) return;
	hashObj.contentType = 'user';
	hashObj.contentTitle = hashSplit[4];
	hashObj.contentDate = hashSplit[2];
	if (hashSplit[1].charAt(1) === 'g') {
		hashObj.contentUser = hashSplit[3] + '@gmail.com';
	} else {
		hashObj.contentUser = hashSplit[3];
	}
}

// eg. - #task/odwyer@gmail.com/task2
function processTaskHash(myHash:string, hashObj:hashObjType) {
	//more validity checking here too
	let hashSplit = myHash.split('/');
	for (let i = 0; i < hashSplit.length; i++) {
		//dont do this because some user emails have chars in
		//  hashSplit[i]=hashSplit[i].replace(/[^a-zA-Z0-9@.]/g, '');
	}
	if (hashSplit.length !== 3) return;
	if (hashSplit[1].length < 3 || hashSplit[2].length < 3) return;
	hashObj.contentType = 'task';
	hashObj.contentUser = hashSplit[1];
	hashObj.taskTitle = hashSplit[2];
}

function getHashObj() {
	let hashObj:hashObjType = {
		contentType: '',
		contentTitle: '',
		contentCode: 0,
		taskTitle: '',
		contentUser: '',
		contentDate: ''
	};
	let myHash = window.location.hash.substr(1);
	if (!myHash) return hashObj;
	myHash = myHash.toLowerCase();
	let firstPart = myHash.split('/')[0];
	let hashType = getHashType(firstPart);
	if (hashType === 'site')processSiteHash(myHash, hashObj);
	if (hashType === 'user')processUserHash(myHash, hashObj);
	if (hashType === 'task')processTaskHash(myHash, hashObj);
	return hashObj;
}

export { getHashObj, hashObjType };

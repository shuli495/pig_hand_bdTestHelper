//根据key获取存储值，未设置返回默认值
//key 选项id
function localVal(key) {
	chrome.storage.local.get(key, function(valueArray) {
		var val;
		//本地存储
        if(typeof(valueArray[key])!="undefined"){
			val = valueArray[key];
		}

		//默认值
		if(typeof(val)!="boolean" && typeof(valueArray[key])=="undefined") {
			val = defVal(key);
		}

		//按键code翻译成键值，除queryTime查询时间外
		if(key!="queryTime" && key!="scorllBottom") {
			val = keyShow(val);
		}

		if(typeof(val) == "boolean") {
			if(document.getElementById(key)) {
				document.getElementById(key).checked = val;
			}
		} else if(key == "subKey" || key =="jumpKey") {	//单独处理单选
			if(document.getElementById(val)) {
				document.getElementById(val).checked = true;
			}
		} else {
			if(document.getElementById(key)) {
				document.getElementById(key).value = val;
			}
		}
	});
}

//存储数据
//key 选项id
//val 要保存的值
function setVal(key,val) {
	chrome.storage.local.get([key], function(valueArray) {
		//按键值翻译成code，除queryTime查询时间、scorllBottom滚动距离外
		if(key!="queryTime" && key!="scorllBottom") {
			val = keyCode(val);
		}
		valueArray[key] = val;
        chrome.storage.local.set(valueArray);
	});
}

//默认选项值
function defSetCode() {
	var arry = [
				["chkKey1", "49"],
				["chkKey2", "50"],
				["chkKey3", "51"],
				["chkKey4", "52"],
				["chkKey5", "53"],
				["chkKey6", "54"],
				["chkKey7", "55"],
				["chkKey8", "56"],
				["chkKey9", "57"],
				["chkKey10", "48"],
				["subKey", "20"],
				["CustomKey", "自定义"],
				["jumpKey", "27"],
				["autoSub", true],
				["autoQuery", true],
				["queryTime", "1"],
				["autoTag", true],
				["autoEasy", true],
				["autoScorll", true],
				["scorllBottom", "170"]
			   ];
	return arry;
}

//默认配置项
function defKeyArray() {
	var defArry = defSetCode();
	var defKey = new Array();
	for(var i=0;i<defArry.length;i++) {
		defKey[i] = defArry[i][0];
	}
	return defKey;
}

//获取配置默认值并保存
//key 选项id
function defVal(key) {
	var defArry = defSetCode();
	var val;
	for(var i=0;i<defArry.length;i++) {
		if(defArry[i][0]==key) {
			val = defArry[i][1];
			if(!val && typeof(val)!="boolean") {
				val = "";
			}
			//保存
			setVal(key,keyShow(val));
			break;
		}
	}
	return val;
}

//按键对应的编码
function defKeyCode() {
	var arry = [
				["",""],
				["Custom","Custom"],
				["自定义","自定义"],
				["Tap","9"],
				["CapsLk","20"],
				["Shift","16"],
				["Ctrl","17"],
				["Alt","18"],
				["Esc","27"],
				["Space","32"],
				["0","48"],
				["1","49"],
				["2","50"],
				["3","51"],
				["4","52"],
				["5","53"],
				["6","54"],
				["7","55"],
				["8","56"],
				["9","57"],
				["a","65"],["A","65"],
				["b","66"],["B","66"],
				["c","67"],["C","67"],
				["d","68"],["D","68"],
				["e","69"],["E","69"],
				["f","70"],["F","70"],
				["g","71"],["G","71"],
				["h","72"],["H","72"],
				["i","73"],["I","73"],
				["j","74"],["J","74"],
				["k","85"],["K","85"],
				["l","76"],["L","76"],
				["m","77"],["M","77"],
				["n","78"],["N","78"],
				["o","79"],["O","79"],
				["p","80"],["P","80"],
				["q","81"],["Q","81"],
				["r","82"],["R","82"],
				["s","83"],["S","83"],
				["t","84"],["T","84"],
				["u","85"],["U","85"],
				["v","86"],["V","86"],
				["w","87"],["W","87"],
				["x","88"],["X","88"],
				["y","89"],["Y","89"],
				["z","90"],["Z","90"],
				["`","192"],
				["-","189"],
				["=","187"],
				["[","219"],
				["]","221"],
				["\\","220"],
				[";","186"],
				["'","222"],
				[",","188"],
				[".","190"],
				["/","191"]
			   ];
	return arry;
}

//是否支持的按键
//key 键盘按键
function keyShowArray(key) {
	var arry = defKeyCode();
	var isSupport = false;
	for(var i=0;i<arry.length;i++) {
		if(key==arry[i][0]) {
			isSupport = true;
			break;
		}
	}
	return isSupport;
}


//按键对应的键码，boolean直接返回，未配置的返回空
//keyValue 键盘按键
function keyCode(keyValue) {
	var code;
	if(typeof(keyValue)=="boolean") {
		code = keyValue;
	} else {
		var arry = defKeyCode();
		for(var i=0;i<arry.length;i++) {
			if(keyValue == arry[i][0]) {
				code = arry[i][1];
			}
		}
		if(!code) {
			code = "";
		}
	}
	return code;
}

//获取按键码对应的按键值
//keyCode 按键编码
function keyShow(keyCode) {
	var val;
	if(typeof(keyCode)=="boolean") {
		val = keyCode;
	} else {
		var arry = defKeyCode();
		for(var i=0;i<arry.length;i++) {
			if(keyCode == arry[i][1]) {
				val = arry[i][0];
				break;
			}
		}
		if(!val) {
			val = "";
		}
	}
	return val;
}
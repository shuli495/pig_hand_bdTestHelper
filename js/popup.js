document.body.onload = init();
var maxId;	//自定义选项最大数

//初始化 控件赋值
function init() {
	maxId = 9;

	//选项
	for(var i=1;i<=maxId;i++) {
		var id = "chkKey"+i;
		localVal(id);	//选项值

		//绑定事件
		document.getElementById(id).onfocus = function(){getKey(this)};
		document.getElementById(id).onkeyup = function(){isSupportKey(this)};
	}

	//设置值
	localVal("subKey")	//确定
	localVal("CustomKey");//自定义确定
	localVal("autoSub");//自动确定

	localVal("jumpKey");//跳过

	localVal("autoTag");//自动切换标签
	localVal("autoScorll");//自动设置滚动条
	localVal("scorllBottom");//滚动条距底边距离


	localVal("autoQuery");//自动查询
	localVal("queryTime");//自动查询间隔


	//绑定事件
	//确定
	var subKeyDom = document.getElementsByName("subKey");
	for(var i=0;i<subKeyDom.length;i++) {
		subKeyDom[i].onclick = function(){clearCustom(this.value)};
	}
	document.getElementById("autoQuery").onclick = function(){autoQueryStar()};	//自动查询事件
	document.getElementById("saveBut").onclick = function(){save()};	//保存事件
	document.getElementById("titleName").onclick = function(){window.open(this.href);};	//标题点击
	document.getElementById("titleMaker").onclick = function(){window.open(this.href);};//作者点击
}

//保存配置
function save() {
	//选项
	for(var i=1;i<=maxId;i++) {
		var id = "chkKey"+i;
		var chkKey = document.getElementById(id);
		if(!isNull(chkKey,"选项1"))return;
		setVal(id,chkKey.value);
	}

	var queryTime = document.getElementById("queryTime");//时间间隔
	var CustomKey = document.getElementById("CustomKey");//自定义确定

	if(!isNull(queryTime,"时间间隔"))return;
	if(!isNum(queryTime.value))return;

	//确定
	var subKeyDom = document.getElementsByName("subKey");
	var subKey = "";
	for(var i=0;i<subKeyDom.length;i++) {
		if(subKeyDom[i].checked==true) {
			if(subKeyDom[i].value=="Custom") {
				if(!isNull(CustomKey,"自定义确定"))return;
			}
			subKey = subKeyDom[i].value;
			break;
		}
	}
	setVal("subKey",subKey);//确定
	setVal("CustomKey",CustomKey.value);//自定义确定
	setVal("autoSub",document.getElementById("autoSub").checked);//自动确定

	//跳过
	var jumpKeyDom = document.getElementsByName("jumpKey");
	var jumpKey = "";
	for(var i=0;i<jumpKeyDom.length;i++) {
		if(jumpKeyDom[i].checked==true) {
			jumpKey = jumpKeyDom[i].value;
			break;
		}
	}
	setVal("jumpKey",jumpKey);//确定

	setVal("autoTag",document.getElementById("autoTag").checked);//自动切换标签
	setVal("autoScorll",document.getElementById("autoScorll").checked);//自动设置滚动条

	//滚动条距底边距离
	var scorllBottom = document.getElementById("scorllBottom");
	if(!isNull(scorllBottom,"时间间隔"))return;
	if(!isNum(scorllBottom.value))return;
	setVal("scorllBottom",scorllBottom.value);

	setVal("queryTime",queryTime.value);//自动查询间隔(分)
	setVal("autoQuery",document.getElementById("autoQuery").checked);//保存自动查询
	alert("保存完成");
}

//清空、还原自定义确定框
function clearCustom(keyValue) {
	if(keyValue=="Custom") {
		document.getElementById("CustomKey").value = "";
	} else {
		document.getElementById("CustomKey").value = "自定义";
	}
}

//启动关闭自动查询
function autoQueryStar() {
	setVal("autoQuery",document.getElementById("autoQuery").checked);//保存自动查询
	var bg = chrome.extension.getBackgroundPage();
	if(document.getElementById("autoQuery").checked) {
		bg.autoQueryPro(true);
	} else {
		bg.autoQueryPro(false);
	}
}

//获取焦点前，暂存设置框的值，用于判断
var nowKeyPress = "";
function getKey(event) {
	if(nowKeyPress=="") {
		nowKeyPress = event.value;
	}
}

//判断是否支持、是否被占用
function isSupportKey(event) {
	//判断是否支持输入的按键
	if(!keyShowArray(event.value)) {
		alert("不支持此按键！");
		event.value = nowKeyPress;
	} else {
		//判断是否已被占用
		//选项框
		for(var i=1;i<=maxId;i++) {
			var id = "chkKey"+i;
			if(id!=event.id) {
				var chkKey = document.getElementById(id);
				if(chkKey.value==event.value) {
					alert("此按键已被占用，请更换！");
					event.value = nowKeyPress;
					return;
				}
			}
		}
		//自定义框
		var CustomKey = document.getElementById("CustomKey");
		if(CustomKey==event.value) {
			alert("此按键已被占用，请更换！");
			event.value = nowKeyPress;
			return;
		}
		nowKeyPress = "";
	}
}

//判断是否空值
function isNull(dom,altText) {
	var val = dom.value;
	if(null==val || ""==val) {
		alert("请填写"+altText+"！");
		return false;
	} else {
		return true;
	}
}

//判断是否是数字
function isNum(num) {
	if(!isNaN(num)) {
		return true;
	} else if(num==0 || num=="0") {
		alert("时间间隔不能为0！");
		return false;
	} else {
		alert("时间间隔不是数字！");
		return false;
	}
}
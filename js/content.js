//答题页面js

var saT;	//当前题
var autoQueryInt;//检查当前提是否新题 计时器(根据当前题数判断)

function beg() {
	//点完确定按钮 计时器判断是否是下道题
	if(saT) {
		var t1Html = document.getElementsByClassName("com-mark-p-brief")[0].innerHTML;
		var t2Html = document.getElementsByClassName("com-mark-pq-content")[0].innerHTML;
		if(t1Html + t2Html != saT) {
			window.clearInterval(autoQueryInt);
			showKey();
		}
	//第一次进页面
	} else {
		showKey();
	}
}

//选项前添加快捷键标志
function showKey() {
	//不同题型单独优化
	diySet("begin");

	//为选项控件添加id
	var labels = document.getElementsByClassName("com-mark-pq-single js-com-mark-pq-single com-mark-pq-choice-choiceshow");
	var idIndex = 1;
	var keys = new Array();	//页面的选项集合

	for(var i=0;i<labels.length;i++) {
		var chkDom = labels[i].getElementsByTagName("span")[0];
		chkDom.id="bdTst_chkBut_"+idIndex;
		chkDom.parentNode.parentNode.onmouseup=function(){mouseAutoChk(this)};
		keys[idIndex-1] = "chkKey"+idIndex;
		idIndex++;
	}

	//选项前显示快捷键
	chrome.storage.local.get(keys, function(valueArray) {
		for(var i=0;i<keys.length;i++) {
			//选项前显示快捷键
			var elem = document.getElementById("bdTst_chkBut_"+(i+1));
			var key = keys[i];
			var val = valueArray[key];

			//本地未获取到取默认值
			if(!val) {
				val = defVal(key);
			}

			//键码翻译成按键值
			elem.parentNode.innerHTML="<span>"+keyShow(val)+"</span>";
		}
		setScorll();//滚动条位置

		//不同题型单独优化
		diySet("end");
	});
}

//鼠标点击选项，如果选择自动确认，则自动点击确定
function mouseAutoChk(event) {
	chrome.storage.local.get("autoSub", function(valueArray) {
		var autoSub = valueArray["autoSub"];
		if(autoSub) {
			var isCheckedInt = setInterval(function(){
				if(event.innerHTML.indexOf("checked=\"checked\"")!=-1) {
					window.clearInterval(isCheckedInt);
					subTopic();//点确定
				}
			},100);
		}
	});
}

//按键监听
window.document.onkeydown=keyListening;
function keyListening(evt) {
	evt=(evt)?evt:window.event;
	if(evt.keyCode) {
		var keys = defKeyArray();	//支持的快捷键
		chrome.storage.local.get(keys, function(valueArray) {
			for(var i=0;i<keys.length;i++) {
				var key = keys[i];	//快捷键
				var localCode = valueArray[key];	//快捷键对应的键码
				if(localCode==evt.keyCode) {
					if(key.indexOf("chkKey") != -1) {	//按选项键
						var id = "bdTst_chkBut_"+key.replace("chkKey","");
						var chkLabel = document.getElementById(id);

						//未找到添加id的控件
						if(!chkLabel) {
							var chkDom = document.getElementsByClassName("com-mark-pq-single js-com-mark-pq-single com-mark-pq-choice-choiceshow");
							chkDom[i].click();
						//根据id找到选项控件
						} else {
							//设置选中状态
							chkLabel.click();
						}

						//自动确定
						var autoSub = valueArray["autoSub"];
						if(autoSub) {
							subTopic();
						}
					} else if(key=="subKey" || key=="CustomKey") {	//按确定键
						subTopic();
					} else if(key=="jumpKey") {	//跳过
						document.getElementById("js_return_btn").click();
					}
					break;
				}
			}
		});
	} else {
	}
}

//点提交按钮
function subTopic() {
	setTimeout("document.getElementById('js_submit_btn').click();", 1000);

	//当前题
	var t1Html = document.getElementsByClassName("com-mark-p-brief")[0].innerHTML;
	var t2Html = document.getElementsByClassName("com-mark-pq-content")[0].innerHTML;

	//试题页面无题号(试题页面重新加载js 不用判断是否换题)
	if(t1Html && t2Html) {
		//标记题
		saT = t1Html + t2Html;

		//确定后自动查询时候开始新任务
		autoQueryInt = setInterval("beg()",500);
	}

	//切换下个标签
	chrome.storage.local.get(["autoTag"], function(valueArray) {
		var autoTag = valueArray["autoTag"];
		if(autoTag) {
			chrome.extension.sendRequest({type:"nextTab"}, function(response) {});
		}
	});
}

//设置滚动条位置
function setScorll() {
	chrome.storage.local.get(["autoScorll","scorllBottom"], function(valueArray) {
		var autoScorll = valueArray["autoScorll"];		//是否设置滚动条
		var scorllBottom = valueArray["scorllBottom"];	//滚动条距底部距离
		if(autoScorll) {
			window.scrollTo(0,document.body.offsetHeight - document.documentElement.clientHeight-parseInt(scorllBottom));
		}
	});
}

//不同题型单独优化
function diySet(step) {
	//标题
	var title = document.getElementsByClassName("bread-navigation")[0].innerHTML;

	if(title.indexOf("拼音练习") != -1) {
		if (step == "begin") {
			var showDom = document.getElementsByClassName("com-mark-pq-single-wrap")[0];
			showDom.innerHTML = "<div id='find_da' style='color:red;font-weight: bold;'>查找答案中...</div><br/>" + showDom.innerHTML;

			var spans = document.getElementsByClassName("com-mark-pq-content")[0].getElementsByTagName("span");
			var hz = spans[0].innerHTML;	//汉字
			var py = spans[1].innerHTML;	//拼音
			var ck = spans[2].innerHTML;	//判断正确与否的汉字

			//调用接口查询翻译结果
			$.ajax({
				url: "http://123.56.228.68:8071/qianliyan/baidu/hanyu/" + hz,
				async: false,
				timeout: 3000,
				type: "GET",
				success: function(data) {
					var chkDom = document.getElementsByClassName("com-mark-pq-single js-com-mark-pq-single com-mark-pq-choice-choiceshow");

					var cks = ck.split(" ");
					var isRight = true;
					var err_py = "";

					//判断答案是否正确
					for (var i=0; i<cks.length; i++) {
						var ckIdx = hz.indexOf(cks[i])
						if(py.split(" ")[ckIdx] != data.split(" ")[ckIdx]) {
							err_py = cks[i] + "(" + py.split(" ")[ckIdx] + ") 正确为：" + data.split(" ")[ckIdx];
							isRight = false;
							break;
						}
					}

					//选择对应选项
					if (!isRight) {
						document.getElementById("find_da").innerHTML = "答案错误：" + err_py;
						chkDom[1].click();
					} else {
						document.getElementById("find_da").style.color = "blue";
						document.getElementById("find_da").innerHTML = "答案正确 (✿◡‿◡)";
						chkDom[0].click();
					}
				},
				error: function() {
					document.getElementById("find_da").innerHTML = "查找失败，请手动选择！";
				}
			});
		}
	}

	if(step == "end") {
		chrome.storage.local.get(defKeyArray(), function(valueArray) {
			//验证码
			var yzm = document.getElementById("mark_captcha").style.display;

			if(yzm == "none") {
				var isActive = document.getElementsByClassName("com-mark-pq-single-wrap")[0].innerHTML.indexOf("active");

				//自动确定
				var autoSub = valueArray["autoSub"];
				if(autoSub && isActive != -1) {
					subTopic();
				}
			} else {
				alert("输入验证码！");
			}
		});
	}
}


window.onload = function() {
	beg()
}

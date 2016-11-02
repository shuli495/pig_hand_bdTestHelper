//查询新项目js

//打开浏览器 查看是否启动自动查询
starAutoQuery();

//监听配置页面，启动或关闭自动查询
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	if(request.isStart) {
		starAutoQuery();
	} else {
		overAutoQuery();
	}
});

//判断是否自动查询，启动则刷新页面后在查询
function starAutoQuery(isManual) {
	chrome.storage.local.get(["autoQuery","queryTime"], function(valueArray) {
		//是否自动查询
		var autoQuery = valueArray["autoQuery"];
		//默认值
		if(typeof(autoQuery) == "undefined") {
			queryTime = defVal("autoQuery");
		}

		if(autoQuery) {
			chrome.extension.sendRequest({type:"getAutoQueryInt"}, 
			function(response) {
				//非第一次启动查询
				if(response.intId) {
					//结束上个查询
					window.clearInterval(response.intId);

					//执行时间(分)
					var queryTime = valueArray["queryTime"];
					if(!queryTime) {//默认执行时间
						queryTime = defVal("queryTime");
					}

					//根据设置时间后，开始查询
					var autoQueryInt = setInterval("begAutoQuery()",parseInt(queryTime)*60*1000);

					//设置计时器id
					chrome.extension.sendRequest({type:"setAutoQueryInt",intId:autoQueryInt}, function(response) {});

				//第一次启动查询
				} else {
					//设置查询id为999，不设置则下次查询获取id为空，也认为是第一次查询
					chrome.extension.sendRequest({type:"setAutoQueryInt",intId:999}, function(response) {
						//直接开始查询
						begAutoQuery();
					});

				}
			});
		}
	});
}

//开始项目查询
function begAutoQuery() {
	//后台页url增加自有参数btpig=0，否则浏览器打开此页面时，插件会自动刷新浏览器页面
	if(window.location.href=="http://test.baidu.com/crowdtest/activity/gotoActivityMarket#?type=1&btpig=0") {
		document.body.onload = queryNewPro();
		document.location.reload();	//刷新
	}
}

//结束项目查询
function overAutoQuery() {
	chrome.extension.sendRequest({type:"getAutoQueryInt"},
	function(response) {
		if(response.intId) {
			//停止计时器
			window.clearInterval(response.intId);
			//清空计时器id变量
			chrome.extension.sendRequest({type:"setAutoQueryInt",intId:""}, function(response) {});
		}
	});
}

//查询新项目
function queryNewPro() {
	//当前项目是否弹出通知过 弹出过则不在弹出
	chrome.extension.sendRequest({type:"getProArry"},
	function(response) {
		//项目列表ul
		var uls = document.getElementsByTagName("ul");
		for(var i=0;i<uls.length;i++) {
			if(uls[i].parentElement.className == "project-index-content") {
				//项目列表li
				var lis = uls[i].getElementsByTagName("li");
				for(var j=0;j<lis.length;j++) {
					//有未参与的项目
					if(lis[j].innerHTML.indexOf("已参与")==-1) {
						var as = lis[j].getElementsByTagName("a");
						if(as.length > 0) {
							var proTitle = as[0].title;//项目标题
							var proUrl = as[0].href;   //项目url
							if(proTitle!="") {
								//判断是否弹出过
								var proArry = response.proTitles;
								var isNotif = false;
								for(var k=0;k<proArry.length;k++) {
									if(proArry[k]==proTitle) {
										isNotif = true;
										break;
									}
								}

								//未弹出过
								if(!isNotif) {
									//弹窗并记录弹过的窗口
									chrome.extension.sendRequest({type:"notice",showText:proTitle,openUrl:proUrl,nowTitle:proTitle}, function(response) {});
								}
							}
						}
					}
				}
			}
		}
	});
}
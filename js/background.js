//querypro页面全局变量
var autoQueryInt;//自动查询任务 定时器id
var proArry = new Array();//记录已弹出通知项目 已弹出不在弹出

//其他页面调用
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	//桌面通知
	if(request.type=="notice") {
		proArry[proArry.length] = request.nowTitle;
		deskNotice(request.showText,request.openUrl);
		sendResponse({});
	//设置自动查询计时器id
	} else if(request.type=="setAutoQueryInt") {
		autoQueryInt = request.intId;
		sendResponse({});
	//获取自动查询计时器id
	} else if(request.type=="getAutoQueryInt") {
		sendResponse({intId:autoQueryInt});
	//设置查询过的任务
	} else if(request.type=="getProArry") {
		sendResponse({proTitles:proArry});
	//切换下个标签
	} else if(request.type=="nextTab") {
		chrome.tabs.query({currentWindow: true},function(tabs){	//当前窗口所有标签
			chrome.tabs.getSelected(null, function(thisTab) {	//当前激活标签
				var firstTabIndex;	//第一个答题页标签序列
				var thisTabIndex;	//当前答题页标签序列
				var isAfterTab = false;	//当前答题页标签后面是否还有答题页标签
				for(var i=0;i<tabs.length;i++) {
					if(tabs[i].url.indexOf("http://test.baidu.com/crowdtesteva/eva/doEva/eva_id/") != -1) {
						//记录第一个答题页标签
						if(!firstTabIndex) {
							firstTabIndex = i;
						}
						
						//如果当前答题页序列不为空，证明当前tab[i]是下一个答题页标签
						if(thisTabIndex) {
							//激活答题页标签
							chrome.tabs.update(tabs[i].id, {selected :true});
							isAfterTab = true;
							break;
						}
						
						//记录当前激活的答题页序列
						if(tabs[i].id==thisTab.id) {
							thisTabIndex=i;
						}
					}
				}
				
				//如果当前答题页后面无答题标签，则选中第一个答题页标签
				if(!isAfterTab) {
					chrome.tabs.update(tabs[firstTabIndex].id, {selected :true});
				}
			});
		});
		sendResponse({});
	}
 
});
  
//选项页面 选择自动查询，启动或关闭后台querypro的查询
function autoQueryPro(starFlag) {
	chrome.extension.sendRequest({isStart:starFlag}, function(response) {});
}

//显示桌面通知
var notifId;//当前点击桌面通知的id
function deskNotice(data,url) {
	var title = "有新项目$_$！ - 点击打开";	//标题
	var icon = "img/icon.png";	//图标地址
	
    if(window.webkitNotifications){	//html5
      	var notification = window.webkitNotifications.createNotification(
      	    icon,
      	    title,
      	    data
      	);
        notification.onclick=function(){noticeClick(url);};	//点击通知
        notification.show();	//显示
        setTimeout(function(){notification.cancel();}, 5000);//5秒后结束
 
    }else if(chrome.notifications){	//chrome
      	var opt = {
            type: 'basic',
            title: title,
            message: data,
            iconUrl: icon
        }
		//点击通知
		chrome.notifications.onClicked.addListener(function(id) {
			//点击会执行所有气泡点击事件，判断相同id返回
			if(notifId == id) {
				return;
			}
			notifId = id;
			noticeClick(url);
		});

		//创建通知
		chrome.notifications.create('', opt, function(id){
            setTimeout(function(){
        	chrome.notifications.clear(id, function(){});
       	    }, 5000);
      	});
    }else{
  	    //不支持通知
    }
}

//点击桌面通知
function noticeClick(url) {
	if(url!="") {
		window.open(url);
	}
}
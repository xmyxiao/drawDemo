/* 主要是撤销与反撤销操作
 * */
(function(global){
	var historyDo;
	historyDo = global.historyDo = {};
	historyDo.pare = {
		undoArr : new Array,
		redoArr : new Array,
		x : 0,
		y : 0,
		x2 : 0,
		y2 : 0,
		imgWidth : 0,
		imgHeight : 0,
		transform : 0
	}
})(this);

//撤销操作
historyDo.unfn = {
	pushUndo : function(eleAction){//撤销数组增加
		historyDo.pare.undoArr.push(eleAction)
		if(historyDo.pare.undoArr.length > 10){
			historyDo.pare.undoArr.splice(0,1);
		}
	},
	popUndo : function(){//撤销数组执行
		if(historyDo.pare.undoArr.length>0){
			var item = historyDo.pare.undoArr.pop();
			switch(item.action){
			case "move":
				historyDo.unfn.unmove(item);
				break;
			case "del":
				historyDo.unfn.undel(item);
				break;
			case "add":
				historyDo.unfn.unadd(item);
				break;	
			case "change":
				historyDo.unfn.unchange(item);
				break;
			default:
				return false;
			}
		}
	},
	unmove : function(item){//撤销移动
		var moveItem = $(item.actElemen);
		if(item.value.eleType == "line"){
			item.value.rex1 = moveItem.attr("x1"),
			item.value.rex2 = moveItem.attr("x2"),
			item.value.rey1 = moveItem.attr("y1"),
			item.value.rey2 = moveItem.attr("y2");
			historyDo.publicfn.moveLineItem(moveItem,item.value.oldx1,item.value.oldx2,item.value.oldy1,item.value.oldy2);
		}else{
			item.value.rex = moveItem.attr("x"),
			item.value.rey = moveItem.attr("y");
			historyDo.publicfn.moveOtherItem(moveItem,item.value.oldx,item.value.oldy);
		}
		historyDo.refn.pushRedo(item);
	},
	undel : function(item){//撤销删除
		if(item.value.nextEle.nodeName == "g"){
			$("#drawing svg").append(item.actElemen);
		}else{
			$(item.value.nextEle).before(item.actElemen);
		}
		historyDo.refn.pushRedo(item);
	},
	unadd : function(item){//撤销新增
		if(item.actElemen == svgItem.param.rectSel){
			svgItem.param.rectSel.resize('stop');
			svgItem.param.rectSel.selectize(false);
			svgItem.param.rectSel = null;
			showCanveMsg();
		}
		item.value.nextEle = item.actElemen.node.nextSibling;
		item.actElemen.remove();
		historyDo.refn.pushRedo(item);
	},
	unchange : function(item){//撤销更改
		var changeItem = item.actElemen;
		if(item.evenntType == "resizedone"){//拖动
			if(item.value.transform != "0" && item.value.transform){
				item.value.retransform = $(changeItem).attr("transform");
				$(changeItem).attr("transform",item.value.transform)
			}else{
				$(changeItem).removeAttr("transform");
			}
			if(item.value.eleType == "line"){
				item.value.rex1 = $(changeItem).attr("x1"),
				item.value.rex2 = $(changeItem).attr("x2"),
				item.value.rey1 = $(changeItem).attr("y1"),
				item.value.rey2 = $(changeItem).attr("y2");
				
				historyDo.publicfn.moveLineItem($(changeItem),item.value.oldx1,item.value.oldx2,item.value.oldy1,item.value.oldy2);
			}else{
				item.value.rex = $(changeItem).attr("x"),
				item.value.rey = $(changeItem).attr("y");
				
				historyDo.publicfn.moveOtherItem($(changeItem),item.value.oldx,item.value.oldy);
			}
			if(item.value.eleType == "image"){
				item.value.rewidth = $(changeItem).attr("width"),
				item.value.reheight = $(changeItem).attr("height");
				
				$(changeItem).attr("width",toNumFix(item.value.width));
				$(changeItem).attr("height",toNumFix(item.value.height));
			}
		}else if(item.evenntType == "panel"){//面板
			if(item.value.eleAttr == "text"){
				item.value.reval = changeItem.text();
				changeItem.text(item.value.oldval);
			}else if(item.value.eleAttr == "imageContent"){
				item.value.reval = $(changeItem.node).attr("imgdata");
				createCode(item.value.oldval);
				var imgSrc = saveImageInfo();
				$(changeItem.node).attr("href",imgSrc);
				$(changeItem.node).attr("imgdata",item.value.oldval);
			}else if(item.value.eleAttr == "width" || item.value.eleAttr == "height"){
				item.value.reval = changeItem.attr("width");
				
				changeItem.attr("width",item.value.oldval);
				changeItem.attr("height",item.value.oldval);
			}else if(item.value.eleAttr == "font-size"){
				item.value.reval = changeItem.attr(item.value.eleAttr);
				changeItem.attr(item.value.eleAttr,item.value.oldval);
				changeItem.attr("x",Number(mmtranslate($("#text-x").val(),"x")).toFixed(2));
				changeItem.attr("y",Number(mmtranslate($("#text-y").val(),"y")).toFixed(2));
				changeItem.attr("dy",returnDy(item.value.oldval));
			}else{
				item.value.reval = changeItem.attr(item.value.eleAttr);
				changeItem.attr(item.value.eleAttr,item.value.oldval);
			}
			
			if(svgItem.param.rectSel){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
			}
			changeItem.selectize().resize();
			svgItem.param.rectSel = changeItem;
			switch(item.value.eleType){
			case "line":
				showLineMsg(changeItem);
				break;
			case "text":
				showTextMsg(changeItem);
				break;
			case "image":
				showImageMsg(changeItem);
				break;	
			default:
				return false;
			}
		}else{
			return ;
		}
		historyDo.refn.pushRedo(item);
	}
}
//获取元素操作
historyDo.getfn = {
	move : function(item){//获取移动
		if(item.tagName == "line"){
			var eleAction = {
				actElemen : item,
				action : "move",
				value : {
					eleType : item.tagName,
					oldx1 : historyDo.pare.x,
					oldy1 : historyDo.pare.y,
					oldx2 : historyDo.pare.x2,
					oldy2 : historyDo.pare.y2
				}
			}
		}else{
			var eleAction = {
				actElemen : item,
				action : "move",
				value : {
					eleType : item.tagName,
					oldx : historyDo.pare.x,
					oldy : historyDo.pare.y
				}
			}
		}
		historyDo.unfn.pushUndo(eleAction);
		historyDo.refn.clear();
	},
	del : function(item){//获取删除
		var eleAction = {
			actElemen : item.node,
			action : "del",
			value : {
				eleType : item.type,
				nextEle : item.node.nextSibling
			}
		}
		historyDo.unfn.pushUndo(eleAction);
		historyDo.refn.clear();
	},
	add : function(item){//获取添加
		var eleAction = {
			actElemen : item,
			action : "add",
			value : {
				eleType : item.type,
				nextEle : item.node.nextSibling
			}
		}
		historyDo.unfn.pushUndo(eleAction);
		historyDo.refn.clear();
	},
	change : function(item){//获取更改
		if(item.type == "resizedone"){//拖动更改
			var eleAction = {
				actElemen : item.target,
				action : "change",
				evenntType : "resizedone",
				value : {
					eleType : item.target.nodeName,
					oldx : historyDo.pare.x,
					oldy : historyDo.pare.y,
					transform : historyDo.pare.transform
				}
			}
			switch(item.target.nodeName){
			case "line":
				eleAction.value.oldx1 = historyDo.pare.x;
				eleAction.value.oldy1 = historyDo.pare.y;
				eleAction.value.oldx2 = historyDo.pare.x2;
				eleAction.value.oldy2 = historyDo.pare.y2;
				break;
			case "image":
				eleAction.value.width = historyDo.pare.imgWidth;
				eleAction.value.height = historyDo.pare.imgHeight;
				break;
			default:
				break;
			}
		}else{//右侧面板修改
			eleAction = item;
			eleAction.evenntType = "panel"
		}
		historyDo.unfn.pushUndo(eleAction);
		historyDo.refn.clear();
	}
}
//面板修改获取
function getPanelChange(actItem,name){
	var changeItem = {
		actElemen : actItem,
		action : "change",
		value : {
			eleType : actItem.type,
			eleAttr : name,
			oldval : actItem.attr(name) || 0
		}
	}
	if(name == "text"){
		changeItem.value.oldval = actItem.text();
	}
	if(name == "imageContent"){
		changeItem.value.oldval = $(actItem.node).attr("imgdata");
	}
	historyDo.getfn.change(changeItem);
	historyDo.refn.clear();
}
//反撤销操作
historyDo.refn = {
	pushRedo : function(eleAction){//反撤销数组增加
		historyDo.pare.redoArr.push(eleAction)
		if(historyDo.pare.redoArr.length > 10){
			historyDo.pare.redoArr.splice(0,1);
		}
	},
	popRedo : function(){//反撤销数组执行
		if(historyDo.pare.redoArr.length>0){
			var item = historyDo.pare.redoArr.pop();
			switch(item.action){
			case "move":
				historyDo.refn.remove(item);
				break;
			case "del":
				historyDo.refn.redel(item);
				break;
			case "add":
				historyDo.refn.readd(item);
				break;	
			case "change":
				historyDo.refn.rechange(item);
				break;
			default:
				return false;
			}
		}
	},
	remove : function(item){//反向移动
		var moveItem = $(item.actElemen);
		if(item.value.eleType == "line"){
			historyDo.publicfn.moveLineItem(moveItem,item.value.rex1,item.value.rex2,item.value.rey1,item.value.rey2);
		}else{
			historyDo.publicfn.moveOtherItem(moveItem,item.value.rex,item.value.rey);
		}
		historyDo.unfn.pushUndo(item);
	},
	redel : function(item){//再次删除
		if(svgItem.param.rectSel){
			if(item.actElemen == svgItem.param.rectSel.node){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
				showCanveMsg();
			}
		}
		item.actElemen.remove();
		historyDo.unfn.pushUndo(item);
	},
	readd : function(item){//再次添加
		$("#drawing svg").append($(item.actElemen.node));
		historyDo.unfn.pushUndo(item);
	},
	rechange : function(item){//再次更改
		var changeItem = item.actElemen;
		if(item.evenntType == "resizedone"){//拖动
			if(item.value.transform != "0" && item.value.transform){
				$(changeItem).attr("transform",item.value.retransform)
			}else{
				$(changeItem).removeAttr("transform");
			}
			if(item.value.eleType == "line"){			
				historyDo.publicfn.moveLineItem($(changeItem),item.value.rex1,item.value.rex2,item.value.rey1,item.value.rey2);
			}else{				
				historyDo.publicfn.moveOtherItem($(changeItem),item.value.rex,item.value.rey);
			}
			if(item.value.eleType == "image"){		
				$(changeItem).attr("width",toNumFix(item.value.rewidth));
				$(changeItem).attr("height",toNumFix(item.value.reheight));
			}
		}else if(item.evenntType == "panel"){//面板
			if(item.value.eleAttr == "text"){
				changeItem.text(item.value.reval);
			}else if(item.value.eleAttr == "imageContent"){
				createCode(item.value.reval);
				var imgSrc = saveImageInfo();
				$(changeItem.node).attr("href",imgSrc);
				$(changeItem.node).attr("imgdata",item.value.reval);
			}else if(item.value.eleAttr == "width" || item.value.eleAttr == "height"){			
				changeItem.attr("width",item.value.reval);
				changeItem.attr("height",item.value.reval);
			}else if(item.value.eleAttr == "font-size"){
				changeItem.attr(item.value.eleAttr,item.value.reval);
				changeItem.attr("x",Number(mmtranslate($("#text-x").val(),"x")).toFixed(2));
				changeItem.attr("y",Number(mmtranslate($("#text-y").val(),"y")).toFixed(2));
				changeItem.attr("dy",returnDy(item.value.reval));
			}else{
				changeItem.attr(item.value.eleAttr,item.value.reval);
			}
			
			if(svgItem.param.rectSel){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
			}
			changeItem.selectize().resize();
			svgItem.param.rectSel = changeItem;
			switch(item.value.eleType){
			case "line":
				showLineMsg(changeItem);
				break;
			case "text":
				showTextMsg(changeItem);
				break;
			case "image":
				showImageMsg(changeItem);
				break;	
			default:
				return false;
			}
		}else{
			return ;
		}
		historyDo.refn.pushRedo(item);
	},
	clear : function(){//清空反撤销数组
		historyDo.pare.redoArr.length = 0;
	}
}
//撤销与反撤销共用
historyDo.publicfn = {
	moveLineItem : function(item,x1,x2,y1,y2){
		item.attr("x1",toNumFix(x1));
		item.attr("x2",toNumFix(x2));
		item.attr("y1",toNumFix(y1));
		item.attr("y2",toNumFix(y2));
	},
	moveOtherItem : function(item,x,y){
		item.attr("x",toNumFix(x));
		item.attr("y",toNumFix(y));
	}
}

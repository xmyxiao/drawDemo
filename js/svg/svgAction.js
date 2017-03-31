/* 主要是右侧菜单的信息显示
 * 键盘对svg图像的修改
 * 右侧信息修改反馈图像
 * 键盘操作
 * */
(function(global){
	var svgChange;
	svgChange = global.svgChange = {};
})(this);

$(function (){
	/*var docElm = document.documentElement;
	if (docElm.webkitRequestFullScreen) {
		docElm.webkitRequestFullScreen(); 
	}*/
	//window.document.oncontextmenu = norightclick;//禁用鼠标右键
	window.document.onkeydown = disableKeyClick; 
	//获取鼠标位置
	$('body').mousemove(function(e) {
		svgItem.param.mouseX = e.originalEvent.x || e.originalEvent.layerX || 0; 
		svgItem.param.mouseY = e.originalEvent.y || e.originalEvent.layerY || 0; 
	});
	//双击不选中文字
	$(".draginput input.nosel").bind("dblclick",function(event){
	    if(document.selection && document.selection.empty) {
	        document.selection.empty();
	    }else if(window.getSelection) {
	        var sel = window.getSelection();
	        sel.removeAllRanges();
	    }
	});
	//绑定输入框事件
	$(".draginput input").on("dblclick",function(){
		$(this)[0].removeAttribute("readonly");
	});
	//输入框失去焦点
	$(".draginput input").blur(function(){
		$(this).attr("readonly","readonly");
	});
	//输入框数值改变
	$(".draginput input").on("change",function(){
		if($(this).attr("id")=="text-name" || $(this).attr("id")=="line-name" || $(this).attr("id")=="image-name"){//name属性
			svgChange.changeName($(this).val(),this);
		}
		else if($(this).attr("id")=="image-data"){//二维码内容
			svgChange.imageContent($(this).val());
		}
		else if($(this).attr("id")=="text-x"){//文字x方向
			svgChange.textX($(this).val());
		}
		else if($(this).attr("id")=="text-y"){//文字y方向
			svgChange.textY($(this).val());
		}
		else if($(this).attr("id")=="text-width"){//文字宽度
			svgChange.textWidth($(this).val());
		}
		else if($(this).attr("id")=="text-height"){//文字高度
			svgChange.textHeight($(this).val());
		}
		else if($(this).attr("id")=="text-fontSize"){//字号
			svgChange.textFontSize($(this).val());
		}
		else if($(this).attr("id")=="image-x"){//图片x方向
			svgChange.imageX($(this).val());
		}
		else if($(this).attr("id")=="image-y"){//图片y方向
			svgChange.imageY($(this).val());
		}
		else if($(this).attr("id")=="image-width"){//图片宽
			svgChange.imageWidth($(this).val());
		}
		else if($(this).attr("id")=="image-height"){//图片高
			svgChange.imageHeight($(this).val());
		}
		else if($(this).attr("id")=="line-x1"){//线开始x
			svgChange.lineX1($(this).val());
		}
		else if($(this).attr("id")=="line-y1"){//线开始y
			svgChange.lineY1($(this).val());
		}
		else if($(this).attr("id")=="line-x2"){//线结束x
			svgChange.lineX2($(this).val());
		}
		else if($(this).attr("id")=="line-y2"){//线结束y
			svgChange.lineY2($(this).val());
		}
		else if($(this).attr("id")=="line-width"){//线宽
			svgChange.lineWidth($(this).val());
		}
	});
	//输入框数值实时改变
	$(".draginput input").bind("input propertychange", function () {
		if($(this).attr("id")=="text-content"){//文字内容
			svgChange.textContent($(this).val());
		}
	});
	//字体改变
	$("#text-family").change(function(){
		var textFamily = $(this).children('option:selected').val();
		if(svgItem.param.rectSel){
			var SvgItem = svgItem.param.rectSel;
			getPanelChange(SvgItem,"font-family");
			SvgItem.attr("font-family",textFamily);
		}
	});
	//文字换行
	$("#text-row").change(function(){
		var row = $(this).children('option:selected').val();
		if(svgItem.param.rectSel){
			var SvgItem = svgItem.param.rectSel;
			getPanelChange(SvgItem,"data-row");
			SvgItem.attr("data-row",row);
			if(row == "true"){
				$("#text-width").val(pxtranslate(SvgItem.attr("width"),"x"));
				$("#text-height").val(pxtranslate(SvgItem.attr("height"),"y"));
				var row = setTextRow(Number(SvgItem.attr("width")).toFixed(2),SvgItem.attr("font-size"),SvgItem.text());
		    	SvgItem.clear();
	    		SvgItem.text(function(add) {
	    			for(var i = 0; i < row.length; i++){
						add.tspan(row[i]).newLine();
					}
				});
				$("#text-panel .draginput-textWidth").removeClass("hidden");
				$("#text-panel .draginput-textHeight").removeClass("hidden");
			}else{
				$("#text-panel .draginput-textWidth").addClass("hidden");
				$("#text-panel .draginput-textHeight").addClass("hidden");
				var pare = "";
				if($(SvgItem.node).find("tspan").length > 0){
					for(var i =0;i<$(SvgItem.node).find("tspan").length;i++){
						pare += $($(SvgItem.node).find("tspan")[i]).text();
					}
				}else{
					pare = SvgItem.text();
				}
				SvgItem.clear();
				SvgItem.plain(pare);
			}
		}
	});	
	//下拉框
	$("#svgSelect").change(function(){
		var svgSelect;
		if($(this).val() != "未选中"){
			var svgSelect ;
			for(var i = 0 ; i < svgItem.param.idArr.length; i++){
				if($(this).val() == svgItem.param.idArr[i].id){
					svgSelect = svgItem.param.idArr[i].itemNode;
					break;
				}
			}
			stopRectSel();
			svgItem.param.rectSel = svgSelect;
			svgSelect.selectize().resize();
			switch(svgSelect.type){
			case "text":
				showTextMsg();
				break;
			case "line":
				showLineMsg();
				break;
			case "image":
				showImageMsg();
				break;	
			default:
				return false;
			}
		}else{
			stopRectSel();
			showCanveMsg();
		}
	});
});
//更改svg图像
svgChange = {
	//改变name属性
	changeName : function(para,that){
		var SvgItem = svgItem.param.rectSel,num,isChange = true,item = that;
		for(var i in svgItem.param.idArr){
			if(svgItem.param.rectSel.attr("id")==svgItem.param.idArr[i].id){
				num = i;
				break;
			}
		}
		if(para.length==0){
			para = svgItem.param.idArr[num].name;
		}else if(para == svgItem.param.idArr[num].name){
			return;
		}else{
			for(var i in svgItem.param.idArr){
				if(para == svgItem.param.idArr[i].name){
					isChange = false;
					break;
				}
			}
			if(isChange){
				svgItem.param.idArr[num].name = para;
			}else{
				$.messager.alert("提示","这个名称已被使用！","info");
				para = svgItem.param.idArr[num].name;
			}
		}
		if(para != SvgItem.attr("name")){
			getPanelChange(SvgItem,"name");
		}
		$(item).val(para);
		SvgItem.attr("name",para);
	},
	//字号改变
	textFontSize : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "10.5";
		}
	    if(isNumber(para)){
	    	getPanelChange(SvgItem,"font-size");
	  		SvgItem.attr("font-size",Number(para).toFixed(2)+"pt");
	  		SvgItem.attr("x",Number(mmtranslate($("#text-x").val(),"x")).toFixed(2));
	  		SvgItem.attr("dy",returnDy(Number(para).toFixed(2)+"pt"));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	//文字内容改变
	textContent : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "点击修改";
		}
		getPanelChange(SvgItem,"text");

		var row = setTextRow(Number(SvgItem.attr("width")),SvgItem.attr("font-size"),para);
    	SvgItem.clear();
		SvgItem.text(function(add) {
			for(var i = 0; i < row.length; i++){
				add.tspan(row[i]).newLine();
			}
		});
	},
	textX : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
	    if(isNumber(para)){
	    	getPanelChange(SvgItem,"x");
	  		SvgItem.attr("x",Number(mmtranslate(para,"x")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	textY : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
	    if(isNumber(para)){
	    	getPanelChange(SvgItem,"y");
	    	SvgItem.attr("y",Number(mmtranslate(para,"y")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	textWidth : function(para){  //文本长度
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = SvgItem.attr("width");
		}
	    if(isNumber(para)){
	    	getPanelChange(SvgItem,"width");
	    	SvgItem.attr("width",Number(mmtranslate(para,"y")).toFixed(2));
	    	var pare = "";
	    	if($(SvgItem.node).find("tspan").length > 0){
				for(var i =0;i<$(SvgItem.node).find("tspan").length;i++){
					pare += $($(SvgItem.node).find("tspan")[i]).text();
				}
			}else{
				pare =  SvgItem.text();
			}
	    	var row = setTextRow(Number(mmtranslate(para,"y")).toFixed(2),SvgItem.attr("font-size"),pare);
	    	SvgItem.clear();
    		SvgItem.text(function(add) {
    			for(var i = 0; i < row.length; i++){
					add.tspan(row[i]).newLine();
				}
			});
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	textHeight : function(para){  //文本高度
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = SvgItem.attr("height");
		}
	    if(isNumber(para)){
	    	getPanelChange(SvgItem,"height");
	    	SvgItem.attr("height",Number(mmtranslate(para,"y")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	//二维码内容改变
	imageContent : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "";
		}
		createCode(para);
		var imgSrc = saveImageInfo();
		getPanelChange(SvgItem,"imageContent");
		$(SvgItem.node).attr("href",imgSrc);
		$(SvgItem.node).attr("imgdata",para);
	},
	imageX : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"x");
	  		SvgItem.attr("x",Number(mmtranslate(para,"x")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	imageY : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"y");
	  		SvgItem.attr("y",Number(mmtranslate(para,"y")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	imageWidth : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "1";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"width");
	  		SvgItem.attr("width",Number(mmtranslate(para,"x")).toFixed(2));
	  		svgChange.imageDisHandW(para,0,"mm");
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	imageHeight : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "1";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"height");
	  		SvgItem.attr("height",Number(mmtranslate(para,"y")).toFixed(2));
	  		svgChange.imageDisHandW(0,para,"mm");
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	imageDisHandW : function(paraX,paraY,conversion){//宽高保持一致
		var SvgItem = svgItem.param.rectSel;
		if(paraX>paraY){
			if(conversion == "mm"){
				SvgItem.attr("height",Number(mmtranslate(paraX,"y")).toFixed(2));
			}else if(conversion == "px"){
				SvgItem.attr("height",Number(paraX).toFixed(2));
			}
		}else if(paraX<paraY){
			if(conversion == "mm"){
				SvgItem.attr("width",Number(mmtranslate(paraY,"x")).toFixed(2));
			}else if(conversion == "px"){
				SvgItem.attr("width",Number(paraY).toFixed(2));
			}
		}else{
			return ;
		}
		showImageMsg();
	},
	//线条改变
	lineX1 : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"x1");
	  		SvgItem.attr("x1",Number(mmtranslate(para,"x")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	lineY1 : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"y1");
	  		SvgItem.attr("y1",Number(mmtranslate(para,"y")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	lineX2 : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"x2");
	  		SvgItem.attr("x2",Number(mmtranslate(para,"x")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	lineY2 : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "0";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"y2");
	  		SvgItem.attr("y2",Number(mmtranslate(para,"y")).toFixed(2));
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	},
	lineWidth : function(para){
		var SvgItem = svgItem.param.rectSel;
		if(para.length==0){
			para = "2";
		}
		if(isNumber(para)){
			getPanelChange(SvgItem,"stroke-width");
	  		SvgItem.attr("stroke-width",Number(para).toFixed(2)+"pt");
	    }else{
	    	$.messager.alert("提示","输入格式不正确！","info");
	    }
	}
}

//线条消息显示
function showLineMsg(){
	var line = svgItem.param.rectSel;
	$("#tools-top").children("div").attr("style","display:none");
	$("#line-panel").attr("style","display:block");
	$("#line-x1").val(pxtranslate(line.attr("x1"),"x"));
	$("#line-y1").val(pxtranslate(line.attr("y1"),"y"));
	$("#line-x2").val(pxtranslate(line.attr("x2"),"x"));
	$("#line-y2").val(pxtranslate(line.attr("y2"),"y"));
	$("#line-name").val(line.attr("name"));
	
	if(line.attr("stroke-width").split("pt").length>0){
		$("#line-width").val(line.attr("stroke-width").split("pt")[0]);
	}else{
		$("#line-width").val(line.attr("stroke-width"));
	}
	$("#svgSelect").val(line.attr("id"));
}
//面板消息显示
function showCanveMsg(){
	$("#tools-top").children("div").attr("style","display:none");
	$("#canvas-panel").attr("style","display:block");
	$("#svgSelect").val("未选中");
}
//文字消息显示
function showTextMsg(){
	var text = svgItem.param.rectSel;
	$("#tools-top").children("div").attr("style","display:none");
	$("#text-panel").attr("style","display:block");
	$("#text-x").val(pxtranslate(text.attr("x"),"x"));
	$("#text-y").val(pxtranslate(text.attr("y"),"y"));
	if(text.attr("font-size").split("pt").length>0){
		$("#text-fontSize").val(text.attr("font-size").split("pt")[0]);
	}else{
		$("#text-fontSize").val(text.attr("font-size"));
	}
	$("#text-content").val(text.text());
	$("#text-name").val(text.attr("name"));
	$("#text-family").val(text.attr("font-family"));
	$("#svgSelect").val(text.attr("id"));
}
//图片消息显示
function showImageMsg(){
	var image = svgItem.param.rectSel;
	$("#tools-top").children("div").attr("style","display:none");
	$("#image-panel").attr("style","display:block");
	$("#image-x").val(pxtranslate(image.attr("x"),"x"));
	$("#image-y").val(pxtranslate(image.attr("y"),"y"));
	$("#image-width").val(pxtranslate(image.attr("width"),"x"));
	$("#image-height").val(pxtranslate(image.attr("height"),"y"));
	$("#image-name").val(image.attr("name"));
	$("#image-data").val(image.attr("imgdata"));
	$("#svgSelect").val(image.attr("id"));
}
//删除选中元素
function delSelectElement(){
	if(svgItem.param.rectSel){
		var itemId = svgItem.param.rectSel.id();
		$("#svgSelect").find("option").each(function(){
			if($(this).val() == itemId){
				$(this).remove();
			}
		});
		historyDo.getfn.del(svgItem.param.rectSel);
		svgItem.param.rectSel.remove();
		stopRectSel();
		showCanveMsg();
	}
}
//禁用鼠标右键
function norightclick(e){ 
	if (window.Event){
	    if (e.which == 2 || e.which == 3) {
	   		return false; 
	    }
	} 
}
//禁用键盘按键以及启用delete键
//ctrl+c  ctrl+v ctrl+z
function disableKeyClick(e){
	/*if(window.event && window.event.keyCode == 122){//F11
    	return false;
    }
    if(window.event && window.event.keyCode == 123){//F12
    	return false;
    }*/
    var keyCode = e.keyCode || e.which || e.charCode;
    var ctrlKey = e.ctrlKey || e.metaKey;
    if(ctrlKey && keyCode == 67) {//ctrl+c  复制元素
        if(svgItem.param.rectSel){
        	svgItem.param.copySelectedElements = svgItem.param.rectSel;
        }
    }
    if(ctrlKey && keyCode == 86) {//ctrl+v  粘贴元素
       if(svgItem.param.copySelectedElements){
       		pasteSelected();
       }
    }
    if(ctrlKey && keyCode == 90) {//ctrl+z  撤销操作
        historyDo.unfn.popUndo();
    }
    if(ctrlKey && keyCode == 89) {//ctrl+y  反撤销操作
    	historyDo.refn.popRedo();
    }
    
    if(window.event && window.event.keyCode == 46){//Delete
    	var obj = event.target || event.srcElement;
    	if(obj.tagName == "INPUT"){
    		return;
    	}else{
    		delSelectElement();
    	}
    }
}
//粘贴元素
function pasteSelected(){
	if(!svgItem.param.copySelectedElements){
		return false;
	}
	var mouse = {
		x : svgItem.param.mouseX,
		y : svgItem.param.mouseY
	}
		
	var svgDraw = {//画板起点与终点
		startX : $("#drawing svg").offset().left,
		startY : $("#drawing svg").offset().top,
		endX : $("#drawing svg").offset().left + $("#drawing svg").width(),
		endY : $("#drawing svg").offset().top + $("#drawing svg").height()
	}
	var obj = svgItem.param.copySelectedElements;
	if(svgItem.param.copySelectedElements.type == "line"){
		var x1 = obj.attr("x1") || "0",
			x2 = obj.attr("x2") || "0",
			y1 = obj.attr("y1") || "0",
			y2 = obj.attr("y2") || "0";
		
		var item = {//被复制元素宽高
			width : x1>x2 ? (x1-x2)/2 : (x2-x1)/2,
			height : y1>y2 ? (y1-y2)/2 : (y2-y1)/2
		}
	}else if(svgItem.param.copySelectedElements.type == "image"){
		var item = {//被复制元素宽高
			width : svgItem.param.copySelectedElements.width(),
			height : svgItem.param.copySelectedElements.height()
		}
	}else{
		var item = {//被复制元素宽高
			width : svgItem.param.copySelectedElements.node.scrollWidth,
			height : svgItem.param.copySelectedElements.node.scrollHeight
		}
	}
	
	var isx,isy;
	
	if(mouse.x >= Number(svgDraw.startX) && mouse.x <= (svgDraw.endX)){
		isx = true;
	}else{
		isx = false;
	}
	if(mouse.y >= Number(svgDraw.startY) && mouse.y <= (svgDraw.endY)){
		isy = true;
	}else{
		isy = false;
	}
	var point = pastePoint(mouse,svgDraw,item,isx,isy);
	
	if(obj.type == "line" ){//线
		var width = x1>x2 ? (x1-x2)/2 : (x2-x1)/2;
		var height = y1>y2 ? (y1-y2)/2 : (y2-y1)/2;
		var objParam = {
			x1 : x1>x2 ? Number(point.x + width) : (point.x - width),
			x2 : x1>x2 ? Number(point.x - width) : (point.x + width),
			y1 : y1>y2 ? Number(point.y + height) : (point.y - height),
			y2 : y1>y2 ? Number(point.y - height) : (point.y + height),
			transform : obj.attr("transform") || "",
			className : obj.attr("class") || "",
			stroke : obj.attr("stroke") || "#000",
			name : "",
			pt : obj.attr("pt") || "1",
			strokeWidth : obj.attr("stroke-width") || "2pt"
		}
		createLine(objParam);
	}
	if(obj.type == "text"){//文本
		var objParam = {
			x : point.x,
			y : point.y,
			className : obj.attr("class") || "",
			fontSize: obj.attr("font-size") || "",
			content : obj.text(),
			name : "",
			fontFamily : obj.attr("font-family") || "Helvetica, Arial, sans-serif"
		}
		createText(objParam);
	}
	if(obj.type == "image" ){//二维码
		var objParam = {
			x : point.x,
			y : point.y,
			className : obj.attr("class") || "",
			width : obj.attr("width") || "0",
			height : obj.attr("height"),
			name : "",
			href : obj.attr("xlink:href") || obj.attr("href"),
			data : obj.attr("imgdata") || "",
			type : obj.attr("imgType") || "",
		}
		createImg(objParam);
	}
}
//判断是否是数字
function isNumber(para){
	var reg = /^\d+(\.\d+)?$/;
	return reg.test(para);
}
//生成标尺
function updateRulers(scanvas, zoom) {
	var workarea = document.getElementById("drawBox");
	
	if(!zoom) zoom = 1;
	if(!scanvas) scanvas = $("#drawing");
	
	var limit = 30000;
	
	var c_elem = svgItem.param.draw.node;
	
	var unit = 1 // 1 = 1px
  
	for(var d = 0; d < 2; d++) {
	    var is_x = (d === 0);
	    var dim = is_x ? 'x' : 'y';
	  	unit = is_x ? mmtranslate(1,'x') : mmtranslate(1,'y');
	  	var lentype = is_x?'width':'height';
	  	var content_d = c_elem.getAttribute(dim)-0;
	  
	  	var $hcanv_orig = $('#ruler_' + dim + ' canvas:first');
	  
	  	// Bit of a hack to fully clear the canvas in Safari & IE9
	  	$hcanv = $hcanv_orig.clone();
	  	$hcanv_orig.replaceWith($hcanv);
	  
	  	var hcanv = $hcanv[0];
	  
	  	var rulWidth,rulHeight;
	  	if($("#drawing").width()>$("#drawBox").width()){
	  		rulWidth = $("#drawing").width();
	  	}else{
	  		rulWidth = $("#drawBox").width();
	  	}
	  
	  	if($("#drawing").height()>$("#drawBox").height()){
	  		rulHeight = $("#drawing").height();
	  	}else{
	  		rulHeight = $("#drawBox").height();
	  	}
	  	// Set the canvas size to the width of the container
	  	var ruler_len = is_x ? rulWidth : rulHeight; 
	  	var total_len = ruler_len;
	  	hcanv.parentNode.style[lentype] = total_len + 'px';
	  
	  	var canv_count = 1;
	  	var ctx_num = 0;
	  	var ctx_arr;
	  	var ctx = hcanv.getContext("2d");
	  
		ctx.fillStyle = "rgb(200,0,0)"; 
		ctx.fillRect(0,0,hcanv.width,hcanv.height); 
	  
	  	// Remove any existing canvasses
		$hcanv.siblings().remove();
	  
	  	// Create multiple canvases when necessary (due to browser limits)
	  	if(ruler_len >= limit) {
			var num = parseInt(ruler_len / limit) + 1;
			ctx_arr = Array(num);
			ctx_arr[0] = ctx;
			for(var i = 1; i < num; i++) {
		  		hcanv[lentype] = limit;
		  		var copy = hcanv.cloneNode(true);
		  		hcanv.parentNode.appendChild(copy);
		  		ctx_arr[i] = copy.getContext('2d');
			}
		
			copy[lentype] = ruler_len % limit;
		
			// set copy width to last
			ruler_len = limit;
	  	}
	  
	 	hcanv[lentype] = ruler_len;
	  
	  	var u_multi = unit * zoom;
	  
	  	// Calculate the main number interval
	  	var raw_m = 50 / u_multi;
	  	var multi = 1;
	  	var r_intervals = [];
      	for(var i = .1; i < 1E5; i *= 10) {
       		r_intervals.push(1 * i);
        	r_intervals.push(2 * i);
        	r_intervals.push(5 * i);
      	}
	  	for(var i = 0; i < r_intervals.length; i++) {
			var num = r_intervals[i];
			multi = num;
			if(raw_m <= num) {
			  break;
			}
	  	}
	  
	  	var big_int = multi * u_multi;
	  	ctx.font = "normal 9px 'Lucida Grande', sans-serif";
	  	ctx.fillStyle = "#777";

	  	var ruler_d = ((content_d / u_multi) % multi) * u_multi;
	  	var label_pos = ruler_d - big_int;
	  	for (; ruler_d < total_len; ruler_d += big_int) {
			label_pos += big_int;
			var real_d = ruler_d - content_d;

			var cur_d = Math.round(ruler_d) + .5;
			if(is_x) {
		  		ctx.moveTo(cur_d, 18);
		  		ctx.lineTo(cur_d, 0);
			} else {
		  		ctx.moveTo(18, cur_d);
		  		ctx.lineTo(0, cur_d);
			}

			var num = (label_pos - content_d) / u_multi;
			var label;
			if(multi >= 1) {
			  	label = Math.round(num);
			} else {
			 	var decs = (multi+'').split('.')[1].length;
			  	label = num.toFixed(decs)-0;
			}
			
			// Do anything special for negative numbers?
			// var is_neg = label < 0;
			// real_d2 = Math.abs(real_d2);
			
			// Change 1000s to Ks
			if(label !== 0 && label !== 1000 && label % 1000 === 0) {
			  	label = (label / 1000) + 'K';
			}
			
			if(is_x) {
			  	ctx.fillText(label, ruler_d+2, 8);
			  	ctx.fillStyle = "#777";
			} else {
			  	var str = (label+'').split('');
			  	for(var i = 0; i < str.length; i++) {
					ctx.fillText(str[i], 1, (ruler_d+9) + i*9);
					ctx.fillStyle = "#777";
			  	}
			}
			
			var part = big_int / 10;
			for(var i = 1; i < 10; i++) {
			  	var sub_d = Math.round(ruler_d + part * i) + .5;
			  	if(ctx_arr && sub_d > ruler_len) {
					ctx_num++;
					ctx.stroke();
					if(ctx_num >= ctx_arr.length) {
				  		i = 10;
				  		ruler_d = total_len;
				  		continue;
					}
					ctx = ctx_arr[ctx_num];
					ruler_d -= limit;
					sub_d = Math.round(ruler_d + part * i) + .5;
			  	}
			  
				var line_num = (i % 2)?12:10;
			  	if(is_x) {
					ctx.moveTo(sub_d, 18);
					ctx.lineTo(sub_d, line_num);
			  	} else {
					ctx.moveTo(18, sub_d);
					ctx.lineTo(line_num ,sub_d);
			  	}
			}
	  	}
	  	ctx.strokeStyle = "#666";
	  	ctx.stroke();
	}
  }

//粘贴时的起始点
function pastePoint(mouse,svgDraw,item,isx,isy){
	var point = {
		x : 0,
		y : 0
	}
	if(isx){
		if(Number(mouse.x + item.width) > svgDraw.endX){
			point.x = svgDraw.endX - item.width - svgDraw.startX;
		}else{
			point.x = mouse.x - svgDraw.startX;
		}
	}else{
		point.x = Number(svgDraw.startX + svgDraw.endX)/2 - svgDraw.startX;
	}
	if(isy){
		if(Number(mouse.y + item.height) > svgDraw.endY){
			point.y = svgDraw.endY - item.height - svgDraw.startY;
		}else{
			point.y = mouse.y - svgDraw.startY;
		}
	}else{
		point.y = Number(svgDraw.startY + svgDraw.endY)/2 - svgDraw.startY;
	}
	if(svgItem.param.copySelectedElements.type != "line"){
		point.x -=  item.width/2;
		point.y -=  item.height/2;
	}
	return point;
}

/* 主要是左侧菜单的功能实现
 * svg图像的创建绑定拖动选中
 * svg图像的缩放保存
 * 二维码图片的引入
 * */
(function(global){
	var svgItem;
	svgItem = global.svgItem = {};
	svgItem.param = {
		httpAddress : null,
		rectSel : null,   //选中元素
		draw : null,      //画板
		idArr : new Array,
		dpiArr : new Array,
		copySelectedElements : null,
		mouseX : null,
		mouseY : null
	}
	svgItem.saveParam = {
		width : null,
		height : null,
		name : null,
		resolution :null,
		guid : null,
		content : null,
		type : null,
		remark : null,
		author : null,
		pageRate : "1"
	}
})(this);
$(function (){  
	svgItem.param.httpAddress = ""   //获取地址
	svgItem.param.dpiArr = getDPI(); //获取分辨率
	
	var x = 100,
		y = 100;
		svgItem.saveParam.name = "未命名方案",
		svgItem.saveParam.type = "create",
		svgItem.saveParam.resolution = svgItem.param.dpiArr[0],
		svgItem.saveParam.remark = "备注",
		svgItem.saveParam.guid = "guid";
		
	svgItem.saveParam.width = x;
	svgItem.saveParam.height = y;
	
	x = x + "mm";
	y = y + "mm";
	
	setContentTitle(svgItem,x,y);
	
	$("#canvas-width").val(x);
	$("#canvas-height").val(y);
	
	svgItem.param.draw = SVG('drawing').size(x, y);
	svgItem.param.draw.addClass("board");
	//页面显示宽高
	svgItem.saveParam.pageWidth = $("#drawing svg").width();
	svgItem.saveParam.pageHeight = $("#drawing svg").height();
	
	svgItem.param.draw.attr("viewBox","0 0 "+svgItem.saveParam.pageWidth+" "+svgItem.saveParam.pageHeight+"");
	resizeSvgMargin();
	
	updateRulers(true,1);//绘制标尺
	
    $(document).click(function (e) {
    	e.preventDefault();
		e.stopPropagation();
		var e = window.event;
		if(!e)return;
        //获取元素
        var obj = e.target || e.srcElement;
		if(svgItem.param.rectSel){
			if(obj!=svgItem.param.rectSel.node && obj == $("#drawing svg")[0]){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
				showCanveMsg();
			}
		}
	});
	//标尺重绘
	$(".layout-button-left").click(function(){
		updateRulers(true,svgItem.saveParam.pageRate);
	});
	$(".layout-button-right").click(function(){
		updateRulers(true,svgItem.saveParam.pageRate);
	});
	$(window).resize(function() {
	    updateRulers(true,svgItem.saveParam.pageRate);
	});
});
//长方体
function createRect(){
	var rect = svgItem.param.draw.rect(2,100).attr('x', 50);
	rect.addClass("board-rect");
	rect.draggable();
	rect.on('dblclick',function(){
		rect.selectize().resize();
		svgItem.param.rectSel = rect;
	});
}
//文本
function createText(objParam){
	if(objParam){
		var text = svgItem.param.draw.plain(objParam.content);
		objParam.fontSize = objParam.fontSize || "8pt";
		text.addClass(objParam.classname);
		text.attr("x",objParam.x);
	    text.attr("y",objParam.y);
	    text.attr("dy",objParam.dy);
	    text.attr("font-size",objParam.fontSize);
	    if(objParam.name==""){
			objParam.name = getSvgName(text.attr("id"));
		}
	    text.attr("name",objParam.name);
	    text.attr("font-family",objParam.fontFamily);
	    textOnEvent(text);
	}else{
		$.messager.prompt("操作提示", "请输入文本内容", function (str) {
			if(str!=""&&str){
				var text = svgItem.param.draw.plain(str);
				text.addClass("board-text");
			    text.attr('y',50);
			    text.attr('font-size',"8pt");
			    text.attr("dy","8.66");
			    text.attr("font-family","宋体");
			    text.attr("name",getSvgName(text.attr("id")));
			    textOnEvent(text);
			}
		});
	}
}
//图片
function createImg(objParam){
	if(objParam){
		var image = svgItem.param.draw.image("", objParam.width, objParam.height);
		image.addClass(objParam.classname);
		image.attr("x",objParam.x);
		image.attr("y",objParam.y);
		image.attr("href",objParam.href);
		 if(objParam.name==""){
			objParam.name = getSvgName(image.attr("id"));
		}
		image.attr("name",objParam.name);
		image.attr("imgdata",objParam.data);
		image.attr("imgType",objParam.type);
		imageOnEvent(image);
	}else{
		$.messager.prompt("操作提示", "请输入二维码内容", function (str) {
			if(str!=""&&str){
				createCode(str);
				var imgSrc = saveImageInfo();
				var image = svgItem.param.draw.image(imgSrc, 100, 100);
				image.addClass("board-image");
				image.attr("name",getSvgName(image.attr("id")));
				image.attr("imgdata",str);
				image.attr("imgType","qrCode");
				imageOnEvent(image);
			}
		});
	}
}
//线
function createLine(objParam){
	if(objParam){
		var line = svgItem.param.draw.line(objParam.x1, objParam.y1, objParam.x2, objParam.y2).stroke({ width: objParam.strokeWidth });
		line.addClass(objParam.className);
		if(objParam.name==""){
			objParam.name = getSvgName(line.attr("id"));
		}
		line.attr("name",objParam.name);
		line.attr("pt",objParam.pt);
		if(objParam.transform!=""){
			line.attr("transform",objParam.transform);
		}
	}else{
		var line = svgItem.param.draw.line(10, 10, 10, 150).stroke({ width: 1 });	
		line.addClass("board-line");
		line.attr("name",getSvgName(line.attr("id")));
		line.attr("pt","1");
		line.attr("stroke-width","1pt");
	}
	lineOnEvent(line);
}
//横线
function createLineTran(){
	var line = svgItem.param.draw.line(10, 10, 150, 10).stroke({ width: 1 });	
	line.addClass("board-line");
	line.addClass("board-lineTran");
	line.attr("name",getSvgName(line.attr("id")));
	line.attr("pt","1");
	line.attr("stroke-width","1pt");
	lineOnEvent(line);
}
//二维码图片地址
function saveImageInfo(){
	var mycanvas = $("#qrcode canvas");
	if(mycanvas[0]){
		var image = mycanvas[0].toDataURL("image/png");  
		mycanvas[0].remove();
		return image;
	}
}
//二维码生成支持中文
function toUtf8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;   
    for(i = 0; i < len; i++) {
    	c = str.charCodeAt(i);
    	if ((c >= 0x0001) && (c <= 0x007F)) {
        	out += str.charAt(i);
    	} else if (c > 0x07FF) {
        	out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        	out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
        	out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    	} else {
        	out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
        	out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
    	}
    }
    return out;
}
//生成二维码
function createCode(str){
	var str = toUtf8(str);
	$("#qrcode").qrcode({
		render: "canvas",
		width: 200,
		height:200,
		text: str
	});
}
//加载生成图像(参数为字符串)
function rebulidSvg(str){
	var svgStr = str;
	//重新生成线条
	if($(svgStr).find("line").length>0){
		for(var i=0;i<$(svgStr).find("line").length;i++){
			var obj = $($(svgStr).find("line")[i]);
			var objParam = {
				x1 : obj.attr("x1") || "0",
				x2 : obj.attr("x2") || "0",
				y1 : obj.attr("y1") || "0",
				y2 : obj.attr("y2") || "0",
				transform : obj.attr("transform") || "",
				className : obj.attr("class") || "",
				stroke : obj.attr("stroke") || "#000",
				name : obj.attr("name") || getSvgName(obj.attr("id")),
				pt : obj.attr("pt") || "1",
				strokeWidth : obj.attr("stroke-width") || "2pt"
			}
			createLine(objParam);
		}
	}
	
	//重新生成文本
	if($(svgStr).find("text").length>0){
		for(var i=0;i<$(svgStr).find("text").length;i++){
			var obj = $($(svgStr).find("text")[i]);
			var objParam = {
				x : obj.attr("x") || "0",
				y : obj.attr("y") || "0",
				className : obj.attr("class") || "",
				fontSize: obj.attr("font-size") || "",
				content : obj.text(),
				name : obj.attr("name") || getSvgName(obj.attr("id")),
				dy : returnDy(obj.attr("font-size")) || "8.66",
				fontFamily : obj.attr("font-family") || "Helvetica, Arial, sans-serif"
			}
			createText(objParam);
		}
	}
	
	//重新生成二维码
	if($(svgStr).find("image").length>0){
		for(var i=0;i<$(svgStr).find("image").length;i++){
			var obj = $($(svgStr).find("image")[i]);
			var objParam = {
				x : obj.attr("x") || "0",
				y : obj.attr("y") || "0",
				className : obj.attr("class") || "",
				width : obj.attr("width") || "0",
				height : obj.attr("height"),
				name : obj.attr("name") || getSvgName(obj.attr("id")),
				href : obj.attr("xlink:href") || obj.attr("href"),
				data : obj.attr("imgdata") || "",
				type : obj.attr("imgType") || "qrCode",
			}
			createImg(objParam);
		}
	}
	historyDo.pare.undoArr.length = 0;
}
//放大图像
function enlargeSvg(){
	svgItem.saveParam.pageRate = Number(svgItem.saveParam.pageRate) + 0.25;
	var pageWidth = Number(svgItem.saveParam.pageRate) * Number(svgItem.saveParam.pageWidth);
	var pageHeight = Number(svgItem.saveParam.pageHeight) * Number(svgItem.saveParam.pageRate);
	$("#drawing svg").css("width",pageWidth);
	$("#drawing svg").css("height",pageHeight);
	resizeSvgMargin();
	resizeTextY(Number(svgItem.saveParam.pageRate - 0.25));
	updateRulers(true,svgItem.saveParam.pageRate);
}
//缩小图像
function narrowSvg(){
	svgItem.saveParam.pageRate = Number(svgItem.saveParam.pageRate) - 0.25;
	if(svgItem.saveParam.pageRate>0.75){
		var pageWidth = Number(svgItem.saveParam.pageRate) * Number(svgItem.saveParam.pageWidth);
		var pageHeight = Number(svgItem.saveParam.pageHeight) * Number(svgItem.saveParam.pageRate);
		$("#drawing svg").css("width",pageWidth);
		$("#drawing svg").css("height",pageHeight);
		resizeSvgMargin();
		resizeTextY(Number(svgItem.saveParam.pageRate + 0.25));
		updateRulers(true,svgItem.saveParam.pageRate);
	}else{
		svgItem.saveParam.pageRate = Number(svgItem.saveParam.pageRate) + 0.25;
		return ;
	}
}
//改变图像margin-top
function resizeSvgMargin(){
	$("#drawing").attr("style","width: "+$("#drawing svg").width()+"px;");
	if($("#mainContent").height()-$("#drawing svg").height()>0){
		$("#drawing svg").css("margin-top",($("#mainContent").height()-$("#drawing svg").height())/2);
	}else{
		$("#drawing svg").css("margin-top","0");
	}
	//svg上的x与y属性
	var svgWidth,svgHeight;
	if($("#drawBox").width()>$("#drawing svg").width()){
		svgWidth = ($("#drawBox").width()-$("#drawing svg").width())/2
	}else{
		svgWidth = 0;
	}
	if($("#drawBox").height()>$("#drawing svg").height()){
		svgHeight = ($("#drawBox").height()-$("#drawing svg").height())/2
	}else{
		svgHeight = 0;
	}
	$("#drawing svg").attr("x",svgWidth);
	$("#drawing svg").attr("y",svgHeight);
}
//改变text元素的dy坐标
function resizeTextY(rerate){
	var rate = svgItem.saveParam.pageRate;
	$("#drawing text").each(function(){
		var fontSize = $(this).attr("font-size").split("pt")[0] / 0.75;
		if(fontSize*rate > 10 && fontSize*rerate <= 10){
			$(this).attr("dy",parseInt(fontSize));
		}else if(fontSize*rate <= 10 && fontSize*rerate > 10){
			$(this).attr("dy",returnDy($(this).attr("font-size")));
		}
	});
}
//保存svg图像
function saveSvg(){
	var httpAddress = "";
	var	insertUrl = httpAddress + "";
	    updataUrl = httpAddress + ""
	
	svgTomm();
	svgItem.saveParam.content = $("#drawing")[0].innerHTML;
}
//导出图像
function putSvg(){
	var	outputUrl = "";

	svgTomm();
	svgItem.saveParam.content = $("#drawing")[0].innerHTML;
	if(svgItem.saveParam.guid == "null"){
		svgItem.saveParam.guid = "";
	}
	
	var urlStr = outputUrl + "?" + "uid=" + svgItem.saveParam.guid + "&xmlStr=" +svgItem.saveParam.content + "&xmlName=" + $("#drawing svg").attr("id");
	var data = {
		uid : svgItem.saveParam.guid,
		xmlStr : svgItem.saveParam.content,
		xmlName : $("#drawing svg").attr("id")
	}
	window.openPostWindow(outputUrl,data,"导出");
}
//从svg的id获取svg的name属性
function getSvgName(str){
	if(str){
		var name = str.split("Svgjs")[1];
		return name;
	}
}
//获取屏幕分辨率
function getDPI() {
    var arrDPI = new Array();
    if (window.screen.deviceXDPI != undefined) {
        arrDPI[0] = window.screen.deviceXDPI;
        arrDPI[1] = window.screen.deviceYDPI;
    }
    else {
        var tmpNode = document.createElement("DIV");
        tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
        document.body.appendChild(tmpNode);
        arrDPI[0] = parseInt(tmpNode.offsetWidth);
        arrDPI[1] = parseInt(tmpNode.offsetHeight);
        tmpNode.parentNode.removeChild(tmpNode);    
    }
    return arrDPI;
}
//将像素转为毫米
function pxtranslate(pare,type){
	var num;
	if(type == "x" || type == "X"){
		num = Number(pare*25.4/svgItem.param.dpiArr[0]).toFixed(2);
	}else if(type == "y" || type == "Y"){
		num = Number(pare*25.4/svgItem.param.dpiArr[1]).toFixed(2);
	}else{
		num = Number(pare*25.4/((svgItem.param.dpiArr[0] + svgItem.param.dpiArr[1])/2)).toFixed(2);
	}
	return num;
}
//将毫米转为像素
function mmtranslate(pare,type){
	var num;
	if(type == "x" || type == "X"){
		num = Number(pare*svgItem.param.dpiArr[0]/25.4).toFixed(2);
	}else if(type == "y" || type == "Y"){
		num = Number(pare*svgItem.param.dpiArr[1]/25.4).toFixed(2);
	}else{
		num = Number(pare*((svgItem.param.dpiArr[0] + svgItem.param.dpiArr[1])/2)/25.4).toFixed(2);
	}
	return num;
}
//转为毫米单位
function svgTomm(){
	var rate = svgItem.saveParam.pageRate
	$("#drawing text").each(function(){//文字毫米单位
		$(this).attr("mm_x",pxtranslate($(this).attr("x"),"x")+"mm");
		$(this).attr("mm_y",pxtranslate($(this).attr("y"),"y")+"mm");
	});
	$("#drawing image").each(function(){//图片毫米单位
		$(this).attr("mm_x",pxtranslate($(this).attr("x"),"x")+"mm");
		$(this).attr("mm_y",pxtranslate($(this).attr("y"),"y")+"mm");
		$(this).attr("mm_width",pxtranslate($(this).attr("width"),"x")+"mm");
		$(this).attr("mm_height",pxtranslate($(this).attr("height"),"y")+"mm");
	});
	$("#drawing line").each(function(){//线条毫米单位
		$(this).attr("mm_x1",pxtranslate($(this).attr("x1"),"x")+"mm");
		$(this).attr("mm_y1",pxtranslate($(this).attr("y1"),"y")+"mm");
		$(this).attr("mm_x2",pxtranslate($(this).attr("x2"),"x")+"mm");
		$(this).attr("mm_y2",pxtranslate($(this).attr("y2"),"y")+"mm");
	});
}
//保存元素name
function pushNameId(item){
	var svgIdName = {
		id : item.attr("id"),
		name : item.attr("name")
	}
	var value = svgIdName.name.replace(/[^0-9]/ig,""); 
	if(value>0&&value>SVG.did){
		SVG.did = value-0+1;
	}
	svgItem.param.idArr.push(svgIdName);
}
//设置信息
function setContentTitle(svgItem,x,y){
	var html = '<ul><li style="margin-left:12px;"><span>分辨率：</span><span class="headMsg-content" onselectstart="return false">'+svgItem.saveParam.resolution+'</span></li>'
			 + '<li><span>方案名：</span><span class="headMsg-content" onselectstart="return false">'+svgItem.saveParam.name+'</span></li>'
			 + '<li><span>标签宽：</span><span class="headMsg-content" onselectstart="return false">'+x+'</span></li>'
			 + '<li><span>标签高：</span><span class="headMsg-content" onselectstart="return false">'+y+'</span></li></ul>';
	var contentdiv = $(".layout-panel-center .panel-title");
	contentdiv.text("");
	contentdiv.append(html);
}
//文本元素绑定事件
function textOnEvent(text){
	if(text){
		text.draggable();
		historyDo.getfn.add(text);
		text.on('beforedrag', function(event){
			historyDo.pare.x = $(event.target).attr("x") || 0;
			historyDo.pare.y = $(event.target).attr("y") || 0;
			historyDo.pare.transform = $(event.target).attr("transform") || 0;
		});
		text.on('dragend', function(event){//判断是否发生移动
			if(Number(historyDo.pare.x) != Number($(event.target).attr("x")) || Number(historyDo.pare.y) != Number($(event.target).attr("y"))){
				historyDo.getfn.move(event.target);
			}
		});
		text.on("click",function(){
			if(svgItem.param.rectSel){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
			}
			text.selectize().resize();
			text.on('resizedone', function(event){
				if(Number(historyDo.pare.x) != Number($(event.target).attr("x")) 
				|| Number(historyDo.pare.y) != Number($(event.target).attr("y"))
				|| historyDo.pare.transform != $(event.target).attr("transform")){
					historyDo.getfn.change(event);
				}
				showTextMsg();
			});
			svgItem.param.rectSel = text;
	    	showTextMsg();
		});
		pushNameId(text);
	}
}
//图片元素绑定事件
function imageOnEvent(image){
	if(image){
		image.draggable();
		historyDo.getfn.add(image);
		image.on('beforedrag', function(event){
			historyDo.pare.x = $(event.target).attr("x") || 0;
			historyDo.pare.y = $(event.target).attr("y") || 0;
			historyDo.pare.imgWidth = $(event.target).attr("width") || 0;
			historyDo.pare.imgHeight = $(event.target).attr("height") || 0;
			historyDo.pare.transform = $(event.target).attr("transform") || 0;
		});
		image.on('dragend', function(event){//判断是否发生移动
			if(Number(historyDo.pare.x) != Number($(event.target).attr("x")) || Number(historyDo.pare.y) != Number($(event.target).attr("y"))){
				historyDo.getfn.move(event.target);
			}
		});
		image.on('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			if(svgItem.param.rectSel){
				svgItem.param.rectSel.resize('stop');
				svgItem.param.rectSel.selectize(false);
				svgItem.param.rectSel = null;
			}
	        image.selectize().resize();
			image.selectize().resize().draggable();
			image.on('resizedone', function(event){
				if(Number(historyDo.pare.x) != Number($(event.target).attr("x")) 
				|| Number(historyDo.pare.y) != Number($(event.target).attr("y"))
				|| historyDo.pare.transform != $(event.target).attr("transform")
				|| Number(historyDo.pare.imgWidth) != Number($(event.target).attr("width"))
				|| Number(historyDo.pare.imgHeight) != Number($(event.target).attr("height"))){
					historyDo.getfn.change(event);
					var oldWidth = Number(historyDo.pare.imgWidth),
						newWidth = Number($(event.target).attr("width")),
						oldHeight = Number(historyDo.pare.imgHeight),
						newHeight = Number($(event.target).attr("height"));
					var	disHeight = oldHeight > newHeight ? (oldHeight - newHeight) : (newHeight - oldHeight);
						disWidth = oldWidth > newWidth ? (oldWidth - newWidth) : (newWidth - oldWidth);
					if(disHeight > disWidth){
						svgChange.imageDisHandW(0,newHeight,"px");
					}else{
						svgChange.imageDisHandW(newWidth,0,"px");
					}
				}
				showImageMsg();
			});
			svgItem.param.rectSel = image;
			showImageMsg();
		});
		pushNameId(image);
	}
}
//直线元素绑定事件
function lineOnEvent(line){
	line.draggable();
	historyDo.getfn.add(line);
	line.on('beforedrag', function(event){
		historyDo.pare.x = $(event.target).attr("x1") || 0;
		historyDo.pare.y = $(event.target).attr("y1") || 0;
		historyDo.pare.x2 = $(event.target).attr("x2") || 0;
		historyDo.pare.y2 = $(event.target).attr("y2") || 0;
		historyDo.pare.transform = $(event.target).attr("transform") || 0;
	});
	line.on('dragend', function(event){//判断是否发生移动
		if(Number(historyDo.pare.x) != Number($(event.target).attr("x1")) || Number(historyDo.pare.y) != Number($(event.target).attr("y1"))){
			historyDo.getfn.move(event.target);
		}
	});
	line.on('click',function(e){
		e.preventDefault();
		e.stopPropagation();
		if(svgItem.param.rectSel){
			svgItem.param.rectSel.resize('stop');
			svgItem.param.rectSel.selectize(false);
			svgItem.param.rectSel = null;
		}
		line.selectize().resize();
		line.on('resizedone', function(event){
			if(Number(historyDo.pare.x) != Number($(event.target).attr("x1")) 
			|| Number(historyDo.pare.y) != Number($(event.target).attr("y1"))
			|| historyDo.pare.transform != $(event.target).attr("transform")
			|| Number(historyDo.pare.x2) != Number($(event.target).attr("x2"))
			|| Number(historyDo.pare.y2) != Number($(event.target).attr("y2"))){
				historyDo.getfn.change(event);
			}
			showLineMsg();
		});
		svgItem.param.rectSel = line;
		showLineMsg();
	});
	pushNameId(line);
}

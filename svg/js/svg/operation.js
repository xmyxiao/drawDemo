//获取元素的纵坐标 
function getTop(e){ 
	var offset=e.offsetTop; 
	if(e.offsetParent!=null){
		offset+=getTop(e.offsetParent);
	}
	return offset; 
} 
//获取元素的横坐标 
function getLeft(e){ 
	var offset=e.offsetLeft; 
	if(e.offsetParent!=null){
		offset+=getLeft(e.offsetParent);
	}
	return offset; 
} 
//提交
function openPostWindow(url, data, name)  {  
    var tempForm = document.createElement("form");  
    tempForm.id="tempForm1";  
    tempForm.method="post";  
    tempForm.action=url;  
    tempForm.target=name;  
  	for(var key in data){
  		var hideInput = document.createElement("input");  
    	hideInput.type="hidden";  
   		hideInput.name= key
   		hideInput.value= data[key];
   		tempForm.appendChild(hideInput);  
  	}
     
    tempForm.addEventListener("onsubmit",function(){ openWindow(name); });
    document.body.appendChild(tempForm);  
    
    tempForm.submit();
    document.body.removeChild(tempForm);
}
//打开窗口
function openWindow(name){  
	window.open('about:blank',name,'height=400, width=400, top=0, left=0, toolbar=yes, menubar=yes, scrollbars=yes, resizable=yes,location=yes, status=yes');   
}
//返回dy的值
function returnDy(str){
	if(str.split("pt").length>0){
		var dy = Number(str.split("pt")[0] / 0.75 * svgItem.saveParam.pageRate) > 10 ? parseInt(str.split("pt")[0] / 0.75) - 2 : 10;
	}else{
		var dy = parseInt(str.split("pt")[0] / 0.75) - 2;
	}
	return dy
}
//转换为两位小数
function toNumFix(num){
	return Number(num).toFixed(2);
}
//获取文本的页面宽高
function getTextWandh(textSize,textStr){
	var textNode = $("#temporaryText");
	textNode.attr("style","font-size: "+textSize+";");
	textNode.text(textStr);
	var pare = {
		width : textNode.width(),
		height : textNode.height()
	}
	textNode.text("");
	return pare;
}
//删除下拉框选项
function optionDel(itemId){
	$("#svgSelect").find("option").each(function(){
		if($(this).val() == itemId){
			$(this).remove();
		}
	});
}
//添加下拉框选项
function optionAdd(svgItem){
	if(svgItem.nodeName){
		var item = {
			type : svgItem.nodeName,
			id : $(svgItem).attr("id"),
			name : $(svgItem).attr("name")
		}
	}else{
		var item = {
			type : svgItem.type,
			id : $(svgItem.node).attr("id"),
			name : $(svgItem.node).attr("name")
		}
	}
	switch(item.type){
	case "line":
		$("#svgSelect").append("<option value="+item.id+"><span>Line&nbsp;&nbsp;|&nbsp;&nbsp;</span><span>"+item.name+"<span></option>");
		break;
	case "text":
		$("#svgSelect").append("<option value="+item.id+"><span>Text&nbsp;&nbsp;|&nbsp;&nbsp;</span><span>"+item.name+"<span></option>");
		break;
	case "image":
		$("#svgSelect").append("<option value="+item.id+"><span>Image&nbsp;&nbsp;|&nbsp;&nbsp;</span><span>"+item.name+"<span></option>");
		break;	
	default:
		return false;
	}
}
//取消选中
function stopRectSel(){
	if(svgItem.param.rectSel){
		svgItem.param.rectSel.resize('stop');
		svgItem.param.rectSel.selectize(false);
		svgItem.param.rectSel = null;
	}
}
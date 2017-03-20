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

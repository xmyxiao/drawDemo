function initWidgetTool(){
	var widgetTool = {

	}
	thisWidget.editMarkEntitie = true;
	thisWidget.refMarkerList = refMarkerList;
	return widgetTool;
}

// 关闭弹出框
parent.closeMarkerDialog = function(){
	thisWidget.editMarkEntitie = false;
	thisWidget.refMarkerList = null
}
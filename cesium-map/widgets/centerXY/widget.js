
var markerXY = null,markerXYHandler = null;

$(function(){
	$("#btnCenterXY").click(function() {
		var e = $("#point_jd").val(),
			i = $("#point_wd").val(),
			t = $("#point_height").val(),
			config = {
				"center":{
					x: Number(e),
					y: Number(i),
					z: Number(t)
				}
			};
		customMap.widget.centerAt(config);
		centerUpdateMarker(config.center)
	})
	
	if(customMap && customMap.tools && customMap.tools.getCurrentExtent){
		var point = {
			x: customMap.tools.getCurrentExtent().xcenter,
			y: customMap.tools.getCurrentExtent().ycenter,
			z: customMap.tools.getCurrentExtent().height
		};
		centerShowLatlng(point);
	}
	// 点击事件
	markerXYHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
	markerXYHandler.setInputAction(function(e) {
		var cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var longitudeString = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
            var latitudeString = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
            var height = Number(cartographic.height.toFixed(1));
			var center = {
				x: longitudeString,
				y: latitudeString,
				z: height
			}
			centerUpdateMarker(center);
			centerShowLatlng(center);
        } 
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
})
// 更新坐标定位图标位置
function centerUpdateMarker(e) {
	var t = Cesium.Cartesian3.fromDegrees(e.x, e.y, 0 || 0);
	null == markerXY ? markerXY = viewer.entities.add({
		name: "坐标拾取",
		position: t,
		billboard: {
			image: "./widgets/centerXY/img/marker.png",
			horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			scale: .6
		}
	}) : markerXY.position = t;
}
// 显示经纬度和高度
function centerShowLatlng(config){
	var point = config;
	$("#point_jd").val(point.x.toFixed(4));
	$("#point_wd").val(point.y.toFixed(4));
	$("#point_height").val(point.z);
}
// 关闭弹出框
function closeCenterXY(){
	markerXYHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
	markerXYHandler.destroy()
	markerXY && (viewer.entities.remove(markerXY), markerXY = null)
}

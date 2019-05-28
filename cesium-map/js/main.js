$(document).ready(function() {
	if(customMap.tools.canWebgl){
		initMap();
	}else{
		layer.open({
			type: 1,
			title: "当前浏览器WebGL功能无效",
			skin: "layer-mars-dialog animation-scale-up",
			resize: !1,
			area: ["600px", "250px"],
			content: '<div style="margin: 20px;"><h3>系统检测到您使用的浏览器WebGL功能无效！</h3>  <p>1、请您检查浏览器版本，安装使用最新版chrome、火狐或IE11以上浏览器！</p> <p>2、WebGL支持取决于GPU支持，请保证客户端电脑已安装最新显卡驱动程序！</p><p>3、如果上两步骤没有解决问题，说明您的电脑需要更换了！</p></div>'
		})
	}
});

function initMap(){
	$.ajax({
		type: "get",
		url:" ./js/config.json",
		async: true,
		success: function(data){
			customMap.config = data;
			createMapviewer();
			initMapData();
		}
	});
	
}
// 格式化数据
function initMapData(){
	var config = customMap.config;
	var operationallayers = config.customMap.operationallayers;
	for(var i =0, l = operationallayers.length; i < l; i++){
		var item = operationallayers[i];
		// 创建模型图层
		if(!item._layer){
			switch(item.type) {
			    case 'gltf':
			    	item._layer = customMap.widget.addGltfLayer(item);
			    	operationallayers[i] = item;
			        break;
			    case '3dtiles':
			    	item._layer = customMap.widget.add3DtilesLayer(item);
			    	operationallayers[i] = item;
			        break;
			    default:
			       	item._layer = ''
			}
		}
	}
}
// 创建地图
function createMapviewer(){
	var config = customMap.config.customMap;
	// 初始底图
	viewer = new Cesium.Viewer('cesiumContainer',{
		animation: false,           //左下仪表 动画控件
		timeline: false,            //时间轴
		fullscreenButton : true,    //右下全屏
		geocoder: false,            //地名查找控件
		baseLayerPicker: false,     //图层选择控件
		navigationHelpButton: false,//帮助按钮
		imageryProvider: new Cesium.UrlTemplateImageryProvider({url: config.googleUrl})
	})
	// 底部logo
	viewer.cesiumWidget.creditContainer.style.display = 'none';
	
	// 根据太阳位置配置Scene
	viewer.scene.globe.enableLighting = true;
	
	// 创建初始相机视图
	// 传入经度和纬度值  返回Cartesian3位置
	// Cesium.Cartesian3.fromDegrees(longitude, latitude, height, ellipsoid, result)
	var initialPosition = new Cesium.Cartesian3.fromDegrees(config.center.x, config.center.y, config.center.z);
	// 创建摄像机位置
	var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(config.center.heading, config.center.pitch, config.center.roll);
	var homeCameraView = {
	    destination : initialPosition,   //摄像机在坐标中的最终位置或从上到下视图可见的矩形。
	    orientation : {
	        heading : initialOrientation.heading,  // 方位角
	        pitch : initialOrientation.pitch,  // 俯仰角（弧度）
	        roll : initialOrientation.roll  // 翻滚角
	    }
	};
	// 设置初始视图
	viewer.scene.camera.setView(homeCameraView);
	
	// 添加相机飞行动画
	homeCameraView.duration = 5.0;                           //飞行时间（s）
	homeCameraView.maximumHeight = 1500000;                     //飞行最大高度
	homeCameraView.pitchAdjustHeight = 1500000;				 //飞行高度高于这个值时俯视  和一些处理
	homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;   //飞行完成后位置转换
	// 覆盖默认主页按钮
	viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
	    e.cancel = true;
	    viewer.scene.camera.flyTo(homeCameraView);
	});
	initToolBar();
	var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
	// todo：在显示地形情况下点击创建点
	handler.setInputAction(function (event) {
	    if (!Cesium.Entity.supportsPolylinesOnTerrain(viewer.scene)) {
	        console.log('当前浏览器不支持地形图');
	        return;
	    }
	    var earthPosition = viewer.scene.pickPosition(event.position); //获取到地形图上面的坐标
	    if (Cesium.defined(earthPosition)) {
	        createPoint(earthPosition); //调用创建点的方法
	    }
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	// todo：在椭球下点击创建点
	handler.setInputAction(function (event) {
	    var earthPosition = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid); //返回在椭球上面的点的坐标
	    if (Cesium.defined(earthPosition)) {
	        createPoint(earthPosition); //在点击位置添加一个点
	    }
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	// todo：拾取模型表面的位置
	handler.setInputAction(function (evt) {
	    var scene = viewer.scene;
	    var pickedObject = scene.pick(evt.position); //判断是否拾取到模型
	    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
	        var cartesian = viewer.scene.pickPosition(evt.position);
	        if (Cesium.defined(cartesian)) {
	            var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度
	            var lng = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度
	            var lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
	            var height = cartographic.height;//模型高度
	            annotate(cartesian, lng, lat, height);
	        }
	    }
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	var annotations = viewer.scene.primitives.add(new Cesium.LabelCollection());
	
	// 信息提示框
	function annotate(cartesian, lng, lat, height) {
	    createPoint(cartesian);
	    annotations.add({
	        position: cartesian,
	        text:
	            'Lon: ' + lng.toFixed(5) + '\u00B0' +
	            '\nLat: ' + lat.toFixed(5) + '\u00B0' +
	            "\nheight: " + height.toFixed(2) + "m",
	        showBackground: true,
	        font: '14px monospace',
	        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
	        disableDepthTestDistance: Number.POSITIVE_INFINITY
	    });
	}
	
	// 添加点
	function createPoint(worldPosition) {
	    var point = viewer.entities.add({
	        position: worldPosition,
	        point: {
	            color: Cesium.Color.WHITE,
	            pixelSize: 5
	        }
	    });
	    return point;
	}
}
// 创建工具栏
function initToolBar(){
	var config = customMap.config.customMap.toolBar;
	for(var item = {}, toolHtml = "", l = config.length, i = 0; i < l; i++ ){
		var tool = config[i];
		if(tool.children) {
			toolHtml += '<div class="btn-group"><button type="button" class="btn btn-link toolBarRight-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="' + tool.icon + '"></i>' + tool.name + ' <span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right toolBarRight-dropdown-menu" style="min-width: 110px;">';
			
			for(var j = 0, r = tool.children.length; j < r; j++) {
				var childrenItem = tool.children[j];
				var g = "";
				childrenItem.onclick ? g = 'onclick="' + childrenItem.onclick + '"' : childrenItem.widget && (g = 'data-widget="' + childrenItem.widget + '"');
				toolHtml += '<li class="widget-btn" ' + g + '><a href="javascript:void(0)"><i class="' + childrenItem.icon + '"></i>' + childrenItem.name + "</a></li>";
				item[childrenItem.widget] = childrenItem
			}
			toolHtml += " </ul></div>"
		} else {
			g = "";
			tool.onclick ? g = 'onclick="' + tool.onclick + '"' : tool.widget && (g = 'data-widget="' + tool.widget + '"');
			toolHtml += '<button type="button" class="widget-btn btn btn-link toolBarRight-btn " ' + g + '><i class="' + tool.icon + '"></i>' + tool.name + "</button>";
			item[tool.widget] = tool
		}
	}
	
	$(".toolBarRight").html(toolHtml);
	$(".toolBarRight .widget-btn").click(function() {
		var widget = $(this).attr("data-widget");
		customMap.widget.activate(item[widget]);
	})
}

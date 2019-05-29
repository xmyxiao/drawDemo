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
	// 鼠标事件
	var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
	function pickAndTrackObject(e) {
    //双击操作
    var entity=pickEntity(viewer,e.position);
	     if(entity){
	         //将笛卡尔直角坐标系转化为经纬度坐标系
	         var wgs84=viewer.scene.globe.ellipsoid.cartesianToCartographic(entity.position._value);
	         //转化为经纬度
	         var long=Cesium.Math.toDegrees(wgs84.longitude);
	         var lat=Cesium.Math.toDegrees(wgs84.latitude);
	         viewer.scene.camera.flyTo( {
	             destination : Cesium.Cartesian3.fromDegrees(long, lat, 2000 ),//使用WGS84
	             orientation : {
	                 heading : Cesium.Math.toRadians( 0 ),
	                 pitch : Cesium.Math.toRadians( -90 ),
	                 roll : Cesium.Math.toRadians( 0 )
	             },
	             duration : 3,//动画持续时间
	             complete : function()//飞行完毕后执行的动作
	             {
	                 // addEntities();
	                 canCont=true;
	             },
	             pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
	             maximumHeight:5000 // 相机最大飞行高度
	         } );
	     }
	}
	function pickAndSelectObject(e) {
	    //单击操作
	    //viewer.selectedEntity= pickEntity(viewer,e.position)
	}
	//拾取实体
	function pickEntity(viewer,position) {
	    var picked=viewer.scene.pick(position);
	    if(picked){
	        var id=Cesium.defaultValue(picked.id,picked.primitive.id);
	        if(id instanceof Cesium.Entity){
	            return id;
	        }
	    }
	    return undefined;
	}
	viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(pickAndSelectObject,Cesium.ScreenSpaceEventType.LEFT_CLICK);
	viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(pickAndTrackObject,Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); 
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

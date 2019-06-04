customMap.widget = $.extend(customMap.widget,{
	// 获取时间作为id
	getTimeToId: function(){
		var data = new Date();
		var y = data.getFullYear().toString();
		var m = data.getMonth().toString();
		var d = data.getDate().toString();
		var h = data.getHours().toString();
		var mi = data.getMinutes().toString();
		var s = data.getSeconds().toString();
		var mil = data.getMilliseconds().toString();
		
		var str = y + m + d + h + mi + s + mil;
		return str;
	},
	// 添加标注点
	drawMarkPoint: function(){
		var logoUrl = './widgets/addmarker/img/marker.png';
		var entitieId = this.getTimeToId();
		this.drawMarkFlag = true;
		if(this.drawMarkEntity){
			viewer.entities.remove(this.drawMarkEntity);
		}
		this.drawMarkEntity = viewer.entities.add({
			id : entitieId,
			name : '我的标记',
			show: false,
	        //position : Cesium.Cartesian3.fromDegrees(),
	        billboard : {
	            image : logoUrl,
	            scale : 0.8
	        },
		 	label : {
			    text : '我的标记',
			    font : '14pt monospace',
			    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
			    outlineWidth : 2,
			    //垂直位置
			    verticalOrigin : Cesium.VerticalOrigin.BUTTON,
			    //中心位置
			    pixelOffset : new Cesium.Cartesian2(0, -30)
		  	}
	   	});
	   	var scene = viewer.scene;
   		var ellipsoid = scene.globe.ellipsoid;
	   	var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
	   	handler.setInputAction(function(movement) {
	   		if(!customMap.widget.drawMarkFlag){
	   			return;
	   		}
        	var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) {
            	var markEntity = customMap.widget.drawMarkEntity;
            	if(!markEntity){
            		return
            	}
				markEntity.position = cartesian;
				markEntity.show = true;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        handler.setInputAction(function(e) {
	   		if(!customMap.widget.drawMarkFlag){
	   			return;
	   		}else{
	   			customMap.widget.drawMarkFlag = false;
	   			handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	   			handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	   		}
        	var cartesian = viewer.camera.pickEllipsoid(e.position, ellipsoid);
            if (cartesian) {
            	var markEntity = customMap.widget.drawMarkEntity;
            	if(!markEntity){
            		return
            	}
				markEntity.position = cartesian;
				markEntity.show = true;
				customMap.widget.drawMarkEntity = null;
				customMap.widget.addNewMarkEntity(markEntity,e);
				if(!customMap.selectedMarkEntitys){
					customMap.selectedMarkEntitys = [];
				}
				var flag = false;
	    		for(var i = 0, l = customMap.selectedMarkEntitys.length; i < l; i++){
	    			if(customMap.selectedMarkEntitys[i]._id === markEntity._id){
	    				flag = true;
	    			}
	    		}
	    		if(!flag){
	    			customMap.selectedMarkEntitys.push(markEntity);
	    		}				
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	},
	// 列表新增标记实体
	addNewMarkEntity: function(markEntity,e){
		if(!markEntity){
			return;
		}
		var scene = viewer.scene;
        //得到当前三维场景的椭球体
        var ellipsoid = scene.globe.ellipsoid;

	  	var cartographic = ellipsoid.cartesianToCartographic(markEntity.position._value);
        //将弧度转为度的十进制度表示
        longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
		var item = {
    		"id": markEntity._id, 
    		"center": { "y": latitudeString, "x": longitudeString},
    		"name": "我的标记", 
    		"remark": ""
    	}
		if(!customMap.config.customMap.markerData){
			customMap.config.customMap.markerData = [];
		}
		customMap.config.customMap.markerData.push(item);
		if(this.refMarkerList){
			this.refMarkerList();
		}
		customMap.widget.showMarkEditDialog(item,e);
	},
	// 显示标记实体编辑弹框
	showMarkEditDialog: function(item,e){
		var html = $('#popup_'+item.id+'');
		if(html.length < 1){
			var infoDiv = this.getMarkEditDialogHtml(item);
			$('#pupup-all-view').append(infoDiv);
			this.positionPopUp(item,e);
		}else if(!html.hasClass('editor')){
			html.remove();
			var infoDiv = this.getMarkEditDialogHtml(item);
			$('#pupup-all-view').append(infoDiv);
			this.positionPopUp(item,e);
		}else{
			html.show();
			this.positionPopUp(item,e);
		}
	},
	// 标记编辑模板
	getMarkEditDialogHtml: function(item){
		var html = 
		'<div id="popup_'+item.id+'" class="cesium-popup editor">'+
			'<a class="cesium-popup-close-button cesium-popup-color" href="javascript:customMap.widget.closeDialog('+item.id+')">×</a>'+           
			'<div class="cesium-popup-content-wrapper cesium-popup-background">'+
				'<div class="cesium-popup-content cesium-popup-color">'+
					'<div class="addmarker-popup-titile">添加标记</div>'+
					'<div class="addmarker-popup-content">'+
						'<form>'+
						'<div class="form-group">'+
							'<label for="addmarker_attr_name">名称</label>'+
							'<input type="text" id="" class="form-control addmarker_attr_name" value="'+item.name+'" placeholder="请输入标记名称">'+
						'</div>'+
						'<div class="form-group">'+
							'<label for="addmarker_attr_remark">备注</label>'+
							'<textarea id="" class="form-control addmarker_attr_remark" rows="3" style="resize: none;" placeholder="请输入备注（可选填）">'+item.remark+'</textarea>'+
						'</div>'+
						'<div class="form-group" style="text-align: center;">'+
							'<input type="button" class="btn btn-primary  btn-sm" value="保存" onclick="customMap.widget.saveEditFeature('+item.id+'),customMap.widget.closeDialog('+item.id+')">'+
							'&nbsp;&nbsp;<input type="button" class="btn btn-danger  btn-sm" value="删除" onclick="customMap.widget.deleteMarkerItem('+item.id+'),customMap.widget.closeDialog('+item.id+')">'+
						'</div>'+
						'</form>'+
					'</div>'+
				'</div>'+     
			'</div>'+      
			'<div class="cesium-popup-tip-container">'+
				'<div class="cesium-popup-tip cesium-popup-background"></div>'+
			'</div>'+
		'</div>';
		return html;
	},
	// 保存编辑
	saveEditFeature: function(id){
		id = id.toString();
		var html = $('#popup_'+id+'')
		var data = this.getMarkData();
		for(var i = 0, l = data.length; i < l; i++){
			if(id === data[i].id){
				data[i].name = html.find('.addmarker_attr_name').val() || '我的标记';
				data[i].remark = html.find('.addmarker_attr_remark').val() || '';
				var markEntity = viewer.entities.getById(id);
				markEntity.label.text._value = data[i].name;
				if(this.refMarkerList){
					this.refMarkerList();
				}
				return
			}
		}
	},
	// 地图标记模板
	getMarkDialogHtml: function(item){
		var html = 
		'<div id="popup_'+item.id+'" class="cesium-popup">'+
			'<a class="cesium-popup-close-button cesium-popup-color" href="javascript:customMap.widget.closeDialog('+item.id+')">×</a>'+           
			'<div class="cesium-popup-content-wrapper cesium-popup-background">'+
				'<div class="cesium-popup-content cesium-popup-color">'+
					'<div class="addmarker-popup-titile">我的标记</div>'+
					'<div class="addmarker-popup-content">'+
						'<div class="form-group">'+
							'<label for="addmarker_attr_name">名称：</label>'+
							'<span>'+item.name+'</span>'+
						'</div>'+
						'<div class="form-group">'+
							'<label for="addmarker_attr_name">备注：</label>'+
							'<span>'+item.remark+'</span>'+
						'</div>'+
					'</div>'+
				'</div>'+     
			'</div>'+      
			'<div class="cesium-popup-tip-container">'+
				'<div class="cesium-popup-tip cesium-popup-background"></div>'+
			'</div>'+
		'</div>';
		return html
	}
})
var thisWidget, basemapsCfg, lastLayer;

function initWidgetView(a) {
	basemapsCfg = (thisWidget = a).getBasemaps();
	for(var e = "", i = 0; i < basemapsCfg.length; i++) {
		var s = basemapsCfg[i];
		if(null != s.name && "" != s.name && 'group' != s.type) {
			var r = "";
			if(thisWidget.basemap === s.type){
				r = 'class="hover"';
			}		
			e += "<li " + r + ' onclick="changeBaseMaps(this,' + i + ')"><div><img src="../../' + (s.icon || "img/basemaps/bingAerial.png") + '" /></div><div>' + s.name + "</div></li>"
		}
	}
	$("#basemaps").html(e);
}

function changeBaseMaps(a, e) {
	$("#basemaps").children().each(function() {
		$(this).removeClass("hover");
	});
	$(a).addClass("hover");
	var layers = parent.viewer.scene.imageryLayers;
	for(var i = 0, l = basemapsCfg.length; i < l; i++){
		if(layers.get(i) && i != e){
			layers.get(i).show = false;
		}
	}
	
	var item = basemapsCfg[e];
	thisWidget.basemap = item.type;
	if(layers.get(e)){
		layers.get(e).show = true;
	}else if(item.type === 'arcgis'){
		var esriImageryProvider = new parent.Cesium.ArcGisMapServerImageryProvider({
		    url : item.url
		});
		layers.addImageryProvider(esriImageryProvider,e);
	}else if(item.type === 'xyz'){
		var xyzImageryProvider = new parent.Cesium.UrlTemplateImageryProvider({
		    url : item.url
		});
		layers.addImageryProvider(xyzImageryProvider,e);
	}
}
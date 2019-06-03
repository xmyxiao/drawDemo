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
	var item = basemapsCfg[e];
	thisWidget.basemap = item.type;
	
	var layers = parent.viewer.scene.imageryLayers;
	var blackMarble = layers.addImageryProvider(parent.Cesium.createTileMapServiceImageryProvider({
	    url : 'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles',
	    layer: "tdtVecBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: true
	}));
}
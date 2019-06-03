mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
	options: {
		view: {
			type: "window",
			url: "view.html",
			windowOptions: {
				width: 190,
				height: 160
			}
		}
	},
	create: function() {
		for(var i = 0, e = this.getBasemaps(), t = 0; t < e.length; t++) {
			var n = e[t];
			null != n.name && "" != n.name && null != n._layer && i++
		}
		this.options.view.windowOptions = i <= 4 ? {
			width: 190,
			height: 100 * Math.ceil(i / 2) + 70
		} : 4 < i && i <= 6 ? {
			width: 270,
			height: 100 * Math.ceil(i / 3) + 70
		} : {
			width: 360,
			height: 105 * Math.ceil(i / 4) + 70
		}
	},
	viewWindow: null,
	winCreateOK: function(i, e) {
		this.viewWindow = e
	},
	activate: function() {},
	disable: function() {
		this.viewWindow = null
	},
	hasTerrain: function() {
		return this.viewer.mars.hasTerrain()
	},
	getBasemaps: function() {
		return this.viewer.gisdata.config.basemaps
	},
	getLayerVisible: function(i) {
		return i.getVisible()
	},
	updateLayerVisible: function(i, e) {
		i.setVisible(e)
	},
	updateTerrainVisible: function(i) {
		this.viewer.mars.updateTerrainProvider(i)
	}
}));
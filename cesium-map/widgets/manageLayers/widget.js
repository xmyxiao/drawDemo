function initWidgetTool(){
	var widgetTool = {
		viewWindow: null,
		_tempIdx: 1,
		arrIdx: [],
		getNextId: function() {
			for(; - 1 != this.arrIdx.indexOf(this._tempIdx);) this._tempIdx++;
			return this.arrIdx.push(this._tempIdx), this._tempIdx
		},
		_layers: null,
		getLayers: function() {
			if(null == this._layers) {
				var e = [],
					t = parent.customMap.config.customMap.operationallayers;
				this._tempIdx = 1, this.arrIdx = [];

				for(a = 0; a < t.length; a++) {
					(n = t[a]).id && this.arrIdx.push(n.id)
				}

				for(a = 0; a < t.length; a++) {
					var def = t[a]
					var item = {
						name: def.name || "未命名",
						id: def.id || this.getNextId(),
						pid: def.pid || -1						
					}
					var item = $.extend(def,item);
					e.push(item)
				}
				for(a = 0; a < e.length; a++) {
					var n = e[a],
						d = Number(n.order);
					isNaN(d) && (d = a), n.order = d, n._key = a + "_" + n.id + "_" + n.name
				}
				this._layers = e
			}
			return this._layers
		}
	}
	return widgetTool;
}

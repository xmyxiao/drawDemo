var thisWidget, widgetTool, lastRightClickTreeId, lastRightClickTreeNode, layers = [],
	layersObj = {};

function initWidgetView(e) {
	thisWidget = e, bindRightMenuEvnet();
	widgetTool = initWidgetTool();
	for(var setting = {
			check: {
				enable: !0
			},
			data: {
				simpleData: {
					enable: !0
				}
			},
			callback: {
				onCheck: treeOverlays_onCheck,
				onRightClick: treeOverlays_OnRightClick,
				onDblClick: treeOverlays_onDblClick
			},
			view: {
				addDiyDom: addOpacityRangeDom
			}
		}, r = [], 
		n = (layers = widgetTool.getLayers()).length - 1; 0 <= n; n--) {
		var a = layers[n],
			i = {
				id: a.id,
				pId: a.pid,
				name: a.name,
				_type: a.type,
				_key: a._key
			};
		"group" == a.type ? (i.icon = "images/folder.png", i.open = null == a.open || a.open) : ("dark" == thisWidget.config.style ? i.icon = "images/layer2.png" : i.icon = "images/layer.png", i.checked = a.visible, a._parent && (i._parent = a._parent._key), layersObj[i._key] = a), r.push(i)
	}
	$.fn.zTree.init($("#treeOverlays"), setting, r), $("#view").mCustomScrollbar({
		theme: "" 
	})
}

function addNode(e) {
	var t, r = $.fn.zTree.getZTreeObj("treeOverlays");
	e.pid && -1 != e.pid && (t = r.getNodeByParam("id", e.pid, null));
	var n = {
		id: e.id,
		pId: e.pid,
		name: e.name,
		_type: e.type,
		_key: e._key
	};
	null == e._layer || "group" == e.type ? (n.icon = "images/folder.png", n.open = null == e.open || e.open) : (n.icon = "images/layer.png", n.checked = thisWidget.getLayerVisible(e._layer), e._parent && (n._parent = e._parent._key), layersObj[n._key] = e._layer), r.addNodes(t, 0, [n], !0)
}

function removeNode(e) {
	var t = $.fn.zTree.getZTreeObj("treeOverlays"),
		r = t.getNodeByParam("id", e.id, null);
	r && t.removeNode(r)
}

function treeOverlays_onCheck(e, t, r) {
	for(var n = $.fn.zTree.getZTreeObj(t), a = n.getChangeCheckedNodes(), i = 0; i < a.length; i++) {
		var item = a[i],itemLayer = layersObj[item._key];
		item.checkedOld = item.checked
		if(null != itemLayer){
			if(!itemLayer._layer && item._type === 'gltf'){
				itemLayer._layer = thisWidget.addGltfLayer(itemLayer);
				layersObj[item._key] = itemLayer;
			}
			if(itemLayer._layer){
				itemLayer._layer.show = item.checked;
			}
			if(item._type === 'mapMark'){
				if(item.checked){
					thisWidget.addMapMarkLayer(item);
				}else{
					thisWidget.hideMapMarkLayer();
				}
			}
			itemLayer.visible = item.checked;
			if(item.checked){
				thisWidget.centerAt(itemLayer);
			}
		}
		
	}
}

function treeOverlays_onDblClick(e, t, r) {
	if(null != r && null != r._key) {
		var n = layersObj[r._key];
		null != n && thisWidget.centerAt(n)
	}
}

function addOpacityRangeDom(e, n) {
	var t = layersObj[n._key];
	if(t && t.hasOpacity) {
		var r = $("#" + n.tId),
			a = '<input id="' + n.tId + '_range" type="range" style="width: 50px;" />';
		r.append(a), n.checked || $("#" + n.tId + "_range").hide(), $("#" + n.tId + "_range").range({
			min: 0,
			max: 100,
			step: 1,
			value: 100 * (t._opacity || 1),
			onChange: function(e) {
				var t = e / 100,
					r = layersObj[n._key];
				thisWidget.udpateLayerOpacity(r, t)
			}
		})
	}
}

function treeOverlays_OnRightClick(e, t, r) {
	if(null != r && null != layersObj[r._key]) {
		var n = layersObj[r._key];
		if(n && n.hasZIndex) {
			lastRightClickTreeId = t, lastRightClickTreeNode = r;
			var a = e.clientY,
				i = e.clientX,
				d = document.body.offsetHeight - 100,
				o = document.body.offsetWidth - 100;
			d < a && (a = d), o < i && (i = o), $("#content_layer_manager_rMenu").css({
				top: a + "px",
				left: i + "px"
			}).show(), $("body").bind("mousedown", onBodyMouseDown)
		}
	}
}

function onBodyMouseDown(e) {
	"content_layer_manager_rMenu" == e.target.id || 0 < $(e.target).parents("#content_layer_manager_rMenu").length || hideRMenu()
}

function hideRMenu() {
	$("body").unbind("mousedown", onBodyMouseDown), $("#content_layer_manager_rMenu").hide()
}

function bindRightMenuEvnet() {
	$("#content_layer_manager_rMenu li").on("click", function() {
		hideRMenu(), moveNodeAndLayer($(this).attr("data-type"))
	})
}

function moveNodeAndLayer(e) {
	var t, r = $.fn.zTree.getZTreeObj(lastRightClickTreeId),
		n = lastRightClickTreeNode.getParentNode();
	t = null == n ? r.getNodes() : n.children;
	var a = lastRightClickTreeNode,
		i = layersObj[a._key];
	switch(e) {
		case "up":
			if(d = a.getPreNode()) r.moveNode(d, a, "prev"), exchangeLayer(i, layersObj[d._key]);
			break;
		case "top":
			if(0 == a.getIndex()) return;
			for(; 0 < a.getIndex();) {
				if(d = a.getPreNode()) r.moveNode(d, a, "prev"), exchangeLayer(i, layersObj[d._key])
			}
			break;
		case "down":
			if(d = a.getNextNode()) r.moveNode(d, a, "next"), exchangeLayer(i, layersObj[d._key]);
			break;
		case "bottom":
			if(a.getIndex() == t.length - 1) return;
			for(; a.getIndex() < t.length - 1;) {
				var d;
				if(d = a.getNextNode()) r.moveNode(d, a, "next"), exchangeLayer(i, layersObj[d._key])
			}
	}
	layers.sort(function(e, t) {
		return e.order - t.order
	})
}

function exchangeLayer(e, t) {
	if(null != e && null != t) {
		var r = e.config.order;
		e.config.order = t.config.order, t.config.order = r, Number(e.config.order) < Number(t.config.order) ? thisWidget.udpateLayerZIndex(e, e.config.order) : thisWidget.udpateLayerZIndex(t, t.config.order)
	}
}

function updateCheckd(e, t) {
	var r = $.fn.zTree.getZTreeObj("treeOverlays"),
		n = r.getNodesByParam("name", e, null);
	n && 0 < n.length ? r.checkNode(n[0], t, !1) : console.log("未在图层树上找到图层“" + e + "”，无法自动勾选处理")
}
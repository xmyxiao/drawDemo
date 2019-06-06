var thisWidget, $table;

function getHeight() {
	return $(window.parent).height() - 40
}

function initWidgetView(t) {
	(thisWidget = t).config && thisWidget.config.style && $("body").addClass(thisWidget.config.style), plotFile.initEvent(), $("#btn_marker_Add").bind("click", function() {
		thisWidget.drawMarkPoint()
	}), $("#btn_plot_delall").click(function() {
		thisWidget.deleteMarkerItem(), refMarkerList()
	});
	
	widgetTool = initWidgetTool();
	var e = !0;
	$("#btn_plot_isedit").click(function() {
		(e = !e) ? ($(this).removeClass("active"), $(this).children().removeClass("fa-lock").addClass("fa-unlock")) : ($(this).addClass("active"), $(this).children().removeClass("fa-unlock").addClass("fa-lock")), thisWidget.hasEdit(e)
	}), ($table = $("#table")).bootstrapTable({
		height: getHeight(),
		singleSelect: !0,
		pagination: !1,
		pageSize: 6,
		iconsPrefix: "fa",
		columns: [{
			field: "name",
			title: "名称",
			sortable: !0,
			editable: !1,
			align: "left"
		}, {
			field: "operate",
			title: "操作",
			align: "center",
			width: 50,
			events: {
				"click .remove": function(t, e, i, l) {
					thisWidget.deleteMarkerItem(i.id)
					refMarkerList();
				}
			},
			formatter: function(t, e, i) {
				return ['<a class="remove" href="javascript:void(0)" title="删除">', '<i class="fa fa-trash"></i>', "</a>"].join("")
			}
		}],
		onClickRow: function(t, e, i) {
			if('operate' === i){
				return;
			}
			for(var i = 0, l = thisWidget.getMarkData().length; i < l; i++){
				var item = thisWidget.getMarkData()[i];
				if(item.id === t.id){
					thisWidget.centerAt(item)
				}
			}
		}
	}), $(window.parent).resize(function() {
		$table.bootstrapTable("refreshOptions", {
			height: getHeight()
		})
	}), refMarkerList()
	showMapListMark();
}

function showMapListMark(){
	var data = thisWidget.getMarkData();
	if(data.length < 1){
		return;
	}
	thisWidget.addMapMarkLayer();
	var center = {
		x: data[0].center.x || parent.customMap.config.customMap.center.x,
		y: data[0].center.y || parent.customMap.config.customMap.center.y,
		z: 1000000
	}
	thisWidget.centerAt({center})
	var list = parent.customMap.config.customMap.operationallayers;
	for(var i = 0, l = list.length; i < l; i++){
		if(list[i].type === 'mapMark'){
			list[i].visible = true;
		}
	}
	
}

function refMarkerList() {
	var t = thisWidget.getMarkData();
	$table.bootstrapTable("load", t)
}
var plotFile = {
	initEvent: function() {
		var n, o = this;
		$("#btn_plot_openfile").click(function() {
			n = !0, $("#input_plot_file").click()
		}), $("#btn_plot_openfile2").click(function() {
			n = !1, $("#input_plot_file").click()
		}), $("#btn_plot_savefile").click(function() {
			var t = thisWidget.getJsonData();
			null == t || "" == t ? toastr.error("当前未标记任何数据！") : haoutil.file.downloadFile("我的标记点.json", t)
		}), $("#input_plot_file").change(function(t) {
			var e = this.files[0],
				i = e.name;
			if("json" != i.substring(i.lastIndexOf(".") + 1, i.length).toLowerCase()) return toastr.error("文件类型不合法,请选择json格式标注文件！"), void o.clearPlotFile();
			if(window.FileReader) {
				var l = new FileReader;
				l.readAsText(e, "UTF-8"), l.onloadend = function(t) {
					var e = this.result;
					thisWidget.jsonToLayer(e, n), o.clearPlotFile()
				}
			}
		})
	},
	clearPlotFile: function() {
		window.addEventListener ? document.getElementById("input_plot_file").value = "" : document.getElementById("input_plot_file").outerHTML += ""
	}
};


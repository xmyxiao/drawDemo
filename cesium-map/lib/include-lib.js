// 用于加载引入资源
! function() {
	for(var resourceLib, includeChart = new RegExp("(^|(.*?\\/))(include-lib.js)(\\?|$)"), libJs = document.getElementsByTagName("script"), i = 0; i < libJs.length; i++) {
		var jsResource = libJs[i].getAttribute("src");
		if(jsResource){
			if(jsResource.match(includeChart)) {
				resourceLib = libJs[i];
				break
			}
		}
	}
	// 加载js与css的方法
	var time = getResourceTime(),cssChart = new RegExp("\\.css");
	function writeResource(resource) {
		if(null != resource && 0 != resource.length){
			for(var i = 0, l = resource.length; i < l; i++) {
				var reUrl = resource[i];
				if(cssChart.test(reUrl)) {  //判断是否是css类型的资源
					var cssUrl = '<link rel="stylesheet" href="' + reUrl + "?time=" + time + '">';
					document.writeln(cssUrl);
				} else {
					var jsUrl = '<script type="text/javascript" src="' + reUrl + "?time=" + time + '"><\/script>';
					document.writeln(jsUrl);
				}
			}
		}
	}
	// 获取时间
	function getResourceTime(){
		var d = new Date();
		return d.getYear() + d.getMonth() + d.getDay();
	}
	// 根据include 加载页面引入资源
	! function() {
		var libpath = resourceLib.getAttribute("libpath") || "";
		libpath.lastIndexOf("/") != libpath.length - 1 && (libpath += "/");
		var resourceMap = {
			jquery: [libpath + "jquery/jquery-1.11.0.js"],
			"jquery.range": [libpath + "jquery/range/range.css", libpath + "jquery/range/range.js"],
			ztree: [libpath + "jquery/ztree/css/zTreeStyle/zTreeStyle.css", libpath + "jquery/ztree/css/mars/ztree-mars.css", libpath + "jquery/ztree/js/jquery.ztree.all.min.js"],
			"jquery.mCustomScrollbar": [libpath + "jquery/mCustomScrollbar/jquery.mCustomScrollbar.css", libpath + "jquery/mCustomScrollbar/jquery.mCustomScrollbar.js"],
			layer: [libpath + "layer/theme/default/layer.css",libpath + "layer/theme/retina/retina.css", libpath + "layer/theme/mars/layer.css", libpath + "layer/layer.js"],
			"font-awesome": [libpath + "fonts/font-awesome/css/font-awesome.min.css"],
			bootstrap: [libpath + "bootstrap/css/bootstrap.css", libpath + "bootstrap/js/bootstrap.min.js"],
			"bootstrap-table": [libpath + "bootstrap/bootstrap-table/bootstrap-table.css", libpath + "bootstrap/bootstrap-table/bootstrap-table.min.js", libpath + "bootstrap/bootstrap-table/locale/bootstrap-table-zh-CN.js"],
			"toolBarRight": [libpath + "css/toolBarRight.css"]
		};
		for(var key in resourceMap){
			writeResource(resourceMap[key]);
		}
	}()
}();
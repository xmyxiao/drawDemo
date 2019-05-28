function s(t, e) {
	null == M && t.viewer && n(t.viewer), "string" == typeof t ? (t = {
		uri: t
	}, null != e && (t.disableOhter = !e)) : null == t.uri && console.error("activate激活widget时需要uri参数！");
	for(var i, r = 0; r < k.length; r++) {
		var a = k[r];
		if(t.uri == a.uri || a.id && t.uri == a.id) {
			if(i = a, i.isloading) return i;
			for(var s in t) "uri" != s && (i[s] = t[s]);
			break
		}
	}
	if(null == i && (o(t), i = t, k.push(t)), P && console.log("开始激活widget：" + i.uri), i.disableOhter ? h(i.uri, i.group) : f(i.group, i.uri), i._class)
		if(i._class.isActivate)
			if(i._class.update) i._class.update();
			else {
				i._class.disableBase();
				var l = setInterval(function() {
					i._class.isActivate || (i._class.activateBase(), clearInterval(l))
				}, 200)
			}
	else i._class.activateBase();
	else {
		for(var r = 0; r < R.length; r++)
			if(R[r].uri == i.uri) return R[r];
		R.push(i), 1 == R.length && g()
	}
	return i
}
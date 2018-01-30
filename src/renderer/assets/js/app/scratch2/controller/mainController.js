define(['app/common/util/util', 'app/common/util/emitor', '../config/menu'], function(util, emitor, menu) {

	var portId;

	function init() {
		emitor.on('app', 'start', onAppStart);

		kenrobot.on('app-menu', 'do-action', onMenuAction);
	}

	function onAppStart() {
		kenrobot.trigger("app-menu", "load", menu, "scratch2");

		kenrobot.postMessage("app:loadSetting").then(setting => {
			var specSetting = setting[kenrobot.viewType];
			for(var name in specSetting) {
				emitor.trigger("setting", "change", name, specSetting[name]);
			}
		});
	}

	function onMenuAction(action, extra) {
		kenrobot.trigger("app", "command", action, extra);
	}

	return {
		init: init,
	};
});
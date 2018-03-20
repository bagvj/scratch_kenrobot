define(['vendor/lodash', 'app/common/util/util', 'app/common/util/emitor', '../config/menu'], function(_, util, emitor, menu) {

	var portId;

	function init() {
		emitor.on('app', 'start', onAppStart);

		kenrobot.on('app-menu', 'do-action', onMenuAction).listenMessage("app:onBeforeQuit", onBeforeQuit);
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

	function onBeforeQuit() {
		var doQuit = () => kenrobot.postMessage("app:exit");
		var delayDoQuit = () => setTimeout(doQuit, 400);

		kenrobot.trigger("app", "command", "is-project-changed", changed => {
			if(changed) {
				util.confirm({
					type: "skip",
					confirmLabel: "是",
					skipLabel: "否",
					cancelLabel: "取消",
					text: "是否保存对当前项目的更改?",
					onSkip: delayDoQuit,
					onConfirm: () =>kenrobot.trigger("app", "command", "save-project-before-quit", delayDoQuit)
				});
			} else {
				doQuit();
			}
		});
	}

	return {
		init: init,
	};
});

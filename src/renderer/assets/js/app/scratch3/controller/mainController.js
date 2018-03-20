define(['vendor/lodash', 'app/common/util/util', 'app/common/util/emitor', '../config/menu'], function(_, util, emitor, menu) {

	function init() {
		emitor.on('app', 'start', onAppStart);

		kenrobot.on('app-menu', 'do-action', onMenuAction).listenMessage("app:onBeforeQuit", onBeforeQuit);
	}

	function onAppStart() {
		kenrobot.trigger("app-menu", "load", menu, "scratch3");

		kenrobot.postMessage("app:loadSetting").then(setting => {
			var specSetting = setting[kenrobot.viewType];
			for(var name in specSetting) {
				emitor.trigger("setting", "change", name, specSetting[name]);
			}
		});
	}

	function onMenuAction(action) {
		kenrobot.trigger("app", "command", action);
	}

	function onBeforeQuit() {
		askSaveProject(() => kenrobot.postMessage("app:exit"));
	}

	function isProjectChange() {
		return kenrobot.view.project && !_.isEqual(kenrobot.view.project, kenrobot.view.getProject());
	}

	function askSaveProject(callback, delay) {
		if(isProjectChange()) {
			util.confirm({
				type: "skip",
				confirmLabel: "是",
				skipLabel: "否",
				cancelLabel: "取消",
				text: "是否保存对当前项目的更改?",
				onSkip: () => callback(),
				onConfirm: () => kenrobot.trigger("app", "command", "save-project", () => setTimeout(callback, delay || 400))
			});
		} else {
			callback();
		}
	}

	return {
		init: init,
	};
});

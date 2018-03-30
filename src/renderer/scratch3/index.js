webpackJsonp([1],{

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


;(function () {
	var whenReady = function () {
		var funcs = [];
		var ready = false;

		function handler(e) {
			if (ready) return;

			if (e.type === 'onreadystatechange' && document.readyState !== 'complete') {
				return;
			}

			for (var i = 0; i < funcs.length; i++) {
				funcs[i].call(document);
			}
			ready = true;
			funcs = null;
		}
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', handler, false);
			document.addEventListener('readystatechange', handler, false);
			window.addEventListener('load', handler, false);
		} else if (document.attachEvent) {
			document.attachEvent('onreadystatechange', handler);
			window.attachEvent('onload', handler);
		}

		return function whenReady(fn) {
			if (ready) {
				fn.call(document);
			} else {
				funcs.push(fn);
			}
		};
	}();

	var projectExtra = {};

	function init() {
		window.kenrobot = window.kenrobot || top.kenrobot;
		if (!kenrobot) {
			return;
		}

		kenrobot.viewType = "scratch3";
		registerShortcut();
		kenrobot.on("app", "command", onCommand).on("project", "open-by", onProjectOpenBy).on("project", "load", onProjectLoad);
	}

	function onCommand(command) {
		switch (command) {
			case "new-project":
				projectExtra = {};
				kenrobot.view.newProject();
				setTimeout(function () {
					return kenrobot.view.project = kenrobot.view.getProject();
				}, 1000);
				break;
			case "open-project":
				onOpenProject();
				break;
			case "save-project":
				onSaveProject(false, arguments.length <= 1 ? undefined : arguments[1]);
				break;
			case "save-as-project":
				onSaveProject(true);
				break;
		}
	}

	function onProjectOpenBy(name, type) {
		if (type != "scratch3") {
			return;
		}

		onOpenProject(name);
	}

	function onOpenProject(name) {
		kenrobot.postMessage("app:projectOpen", "scratch3", name).then(onProjectLoad, function (err) {
			kenrobot.trigger("util", "message", {
				text: "打开失败",
				type: "error"
			});
		});
	}

	function onProjectLoad(project) {
		projectExtra = { path: project.path, project_name: project.project_name };
		kenrobot.view.loadProject(project.data);
		kenrobot.view.project = project.data;
		kenrobot.trigger("util", "message", "打开成功");
	}

	function onSaveProject(saveAs, saveCallback) {
		var doSave = function doSave(_) {
			if (projectExtra.path) {
				saveProject(kenrobot.view.getProject(), saveAs, saveCallback);
			} else if (saveAs || !projectExtra.project_name) {
				kenrobot.trigger("prompt", "show", {
					title: "项目保存",
					placeholder: "项目名字",
					callback: function callback(name) {
						if (!name) {
							kenrobot.trigger("util", "message", {
								text: "保存失败",
								type: "error"
							});
							return;
						}

						projectExtra.project_name = name;
						saveProject(kenrobot.view.getProject(), saveAs, saveCallback);
					}
				});
			} else {
				saveProject(kenrobot.view.getProject(), saveAs, saveCallback);
			}
		};

		if (kenrobot.user || saveAs || projectExtra.hasShowSave) {
			doSave();
		} else {
			projectExtra.hasShowSave = true;
			kenrobot.trigger("save", "show", doSave);
		}
	}

	function saveProject(data, saveAs, callback) {
		var promise;
		if (saveAs) {
			promise = kenrobot.postMessage("app:projectSaveAs", projectExtra.project_name, data, "scratch3");
		} else {
			promise = kenrobot.postMessage("app:projectSave", projectExtra.project_name, data, "scratch3", projectExtra.path);
		}

		promise.then(function (result) {
			projectExtra = Object.assign(projectExtra, result);
			kenrobot.view.project = result.data;
			kenrobot.trigger("util", "message", "保存成功");
			callback && callback();
		}, function (err) {
			kenrobot.trigger("util", "message", {
				text: "保存失败",
				type: "error"
			});
		});
	}

	function registerShortcut() {
		var shortcuts = [{
			key: ["ctrl+n", "command+n"],
			callback: function callback(_) {
				return onCommand("new-project");
			}
		}, {
			key: ["ctrl+o", "command+o"],
			callback: function callback(_) {
				return onCommand("open-project");
			}
		}, {
			key: ["ctrl+s", "command+s"],
			callback: function callback(_) {
				return onCommand("save-project");
			}
		}, {
			key: ["ctrl+shift+s", "command+shift+s"],
			callback: function callback(_) {
				return onCommand("save-as-project");
			}
		}];

		kenrobot.trigger("shortcut", "register", shortcuts);
	}

	whenReady(init);
})();

/***/ })

},[130]);
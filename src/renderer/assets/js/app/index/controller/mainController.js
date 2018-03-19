define(['vendor/jquery', 'vendor/pace', 'vendor/mousetrap', 'app/common/util/util', 'app/common/util/emitor', '../config/menu'], function($1, pace, Mousetrap, util, emitor, menu) {

	var iframe;
	var mousetrap;

	var baseUrl;
	var inSync;

	function init() {
		$(window).on('contextmenu', onContextMenu).on('click', onWindowClick).on('resize', onWindowResize);

		iframe = document.getElementById("content-frame");

		emitor.on('app', 'check-update', onCheckUpdate)
			.on('app', 'switch', onSwitch)
			.on("app", "start", onAppStart)
			.on("user", "update", onUserUpdate);

		kenrobot.listenMessage("app:onFullscreenChange", onFullscreenChange)
			.listenMessage("app:onSerialPortData", onSerialPortData)
			.listenMessage("app:onSerialPortError", onSerialPortError)
			.listenMessage("app:onSerialPortClose", onSerialPortClose)
			.on("util", "message", onUtilMessage, {canReset: false})
			.on("shortcut", "register", onShortcutRegister, {canReset: false})
			.on('build', 'error', onBuildError, {canReset: false})
			.on('app-menu', 'do-action', onMenuAction, {canReset: false})
			.on("user", "logout", onUserLogout, {canReset: false})
			.on("project", "sync", onProjectSync, {canReset: false});

		pace.start({
			elements: {
				selectors: ["#content-frame"],
			},
			ajax: false,
			document: false,
			restartOnPushState: false,
			restartOnRequestAfter: false,
		});
		pace.stop();
	}

	function onAppStart() {
		kenrobot.trigger("app-menu", "load", menu, "index");

		inSync = true;
		kenrobot.postMessage("app:loadToken").then(result => {
			kenrobot.user = result
		}).fin(() => {
			emitor.trigger("user", "update");
		});

		kenrobot.postMessage("app:getBaseUrl").then(url => {
			baseUrl = url;

			setTimeout(() => {
				onSwitch("scratch3");

				//app启动后自动检查更新，并且如果检查失败或者没有更新，不提示
				setTimeout(() => {
					onCheckUpdate(false);

					inSync = false;
					//项目同步
					onProjectSync();
				}, 3000);
			}, 400);
		});
	}

	function onUtilMessage() {
		util.message.apply(this, arguments);
	}

	function onShortcutRegister(shortcuts) {
		mousetrap && shortcuts.forEach(function(shortcut){
			mousetrap.bind(shortcut.key, function() {
				shortcut.callback && shortcut.callback();

				return false;
			});
		});
	}

	function onUserLogout() {
		kenrobot.postMessage("app:logout").then(() => {
			util.message("退出成功");
		}).fin(() => {
			kenrobot.user = null;
			emitor.trigger("user", "update");
		});
	}

	function onUserUpdate() {
		kenrobot.user && setTimeout(() => onProjectSync(), 2000);
	}

	function onProjectSync() {
		// if(inSync || !kenrobot.user) {
		// 	return;
		// }

		// inSync = true;
		// // util.message("项目开始同步");
		// kenrobot.postMessage("app:projectSync").then(() => {
		// 	inSync = false;
		// 	util.message("项目同步成功");
		// }, err => {
		// 	inSync = false;
		// 	util.message({
		// 		text: "项目同步失败",
		// 		type: "error",
		// 	});
		// });
	}

	function onMenuAction(action, extra) {
		switch(action) {
			case "fullscreen":
				kenrobot.postMessage("app:fullscreen");
				break;
			case "language":
				util.message("敬请期待");
				break;
			case "theme":
				util.message("敬请期待");
				break;
			case "setting":
				// kenrobot.trigger("setting", "show");
				util.message("敬请期待");
				break;
			case "switch":
				onSwitch(extra.type);
				break;
			case "check-update":
				onCheckUpdate();
				break;
			case "visit-kenrobot":
				kenrobot.postMessage("app:openUrl", "https://www.kenrobot.com");
				break;
			case "visit-arduino":
				kenrobot.postMessage("app:openUrl", "http://www.arduino.cn");
				break;
			case "suggestion":
				kenrobot.postMessage("app:openUrl", "http://www.arduino.cn/forum-101-1.html");
				break;
			case "about-kenrobot":
				var info = kenrobot.appInfo;
				kenrobot.trigger("about", "show", {
					version: info.version,
					url: "https://www.kenrobot.com",
					date: info.date,
					platform: info.platform,
					appBit: info.appBit,
					buildNumber: info.buildNumber,
				});
				break;
		}
	}

	function onCheckUpdate(manual) {
		var promise = $.Deferred();

		manual = manual !== false;

		kenrobot.postMessage("app:checkUpdate").then(result => {
			if(result.status != 0) {
				manual && util.message("已经是最新版本了");
				promise.resolve(1);
				return;
			}

			kenrobot.trigger("update", "show", result.data);
			promise.resolve(0);
		}, err => {
			manual && util.message("检查更新失败");
			promise.resolve(-1)
		});

		return promise
	}

	function onSwitch(name) {
		kenrobot.reset();

		kenrobot.trigger("app", "will-leave");
		iframe.src = `${baseUrl}/${name}`;

		iframe.addEventListener("load", () => {
			mousetrap = Mousetrap(iframe.contentDocument);
		}, false);
		pace.restart();
	}

	function onFullscreenChange(fullscreen) {
		emitor.trigger("app", "fullscreenChange", fullscreen);
	}

	function onSerialPortData(portId, data) {
		kenrobot.trigger("serialport", "data", portId, data);
	}

	function onSerialPortError(portId, err) {
		kenrobot.trigger("serialport", "error", portId, err);
	}

	function onSerialPortClose(portId) {
		kenrobot.trigger("serialport", "close", portId);
	}

	function onBuildError(message, err) {
		util.confirm({
			text: message,
			cancelLabel: "确定",
			confirmLabel: "查看日志",
			onConfirm: function() {
				kenrobot.delayTrigger(500, "error", "show", {output: [message, err]});
			}
		});
	}

	function onContextMenu(e) {
		e.preventDefault();

		hideMenu();

		emitor.trigger("app", "contextMenu", e);

		return false;
	}

	function onWindowClick(e) {
		hideMenu();
	}

	function onWindowResize(e) {
		hideMenu();
		emitor.trigger("app", "resize", e);
	}

	function hideMenu() {
		$('.x-select, .x-context-menu').removeClass("active");
	}

	return {
		init: init,
	};
});

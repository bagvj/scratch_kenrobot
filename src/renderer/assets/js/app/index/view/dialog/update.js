define(['vendor/jquery', 'app/common/util/util', 'app/common/util/emitor'], function($1, util, emitor) {
	var dialogWin;

	var versionInfo;
	var action;
	var versionPath;
	var taskId;
	var userCancel;

	function init() {
		dialogWin = $('.update-dialog').on("click", ".thanks", onThanksClick).on("click", ".download", onDownloadClick);

		kenrobot.on('update', 'show', onShow, {canReset: false});
	}

	function onShow(args) {
		if(action == "background-download") {
			action = "downloading";
			setBackground(false);
		} else if(action == "install" || action == "open") {
			doShow();
		} else {
			versionInfo = args;
			action = "download";

			dialogWin.find(".download").val("立即更新");
			dialogWin.find(".thanks").val("暂不下载").show();
			dialogWin.find(".name").text(versionInfo.appname);
			dialogWin.find(".version").text(versionInfo.version);
			updateContent(dialogWin.find(".features-wrap"), versionInfo.changelog.features);
			updateContent(dialogWin.find(".bugs-wrap"), versionInfo.changelog.bugs);

			doShow();
		}
	}

	function onCancel() {
		if(action == "downloading") {
			action = "background-download";
			util.message(`新版本${versionInfo.version}已进入后台下载`);
		}
	}

	function onClosed() {
		dialogWin.removeClass("x-into-background");
	}

	function afterShow() {
		dialogWin.removeClass("x-into-front");
		if(action == "downloading") {
			dialogWin.addClass("x-into-background");
		}
	}

	function doShow() {
		util.dialog({
			selector: dialogWin,
			onCancel: onCancel,
			onClosed: onClosed,
			afterShow: afterShow,
		});
	}

	function updateContent(element, list) {
		element.find(".list").empty();

		if(!list || list.length == 0) {
			element.removeClass("active");
			return;
		}

		element.find(".list").append(list.map(item => $(`<li>${item}</li>`)));
		element.addClass("active");
	}

	function onThanksClick() {
		if(action == "downloading") {
			action = "background-download";
			setBackground(true);
			util.message(`新版本${versionInfo.version}已进入后台下载`);
		} else {
			dialogWin.find(".x-dialog-close").trigger("click");
		}
	}

	function onDownloadClick() {
		if(action == "download") {
			action = "downloading";
			var downloadBtn = dialogWin.find(".download").val("下载中 0%");
			var thanksBtn = dialogWin.find(".thanks").val("后台下载");
			dialogWin.addClass("x-into-background");

			kenrobot.postMessage("app:download", versionInfo.download_url, {checksum: versionInfo.checksum}).then(result => {
				taskId = null;
				userCancel = false;
				versionPath = result.path;

				kenrobot.postMessage("app:removeOldVersions", versionInfo.version).fin(() => {
					enableHoverCancel(false);
					var oldAction = action;
					var info = kenrobot.appInfo;
					if(info.platform == "win") {
						downloadBtn.val("安装");
						action = "install";
					} else {
						downloadBtn.val("打开");
						action = "open";
					}
					thanksBtn.hide();
					if(oldAction == "background-download") {
						setBackground(false);
					}
				});

				emitor.trigger("update", "download", true);
			}, err => {
				enableHoverCancel(false);
				!userCancel && util.error(`新版本${versionInfo.version}下载失败`);
				downloadBtn.val("重新下载");
				action = "download";
				taskId = null;
				userCancel = false;

				emitor.trigger("update", "download", false);
			}, progress => {
				!taskId && (taskId = progress.taskId)
				var totalSize = progress.totalSize || 100 * 1024 * 1024;
				var percent = parseInt(100 * progress.size / totalSize);
				var text = `下载中 ${percent}%`;
				if(downloadBtn.data("action") === "cancel") {
					downloadBtn.data("progress", text);
				} else {
					downloadBtn.val(text);
				}

				emitor.trigger("update", "download", percent);
			});

			enableHoverCancel(true);
		} else if(action == "install") {
			onThanksClick();
			kenrobot.postMessage("app:execFile", versionPath).then(() => {
				util.message("安装成功");
			}, err => {
				util.error("安装失败");
			});
		} else if(action == "open") {
			onThanksClick();
			kenrobot.postMessage("app:showItemInFolder", versionPath);
		} else if(action == "downloading") {
			//取消
			taskId && kenrobot.postMessage("app:cancelDownload", taskId);
			taskId = null;
			util.message("取消成功");
			userCancel = true;
		}
	}

	function enableHoverCancel(value) {
		var downloadBtn = dialogWin.find(".download");

		downloadBtn.off("mouseenter", onDownloadHoverIn);
		downloadBtn.off("mouseleave", onDownloadHoverOut);

		if(value) {
			downloadBtn.on("mouseenter", onDownloadHoverIn);
			downloadBtn.on("mouseleave", onDownloadHoverOut);
		}
	}

	function onDownloadHoverIn() {
		dialogWin.find(".download").val("取消下载").data("action", "cancel");
	}

	function onDownloadHoverOut() {
		var btn = dialogWin.find(".download");
		dialogWin.find(".download").val(btn.data("progress")).data("action", "").data("progress", "");
	}

	function setBackground(value) {
		if(value) {
			dialogWin.addClass("x-into-background");
			dialogWin.find(".x-dialog-close").trigger("click");
		} else {
			dialogWin.addClass("x-into-front");

			doShow();
		}
	}

	return {
		init: init,
	};
});
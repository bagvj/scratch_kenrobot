define(['app/common/util/emitor', 'app/common/util/report', './controller/index'], function(emitor, report, controller) {

	function init() {
		window.kenrobot = window.kenrobot || top.kenrobot;

		report.init();
		controller.init();

		emitor.trigger('app', 'start');
	}

	return {
		init: init,
	}
});

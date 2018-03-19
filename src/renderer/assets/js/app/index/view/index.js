define(['./titlebar', './dialog/update', './dialog/login', './dialog/about', './dialog/common', './dialog/prompt', './dialog/save', './dialog/saveAs', './dialog/error', './dialog/project', './dialog/setting'], function(titlebar, update, login, about, common, prompt, save, saveAs, error, project, setting) {

	function init() {
		titlebar.init();

		update.init();
		login.init();
		about.init();
		common.init();
		prompt.init();
		save.init();
		saveAs.init();
		error.init();
		project.init();
		setting.init();
	}

	return {
		init: init,
	};
});
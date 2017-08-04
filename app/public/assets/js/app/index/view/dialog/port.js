define(['vendor/jquery', 'app/common/util/util', 'app/common/util/emitor'], function($1, util, emitor) {
	var dialogWin;
	var portList;
	var callback;
	var ports;

	function init() {
		dialogWin = $('.port-dialog');
		portList = $('.port-list', dialogWin).on('click', '.placeholder', onShowPortSelect);

		kenrobot.on('port', 'show', onShow, {canReset: false});
	}

	function onShow(args) {
		ports = args.ports;
		callback = args.callback;

		reset();
		var ul = $("> ul", portList);
		var index = 0;
		ports.forEach(function(port, i) {
			if(args.selected && port.comName == args.selected) {
				index = i;
			}
			$('<li>').data('value', port.comName).text(port.boardName ? (port.comName + "(" + port.boardName + ")") : port.comName).attr("title", port.boardName || "").appendTo(ul);
		});
		$('li', ul).on('click', onPortSelectClick).eq(index).trigger("click");

		util.dialog({
			selector: dialogWin,
			onClosed: onClosed,
			onConfirm: onConfirm,
			onCancel: onCancel,
		});
	}

	function onClosed() {
		reset();
	}

	function onConfirm() {
		var comName = portList.data("value");
		var port;
		ports.forEach(function(p) {
			if(p.comName == comName) {
				port = p;
				return true;
			}
		});
		callback(port);
	}

	function onCancel() {
		callback();
	}

	function reset() {
		$('.placeholder', portList).empty();
		$('> ul', portList).empty();
	}

	function onShowPortSelect(e) {
		var select = $(this).closest(".x-select");
		select.toggleClass("active");
		e.stopPropagation();
	}

	function onPortSelectClick(e) {
		var li = $(this);
		var select = li.closest(".x-select");
		select.removeClass("active").data("value", li.data("value")).find(".placeholder").html(li.html()).attr('title', li.attr('title') || "");
	}

	return {
		init: init,
	};
});
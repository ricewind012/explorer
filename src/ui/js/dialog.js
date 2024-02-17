document.addEventListener('DOMContentLoaded', () => {
	g_Elements.dialog = {
		ok:     id('button-ok'),
		cancel: id('button-cancel'),
		apply:  id('button-apply'),
	};

	g_Elements.dialog.cancel?.addEventListener('click', () => {
		window.close();
	});
});

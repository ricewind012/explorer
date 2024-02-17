import {
	CAppData,
	CList,
} from './classes.js';

document.addEventListener('DOMContentLoaded', () => {
	g_Elements.options = {
		hidden_files_off:      id('hidden-files-off'),
		hidden_files_on:       id('hidden-files-on'),
		full_path_in_titlebar: id('full-path-in-titlebar'),
		hide_file_extensions:  id('hide-file-extensions'),
		description_bar:       id('description-bar'),
	};

	g_Elements.options_dialog = {
		list: id('options-dialog-file-types-list'),
	};

	let list = new CList(g_Elements.options_dialog.list);
	let data = CAppData.Get(k_strOptionsKey);

	for (let k of Object.keys(g_Elements.options)) {
		let el = g_Elements.options[k];
		el.checked = data[k];
		el.addEventListener('click', () => {
			g_Elements.dialog.apply.disabled = false;
		});
	}

	function OnClick() {
		for (let k of Object.keys(g_Elements.options))
			data[k] = g_Elements.options[k].checked;

		CAppData.Set(k_strOptionsKey, data);
	};

	g_Elements.dialog.ok.addEventListener('click', () => {
		OnClick();
		window.close();
	});

	g_Elements.dialog.apply.addEventListener('click', () => {
		OnClick();
		g_Elements.dialog.apply.disabled = true;
	});
});

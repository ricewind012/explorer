import { CTitlebar } from './elements/title-bar.js';

window.addEventListener('message', (ev) => {
	let data = ev.data;

	CTitlebar.UpdateTitle(data.title);
	g_Elements.alert.text.innerText = data.text;
	g_Elements.alert.icon.setAttribute('type', data.icon);
});

document.addEventListener('DOMContentLoaded', () => {
	g_Elements.alert = {
		icon: id('alert-icon'),
		text: id('alert-text'),
		ok:   id('alert-ok'),
	};

	g_Elements.alert.ok.addEventListener('click', () => {
		window.close();
	});
});

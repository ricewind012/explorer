let g_Elements = {};

window.addEventListener('focus', () => {
	document.documentElement.setAttribute('focused', '');
});

window.addEventListener('blur', () => {
	document.documentElement.removeAttribute('focused');
});

window.addEventListener('message', (ev) => {
	g_Message = ev.data;

	console.log('Message received: %o', ev.data);
});

document.addEventListener('keydown', (ev) => {
	switch (ev.key) {
		case 'Escape':
			window.close();
			break;
	}
});

document.addEventListener('DOMContentLoaded', () => {
	g_Elements.titlebar = {
		icon: id('titlebar-icon'),
		name: id('titlebar-name'),

		buttons: {
			minimise: id('titlebar-button-minimise'),
			maximise: id('titlebar-button-maximise'),
			restore:	id('titlebar-button-restore'),
			close:		id('titlebar-button-close'),
		},
	};

	// Set up titlebar
	let buttons = g_Elements.titlebar.buttons;

	buttons.minimise?.addEventListener('click', () => {
		electron.ipcRenderer.send('minimize');
	});
	buttons.maximise?.addEventListener('click', () => {
		HandleMaximizeButton();
	});
	buttons.restore?.addEventListener('click', () => {
		HandleMaximizeButton();
	});
	buttons.close?.addEventListener('click', () => {
		electron.ipcRenderer.send('close');
	});
});
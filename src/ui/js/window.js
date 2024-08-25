let g_Elements = {};

window.addEventListener('focus', () => {
	document.documentElement.classList.add('focused');
});

window.addEventListener('blur', () => {
	document.documentElement.classList.remove('focused');
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
	g_Elements.titlebar = id('titlebar');
});

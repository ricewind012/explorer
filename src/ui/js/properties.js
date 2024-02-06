import EFileType from '../../shared/EFileType.js';
import { CPath } from './classes.js';
import { HumanReadableSize } from './functions.js';

window.addEventListener('message', (ev) => {
	let file = ev.data.file;

	g_Elements.file.name.innerText = CPath.Basename(file.path);

	g_Elements.info.type.innerText = EFileType[file.type];
	g_Elements.info.path.innerText = file.path
		.split('/')
		.filter(e => e)
		.slice(-2, -1)
		[0] || '/';
	g_Elements.info.size.innerText = HumanReadableSize(file.size);
	if (file.size)
		g_Elements.info.size.innerText += ` (${file.size?.toLocaleString()} bytes)`;

	g_Elements.attr.versteckt.checked = file.path[0] == '.';
	g_Elements.attr.readonly.checked = !(file.mode & S_IWUSR);
	g_Elements.attr.system.checked = !(file.mode & S_IWOTH);
});

document.addEventListener('DOMContentLoaded', () => {
	g_Elements = {
		file: {
			icon: id('file-icon'),
			name: id('file-name'),
		},

		info: {
			type: id('file-type'),
			path: id('file-path'),
			size: id('file-size'),
		},

		attr: {
			versteckt: id('attr-versteckt'),
			readonly:  id('attr-read-only'),
			system:    id('attr-system'),
		},

		btns: {
			ok: id('button-ok'),
		},
	};

	g_Elements.btns.ok.addEventListener('click', () => {
		window.close();
	});
});

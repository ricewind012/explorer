function CreateWindow(strPageName, options, msg) {
	options = Object.assign(options, {
		autoHideMenuBar: true,
		resizable:       false,
		frame:           false,
	});
	options = Object.entries(options)
		.map(e => e.join('='))
		.join(',');

	let hWindow = window.open(`${strPageName}.html`, '_blank', options);

	hWindow.addEventListener('DOMContentLoaded', () => {
		hWindow.postMessage(msg);
	});

	return hWindow;
}

function HandlePointerEvent(el, fnMoveCallback) {
	el.addEventListener('pointerdown', () => {
		function fnMove(ev) {
			fnMoveCallback(ev);
		}

		function fnUp() {
			removeEventListener('pointermove', fnMove);
			removeEventListener('pointerup', fnUp);
		}

		addEventListener('pointermove', fnMove, { passive: true });
		addEventListener('pointerup', fnUp, { passive: true });
	});
}

function HandleMaximizeButton() {
	let buttons = g_Elements.titlebar.buttons;
	let bFullscreen = buttons.maximise.hidden;

	buttons.restore.hidden  = bFullscreen;
	buttons.maximise.hidden = !bFullscreen;
	electron.ipcRenderer.send('fullscreen');
}

function GetPreviousSiblingsWidth(el) {
	let nWidth = 0;

	while (el.previousElementSibling) {
		let elPrevious = el.previousElementSibling;

		nWidth += elPrevious.getBoundingClientRect().width;
		el = elPrevious;
	}

	return nWidth;
}

function PermissionsToString(nPerms) {
	let char = (c, p) => nPerms & p ? c : '-';
	let strResult = '';

	strResult += char('r', S_IRUSR);
	strResult += char('w', S_IWUSR);
	strResult += char('x', S_IXUSR);
	strResult += char('r', S_IRGRP);
	strResult += char('w', S_IWGRP);
	strResult += char('x', S_IXGRP);
	strResult += char('r', S_IROTH);
	strResult += char('w', S_IWOTH);
	strResult += char('x', S_IXOTH);

	return strResult;
}

function HumanReadableSize(nBytes) {
	if (!nBytes || nBytes >= k_n1TB)
		return '0 B';

	let eUnit = Math.floor(Math.log(nBytes) / Math.log(1024));
	let nSize = Math.round(nBytes / Math.pow(1024, eUnit));

	return `${nSize} ${EFileUnits[eUnit]}`;
}

function UpdateTitle(strName) {
	strName = `Exploring - ${strName}`;
	document.title = strName;
	g_Elements.titlebar.name.innerText = strName;
}

function UpdateStatusbar(strSection, strText) {
	g_Elements.statusbar[strSection].innerText = strText;
}
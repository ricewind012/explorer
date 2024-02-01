import EFileType from '../../shared/EFileType.js';
import {
	EFileSorting,
	EFileUnits,
} from './enums.js';

export function AlertDialog(strIcon, strTitle, strText) {
	electron.Window.Create(
		'alert',
		{
			resizable: false,
			width:     380,
			height:    164,
		},
		{
			icon:  strIcon,
			title: strTitle,
			text:  strText,
		}
	);
}

export function HandlePointerEvent(el, fnMoveCallback) {
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

export function HandleMaximizeButton() {
	let buttons = g_Elements.titlebar.buttons;
	let bFullscreen = buttons.maximise.hidden;

	buttons.restore.hidden  = bFullscreen;
	buttons.maximise.hidden = !bFullscreen;
	electron.Window.ToggleFullscreen();
}

export function OnKeyPress(ev) {
	switch (ev.key) {
		case 'Enter':
			let selection = g_Path.m_Selection;

			switch (selection.file.type) {
				case EFileType.NotFound:
				case EFileType.Unknown:
					break;

				case EFileType.Directory:
					g_Path.Navigate(selection.file.path);
					break;

				default:
					g_Path.ExecuteSelection();
					break;
			}
			break;

		case 'Backspace':
			let strPath = g_Path.m_strPath;

			if (!strPath || strPath == '/')
				return;

			g_Path.Navigate(
				'/' + strPath
					.split('/')
					.filter(e => e)
					.slice(0, -1)
					.join('/')
			);
			break;

		case 'F2':
			g_Path.RenameSelection();
			break;

		case 'Delete':
			g_Path.DeleteSelection();
			break;
	}
}

export function GetPreviousSiblingsWidth(el) {
	let nWidth = 0;

	while (el.previousElementSibling) {
		let elPrevious = el.previousElementSibling;

		nWidth += elPrevious.getBoundingClientRect().width;
		el = elPrevious;
	}

	return nWidth;
}

export function PermissionsToString(nPerms) {
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

export function HumanReadableSize(nBytes) {
	if (!nBytes)
		return '0 B';

	let eUnit = Math.floor(Math.log(nBytes) / Math.log(1024));
	let nSize = Math.round(nBytes / Math.pow(1024, eUnit));

	return `${nSize} ${EFileUnits[eUnit]}`;
}

export function UpdateTitle(strName) {
	document.title = strName;
	g_Elements.titlebar.name.innerText = strName;
}

export function UpdateStatusbar(strSection, strText) {
	g_Elements.statusbar[strSection].innerText = strText;
}

import { CPath, CPathSelection } from './classes.js';
import EFileType from '../../shared/EFileType.js';
import { EFileUnits } from './enums.js';

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
	let section = g_LastClickedSection;

	// TODO: maybe use events to not do ChangeFromEl
	switch (ev.key) {
		case 'ArrowUp': {
			ev.preventDefault();

			section.ChangeFromEl(
				section.m_Selection.el
					.parentElement.previousElementSibling
					?.querySelector(`:scope > .${CPathSelection.s_classes.item}`)
			);
			break;
		}

		case 'ArrowDown': {
			ev.preventDefault();

			section.ChangeFromEl(
				section.m_Selection.el
					.parentElement.nextElementSibling
					?.querySelector(`:scope > .${CPathSelection.s_classes.item}`)
			);
			break;
		}

		case 'Enter':
			let selection = g_LastClickedSection.m_Selection;

			OpenFile(
				selection.file,
				(strPath) => {
					g_Path.Navigate(strPath);
				},
				(strPath) => {
					g_PathSelection.Execute();
				}
			);
			break;

		case 'Backspace':
			g_Path.NavigateToParent();
			break;

		case 'F2':
			g_PathSelection.Rename();
			break;

		case 'Delete':
			g_PathSelection.Delete();
			break;
	}
}

export function OpenFile(file, fnDirCallback, fnFileCallback) {
	switch (file.type) {
		case EFileType.NotFound:
		case EFileType.Unknown:
			break;

		case EFileType.Directory:
			fnDirCallback(file.path);
			break;

		default:
			fnFileCallback(file.path);
			break;
	}
}

export function GetParentElementWithID(elChild) {
	let el = elChild;

	while (!el.id) {
		if (!el.parentElement)
			return null;

		el = el.parentElement;
	}

	return el;
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

export function CreateShortcut(file) {
	electron.File.Write(`${file.path}.desktop`, `[Desktop Entry]
Name=${CPath.Basename(file.path)}
Type=Link
URL=file://${file.path}
`);
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

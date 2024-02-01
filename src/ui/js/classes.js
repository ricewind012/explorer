import EFileType from '../../shared/EFileType.js';

import {
	AlertDialog,
	HumanReadableSize,
	OnKeyPress,
	PermissionsToString,
	UpdateStatusbar,
} from './functions.js';

export class CAppData {
	static Set(k, v) {
		localStorage.setItem(k, JSON.stringify(v));
	}

	static Get(strItem) {
		return JSON.parse(localStorage.getItem(strItem));
	}
}

export class CPath {
	constructor() {
		this.m_strPath = null;
		this.m_Selection = null;
		this.m_Sorting  = {
			data:   null,
			button: null,
			order:  0,
		};
	}

	Render() {
		let elList = g_Elements.content.list;
		let strLabel = `${g_vecFiles.length} files in ${this.m_strPath}`;
		this.m_Selection = null;
		postMessage({ action: 'close' });
		console.time(strLabel);

		elList.innerHTML = '';
		for (let i = 0; i < g_vecFiles.length; i++) {
			let file = g_vecFiles[i];
			let bUnknownType = file.type == EFileType.Unknown;
			console.assert(!bUnknownType, 'EFileType == 8 for %o', file.path);

			let elEntry = g_Elements.content.entry.content.cloneNode(true);
			let elEntryContainer = elEntry.children[0];
			let [
				elListIcon,
				elListName,
				_elListRenameInput,
				elListSize,
				elListType,
				elListMode,
			] = [...elEntryContainer.children];

			elEntryContainer.addEventListener('click', (ev) => {
				this.ChangeSelection(ev.target.parentNode, file);
			});

			elListName.innerText = file.path
				.split('/')
				.filter(e => e)
				.splice(-1);

			if (!bUnknownType) {
				for (let i of Object.keys(file))
					elEntryContainer.setAttribute(i, file[i]);

				elListType.innerText = EFileType[file.type];
				elListMode.innerText = PermissionsToString(
					`0o${(file.mode).toString(8)}`
				);

				if (file.type == EFileType.Directory) {
					elListName.addEventListener('dblclick', (ev) => {
						g_Path.Navigate(file.path);
					});
				} else {
					let strExtension = file.path.match(/\.[\w-]+$/);
					elListIcon.setAttribute('ext', strExtension);

					elListName.addEventListener('dblclick', (ev) => {
						this.ExecuteSelection();
					});
					elListSize.innerText = HumanReadableSize(file.size);
				}
			}

			elList.appendChild(elEntry);
		}

		console.timeEnd(strLabel);
	}

	Navigate(strPath) {
		try {
			window.g_vecFiles = electron.FS.List(strPath);
		} catch(e) {
			AlertDialog('error', 'Navigate() error', e.message);
			return;
		}

		evt('explorer:navigate', {
			path:  strPath,
			count: g_vecFiles.length,
		});
	}

	ChangeSelection(el, file) {
		this.m_Selection?.el.removeAttribute('selected');
		this.m_Selection = {
			el,
			file
		};
		this.m_Selection.el.setAttribute('selected', '');

		if (this.m_Selection.file.type == EFileType.Directory)
			return;

		UpdateStatusbar(
			'usage',
			HumanReadableSize(this.m_Selection.file.size)
		);
	}

	DeleteSelection() {
		let selection = this.m_Selection;

		try {
			electron.File.Delete(selection.file.path, { recursive: true });
		} catch (e) {
			AlertDialog('error', 'DeleteSelection() error', e.message);
			return;
		}

		console.log('%o deleted', selection.file.path);
		selection.el.remove();
	}

	ExecuteSelection() {
		try {
			electron.ExecuteCommand(`${k_strOpener} ${this.m_Selection.file.path}`);
		} catch (e) {
			AlertDialog('error', 'ExecuteSelection() error', e.message);
			return;
		}
	}

	RenameSelection() {
		let elSelection = this.m_Selection.el;
		let elListName = elSelection.querySelector(':scope > .list-name');
		let elInput = elSelection.querySelector(':scope > .list-rename-input');

		elListName.hidden = true;
		elInput.value = elListName.innerText;
		elInput.hidden = false;
		elInput.focus();
		elInput.select();

		function GoBack() {
			elListName.hidden = false;
			elInput.hidden = true;

			electron.Window.SetDestroyable(true);
			document.addEventListener('keydown', OnKeyPress);
			document.removeEventListener('keydown', OnAccept);
			document.removeEventListener('keydown', OnCancel);
		}

		function OnAccept(ev) {
			if (ev.key != 'Enter')
				return;

			let strOldName = elListName.innerText;
			let strNewName = elInput.value;

			if (strNewName == '' || strOldName == strNewName) {
				GoBack();
				return;
			}

			console.log('%o renamed to %o', strOldName, strNewName);
			g_Path.m_Selection.file.path = strNewName;
			elListName.innerText = strNewName;
			try {
				electron.File.Move(
					g_Path.m_strPath + '/' + strOldName,
					g_Path.m_strPath + '/' + strNewName
				);
			} catch (e) {
				AlertDialog('error', 'electron.File.Move() error', e.message);
			}

			GoBack();
		}

		function OnCancel(ev) {
			if (ev.key != 'Escape')
				return;

			GoBack();
		}

		electron.Window.SetDestroyable(false);
		document.removeEventListener('keydown', OnKeyPress);
		document.addEventListener('keydown', OnAccept);
		document.addEventListener('keydown', OnCancel);
	}
}

export class CTree {
	constructor() {
		this.m_elTreeSelection = null;
	}

	RenderPath(strPath) {
		let files;
		try {
			files = electron.FS.List(strPath);
		} catch (e) {
			AlertDialog('error', 'electron.FS.List() error', e.message);
			return;
		}

		return files
			.filter(e => e.type == EFileType.Directory)
			.map(file => {
				let elEntry = g_Elements.tree.template.content.cloneNode(true);
				let elEntryContainer = elEntry.children[0];
				let [
					elListIcon,
					elListImage,
					elListName,
				] = [...elEntryContainer.querySelectorAll(':scope > div > *')];

				let strFolderName = file.path
					.split('/')
					.filter(e => e)
					.splice(-1)[0];
				elListName.innerText = strFolderName;

				const OnClick = (ev) => {
					let elTarget = ev.target;

					this.m_Selection?.removeAttribute('selected');
					this.m_Selection = elEntryContainer;
					this.m_Selection.setAttribute('selected', '');

					if (elEntryContainer.getAttribute('open') == '')
						elEntryContainer.removeAttribute('open');
					else
						elEntryContainer.setAttribute('open', '');

					if (elEntryContainer.bRendered)
						return;

					let dirs = this.RenderPath(file.path);

					if (!dirs?.length) {
						elEntryContainer.setAttribute('empty', '');
					} else {
						for (let i of dirs)
							elEntryContainer.appendChild(i);
					}

					elEntryContainer.bRendered = true;
				}

				elListIcon.addEventListener('click', OnClick);
				elListName.addEventListener('click', (ev) => {
					OnClick(ev);

					let path = strPath + '/' + strFolderName;

					if (window.g_Path?.m_strPath == path)
						return;

					window.g_Path.Navigate(path);
				});

				return elEntry;
			});
	}

	Render() {
		let strLabel = 'CTree::Render()';
		let elTree = g_Elements.tree.container;

		console.time(strLabel);
		for (let i of this.RenderPath('/'))
			elTree.appendChild(i)
		console.timeEnd(strLabel);
	}
}

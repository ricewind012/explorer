class CEnum {
	constructor(...vecMembers) {
		for (let i = 0; i < vecMembers.length; i++) {
			this.Append(vecMembers[i], i);
		}
	}

	Append(strMember, nNumber) {
		this[nNumber] = strMember;
		this[strMember] = nNumber;
	}
}

class CAppData {
	Set(k, v) {
		localStorage.setItem(k, JSON.stringify(v));
	}

	Get(strItem) {
		return JSON.parse(localStorage.getItem(strItem));
	}
}

class CPath {
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
				elListMode.innerText = (() => {
					switch (file.mode) {
						case EFileType.Directory:
							return 'd';
						case EFileType.Symlink:
							return 'l';
						default:
							return file.mode & S_IRGRP ? '-' : 's';
					}
				})();
				elListMode.innerText += PermissionsToString(
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
			g_vecFiles = electron.FS.List(strPath).map(e => {
				let type = (() => {
					switch (e.mode & S_IFMT) {
						case S_IFREG:  return EFileType.Regular;
						case S_IFDIR:  return EFileType.Directory;
						case S_IFLNK:  return EFileType.Symlink;
						case S_IFBLK:  return EFileType.Block;
						case S_IFCHR:  return EFileType.Character;
						case S_IFIFO:  return EFileType.FIFO;
						case S_IFSOCK: return EFileType.Socket;
						default:       return EFileType.Unknown;
					}
				})();

				return Object.assign(e, { type })
			});
		} catch(e) {
			alert(e.message);
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
			alert(e.message);
			return;
		}

		console.log('%o deleted', selection.file.path);
		selection.el.remove();
	}

	ExecuteSelection() {
		try {
			electron.ExecuteCommand(`${k_strOpener} ${this.m_Selection.file.path}`);
		} catch (e) {
			alert(e.message);
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
				alert(e.message);
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

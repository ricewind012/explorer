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
		console.time(strLabel);

		elList.innerHTML = '';
		for (let i = 0; i < g_vecFiles.length; i++) {
			let hFile = g_vecFiles[i];
			let bUnknownType = hFile.type == EFileType.NotFound;
			console.assert(!bUnknownType, 'EFileType == -1 for %o', hFile.path);

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
				this.ChangeSelection(ev.target.parentNode, hFile);
			});

			elListName.innerText = hFile.path
				.split('/')
				.filter(e => e)
				.splice(-1);

			if (!bUnknownType) {
				for (let i of Object.keys(hFile))
					elEntryContainer.setAttribute(i, hFile[i]);

				elListType.innerText = EFileType[hFile.type];
				elListMode.innerText = (() => {
					switch (hFile.mode) {
						case EFileType.Directory:
							return 'd';
						case EFileType.Symlink:
							return 'l';
						default:
							return hFile.mode & S_IRGRP ? '-' : 's';
					}
				})();
				elListMode.innerText += PermissionsToString(
					`0o${(hFile.mode).toString(8)}`
				);

				if (hFile.type == EFileType.Directory) {
					elListName.addEventListener('dblclick', (ev) => {
						g_Path.Navigate(hFile.path);
					});
				} else {
					let strExtension = hFile.path.match(/\.[\w-]+$/);
					elListIcon.setAttribute('ext', strExtension);

					elListName.addEventListener('dblclick', (ev) => {
						this.ExecuteSelection();
					});
					elListSize.innerText = HumanReadableSize(hFile.size);
				}
			}

			elList.appendChild(elEntry);
		}

		console.timeEnd(strLabel);
	}

	Navigate(strPath) {
		try {
			g_vecFiles = electron.FilesystemUtils.GetFiles(strPath);
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

	ExecuteSelection() {
		try {
			electron.ExecuteCommand(`${k_strOpener} ${this.m_Selection.file.path}`);
		} catch (e) {
			alert(e.message);
			return;
		}
	}
}

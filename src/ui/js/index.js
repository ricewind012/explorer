import {
	CAppData,
	CPath,
	CTree,
	CWindow,
} from './classes.js';

import {
	OnKeyPress,
	HandlePointerEvent,
	CreateShortcut,
	HumanReadableSize,
	UpdateTitle,
	UpdateStatusbar,
} from './functions.js';

import vecMenuEntries from './menu-shared.js';

window.g_Path      = new CPath();
window.g_Tree      = new CTree();
window.g_strFileToCopy = '';

let g_hChildWindow = null;
let g_vecFiles     = [];

let g_vecTableButtons = [
	{
		name: 'name',
		functions: [
			(a, b) => a,
			(a, b) => a.path.localeCompare(b.path),
			(a, b) => b.path.localeCompare(a.path),
		],
	}, {
		name: 'size',
		functions: [
			(a, b) => a,
			(a, b) => a.size - b.size,
			(a, b) => b.size - a.size,
		],
	}, {
		name: 'type',
		functions: [
			(a, b) => a,
			(a, b) => a.type - b.type,
			(a, b) => b.type - a.type,
		],
	}, {
		name: 'mode',
		functions: [
			(a, b) => a,
			(a, b) => a.mode - b.mode,
			(a, b) => b.mode - a.mode,
		],
	},
];

window.addEventListener('message', async (ev) => {
	let data = ev.data;

	switch (data.action) {
		case 'close':
			if (g_hChildWindow)
				electron.Window.Close(g_hChildWindow);
			g_hChildWindow = null;
			break;

		case 'execute':
			g_Path.ExecuteSelection();
			break;

		case 'navigate':
			g_Path.Navigate(data.path);
			break;

		case 'create-window':
			g_hChildWindow = await CWindow.Properties(data.file);
			break;

		case 'create-shortcut':
			CreateShortcut(data.file);
			g_Path.CreateListItemFromNewFile(`${data.file.path}.desktop`)
			break;

		case 'file-cut':
		case 'file-copy':
			g_Path.CopySelection();
			break;

		case 'file-paste':
			g_Path.PasteSelection();
			break;

		case 'file-delete':
			g_Path.DeleteSelection();
			break;

		case 'file-rename':
			g_Path.RenameSelection();
			break;
	}
});

document.addEventListener('keydown', OnKeyPress);

document.addEventListener('contextmenu', async (ev) => {
	let selection = g_Path.m_Selection;

	if (!selection?.el)
		return;

	let unMenuHeight = vecMenuEntries
		.map(e => e.length ? 17 : 10)
		.reduce((a, b) => a + b) + 1;

	g_hChildWindow = await CWindow.Menu(ev, selection.file, unMenuHeight);
});

document.addEventListener('explorer:navigate', (ev) => {
	LogEvt(ev);

	let {
		path:  strPath,
		count: nFiles,
	} = ev.detail;
	let {
		bsize:  nBlockSize,
		blocks: nBlocks,
		bfree:  nBlocksFree,
	} = electron.FS.Stat(strPath);
	let nDiskUsage = nBlocks * nBlockSize - nBlocksFree * nBlockSize;

	UpdateStatusbar('count', `${nFiles} object(s)`);
	UpdateStatusbar('usage', HumanReadableSize(nDiskUsage));

	CAppData.Set('last_path', strPath);
	g_Path.m_strPath = strPath;
	g_Path.Render();
	UpdateTitle(`Exploring - ${strPath}`);
});

document.addEventListener('explorer:sort', (ev) => {
	LogEvt(ev);

	g_Path.m_Sorting = {
		button: ev.detail.button,
		order:  ev.detail.order,
	};

	CAppData.Set('last_sort', {
		button: ev.detail.button.name,
		order:  ev.detail.order,
	});
	g_Path.Render();
});

document.addEventListener('DOMContentLoaded', () => {
	g_Elements.content = {
		container: id('content'),
		separator: id('content-separator'),
		list:      id('table-list'),
		entry:     id('list-entry-template'),

		table: {
			name: id('table-name-button'),
			size: id('table-size-button'),
			type: id('table-type-button'),
			mode: id('table-mode-button'),
		},
	};

	g_Elements.tree = {
		container: id('tree'),
		template:  id('tree-entry-template'),
	};

	g_Elements.toolbar = {
		select:      id('toolbar-select'),

		go_up:       id('toolbar-button-go-up'),

		cut:         id('toolbar-button-cut'),
		copy:        id('toolbar-button-copy'),
		paste:       id('toolbar-button-paste'),

		undo_delete: id('toolbar-button-undo-delete'),

		delete:      id('toolbar-button-delete'),
		properties:  id('toolbar-button-properties'),

		big_icons:   id('toolbar-button-big-icons'),
		small_icons: id('toolbar-button-small-icons'),
		list:        id('toolbar-button-list'),
		details:     id('toolbar-button-details'),
	};

	g_Elements.statusbar = {
		count:  id('statusbar-count'),
		usage:  id('statusbar-disk-usage'),
		handle: id('window-resize-handle'),
	};

	// Set up toolbar
	let fnStub = () => {
		CWindow.Alert('warning', 'Warning', 'Not implemented');
	};

	let toolbarButtonHandlers = {
		go_up:       () => { g_Path.NavigateToParent(); },
		cut:         () => { g_Path.CopySelection(); },
		copy:        () => { g_Path.CopySelection(); },
		paste:       () => { g_Path.PasteSelection(); },
		undo_delete: fnStub,
		delete:      () => { g_Path.DeleteSelection(); },
		properties:  async () => {
			window.g_hChildWindow = CWindow.Properties(g_Path.m_Selection.file);
		},
		big_icons:   fnStub,
		small_icons: fnStub,
		list:        fnStub,
		details:     fnStub,
	};

	for (let k of Object.keys(g_Elements.toolbar)) {
		g_Elements.toolbar[k].addEventListener('click', toolbarButtonHandlers[k]);
	}

	// Set up statusbar
	HandlePointerEvent(g_Elements.statusbar.handle, (ev) => {
		electron.Window.Resize(ev.pageX, ev.pageY);
	});

	// Set up separators
	let elContent = g_Elements.content.container;

	for (let el of els('.table-header-button-container > .separator')) {
		HandlePointerEvent(el, (ev) => {
			let nPreviousButtonWidth = GetPreviousSiblingsWidth(el.parentNode);

			elContent.style.setProperty(
				`--${el.id}-width`,
				`${ev.pageX - nPreviousButtonWidth}px`
			);
		});
	}

	HandlePointerEvent(g_Elements.content.separator, (ev) => {
		elContent.style.setProperty(
			`--${ev.target.id}-width`,
			`${ev.pageX - k_nContentSeparatorOffset}px`
		);
	});

	// Set up table buttons
	let buttons = g_Elements.content.table;

	for (let i = 0; i < g_vecTableButtons.length; i++) {
		let button = g_vecTableButtons[i];
		let strButtonName = button.name;

		buttons[strButtonName].addEventListener('click', (ev) => {
			let eCurrentOrder = g_Path.m_Sorting.order;
			let eOrder = ++eCurrentOrder == 2 ? 0 : eCurrentOrder;

			g_Path.m_Sorting.button?.el?.removeAttribute('sort');
			ev.target.setAttribute('sort', EFileSorting[eOrder]);

			evt('explorer:sort', {
				data:   g_vecFiles.sort(button.functions[eOrder]),
				order:  eOrder,
				button: {
					el:   button[0],
					name: strButtonName,
				},
			});
		});
	}

	let lastSort = CAppData.Get('last_sort') || {};
	let eOrder;
	let strButton;
	let bHasSort;

	if (!Object.keys(lastSort).length) {
		eOrder = lastSort.order;
		strButton = lastSort.button;
		bHasSort = eOrder && strButton;
	}

	if (bHasSort)
		buttons[strButton].setAttribute('sort', EFileSorting[eOrder]);

	// ... and go
	g_Path.Navigate(CAppData.Get('last_path') || '/');
	g_Tree.Render();

	// TODO: this **re**renders it
	if (!bHasSort)
		return;

	evt('explorer:sort', {
		data:   g_vecFiles.sort(
			g_vecTableButtons
				.find(e => e.name == strButton)
				.functions[eOrder]
		),
		order:  eOrder,
		button: {
			el:   buttons[strButton],
			name: strButton,
		},
	});
});

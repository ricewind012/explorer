import {
	CAppData,
	CPathSelection,
	CPath,
	CStatusbar,
	CTree,
	CWindow,
	CMenubar,
} from './classes.js';

import { EFileSorting } from './enums.js';

import {
	OnKeyPress,
	GetParentElementWithID,
	HandlePointerEvent,
	CreateShortcut,
	HumanReadableSize,
	UpdateTitle,
} from './functions.js';

import entries from './menu-shared.js';

function fnStub() {
	CWindow.Alert('warning', 'Warning', 'Not implemented');
}

window.g_Menubar       = new CMenubar();
window.g_PathSelection = new CPathSelection();
window.g_Path          = new CPath();
window.g_Statusbar     = new CStatusbar();
window.g_Tree          = new CTree();
window.g_LastClickedSection = null;
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
		case k_Messages.window.close:
			await electron.Window.Close(window.g_hChildWindow);
			window.g_hChildWindow = null;
			break;

		case k_Messages.window.menu_done:
			g_Menubar.ChangeSelection(null);
			break;

		case k_Messages.nav.execute:
			g_PathSelection.Execute();
			break;

		case k_Messages.nav.navigate:
			g_Path.Navigate(data.path);
			break;

		case k_Messages.nav.refresh:
			g_Path.Refresh();
			break;

		case k_Messages.window.create:
			window.g_hChildWindow = await CWindow.Properties({ file: data.file });
			break;

		case k_Messages.file.shortcut:
			CreateShortcut(data.file);
			g_Path.CreateListItemFromNewFile(`${data.file.path}.desktop`)
			break;

		case k_Messages.file.cut:
		case k_Messages.file.copy:
			g_PathSelection.Copy();
			break;

		case k_Messages.file.paste:
			g_PathSelection.Paste();
			break;

		case k_Messages.file.delete:
			g_PathSelection.Delete();
			break;

		case k_Messages.file.rename:
			g_PathSelection.Rename();
			break;
	}
});

document.addEventListener('keydown', OnKeyPress);

document.addEventListener('click', (ev) => {
	let elParent = GetParentElementWithID(ev.target);

	window.g_LastClickedSection = (() => {
		switch (elParent.id) {
			case CPath.s_strListID: return g_PathSelection;
			case CTree.s_strListID: return g_Tree;
		}
	})();

	switch (ev.target.id) {
		case CPath.s_strListID:
			g_PathSelection.Change(null, null);
			break;

		case CTree.s_strListID:
			g_Tree.ChangeSelection(null, null);
			break;
	}
});

document.addEventListener('contextmenu', async (ev) => {
	let elParent = GetParentElementWithID(ev.target);

	if (!g_PathSelection.m_Selection && !g_Tree.m_Selection)
		return;

	let vecMenuEntries = entries[elParent.id];
	let file = (() => {
		switch (elParent.id) {
			case CPath.s_strListID: return g_PathSelection.m_Selection.file;
			case CTree.s_strListID: return g_Tree.m_Selection.file;

			default:
				console.log('event(contextmenu): nothing to open');
				return;
		}
	})();

	if (!file)
		return;

	window.g_hChildWindow = await CWindow.Menu(
		file,
		elParent.id,
		{
			x:      ev.screenX,
			y:      ev.screenY,
		}
	);
});

document.addEventListener('explorer:navigate', (ev) => {
	LogEvt(ev);

	let {
		path:  strPath,
		count: nFiles,
	} = ev.detail;

	let vecHiddenFiles = window.g_vecFiles
		.filter(e => e.path.startsWith(strPath + '/.'));
	let strCountText = `${nFiles} object(s)`;
	if (vecHiddenFiles.length)
		strCountText += ` (plus ${vecHiddenFiles.length} hidden)`;

	g_Statusbar.UpdateDiskUsage(strPath);
	g_Statusbar.UpdateItem('count', strCountText);
	g_Statusbar.UpdateItem('usage', HumanReadableSize(g_Statusbar.m_unDiskUsage));

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
		list:      id(CPath.s_strListID),
		entry:     id('list-item-template'),

		table: {
			name: id('table-name-button'),
			size: id('table-size-button'),
			type: id('table-type-button'),
			mode: id('table-mode-button'),
		},
	};

	g_Elements.menubar = {
		file:  id('menubar-file'),
		edit:  id('menubar-edit'),
		view:  id('menubar-view'),
		tools: id('menubar-tools'),
		help:  id('menubar-help'),
	};

	g_Elements.tree = {
		container: id(CTree.s_strListID),
		template:  id('tree-item-template'),
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

	// Set up menubar
	// TODO: make on hover, but creating windows is too fucking slow
	for (let el of Object.values(g_Elements.menubar)) {
		let section = el.id;
		let bounds = el.getBoundingClientRect();

		el.bClicked = false;
		el.addEventListener('click', (ev) => {
			if (!el.bClicked) {
				g_Menubar.CloseContextMenu();
				g_Menubar.ChangeSelection(el);
				g_Menubar.OpenContextMenu(section, {
					x: Math.round(window.screenX + bounds.x),
					y: Math.round(window.screenY + bounds.y + bounds.height),
				});
			} else {
				g_Menubar.ChangeSelection(null);
				g_Menubar.CloseContextMenu();
			}

			el.bClicked = !el.bClicked;
		});
	}

	// Set up toolbar
	let toolbarButtonHandlers = {
		go_up:       () => { g_Path.NavigateToParent(); },

		cut:         () => { g_PathSelection.Copy(); },
		copy:        () => { g_PathSelection.Copy(); },
		paste:       () => { g_PathSelection.Paste(); },

		undo_delete: fnStub,

		delete:      () => { g_PathSelection.Delete(); },
		properties:  async () => {
			let selection = g_PathSelection.m_Selection;

			if (!selection) {
				CWindow.Alert('error', 'Error', 'No selection');
				return;
			}

			window.g_hChildWindow = await CWindow.Properties(selection);
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
			let eOrder = ++eCurrentOrder == 3 ? 0 : eCurrentOrder;

			g_Path.m_Sorting.button?.el?.removeAttribute('sort');
			ev.target.setAttribute('sort', EFileSorting[eOrder]);

			evt('explorer:sort', {
				data:   window.g_vecFiles.sort(button.functions[eOrder]),
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
		data:   window.g_vecFiles.sort(
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

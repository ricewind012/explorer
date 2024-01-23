let g_Path         = new CPath();
let g_Tree         = new CTree();

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
			g_hChildWindow = await electron.Window.Create(
				'properties',
				{
					resizable: false,
					width:     367,
					height:    419,
				},
				data.file
			);
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

	let nMenuHeight = g_vecMenuEntries
		.map(e => e.length ? 17 : 11)
		.reduce((a, b) => a + b) + 1;

	g_hChildWindow = await electron.Window.Create(
		'menu',
		{
			resizable:       false,
			focusable:       false,
			width:           112,
			minWidth:        112,
			height:          nMenuHeight,
			minHeight:       nMenuHeight,
			x:               ev.screenX,
			y:               ev.screenY,
		},
		selection.file
	);
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
	UpdateTitle(strPath);
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

	g_Elements.statusbar = {
		count:  id('statusbar-count'),
		usage:  id('statusbar-disk-usage'),
		handle: id('statusbar-resize-handle'),
	};

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

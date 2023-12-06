let g_Data     = new CAppData();
let g_Path     = new CPath();
let g_Elements = {};

let g_hChildWindow = null;
let g_vecFiles = [];

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

window.addEventListener('focus', () => {
	document.documentElement.setAttribute('focused', '');
});

window.addEventListener('blur', () => {
	document.documentElement.removeAttribute('focused');
});

window.addEventListener('message', (ev) => {
	let data = ev.data;

	console.log('Message received: %o', data);

	switch (data.action) {
		case 'close':
			if (!g_hChildWindow?.closed)
				g_hChildWindow?.close();
			break;

		case 'execute':
			g_Path.ExecuteSelection();
			break;

		case 'navigate':
			g_Path.Navigate(data.path);
			break;

		case 'create-window':
			g_hChildWindow = CreateWindow(
				'properties',
				{
					width:  367,
					height: 419,
				},
				data.file
			);
			break;
	}
});

document.addEventListener('keydown', (ev) => {
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
	}
});

document.addEventListener('contextmenu', (ev) => {
	// TODO:
	// immediately closes every window, but
	// can be opened multiple times without this
	//postMessage({ action: 'close' });

	let selection = g_Path.m_Selection;

	if (!selection?.el)
		return;

	let nMenuHeight = g_vecMenuEntries
		.map(e => e.length ? 23 : 6)
		.reduce((a, b) => a + b);

	g_hChildWindow = CreateWindow(
		'menu',
		{
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
		capacity: nCapacity,
		free:     nFree
	} = electron.FilesystemUtils.DiskUsage(strPath);
	let nDiskUsage = nCapacity - nFree;

	UpdateStatusbar('count', `${nFiles} object(s)`);
	UpdateStatusbar('usage', HumanReadableSize(nDiskUsage));

	g_Data.Set('last_path', strPath);
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

	g_Data.Set('last_sort', {
		button: ev.detail.button.name,
		order:  ev.detail.order,
	});
	g_Path.Render();
});

document.addEventListener('DOMContentLoaded', () => {
	g_Elements = {
		titlebar: {
			icon: id('titlebar-icon'),
			name: id('titlebar-name'),

			buttons: {
				minimise: id('titlebar-button-minimise'),
				maximise: id('titlebar-button-maximise'),
				restore:  id('titlebar-button-restore'),
				close:    id('titlebar-button-close'),
			},
		},

		content: {
			container: id('content'),
			list:      id('table-list'),
			entry:     id('list-entry-template'),

			table: {
				name: id('table-name-button'),
				size: id('table-size-button'),
				type: id('table-type-button'),
				mode: id('table-mode-button'),
			},
		},

		statusbar: {
			count:  id('statusbar-count'),
			usage:  id('statusbar-disk-usage'),
			handle: id('statusbar-resize-handle'),
		},
	};

	// Set up titlebar
	g_Elements.titlebar.buttons.minimise.addEventListener('click', () => {
		electron.ipcRenderer.send('minimize');
	});
	g_Elements.titlebar.buttons.maximise.addEventListener('click', () => {
		HandleMaximizeButton();
	});
	g_Elements.titlebar.buttons.restore.addEventListener('click', () => {
		HandleMaximizeButton();
	});
	g_Elements.titlebar.buttons.close.addEventListener('click', () => {
		electron.ipcRenderer.send('close');
	});

	// Set up statusbar
	HandlePointerEvent(g_Elements.statusbar.handle, (ev) => {
		electron.ipcRenderer.send('resize', {
			width:  ev.pageX,
			height: ev.pageY,
		});
	});

	// Set up separators
	let elContent = g_Elements.content.container;

	for (let el of els('.table-header-button-container > .separator')) {
		HandlePointerEvent(el, (ev) => {
			let target = ev.target;
			// TODO: does not work when resizing to right hand side
			let nPreviousButtonWidth = GetPreviousSiblingsWidth(target.parentNode);

			elContent.style.setProperty(
				`--${target.id}-width`,
				`${ev.pageX - nPreviousButtonWidth}px`
			);
		});
	}

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

	let lastSort = g_Data.Get('last_sort') || {};
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
	g_Path.Navigate(g_Data.Get('last_path') || '/');

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

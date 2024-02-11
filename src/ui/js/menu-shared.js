import { CWindow } from './classes.js';
import { OpenFile } from './functions.js';

function fnStub() {
	CWindow.Alert('warning', 'Warning', 'Not implemented');
}

function OpenFileFromMenu(file) {
	OpenFile(
		file,
		(strPath) => {
			electron.SendMesssageToParent({
				action: 'navigate',
				path:   file.path,
			});
		},
		(strPath) => {
			electron.SendMesssageToParent({
				action: 'execute',
			});
		}
	);
}

function SendMessageWithFile(strAction) {
	electron.SendMesssageToParent({
		action: strAction,
		file:   g_Message.file,
	});
}

// TODO: these only use table, not tree
const vecSharedFileEntries = [
	[
		// Separator
	], [
		'Cut', () => {
			SendMessageWithFile('file-cut');
		}
	], [
		'Copy', () => {
			SendMessageWithFile('file-copy');
		}
	], [
		// Separator
	], [
		'Create Shortcut', () => {
			SendMessageWithFile('create-shortcut');
		}
	], [
		'Delete', () => {
			SendMessageWithFile('file-delete');
		}
	], [
		'Rename', () => {
			SendMessageWithFile('file-rename');
		}
	], [
		// Separator
	], [
		'Properties', () => {
			SendMessageWithFile('create-window');
		}
	]
];

const entries = {
	'menubar-file': [
		[
			'New', fnStub,
		], [
			// Separator
		], [
			'Create Shortcut', () => {
				SendMessageWithFile('create-shortcut');
			}
		], [
			'Delete', () => {
				SendMessageWithFile('file-delete');
			}
		], [
			'Rename', () => {
				SendMessageWithFile('file-rename');
			}
		], [
			'Properties', () => {
				SendMessageWithFile('create-window');
			}
		], [
			// Separator
		], [
			'Close', () => {
				electron.Window.Close(1);
			}
		],
	],

	'menubar-edit': [
		[
			'Undo', fnStub,
		], [
			// Separator
		], [
			'Cut', () => {
				SendMessageWithFile('file-cut');
			},
		], [
			'Copy', () => {
				SendMessageWithFile('file-copy');
			},
		], [
			'Paste', () => {
				SendMessageWithFile('file-paste');
			},
		], [
			'Paste Shortcut', () => {
				SendMessageWithFile('file-paste');
			},
		], [
			// Separator
		], [
			'Select All', fnStub,
		], [
			'Invert Selection', fnStub,
		],
	],

	'menubar-view': [
		[
			'Toolbar', fnStub,
		], [
			'Status Bar', fnStub,
		], [
			// Separator
		], [
			'Large Icons', fnStub,
		], [
			'Small Icons', fnStub,
		], [
			'List', fnStub,
		], [
			'Details', fnStub,
		], [
			// Separator
		], [
			'Arrange Icons', fnStub,
		], [
			'Line up Icons', fnStub,
		], [
			// Separator
		], [
			'Refresh', () => {
				electron.SendMesssageToParent({
					action: 'refresh',
				});
			},
		], [
			'Options', fnStub,
		]
	],

	'menubar-tools': [
		[
			'Find', fnStub,
		], [
			// Separator
		], [
			'Go to...', fnStub,
		],
	],

	'menubar-help': [
	],

	table: [
		[
			'Open', () => {
				OpenFileFromMenu(g_Message.file);
			}
		],
		...vecSharedFileEntries,
	],

	tree: [
		[
			'Explore', () => {
				OpenFileFromMenu(g_Message.file);
			}
		],
		// TODO: open (index only with menu bar) & find
		...vecSharedFileEntries,
	],
};

export default entries;

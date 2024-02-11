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
				action: k_Messages.nav.navigate,
				path:   file.path,
			});
		},
		(strPath) => {
			electron.SendMesssageToParent({
				action: k_Messages.nav.execute,
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
			SendMessageWithFile(k_Messages.file.cut);
		}
	], [
		'Copy', () => {
			SendMessageWithFile(k_Messages.file.copy);
		}
	], [
		// Separator
	], [
		'Create Shortcut', () => {
			SendMessageWithFile(k_Messages.file.shortcut);
		}
	], [
		'Delete', () => {
			SendMessageWithFile(k_Messages.file.delete);
		}
	], [
		'Rename', () => {
			SendMessageWithFile(k_Messages.file.rename);
		}
	], [
		// Separator
	], [
		'Properties', () => {
			SendMessageWithFile(k_Messages.window.create);
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
				SendMessageWithFile(k_Messages.file.shortcut);
			}
		], [
			'Delete', () => {
				SendMessageWithFile(k_Messages.file.delete);
			}
		], [
			'Rename', () => {
				SendMessageWithFile(k_Messages.file.rename);
			}
		], [
			'Properties', () => {
				SendMessageWithFile(k_Messages.window.create);
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
				SendMessageWithFile(k_Messages.file.cut);
			},
		], [
			'Copy', () => {
				SendMessageWithFile(k_Messages.file.copy);
			},
		], [
			'Paste', () => {
				SendMessageWithFile(k_Messages.file.paste);
			},
		], [
			'Paste Shortcut', () => {
				SendMessageWithFile(k_Messages.file.paste);
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
					action: k_Messages.nav.refresh,
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

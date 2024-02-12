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
	{
		// Separator
	}, {
		name: 'Cut',
		callback: () => {
			SendMessageWithFile(k_Messages.file.cut);
		},
	}, {
		name: 'Copy',
		callback: () => {
			SendMessageWithFile(k_Messages.file.copy);
		},
	}, {
		// Separator
	}, {
		name: 'Create Shortcut',
		callback: () => {
			SendMessageWithFile(k_Messages.file.shortcut);
		},
	}, {
		name: 'Delete',
		callback: () => {
			SendMessageWithFile(k_Messages.file.delete);
		},
	}, {
		name: 'Rename',
		callback: () => {
			SendMessageWithFile(k_Messages.file.rename);
		},
	}, {
		// Separator
	}, {
		name: 'Properties',
		callback: () => {
			SendMessageWithFile(k_Messages.window.create);
		},
	},
];

const entries = {
	'menubar-file': [
		{
			name: 'New',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Create Shortcut',
			callback: () => {
				SendMessageWithFile(k_Messages.file.shortcut);
			},
		}, {
			name: 'Delete',
			callback: () => {
				SendMessageWithFile(k_Messages.file.delete);
			},
		}, {
			name: 'Rename',
			callback: () => {
				SendMessageWithFile(k_Messages.file.rename);
			},
		}, {
			name: 'Properties',
			callback: () => {
				SendMessageWithFile(k_Messages.window.create);
			},
		}, {
			// Separator
		}, {
			name: 'Close',
			callback: () => {
				electron.Window.Close(1);
			},
		},
	],

	'menubar-edit': [
		{
			name: 'Undo',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Cut',
			callback: () => {
				SendMessageWithFile(k_Messages.file.cut);
			},
		}, {
			name: 'Copy',
			callback: () => {
				SendMessageWithFile(k_Messages.file.copy);
			},
		}, {
			name: 'Paste',
			callback: () => {
				SendMessageWithFile(k_Messages.file.paste);
			},
		}, {
			name: 'Paste Shortcut',
			callback: () => {
				SendMessageWithFile(k_Messages.file.paste);
			},
		}, {
			// Separator
		}, {
			name: 'Select All',
			callback: fnStub,
		}, {
			name: 'Invert Selection',
			callback: fnStub,
		},
	],

	'menubar-view': [
		{
			name: 'Toolbar',
			callback: fnStub,
		}, {
			name: 'Status Bar',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Large Icons',
			callback: fnStub,
		}, {
			name: 'Small Icons',
			callback: fnStub,
		}, {
			name: 'List',
			callback: fnStub,
		}, {
			name: 'Details',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Arrange Icons',
			callback: fnStub,
		}, {
			name: 'Line up Icons',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Refresh',
			callback: () => {
				electron.SendMesssageToParent({
					action: k_Messages.nav.refresh,
				});
			},
		}, {
			name: 'Options',
			callback: fnStub,
		},
	],

	'menubar-tools': [
		{
			name: 'Find',
			callback: fnStub,
		}, {
			// Separator
		}, {
			name: 'Go to...',
			callback: fnStub,
		},
	],

	'menubar-help': [
	],

	table: [
		{
			name: 'Open',
			callback: () => {
				OpenFileFromMenu(g_Message.file);
			},
		},
		...vecSharedFileEntries,
	],

	tree: [
		{
			name: 'Explore',
			callback: () => {
				OpenFileFromMenu(g_Message.file);
			},
		},
		// TODO: open (index only with menu bar) & find
		...vecSharedFileEntries,
	],
};

export default entries;

import {
	CPath,
	CWindow,
} from './classes.js';
import { EMenuItemType } from './enums.js';
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
		options: {
			// TODO: this actually doesn't matter and I can Alert() that
			disabled: !(g_Message.file?.mode & S_IRUSR),
		},
	}, {
		name: 'Copy',
		callback: () => {
			SendMessageWithFile(k_Messages.file.copy);
		},
		options: {
			disabled: !(g_Message.file?.mode & S_IRUSR),
		},
	}, {
		// Separator
	}, {
		name: 'Create Shortcut',
		callback: () => {
			SendMessageWithFile(k_Messages.file.shortcut);
		},
		options: {
			disabled: !(g_Message.file?.mode & S_IWUSR),
		},
	}, {
		name: 'Delete',
		callback: () => {
			SendMessageWithFile(k_Messages.file.delete);
		},
		options: {
			disabled: !(g_Message.file?.mode & S_IWUSR),
		},
	}, {
		name: 'Rename',
		callback: () => {
			SendMessageWithFile(k_Messages.file.rename);
		},
		options: {
			disabled: !(g_Message.file?.mode & S_IRUSR),
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
			options: {
				type: EMenuItemType.Parent,
			},
		}, {
			// Separator
		}, {
			name: 'Create Shortcut',
			callback: () => {
				SendMessageWithFile(k_Messages.file.shortcut);
			},
			options: {
				disabled: !(g_Message.file?.mode & S_IWUSR),
			},
		}, {
			name: 'Delete',
			callback: () => {
				SendMessageWithFile(k_Messages.file.delete);
			},
			options: {
				disabled: !(g_Message.file?.mode & S_IWUSR),
			},
		}, {
			name: 'Rename',
			callback: () => {
				SendMessageWithFile(k_Messages.file.rename);
			},
			options: {
				disabled: !(g_Message.file?.mode & S_IRUSR),
			},
		}, {
			name: 'Properties',
			callback: () => {
				electron.SendMesssageToParent({
					action: k_Messages.window.create,
					file:   g_Message.dir,
				});
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
			options: {
				disabled: !(g_Message.file?.mode & S_IRUSR),
			},
		}, {
			name: 'Copy',
			callback: () => {
				SendMessageWithFile(k_Messages.file.copy);
			},
			options: {
				disabled: !(g_Message.file?.mode & S_IRUSR),
			},
		}, {
			name: 'Paste',
			callback: () => {
				SendMessageWithFile(k_Messages.file.paste);
			},
			options: {
				disabled: !(g_Message.dir?.mode & S_IWUSR),
			},
		}, {
			name: 'Paste Shortcut',
			callback: () => {
				SendMessageWithFile(k_Messages.file.paste);
			},
			options: {
				disabled: !(g_Message.dir?.mode & S_IWUSR),
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
			options: {
				type:    EMenuItemType.Checkbox,
				checked: true,
			}
		}, {
			name: 'Status Bar',
			callback: fnStub,
			options: {
				type:    EMenuItemType.Checkbox,
				checked: true,
			},
		}, {
			// Separator
		}, {
			name: 'Large Icons',
			callback: fnStub,
			options: {
				type: EMenuItemType.Radio,
			},
		}, {
			name: 'Small Icons',
			callback: fnStub,
			options: {
				type: EMenuItemType.Radio,
			},
		}, {
			name: 'List',
			callback: fnStub,
			options: {
				type: EMenuItemType.Radio,
			},
		}, {
			name: 'Details',
			callback: fnStub,
			options: {
				type:    EMenuItemType.Radio,
				checked: true,
			},
		}, {
			// Separator
		}, {
			name: 'Arrange Icons',
			callback: fnStub,
			options: {
				disabled: true,
				type:     EMenuItemType.Parent,
			},
		}, {
			name: 'Line up Icons',
			callback: fnStub,
			options: {
				disabled: true,
			},
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
			options: {
				type: EMenuItemType.Parent,
			},
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
			options: {
				primary: true,
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
			options: {
				primary: true,
			},
		},
		// TODO: open (index only with menu bar) & find
		...vecSharedFileEntries,
	],
};

export default entries;

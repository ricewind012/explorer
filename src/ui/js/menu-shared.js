import { OpenFile } from './functions.js';

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

// TODO: these only use table, not tree
const vecSharedFileEntries = [
	[
		// Separator
	], [
		'Cut', () => {
			electron.SendMesssageToParent({
				action: 'file-cut',
				file:   g_Message.file,
			});
		}
	], [
		'Copy', () => {
			electron.SendMesssageToParent({
				action: 'file-copy',
				file:   g_Message.file,
			});
		}
	], [
		// Separator
	], [
		'Create Shortcut', () => {
			electron.SendMesssageToParent({
				action: 'create-shortcut',
				file:   g_Message.file,
			});
		}
	], [
		'Delete', () => {
			electron.SendMesssageToParent({
				action: 'file-delete',
				file:   g_Message.file,
			});
		}
	], [
		'Rename', () => {
			electron.SendMesssageToParent({
				action: 'file-rename',
				file:   g_Message.file,
			});
		}
	], [
		// Separator
	], [
		'Properties', () => {
			electron.SendMesssageToParent({
				action: 'create-window',
				file:   g_Message.file,
			});
		}
	]
];

const entries = {
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

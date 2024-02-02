import EFileType from '../../shared/EFileType.js';

const vecMenuEntries = [
	[
		'Open', () => {
			switch (g_Message.type) {
				case EFileType.NotFound:
				case EFileType.Unknown:
					break;

				case EFileType.Directory:
					electron.SendMesssageToParent({
						action: 'navigate',
						path:	 g_Message.path,
					});
					break;

				default:
					electron.SendMesssageToParent({
						action: 'execute',
					});
					break;
			}
		}
	], [
		// Separator
	], [
		'Cut', () => {
			electron.SendMesssageToParent({
				action: 'file-cut',
				file:   g_Message,
			});
		}
	], [
		'Copy', () => {
			electron.SendMesssageToParent({
				action: 'file-copy',
				file:   g_Message,
			});
		}
	], [
		// Separator
	], [
		'Create Shortcut', () => {
			electron.SendMesssageToParent({
				action: 'create-shortcut',
				file:   g_Message,
			});
		}
	], [
		'Delete', () => {
			electron.SendMesssageToParent({
				action: 'file-delete',
				file:   g_Message,
			});
		}
	], [
		'Rename', () => {
			electron.SendMesssageToParent({
				action: 'file-rename',
				file:   g_Message,
			});
		}
	], [
		// Separator
	], [
		'Properties', () => {
			electron.SendMesssageToParent({
				action: 'create-window',
				file:   g_Message,
			});
		}
	]
];

export default vecMenuEntries;

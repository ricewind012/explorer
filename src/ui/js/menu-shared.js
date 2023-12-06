let g_vecMenuEntries = [
	[
		'Open', () => {
			switch (g_Data.type) {
				case EFileType.NotFound:
				case EFileType.Unknown:
					break;

				case EFileType.Directory:
					SendMesssageToParent({
						action: 'navigate',
						path:	 g_Data.path
					});
					break;

				default:
					SendMesssageToParent({
						action: 'execute',
					});
					break;
			}
		}
	], [
		// Separator
	], [
		'Properties', () => {
			SendMesssageToParent({
				action: 'create-window',
				file:   g_Data,
			});
		}
	]
];
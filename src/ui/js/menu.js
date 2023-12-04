let SendMesssageToParent = window.opener.postMessage;

let g_elEntryTemplate = null;

let g_vecEntries = [
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
	],
];

window.addEventListener('message', (ev) => {
	g_Data = ev.data;

	console.log('Message received: %o', g_Data);
});

document.addEventListener('keydown', (ev) => {
	switch (ev.key) {
		case 'Escape':
			window.close();
			break;
	}
});

document.addEventListener('DOMContentLoaded', () => {
  g_elEntryTemplate = id('menu-entry-template');

	for (let i = 0; i < g_vecEntries.length; i++) {
		let elEntry = g_elEntryTemplate.content.cloneNode(true).children[0];

    elEntry.innerText = g_vecEntries[i][0];
		elEntry.addEventListener('click', () => {
			g_vecEntries[i][1]();
			window.close();
		});

    document.body.appendChild(elEntry);
	}
});
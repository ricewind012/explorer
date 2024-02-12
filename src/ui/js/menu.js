import entries from './menu-shared.js';

window.addEventListener('message', (ev) => {
	let elEntryTemplate = id('menu-entry-template');
	let vecMenuEntries = entries[ev.data.section];

	for (let i = 0; i < vecMenuEntries.length; i++) {
		let entry = vecMenuEntries[i];
		let elEntry;

		if (!Object.keys(entry).length) {
			elEntry = document.createElement('hr');
		} else {
			elEntry = elEntryTemplate.content.cloneNode(true).children[0];

			elEntry.innerText = entry.name;

			elEntry.addEventListener('click', () => {
				electron.SendMesssageToParent({
					action: k_Messages.window.menu_done,
				});
				entry.callback();
				window.close();
			});
		}

		document.body.appendChild(elEntry);
	}
});

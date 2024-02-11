import entries from './menu-shared.js';

window.addEventListener('message', (ev) => {
	let elEntryTemplate = id('menu-entry-template');
	let vecMenuEntries = entries[ev.data.section];

	for (let i = 0; i < vecMenuEntries.length; i++) {
		let vecEntry = vecMenuEntries[i];
		let elEntry;

		if (!vecEntry.length) {
			elEntry = document.createElement('hr');
		} else {
			elEntry = elEntryTemplate.content.cloneNode(true).children[0];

			elEntry.innerText = vecEntry[0];
			elEntry.addEventListener('click', () => {
				electron.SendMesssageToParent({
					action: k_Messages.window.menu_done,
				});
				vecEntry[1]();
				window.close();
			});
		}

		document.body.appendChild(elEntry);
	}
});

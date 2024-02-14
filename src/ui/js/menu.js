window.addEventListener('message', async (ev) => {
	// Import here, since g_Message is, otherwise, undefined.
	let entries = (await import('./menu-shared.js')).default;
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

			if (entry.options) {
				let opts = entry.options;

				if (opts.disabled)
					elEntry.setAttribute('disabled', '');
				if (opts.primary)
					elEntry.setAttribute('primary', '');
				if (opts.type)
					elEntry.setAttribute('type', opts.type);
			}
		}

		document.body.appendChild(elEntry);
	}
});

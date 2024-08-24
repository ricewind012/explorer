import { EMenuItemType } from './enums.js';

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

				if (opts.checked)
					elEntry.ariaChecked = opts.checked;
				if (opts.disabled)
					elEntry.ariaDisabled = opts.disabled;
				if (opts.primary)
					elEntry.classList.add('primary');
				switch (opts.type) {
					case EMenuItemType.Checkbox:
						elEntry.role = 'menuitemcheckbox';
						break;

					case EMenuItemType.Radio:
						elEntry.role = 'menuitemradio';
						break;

					case EMenuItemType.Parent:
						elEntry.ariaHasPopup = true;
				}
			}
		}

		document.body.appendChild(elEntry);
	}
});

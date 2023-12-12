let SendMesssageToParent = window.opener.postMessage;

let g_elEntryTemplate = null;

document.addEventListener('DOMContentLoaded', () => {
  g_elEntryTemplate = id('menu-entry-template');

	for (let i = 0; i < g_vecMenuEntries.length; i++) {
		let vecEntry = g_vecMenuEntries[i];
		let elEntry;

		if (!vecEntry.length) {
			elEntry = document.createElement('hr');
		} else {
			elEntry = g_elEntryTemplate.content.cloneNode(true).children[0];

			elEntry.innerText = vecEntry[0];
			elEntry.addEventListener('click', () => {
				vecEntry[1]();
				window.close();
			});
		}

    document.body.appendChild(elEntry);
	}
});
import { CCustomElementBase } from './base.js';

export class CTitlebar extends CCustomElementBase {
	constructor() {
		super();

		this.m_bFullscreen = false;
		this.m_buttons = {};
		this.m_elTitle = null;
	}

	static get observedAttributes() {
		return ['name'];
	}

	static UpdateTitle(strTitle) {
		document.title = strTitle;
		g_Elements.titlebar.setAttribute('name', strTitle);
	}

	attributeChangedCallback(strName, strOldValue, strNewValue) {
		this.m_elTitle.innerText = strNewValue;
	}

	connectedCallback() {
		this.id = 'titlebar';
		this.className = 'titlebar';

		this.AddElementFromAttribute('icon', {
			tag: 'img',
			key: 'src',
		}, this);

		this.m_elTitle = this.AddElementFromAttributeWithText(
			'h1',
			this.getAttribute('name'),
			{
				id:    'titlebar-name',
				class: 'text-overflow titlebar-name',
			},
			this
		);

		const elButtonsContainer = this.CreateElement('menu', {
			id: 'titlebar-buttons',
		}, this);
		const buttonCallbacks = {
			close: () => {
				window.close();
			},
			restore: () => {
				this.HandleMaximizeButton();
			},
			maximise: () => {
				this.HandleMaximizeButton();
			},
			minimise: () => {
				electron.Window.Minimize();
			},
		};

		const bOnlyClose = this.AttributeExists('only-close');
		const elCloseButton = this.CreateElement('button', {
			class: 'titlebar-button',
			id:    'titlebar-button-close',
		}, elButtonsContainer);
		elCloseButton.addEventListener('click', buttonCallbacks.close);

		if (bOnlyClose)
			return;

		const vecButtons = Object.keys(buttonCallbacks).filter(e => e != 'close');
		for (const k of vecButtons) {
			const el = this.CreateElement(
				'button',
				{
					class:  'titlebar-button',
					id:     `titlebar-button-${k}`,
				},
				elButtonsContainer,
				true
			);
			el.addEventListener('click', buttonCallbacks[k]);

			if (k == 'restore')
				el.hidden = true;

			this.m_buttons[k] = el;
		}
	}

	HandleMaximizeButton() {
		this.m_bFullscreen = !this.m_bFullscreen;

		this.m_buttons.restore.hidden  = this.m_bFullscreen;
		this.m_buttons.maximise.hidden = !this.m_bFullscreen;
		electron.Window.ToggleFullscreen();
	}
}

customElements.define('title-bar', CTitlebar);

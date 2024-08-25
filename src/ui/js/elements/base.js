export class CCustomElementBase extends HTMLElement {
	AddElementFromAttribute(strAttribute, opts, elParent) {
		// TODO: use AttributeExists maybe ?
		const strAttributeValue = this.getAttribute(strAttribute);
		if (!strAttributeValue)
			return;

		return this.CreateElement(opts.tag, {
			[opts.key]: strAttributeValue,
			...opts,
		}, elParent);
	}

	AddElementFromAttributeWithText(strTag, strText, opts, elParent) {
		const el = this.CreateElement(strTag, opts, elParent);
		el.innerText = strText;

		return el;
	}

	AttributeExists(strAttr) {
		return this.getAttribute(strAttr) === '';
	}

	CreateElement(strTag, opts, elParent, bPrepend = false) {
		const el = document.createElement(strTag);

		for (const [k, v] of Object.entries(opts)) {
			el.setAttribute(k, v);
		}

		if (elParent) {
			if (bPrepend) {
				elParent.prepend(el);
			} else {
				elParent.appendChild(el);
			}
		}

		return el;
	}
}

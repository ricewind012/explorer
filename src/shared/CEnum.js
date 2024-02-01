/**
 * enums in JS
 */
export default class CEnum {
	constructor(...vecMembers) {
		for (let i = 0; i < vecMembers.length; i++) {
			this.Append(vecMembers[i], i);
		}
	}

	Append(strMember, nIndex) {
		this[nIndex] = strMember;
		this[strMember] = nIndex;
	}
}

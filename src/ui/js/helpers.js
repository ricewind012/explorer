let id     = s      => document.getElementById(s);
let els    = s      => [...document.querySelectorAll(s)];
let evt    = (s, o) => document.dispatchEvent(new CustomEvent(s, { detail: o }));

let LogEvt = e => console.log(e.type, e.detail);

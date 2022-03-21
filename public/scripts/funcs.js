// Create SVG element
function create_svg_element(name, attrs = null, text = null) {
	let el = document.createElementNS("http://www.w3.org/2000/svg", name);
	if (attrs !== null) for (let name in attrs) el.setAttributeNS(null, name, attrs[name]);
	if (text !== null) {
		for (let line of text) {
			if (line == "$n") el.appendChild(createSVGElement("br")); else {
				let txt = document.createTextNode(line);
				el.appendChild(txt);
			}
		}
	}
	return el;
}

// Get formatted time
function getTime() {
	let now = new Date();
	let time = (now.getHours().toString().length == 1 ? '0' + now.getHours() : now.getHours()) + ':' + (now.getMinutes().toString().length == 1 ? '0' + now.getMinutes() : now.getMinutes()) + ':' + (now.getSeconds().toString().length == 1 ? '0' + now.getSeconds() : now.getSeconds());
	return time;
}

function rand(min, max) {
	// Exclusive max
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Put commas in number
function commas(x, dp = undefined) {
	if (typeof dp == 'number') x = +x.toFixed(dp);
	else if (dp == 'round') x = Math.round(x);

	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get length of object
function len(x) {
	if (typeof x != 'object') return -1;
	return Object.keys(x).length;
}

function display(str, isPlural = false) {
	str = str.replace(/_/g, ' ');
	let words = str.split(' ');
	let newwords = [];

	for (let i = 0; i < words.length; i += 1) {
		newwords.push(words[i][0].toUpperCase() + words[i].substr(1, words[i].length));
	}

	str = newwords.join(' ');
	return (isPlural ? str + 's' : str);
}
function getInitials(text, nicify = false) {
	if (nicify) text = display(text);
	let initials = '';
	for (let word of text.split(/\s+/g)) initials += word[0].toUpperCase();
	return initials;
}

function discard(victim, array) {
	array.splice(array.indexOf(victim), 1);
	return victim;
}
function array_remove(elem, array) { discard(elem, array); }

// Get owner of a region
function getOwner(region) {
	if (region == window.data.vars.player_1.region)
		return 'player_1';
	else if (region == window.data.vars.player_2.region)
		return 'player_2';
	else
		return null;
}

// .getOwner, but also acknowledges allies
function getCountryOwner(region) {
	if (region == window.data.vars.player_1.region || window.data.vars.player_1.allies.indexOf(region) !== -1)
		return 'player_1';
	else if (region == window.data.vars.player_2.region || window.data.vars.player_2.allies.indexOf(region) !== -1)
		return 'player_2';
	else
		return null;
}

// Get a country name
function getCountryName(code) {
	try {
		return window.countries[code].name;
	} catch (e) {
		return 'N/A';
	}
}

// Get a silo, orovided its ID
function getSilo(id) {
	return window.data.silos[window.me][id];
}

/* repeatString() returns a string which has been repeated a set number of times */
function repeatString(str, num) {
	let out = '';
	for (var i = 0; i < num; i++) out += str;
	return out;
}

function dump(v, typeonly = false, recursionLevel = 0) {
	recursionLevel = (typeof recursionLevel !== 'number') ? 0 : recursionLevel;

	if (v == null)
		return (typeonly ? 'null' : 'NULL');

	var vType = typeof v;
	var out = vType;

	switch (vType) {
		case "number":
			return (typeonly ? 'int' : (parseInt(v) == v ? 'int(' : 'float(') + v + ')');
		case "boolean":
			return (typeonly ? 'bool' : 'bool(' + v + ')');
		case "string":
			return (typeonly ? 'string' : 'string(' + v.length + ') "' + v + '"');
		case "object":
			//If using jQuery: if ($.isArray(v))
			//If using IE: if (isArray(v))
			//this should work for all browsers according to the ECMAScript standard:
			if (Object.prototype.toString.call(v) === '[object Array]') {
				if (typeonly) return 'array';
				out = 'array(' + v.length + ') {\n';
				if (v.length < 1)
					return 'array(' + v.length + ') {  }';
				else {
					for (var i = 0; i < v.length; i++) {
						out += repeatString('   ', recursionLevel) + "   [" + i + "] =>  " +
							dump(v[i], typeonly, recursionLevel + 1) + "\n";
					}
					out += repeatString('   ', recursionLevel) + "}";
				}
			} else {
				if (typeonly) return 'object';
				//if object
				let sContents = "{\n";
				let cnt = 0;
				for (var member in v) {
					//No way to know the original data type of member, since JS
					//always converts it to a string and no other way to parse objects.
					sContents += repeatString('   ', recursionLevel) + "   [\"" + member + "\"] =>  " + dump(v[member], typeonly, recursionLevel + 1) + "\n";
					cnt++;
				}
				sContents += repeatString('   ', recursionLevel) + "}";
				out += "(" + cnt + ") " + sContents;
			}
			break;
		case "function":
			return 'function';
		default:
			return (typeonly ? 'unknown' : v);
	}

	return out;
}
function gettype(x) {
	return dump(x, true);
}
function istype(x, ...types) {
	for (let i = 0; i < types.length; i += 1) types[i] = types[i].toLowerCase();
	return types.indexOf(dump(x, true).toLowerCase()) !== -1;
}

function removeElement(selector) {
	let els = document.querySelectorAll(selector);
	for (let el of els) el.parentNode.removeChild(el);
	return els.length;
}

// ENcodes <, >, ', " for safe-html
function htmlToText(html) {
	html = html.replace(/</g, '_$TO$_');
	html = html.replace(/\>/g, '_$TC$_');
	html = html.replace(/\'/g, '_$SM$_');
	html = html.replace(/\"/g, '_$DM$_');
	return html;
}

function textToHtml(text) {
	text = text.replace(/(\_\$TO\$\_)/g, "<");
	text = text.replace(/(\_\$TC\$\_)/g, ">");
	text = text.replace(/(\_\$SM\$\_)/g, "'");
	text = text.replace(/(\_\$DM\$\_)/g, "\"");
	return text;
}

// SOrt an object by key
function sortObject(object) {
	return Object.keys(object).sort().reduce(function (result, key) {
		result[key] = object[key];
		return result;
	}, {});
}

function randomChoice(array) {
	return array[Math.floor(Math.random() * array.length)];
}

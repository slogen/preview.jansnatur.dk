x = function(){
function regExpEscape(literal) {
	return literal.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
function forEach(items, callback) {
	for (var i = 0; i < items.length; ++i) {
		callback(items[i], i);
	}
}
function foldl(items, init, folder) {
	var state = init;
	for (var i = 0; i < items.length; ++i) {
		state = folder(state, items[i], i);
	}
	return state;
}

let canClassList = !(document.createElement('p').classList === undefined);
function classList(clazz) {
	if (clazz === undefined) {
		function ignore(node) {}
		return {
			add: ignore,
			remove: ignore
		};
	}
	if (canClassList) {
		function add(node) {
			return node.classList.add(clazz);
		}
		function remove(node) {
			return node.classList.remove(clazz);
		}
		return {
			add: add,
			remove: remove
		};
	}

	function add(node) {
		var change = node.className.search(rm) >= 0;
		if (change)
			node.className += " " + clazz;
	}
	var rm = new RegExp('(\\s|^)' + regExpEscape(clazz) + '(\\s|$)');
	function remove(node) {
		var change = node.className.search(rm) >= 0;
		if (change)
			node.className = rm.node.className.replace(rm, '');
	}
	return {
		add: add,
		remove: remove
	};
}

function classTag(clazz, inverseClazz) {
	var activateTag = classList(clazz);
	var inactiveTag = classList(inverseClazz);
	function set(node, active) {
		if (active) {
			activateTag.add(node);
			inactiveTag.remove(node);
		} else {
			activateTag.remove(node);
			inactiveTag.add(node);
		}
	}
	return set;
}
var activeTag = classTag("active", "inactive");
var clickedTag = classTag("clicked", "not-clicked");
var debugTag = classTag("debug");

var onTick = [];
function maketick() {
	var i = 0;
	return function tick() {
		var l = onTick.length;
		if (i < l)
			onTick[i]();
		if (l > 0)
			i = (i + 1) % l;
	}
}
function hookup_swap(node) {
	function cards() {
		return node.children;
	}
	var active = 0;
	function consider(n, i) {
		activeTag(n, i == active);
	}
	function act(advance) {
		cs = cards();
		if (advance)
			active = (active + 1) % cs.length;
		forEach(cs, consider);
	}
	function onTicked() {
		act(node.querySelectorAll(":hover").length == 0);
		clickedTag(node, false);
	}
	function next() {
		act(true);
		clickedTag(node, true);
	}
	function onInit() {
		act(false);
	}
	node.onclick = next;
	onTick.push(onTicked);
}
function hookup_explain(node) {
	node.onclick = function() {
		node.style.visibility = 'hidden';
	}
	;
}
function transformWidth(node) {
	var origW = node.scrollWidth;
	var w = node.parentElement.clientWidth;
	if (w < origW)
		var factor = w / origW;
	else
		var factor = 1;
	node.style.transform = "scale(" + factor + ")";
}
function loaded() {
	forEach(document.getElementsByClassName("explain"), hookup_explain)
	forEach(document.querySelectorAll(".swap"), hookup_swap);
	var iframersize = foldl(document.querySelectorAll("iframe"), function() {}, function(a, node) {
		return function x() {
			a();
			transformWidth(node);
		}
	});
	document.iframersize = iframersize;
	window.onresize = iframersize;
	window.setInterval(maketick(), 5000);
}

return {
	regExpEscape: regExpEscape,
	forEach: forEach,
	foldl: foldl,
	classList: classList,
	classTag: classTag,
	maketick: maketick,
	hookup_swap: hookup_swap,
	hookup_explain: hookup_explain,
	transformWidth: transformWidth,
	loaded: loaded
}
}();
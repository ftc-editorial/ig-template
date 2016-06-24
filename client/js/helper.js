function getPageOffset() {
	var supportPageOffset = window.pageXOffset !== undefined;
	var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
	
	var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
	var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
	return {x:x, y:y};
}

function getElementPosition(e) {

	if (!(e instanceof HTMLElement)) {
		e = document.querySelector(e);
	}
	var box = e.getBoundingClientRect();
	var offset = getPageOffset();
	var x1 = box.left + offset.x;
	var x2 = box.right + offset.x;
	var y1 = box.top + offset.y;
	var y2 = box.bottom + offset.y;

	return {xLeft: x1,  xRight: x2, yTop: y1,yBottom: y2};
}

function getElementSize(e) {
    var box = e.getBoundingClientRect();
    var w = box.width || (box.right - box.left);
    var h = box.height || (box.bottom - box.top);
    return {w: w, h: h}
}

exports.getPageOffset = getPageOffset;
exports.getElementPosition = getElementPosition;
exports.getElementSize = getElementSize;
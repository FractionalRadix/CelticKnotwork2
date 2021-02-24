function main() {
	var svg = document.getElementById('svg1');

	const numCols = 18;
	const numRows = 17;

	drawDots(svg, numRows, numCols);
	drawSlashLines(svg, numRows, numCols);
	drawBackslashLines(svg, numRows, numCols);
	drawHorizontalArcs(svg, numRows, numCols);
}

function rowAndColToPoint(row,col) {
	return { x : 10 + 20 * col, y : 10 + 20 * row };
}

/**
 * Given an object with an x value and a y value, return a string that consists of the string representations of these values, separated by a space.
 * For example, if you ave han object { x : 3.5, y : 4.1, z: 2.11, w: 0.8 }, it will return "3.5 4.1"
 * @param Object p An object with an "x" attribute and a "y" attribute.
 * @return The textual representation of the x and y attribute, separated by a single space.
 */
function pointToString(p) {
	return p.x.toString() + " " + p.y.toString();
}

function drawDots(svg, numRows, numCols) {
	for (let row = 1; row <= numRows; row++) {
		for (let col = 1; col <= numCols; col++) {
			let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
			const point = rowAndColToPoint(row, col);
			circle.setAttribute("cx", point.x);
			circle.setAttribute("cy", point.y);
			circle.setAttribute("r", 2);
			circle.setAttribute("fill", "white");
			svg.appendChild(circle);
		} // end for col
	} // end for row
}

function drawSlashLines(svg, numRows, numCols) {
	let start = 4;
	let end = 2 * Math.max(numRows, numCols);
	for(let idx = start; idx < end; idx += 2) {
		let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		let pt1 = rowAndColToPoint(1, Math.min(idx, numRows));
		let pt2 = rowAndColToPoint(Math.min(idx, numCols), 1); //TODO!~
		line.setAttribute("x1", pt1.x);
		line.setAttribute("y1", pt1.y);
		line.setAttribute("x2", pt2.x);
		line.setAttribute("y2", pt2.y);
		line.style.stroke = "white";
		line.style.strokeWidth = "1";
		svg.appendChild(line);
	}
}

/**
 * Draw the "/" diagonal lines.
 */
function OLD_drawSlashLines(svg, numRows, numCols) {
	for (let row = 2; row <= numRows; row += 1) {
		for (let col = 2; col <= numCols; col += 2) {
			let delta = (row % 2 == 1) ? 1 : 0;
			let pt1 = rowAndColToPoint(row - 1, col + 1  - 1+ delta);
			let pt2 = rowAndColToPoint(row - 1 + 1, col - 1  - 1  +  1 + delta);
			let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", pt1.x);
			line.setAttribute("y1", pt1.y);
			line.setAttribute("x2", pt2.x);
			line.setAttribute("y2", pt2.y);
			line.style.stroke = "white";
			line.style.strokeWidth = "1";
			svg.appendChild(line);
		} // end for col
	} // end for row
}

/**
 * Draw the "\" diagonal lines.
 */
function drawBackslashLines(svg, numRows, numCols) {
	for (let row = 1; row <= numRows - 1; row += 1) {
		for (let col = 0; col <= numCols - 1; col += 2) {
			let delta =  (row % 2 == 1) ? 0 : 1;
if (col === 0 && delta === 0) continue;
if (col === numCols - 1 && delta === 1) continue;
			let pt1 = rowAndColToPoint(row, col + delta);
			let pt2 = rowAndColToPoint(row + 1, col+1 + delta);
			let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", pt1.x);
			line.setAttribute("y1", pt1.y);
			line.setAttribute("x2", pt2.x);
			line.setAttribute("y2", pt2.y);
			line.style.stroke = "white";
			line.style.strokeWidth = "1";
			svg.appendChild(line);
		} // end for col
	} // end for row
}

function drawHorizontalArcs(svg, numRows, numCols) {
	for (let col = 2; col < numCols - 1; col += 2 ) {
		let startPoint1 = { row: 1, col: col };
		addUpwardsHorizontalArc(svg, startPoint1);
		let startPoint2 = { row: numRows, col: col };
		addDownwardsHorizontalArc(svg, startPoint2);
	}
}

function addUpwardsHorizontalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row, start.col + 2);
	let ctrl = rowAndColToPoint(start.row - 1, start.col + 1);

	let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
	let pathVal =  "M " + pointToString(pt1) + " Q " + pointToString(ctrl) + " " + pointToString(pt2);
	arc.setAttribute("d", pathVal);
	arc.style.stroke = "white";
	arc.style.strokeWidth = "1";
	arc.style.fill="none";
	svg.appendChild(arc);
}

function addDownwardsHorizontalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row, start.col + 2);
	let ctrl = rowAndColToPoint(start.row + 1, start.col + 1);

	let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
	let pathVal =  "M " + pointToString(pt1) + " Q " + pointToString(ctrl) + " " + pointToString(pt2);
	arc.setAttribute("d", pathVal);
	arc.style.stroke = "white";
	arc.style.strokeWidth = "1";
	arc.style.fill="none";
	svg.appendChild(arc);
}


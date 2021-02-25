function main() {
	var svg = document.getElementById('svg1');

	const numCols = 18;
	const numRows = 9;

	//TODO!+ Find a way to store the lines and arcs into a data structure.
	// This allows us to add the break/rejoin function.
	// When the user clicks on a part where two lines cross, we find those lines back in the SVG.
	// We then remove those lines (break), and replace them with a set of arcs (rejoin).


	drawDots(svg, numRows, numCols);
	drawSlashLines(svg, numRows, numCols);
	drawBackslashLines(svg, numRows, numCols);
	drawArcs(svg, numRows, numCols);
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
	console.log("numRows=="+numRows+", numCols=="+numCols);
	let start = 4;
	let end = 2 * Math.max(numRows, numCols);

	// Curious: if you try to print the same multiple times, JavaScript prints it only ONCE?
	// If you print something else in-between it WILL print the earlier text again.
	// Way to confuse me while I'm debugging, JavaScript...
	for (let tmp = 1; tmp < 5; tmp++) {
		console.log("Test");
	}

	for(let idx = start; idx < end; idx += 2) {
		let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

		console.log(idx);

		//TODO!~ Still need to correct a few things about these (row,col) coordinates for starting point and ending point.
		//TODO!+ After this is done, the lines should be built from smaller line segments, that can be removed individually. (So, a nested for loop).

		let startingPointColIdx = 1;
		let startingPointRowIdx = idx;
		if (startingPointRowIdx > numRows) {
			startingPointColIdx = startingPointRowIdx - numRows;
		}

		let endingPointRowIdx = 1;
		let endingPointColIdx = idx;
		if (endingPointRowIdx > numCols) {
			endingPointRowIdx = endingPointColIdx - numCols;
		}


		let pt1 = rowAndColToPoint(startingPointRowIdx, startingPointColIdx);
		let pt2 = rowAndColToPoint(endingPointRowIdx, endingPointColIdx);

		line.setAttribute("x1", pt1.x);
		line.setAttribute("y1", pt1.y);
		line.setAttribute("x2", pt2.x);
		line.setAttribute("y2", pt2.y);
		line.style.stroke = "white";
		line.style.strokeWidth = "2";
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
			line.style.strokeWidth = "2";
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
			line.style.strokeWidth = "2";
			svg.appendChild(line);
		} // end for col
	} // end for row
}

function drawArcs(svg, numRows, numCols) {
	// Draw the horizontal arcs, above and below our grid.
	for (let col = 2; col < numCols - 1; col += 2 ) {
		let startPoint1 = { row: 1, col: col };
		addUpwardsHorizontalArc(svg, startPoint1);
		let startPoint2 = { row: numRows, col: col };
		addDownwardsHorizontalArc(svg, startPoint2);
	}

	// Draw the vertical arcs, to the left and right of our grid.
	for (let row = 2; row < numRows - 1; row += 2) {
		let startPoint1 = { row: row, col: 1 };
		addBackwardsVerticalArc(svg, startPoint1);
		let startPoint2 = { row: row, col: numCols };
		addForwardsVerticalArc(svg, startPoint2);
	}
}

/**
 * Add a horizontal arc that bends upwards.
 * @param {svg} svg Reference to the SVG object to which the arc must be added.
 * @param start The leftmost point of the arc, in terms of rows and columns on a grid.
 * The ending point of the arc will be two columns to the right of the starting point.
 */
function addUpwardsHorizontalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row, start.col + 2);
	let ctrl = rowAndColToPoint(start.row - 1, start.col + 1);
	addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
}

/**
 * Add a horizontal arc that bends downwards.
 * @param {svg} svg Reference to the SVG object to which the arc must be added.
 * @param start The leftmost point of the arc, in terms of rows and columns on a grid. Must have a "row" and a "col" attribute.
 * The ending point of the arc will be two columns to the right of the starting point.
 */
function addDownwardsHorizontalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row, start.col + 2);
	let ctrl = rowAndColToPoint(start.row + 1, start.col + 1);
	addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
}

/**
 * Add a vertical arc that bends backwards (towards the left side of the screen).
 * @param {svg} svg Reference to the SVG object to which the arc must be added.
 * @param start The uppermost point of the arc, in terms of rows and columns on a grid. Must have a "row" and a "col" attribute.
 * The ending point of the arc will be two rows below the starting point.
 */
function addBackwardsVerticalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row + 2, start.col);
	let ctrl = rowAndColToPoint(start.row + 1, start.col - 1);
	addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
}

/**
 * Add a vertical arc that bends forwards (towards the right side of the screen).
 * @param {svg} svg Reference to the SVG object to which the arc must be added.
 * @param start The uppermost point of the arc, in terms of rows and columns on a grid. Must have a "row" and a "col" attribute.
 * The ending point of the arc will be two rows below the starting point.
 */
function addForwardsVerticalArc(svg, start) {
	let pt1 = rowAndColToPoint(start.row, start.col);
	let pt2 = rowAndColToPoint(start.row + 2, start.col);
	let ctrl = rowAndColToPoint(start.row + 1, start.col + 1);
	addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
}

/**
 * Shorthand function to add a quadratic Bézier curve to an SVG element.
 * @param {svg} The SVG to which the curve will be added.
 * @param {startingPoint} Starting point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
 * @param {controlPoint} Control point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
 * @param {endingPoint} Ending point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
 */
function addQuadraticBezierCurve(svg, startingPoint, controlPoint, endingPoint) {
	let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
	let pathVal =  "M " + pointToString(startingPoint) + " Q " + pointToString(controlPoint) + " " + pointToString(endingPoint);
	arc.setAttribute("d", pathVal);
	arc.style.stroke = "white";
	arc.style.strokeWidth = "2";
	arc.style.fill="none";
	svg.appendChild(arc);
}
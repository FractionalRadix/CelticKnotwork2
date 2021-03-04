//TODO?~ See if we can make these static members of rowAndColToPoint.
var xOffset;
var xScale;
var yOffset;
var yScale;

var svg;
var svgHelper = new SvgHelper();

// ********************* Single-Line Test ***********************************************************************************
function single_line_test() {
	
	// Grab the first connection.
	var key1 = connections.keys().next().value;
	var conn1 = connections.get(key1);

	var prevRow = conn1.row1;
	var prevCol = conn1.col2;

	let visited = [key1];
	do {
		console.log(visited);

		var curRow, curCol;
		if (prevRow === conn1.row1 && prevCol === conn1.col1) {
			curRow = conn1.row2;
			curCol = conn1.col2;
		} else /* if prevRow === conn1.row2 && prevCol === conn1.col2 */ {
			curRow = conn1.row1;
			curCol = conn1.col1;
		}
		let next = nextLine(key1, curRow, curCol);
		console.log(next);
		var visitedBefore = visited.indexOf(next) > -1;
		visited.push(next);
		key1 = next;
		conn1 = connections.get(key1);

		prevRow = curRow;
		prevCol = curCol;

		// Draw it the new connection in red..
		svgHelper.changeColor(svg, key1, "red");

	} while (!visitedBefore);

	//TODO!+

}

/***
 * Determine the slope of the given line at the given grid point, modulo 180 degrees.
 * @param {Number} lineID ID of the arc or line segment.
 * @param {Number} row Row coordinate of the point where we want to measure the slope; should belong to one of the line's ending points.
 * @param {Number} col Column coordinate of the point where we want to measure the slope; should belong to one of the line's ending points - the same ending point as the "row" parameter.
 */
function slope(lineID, row, col) {
	//TODO!+
	// Note that "slope", for our purposes, is two-way: a slope of 45 degrees (Southeast) connects to a slope of 225 degrees (Northwest).
	// Our slope should be done modulo 180 degrees.

	console.log("slope("+lineID+","+row+","+col+")");
	var line = connections.get(lineID);
	var startRow, startCol, endRow, endCol;
	if (line.row1 === row && line.col1 === col) {
		startRow = line.row1;
		startCol = line.col1;
		endRow = line.row2;
		endCol = line.col2;
	} else { // line.row2 == row && line.col2 == col 
		startRow = line.row2;
		startCol = line.col2;
		endRow = line.row1;
		endCol = line.col1;
	}

	console.log("Calculating slope for ("+startCol+","+startRow+")-("+endCol+","+endRow+")");
		
	if (line.rowCtrl === null || line.rowCtrl === undefined) {
		// It's a diagonal.
		return slopeOfDiagonal(startCol, startRow, endCol, endRow);
	} else {
		// It's a curve.
		if (line.row1 === line.row2) {
			// It's a horizontal curve.
			//TODO!+
			return 1; //TODO!~
		} else if (line.col1 === line.col2) {
			// It's a vertical curve.
			//TODO!+
			return 1; //TODO!~
		}
	}
}

function slopeOfDiagonal(x1, y1, x2, y2) {
	var dy = y1 - y2; // Normally you'd use line.row2-line.row1, but in SVG and most other computer graphics, a higher y value is a lower row... so it must be inverted.
	var dx = x2 - x1;
	var slope = dy / dx; //TODO?~ Handle the unlikely case that dx===0 ?
	return slope;
}

/**
 * Given a connection (arc or line segment), find the next connection.
 * The "next" connection is another connection. If there is one that starts with the same slope that the current one ends with, this is the preferred one.
 * Since all connections by definition have two points, we also point out which point we're looking at.
 * @param {Number} id ID of the original connection.
 * @param {Number} startRow Row coordinate of the point whose connections we are interested in.
 * @param {Number} startCol Column coordinate of the point whose connections we are interested in.
 * @return {Number} ID of the next connection.
 */
function nextLine(id, startRow, startCol) {
	console.log("nextLine("+id+","+startRow+","+startCol+")");
	// Find all connections from our starting point.
	var connectedLines1 = allLinesConnectedTo(startRow, startCol);
	// There is ONE connection we will never take: our original connection, the one we started from.
	// So remove all occurrences of our original connection.
	var originalLine = connections.get(id);
	var connectedLines2 = [];
	for (let key of connectedLines1) {
		let line = connections.get(key);
		if (!(line.row1 == originalLine.row1 && line.col1 == originalLine.col1 && line.row2 == originalLine.row2 && line.col2 == originalLine.col2)) {
			connectedLines2.push(key);	//TODO?  push({id: key, connection: line}) ?
		}
	}

	console.log("Nr of connected lines: "+connectedLines2.length);
	// At this point, we have a number of connected lines.
	// IF we have a connected line with the same slope, we should select that.
	// If there is no such line, we may have secondary constraints; for now, if we encounter that case, we just grab the first connected line available.
	let selectedLine = null;

	var slope1 = slope(id, startRow, startCol);
	console.log("slope1==="+slope1);
	for (let i = 0; i < connectedLines2.length; i++) {
		console.log("connectedLines2["+i+"]==="+connectedLines2[i]);
		var slope2 = slope(connectedLines2[i], startRow, startCol);
		if (slope1 === slope2) {
			console.log("slope==="+slope1+", slope2==="+slope2);
			selectedLine = connectedLines2[i];
			break;
		}
	}
	//TODO?~ Find out if there are other reasons to give a connected line priority, when there is no connected line that has the same slope as the one we came from.
	if (selectedLine === null) {
		selectedLine = connectedLines2[0];
	}


	return selectedLine;
}
// ********************* Deciding wich operator to use **********************************************************************

var selectedOperation = null;

function activate_operator(src) {

	var verticalRejoinButton = document.getElementById('VerticalRejoin');
	var horizontalRejoinButton = document.getElementById('HorizontalRejoin');
	var crossButton = document.getElementById('Cross');

	switch(src.id) {
		case "VerticalRejoin":
			selectedOperation = verticalRejoin;

			verticalRejoinButton.classList.remove('box-unpressed');
			verticalRejoinButton.classList.add('box-pressed');
			horizontalRejoinButton.classList.remove('box-pressed');
			horizontalRejoinButton.classList.add('box-unpressed');
			crossButton.classList.remove('box-pressed');
			crossButton.classList.add('box-unpressed');

			break;
		case "HorizontalRejoin":
			selectedOperation = horizontalRejoin;

			verticalRejoinButton.classList.remove('box-pressed');
			verticalRejoinButton.classList.add('box-unpressed');
			horizontalRejoinButton.classList.remove('box-unpressed');
			horizontalRejoinButton.classList.add('box-pressed');
			crossButton.classList.remove('box-pressed');
			crossButton.classList.add('box-unpressed');

			break;
		case "Cross":
			selectedOperation = cross;

			verticalRejoinButton.classList.remove('box-pressed');
			verticalRejoinButton.classList.add('box-unpressed');
			horizontalRejoinButton.classList.remove('box-pressed');
			horizontalRejoinButton.classList.add('box-unpressed');
			crossButton.classList.remove('box-unpressed');
			crossButton.classList.add('box-pressed');

			break;
		default:
			break;
	}
}

function main() {
	
	svg = document.getElementById('svg1');

	// Test case values for (numRows,numCols):
	// (18,8) (18,7) (17,8) (17,7)
	// (8,18) (7,18) (8,17) (7,17)
	// (15,15) (18,18)
	// Note that for the arcs to work properly, you need an ODD number of rows and an ODD number of columns.
	const numRows = 21;
	const numCols = 21;


	// Automatically scale the grid to the size of the SVG.
	var bBox = svg1.getBBox();
	xOffset = 10;
	yOffset = 10;
	const widthWithoutPadding  = bBox.width  - 2 * xOffset;
	const heightWithoutPadding = bBox.height - 2 * yOffset;
	xScale = widthWithoutPadding / (numCols + 1);
	yScale = heightWithoutPadding / (numRows + 1);

	// Source: https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
	function getMousePosition(evt) {
		var CTM = svg.getScreenCTM();
		return {
			x: (evt.clientX - CTM.e) / CTM.a,
			y: (evt.clientY - CTM.f) / CTM.d
		};
	}
	svg.addEventListener("click", function(event) {
		var mousePos = getMousePosition(event);
		var gridPos = pointToRowAndCol(mousePos);

		if (selectedOperation !== null) {
			selectedOperation(svg, gridPos);
		}
	});

	drawDots(svg, numRows, numCols);
	drawSlashLines(svg, numRows, numCols);
	drawBackslashLines(svg, numRows, numCols);
	drawArcs(svg, numRows, numCols);
}

function rowAndColToPoint(row,col) {
	var xVal = xOffset + col * xScale;
	var yVal = yOffset + row * yScale;
	return { x : xOffset + col * xScale, y : yOffset + row * yScale };
}

function pointToRowAndCol(point) {
	var colCoor = ( point.x - xOffset ) / xScale;
	var rowCoor = ( point.y - yOffset ) / yScale;
	return { row : Math.round(rowCoor), col: Math.round(colCoor) };
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
			const point = rowAndColToPoint(row, col);
			svgHelper.drawDot(svg, point.x, point.y, 2, "white");
		}
	}
}

function drawSlashLines(svg, numRows, numCols) {
	let start = 4;
	let end = numRows + numCols - 2;

	for(let idx = start; idx < end; idx += 2) {

		// Determine the starting point and ending point for the entire diagonal.
		let startingPointColIdx = 1;
		if (idx > numRows) {
			startingPointColIdx = idx - numRows + 1;
		}

		let startingPointRowIdx = Math.min(idx, numRows);

		let endingPointRowIdx = 1;
		if (idx > numCols) {
			endingPointRowIdx = idx - numCols + 1;
		}

		let endingPointColIdx = Math.min(idx, numCols);

		// Draw the diagonal as a series of smaller diagonals.
		// (We do this so we can remove individual parts of the diagonal later).
		let n = endingPointColIdx - startingPointColIdx;
		for (let i = 0; i < n; i++ ) {
			let curRow = startingPointRowIdx - i;
			let curCol = startingPointColIdx + i;

			let ptStart = rowAndColToPoint(curRow, curCol);
			let ptEnd   = rowAndColToPoint(curRow - 1, curCol + 1);

			let id = svgHelper.addLine(svg, ptStart.x, ptStart.y, ptEnd.x, ptEnd.y, "darkgreen", 2);

			connections.set(id, new Connection(curRow, curCol, curRow - 1, curCol + 1));
		}
	}
}

function drawBackslashLines(svg, numRows, numCols) {
	let start = 3
	let end = numRows + numCols - 3;

	for(let idx = start; idx < end; idx += 2) {

		// Determine the starting point and ending point for the entire diagonal.
		let startingPointRowIdx = Math.max(numRows - idx, 1);

		let startingPointColIdx = Math.max(1, idx - numRows + 2);

		let endingPointRowIdx = numRows;
		if (idx > numCols) {
			endingPointRowIdx = numRows + numCols - idx;
		}

		// Draw the diagonal as a series of smaller diagonals.
		// (We do this so we can remove individual parts of the diagonal later).
		let n = endingPointRowIdx - startingPointRowIdx;
		for (let i = 0; i < n; i++) {
			let curRow = startingPointRowIdx + i;
			let curCol = startingPointColIdx + i;

			if (curCol >= numCols)
				continue;

			let startingPoint = rowAndColToPoint(curRow, curCol);
			let endingPoint = rowAndColToPoint(curRow + 1, curCol + 1);
		
			let id = svgHelper.addLine(svg, startingPoint.x, startingPoint.y, endingPoint.x, endingPoint.y, "darkgreen", 2);

			connections.set(id, new Connection(curRow, curCol, curRow + 1, curCol + 1));
		}
	}
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen", 2);
	connections.set(id, new Connection(start.row, start.col, start.row, start.col + 2, start.row - 1, start.col + 1 ));
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen", 2);
	connections.set(id, new Connection(start.row, start.col, start.row, start.col + 2, start.row + 1, start.col + 1));
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen", 2);
	connections.set(id, new Connection(start.row, start.col, start.row + 2, start.col, start.row + 1, start.col - 1));
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen",2 );
	connections.set(id, new Connection(start.row, start.col, start.row + 2, start.col, start.row + 1, start.col + 1));
}


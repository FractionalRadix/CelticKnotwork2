//TODO?~ See if we can make these static members of rowAndColToPoint.
var xOffset;
var xScale;
var yOffset;
var yScale;

var svgHelper = new SvgHelper();

// ********************* Single-Line Test ***********************************************************************************
function single_line_test() {
	
	// Grab the first connection.
	var key1 = connections.keys().next().value;
	var conn1 = connections.get(key1);

	console.log("single_line_test: marker 1.");
	let visited = [key1];
	do {
		console.log("single_line_test: marker 2.");
		let next = nextLine(key1, conn1.row2, conn1.col2); //TODO!~ Find it if we should (row1,col1) or (row2,col2) !!
		var visitedBefore = visited.indexOf(next) > -1;
		visited.push(next);
		console.log(visited);

	} while (!visitedBefore);

	//TODO!+

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
	// At this point, we have a number of connected lines.
	// We SHOULD select one that starts with the same slope that our original line ends with.
	// For now, we just grab the first!
	let selectedLine = connectedLines2[0];

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
	
	var svg = document.getElementById('svg1');

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

			let id = svgHelper.drawLine(svg, ptStart.x, ptStart.y, ptEnd.x, ptEnd.y, 2, "darkgreen");

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
		
			let id = svgHelper.drawLine(svg, startingPoint.x, startingPoint.y, endingPoint.x, endingPoint.y, 2, "darkgreen");

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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen");
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen");
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen");
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
	let id = svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2, "darkgreen");
	connections.set(id, new Connection(start.row, start.col, start.row + 2, start.col, start.row + 1, start.col + 1));
}


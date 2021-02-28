//TODO?~ See if we can make these static members of rowAndColToPoint.
var xOffset;
var xScale;
var yOffset;
var yScale;

var svgHelper = new SvgHelper();


// ********************* Deciding wich operator to use **********************************************************************

var selectedOperation = null;

function activate_operator(src) {
	switch(src.id) {
		case "VerticalRejoin":
			selectedOperation = verticalRejoin;
			break;
		case "HorizontalRejoin":
			selectedOperation = horizontalRejoin;
			break;
		case "Cross":
			selectedOperation = cross;
			break;
		case "Erase":
			selectedOperation = erase;
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

function erase(svg, gridPos) {

	res = [];

	// Find all line segments connected to the selected grid point, and add their ID's to the array 'res'.
	for (let lineSeg of connections) {
		let test1 = (lineSeg[1].row1 == gridPos.row && lineSeg[1].col1 == gridPos.col);
		let test2 = (lineSeg[1].row2 == gridPos.row && lineSeg[1].col2 == gridPos.col);
		if (test1 || test2) {
			let rowDiff = Math.abs(lineSeg[1].row1 - lineSeg[1].row2);
			let colDiff = Math.abs(lineSeg[1].col1 - lineSeg[1].col2);
			if (rowDiff <= 1 && colDiff <= 1) {
				res.push(lineSeg[0]);
			}
		}
	}
	massDelete(svg, res);

	// Find vertical arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var verticalArcs = findVerticalArcsAroundPoint(gridPos);
	massDelete(svg, verticalArcs);

	// Find horizontal arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var horizontalArcs = findHorizontalArcsAroundPoint(gridPos);
	massDelete(svg, horizontalArcs);
}

/**
 * Finds the vertical arcs (if any) that surround the given grid position.
 * @param {Object} gridPoint The grid point; should have a "row" member and a "col" member, both of which should be integers.
 * @return {Array} An array of IDs, where each ID is the ID of a vertical arc surrounding the given grid point. (So, size of the array varies from 0 to 2, inclusive).
 */
function findVerticalArcsAroundPoint(gridPoint) {
	// Find vertical arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var res = [];

	for (let [id,arc] of connections) {
		let test1 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col - 1);
		let test2 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col - 1);
		if (test1 || test2) {
			// The SVG element we found is a vertical arc, directly to the left of our grid point.
			//TODO!+ Find out if it bends towards the right (towards our grid point), if it doesn't we don't have to remove it...
			res.push(id);
		}
		
		let test3 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col + 1);
		let test4 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col + 1);
		if (test3 || test4) {
			// The SVG element we found is a vertical arc, directly to the right of our grid point.
			//TODO!+ Find out if it bends towards the left (towards our grid point), if it does we don't have to remove it...
			res.push(id);
		}
	}

	return res;
}

/**
 * Finds the horizontal arcs (if any) that surround the given grid position.
 * @param {Object} gridPoint The grid point; should have a "row" member and a "col" member, both of which should be integers.
 * @return {Array} An array of IDs, where each ID is the ID of a horizontal arc surrounding the given grid point. (So, size of the array varies from 0 to 2, inclusive).
 */
function findHorizontalArcsAroundPoint(gridPoint) {
	// Find horizontal arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var res = [];

	for (let [id, arc] of connections) {
		let test1 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col + 1);
		let test2 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col - 1);
		if (test1 || test2) {
			// The SVG element we found is a horizontal arc, directly above our grid point.
			//TODO!+ Find out if it bends downwards (towards our grid point), if it doesn't we don't have to remove it...
			res.push(id);
		}

		let test3 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col + 1);
		let test4 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col - 1);
		if (test3 || test4) {
			// The SVG element we found is a horizontal arc, directly below our grid point.
			//TODO!+ Find out if it bends upwards (towards our grid point), if it doesn't we don't have to remvoe it...
			res.push(id);
		}
	}

	return res;
}

function verticalRejoin(svg, gridPos) {
	console.log("In verticalRejoin(svg, gridPos)");

	let topOfLeftArc = { row : gridPos.row - 1, col : gridPos.col - 1 };
	let topOfRightArc = { row: gridPos.row - 1, col : gridPos.col + 1 };

	// Do these vertical arcs already exist? If so, leave.
	var existingVerticalArcs = findVerticalArcsAroundPoint(gridPos);
	if (existingVerticalArcs !== null && existingVerticalArcs.length > 0)
		return;

	// Are there already horizontal arcs in this story? If so, remove them.
	var existingHorizontalArcs = findHorizontalArcsAroundPoint(gridPos);
	massDelete(svg, existingHorizontalArcs);

	// Remove any diagonal lines.
	//TODO?~ Use nested loops.
	var lineIDs1 = searchConnections(gridPos.row - 1, gridPos.col - 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs1);
	var lineIDs2 = searchConnections(gridPos.row + 1, gridPos.col + 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs2);
	var lineIDs3 = searchConnections(gridPos.row - 1, gridPos.col + 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs3);
	var lineIDs4 = searchConnections(gridPos.row + 1, gridPos.col - 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs4);

	addForwardsVerticalArc(svg, topOfLeftArc);
	addBackwardsVerticalArc(svg, topOfRightArc);
}

function horizontalRejoin(svg, gridPos) {
	let startOfTopArc = { row: gridPos.row - 1, col: gridPos.col - 1 };
	let startOfBottomArc = { row: gridPos.row + 1, col: gridPos.col - 1 };

	// Do these horizontal arcs already exist? If so, leave.
	var existingHorizontalArcs = findHorizontalArcsAroundPoint(gridPos);
	if (existingHorizontalArcs !== null && existingHorizontalArcs.length > 0)
		return;

	// Are there already vertical arcs in this story? If so, remove them.
	var existingVerticalArcs = findVerticalArcsAroundPoint(gridPos);
	massDelete(svg, existingVerticalArcs);

	// Remove any diagonal lines.
	//TODO?~ Use a nested loops.
	var lineIDs1 = searchConnections(gridPos.row - 1, gridPos.col - 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs1);
	var lineIDs2 = searchConnections(gridPos.row + 1, gridPos.col + 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs2);
	var lineIDs3 = searchConnections(gridPos.row - 1, gridPos.col + 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs3);
	var lineIDs4 = searchConnections(gridPos.row + 1, gridPos.col - 1, gridPos.row, gridPos.col);
	massDelete(svg, lineIDs4);

	addDownwardsHorizontalArc(svg, startOfTopArc);
	addUpwardsHorizontalArc(svg, startOfBottomArc);
}

function cross(svg, gridPoint) {

	console.log("In function 'cross'");

	var toBeDeleted = allLinesConnectedTo(gridPoint);
	massDelete(svg, toBeDeleted);

	toBeDeleted = findHorizontalArcsAroundPoint(gridPoint);
	massDelete(svg, toBeDeleted);
	
	toBeDeleted = findVerticalArcsAroundPoint(gridPoint);
	massDelete(svg, toBeDeleted);

	let center = rowAndColToPoint(gridPoint.row, gridPoint.col);
	
	for (let rowDelta = - 1; rowDelta <= +1; rowDelta += 2) {
		for (let colDelta = -1; colDelta <= +1; colDelta += 2) {
			let corner1onGrid = { row: gridPoint.row + rowDelta, col: gridPoint.col + colDelta };
			let corner1onSvg  = rowAndColToPoint( corner1onGrid.row, corner1onGrid.col );
			let id1 = svgHelper.drawLine(svg, center.x, center.y, corner1onSvg.x, corner1onSvg.y,  2, "darkgreen");
			connections.set(id1, new Connection(gridPoint.row, gridPoint.col, corner1onGrid.row, corner1onGrid.col));
		}
	}
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
	connections.set(id, new Connection(start.row, start.col, start.row, start.col + 2));
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
	connections.set(id, new Connection(start.row, start.col, start.row, start.col + 2));
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
	connections.set(id, new Connection(start.row, start.col, start.row + 2, start.col));
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
	connections.set(id, new Connection(start.row, start.col, start.row + 2, start.col));
}


//TODO?~ See if we can make these static members of rowAndColToPoint.
var xOffset;
var xScale;
var yOffset;
var yScale;

var svgHelper = new SvgHelper();

function main() {
	var svg = document.getElementById('svg1');

	// Test case values for (numRows,numCols):
	// (18,8) (18,7) (17,8) (17,7)
	// (8,18) (7,18) (8,17) (7,17)
	// (15,15) (18,18)
	// Note that for the arcs to work properly, you need an ODD number of rows and an ODD number of columns.
	const numRows = 17;
	const numCols = 17;


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
	document.addEventListener("click", function(event) {
		var mousePos = getMousePosition(event);
		console.log(mousePos.x+","+mousePos.y);
		var gridPos = pointToRowAndCol(mousePos);
		console.log(gridPos.row + " " + gridPos.col);
		//verticalRejoin(svg, gridPos);
		horizontalRejoin(svg, gridPos);
	});

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
	var xVal = xOffset + col * xScale;
	var yVal = yOffset + row * yScale;
	return { x : xOffset + col * xScale, y : yOffset + row * yScale };
}

function pointToRowAndCol(point) {
	var colCoor = ( point.x - xOffset ) / xScale;
	var rowCoor = ( point.y - yOffset ) / yScale;
	return { row : Math.round(rowCoor), col: Math.round(colCoor) };
}

function verticalRejoin(svg, gridPos) {
	let topOfLeftArc = { row : gridPos.row - 1, col : gridPos.col - 1 };
	let topOfRightArc = { row: gridPos.row - 1, col : gridPos.col + 1 };
	addForwardsVerticalArc(svg, topOfLeftArc);
	addBackwardsVerticalArc(svg, topOfRightArc);
}

function horizontalRejoin(svg, gridPos) {
	let startOfTopArc = { row: gridPos.row - 1, col: gridPos.col - 1 };
	let startOfBottomArc = { row: gridPos.row + 1, col: gridPos.col - 1 };
	addDownwardsHorizontalArc(svg, startOfTopArc);
	addUpwardsHorizontalArc(svg, startOfBottomArc);
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
		} // end for col
	} // end for row
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

			svgHelper.drawLine(svg, ptStart.x, ptStart.y, ptEnd.x, ptEnd.y, 2, "yellow");
		}
	}
}

function drawBackslashLines(svg, numRows, numCols) {
	let start = 3
	let end = numRows + numCols - 3;

	for(let idx = start; idx < end; idx += 2) {

		// Determine the starting point and ending point for the entire diagonal.
		let startingPointRowIdx = Math.max(numRows - idx, 1);

		let startingPointColIdx = Math.max(1, idx - numRows + 2); //TODO?~ Is this correct?

		let endingPointRowIdx = numRows;
		if (idx > numCols) {
			endingPointRowIdx = numRows + numCols - idx; //TODO?~ Is this correct?
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
		
			svgHelper.drawLine(svg, startingPoint.x, startingPoint.y, endingPoint.x, endingPoint.y, 2, "yellow");
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
	svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
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
	svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
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
	svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
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
	svgHelper.addQuadraticBezierCurve(svg, pt1, ctrl, pt2);
}


// ********************* Single-Line Test ***********************************************************************************

function singleLineTest() {
	singleLine(); // Call to initialize, so we can "export" the function singleLine.test.
	singleLine.test();
}

function singleLine( ) {
	// Put all of this in a single function, so we don't clutter the global namespace.
	var prevRow, prevCol;
	var key1, conn1;
	var visited;
	var timerID;

	// Expose the "test" function to the outside.
	singleLine.test = test;

	function test() {
		
		// Grab the first connection.
		key1 = connections.keys().next().value;
		conn1 = connections.get(key1);

		prevRow = conn1.row1;
		prevCol = conn1.col2;

		visited = [key1];

		timerID = setInterval(single_line_test_step, 250);
		//TODO!~ call clearInterval(timerId) as soon as "visitedBefore" becomes "true", or the user takes an action unrelated to the single-line test.
		/*
		do {
			var visitedBefore = single_line_test_step();
		} while (!visitedBefore);
		*/

		//TODO?+ Add a check if all lines have been visited?

	}

	/**
	 * A single step in the "single line" test (no pun intended).
	 * This method will later be called by setInterval, to add some animation.
	 * @param {Object} svg SVG on which the knotwork is drawn.
	 * @param {[Number]} visited Array of line ID's, to keep track of which lines have already been visited.
	 * @return {Boolean} true if and only if the line we have found, has been visited before (is in the "visited" array).
	 */
	function single_line_test_step() {
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

		if (visitedBefore) {
			clearInterval(timerID);
		}
		return visitedBefore;
	}

	/***
	 * Determine the slope of the given line at the given grid point, modulo 180 degrees.
	 * @param {Number} lineID ID of the arc or line segment.
	 * @param {Number} row Row coordinate of the point where we want to measure the slope; should belong to one of the line's ending points.
	 * @param {Number} col Column coordinate of the point where we want to measure the slope; should belong to one of the line's ending points - the same ending point as the "row" parameter.
	 * @return {Number} A number indicating the slope of the line at the given point; that is, it's delta-y divided by it's delta-x.
	 */
	function slope(lineID, row, col) {

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
			
		if (line.rowCtrl === null || line.rowCtrl === undefined) {
			// It's a diagonal.
			// Note that, because in SVG higher y values correspond to LOWER positions, the y-values (the row numbers) must be REVERSED before calling!
			return slopeOfDiagonal(startCol, endRow, endCol, startRow);
		} else {
			// It's a curve.
			if (startRow === endRow) {
				// It's a horizontal curve.
				if (line.rowCtrl > startRow) {
					// Control point on a row with a higher number, means the curve bends downwards.
					// It is -1 if endCol > startCol, +1 if endCol < startCol. Note that we should never have line.col1 === line.col2 here.
					// (Note that the angle is always a multiple of 45 degrees - if we ever change that, we'll need a more involved calculation of the slope at the start/end of a Bézier curve).
					return (endCol > startCol) ? -1 : +1;
				} else { // line.rowCtrl < startRow. Note that we should NOT ever get line.rowCtrl === line.row2. We're supposed to have a curve, not a flat line.
					// Control point on a row with a lesser numer, means the curve bends upwards.
					// It is +1 if endCol > startCol, -1 if endCol < startCol. Note that we should never have line.col1 === line.col2 here.
					// (Note that the angle is always a multiple of 45 degrees - if we ever change that, we'll need a more involved calculation of the slope at the start/end of a Bézier curve).
					return (endCol > startCol) ? +1 : -1;
				}
			} else if (startCol === endCol) {
				// It's a vertical curve.
				if (line.colCtrl > startCol) {
					// Control point on a column with a higher number, means the curve bends towards the right.
					// If startRow > endRow, we are at the bottom of this curve, and the slope is 45 degrees (+1).
					// If startRow < endRow, we are at the top of this curve, and the slope is -45 degrees (-1).
					// Note that startRow !== endRow; if this happens, we have a point, not a line.
					// Also note that the angle is always a multiple of 45 degrees - if we ever change that, we'll need a more involved calculation of the slope at the start/end of a Bézier curve.
					return (startRow > endRow ) ? +1 : -1;
				} else { // if line.colCtrol < startCol
					// Control point on a column with a lower number, means the curve ends towards the left.
					// If startRow > endRow, we are at the bottom of the curve, and the slope is 135 degrees (-1).
					// If startRow < endRow, we are at the top of the curve, and the slope is -225 degrees (+1).
					// Note that startRow !== endRow; if this happens, we have a point, not a line.
					// Also note that the angle is always a multiple of 45 degrees - if we ever change that, we'll need a more involved calculation of the slope at the start/end of a Bézier curve.
					return (startRow > endRow) ? - 1 : +1;
				}
			}
		}
	}

	//TODO!~ Don't let this method compensate for the upside-down approach of a computer.
	// Let the caller do that.
	function slopeOfDiagonal(x1, y1, x2, y2) {
		var dy = y2 - y1; // Normally you'd use y2 - y1, but in SVG and most other computer graphics, a higher y value is a lower row... so it must be inverted.
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
}
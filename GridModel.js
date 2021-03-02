// This file stores the "model" for the grid: the list of connections.
// The variables and functions here keep track of which grid points are connected to which other ones.

//TODO!+ Add a way to see if arcs are bent leftwards, rightwards, upwards, or downwards.
//TODO!+ Make SVG an observer to this.

class Connection {
	/**
	 * @param {Number} row1
	 * @param {Number} col1
	 * @param {Number} row2
	 * @param {Number} col2
	 * @param {Number} rowCtrl If the new connection is an arc, this is the row coordinate for the  control point for the arc, in a quadratic Bézier curve. Otherwise it will be null or undefined.
	 * @param {Number} colCtrl If the new connection is an arc, this is the column coordinate for the  control point for the arc, in a quadratic Bézier curve. Otherwise it will be null or undefined.
	 */
	constructor(row1,col1,row2,col2, rowCtrl, colCtrl) {
		this.row1 = row1;
		this.col1 = col1;
		this.row2 = row2;
		this.col2 = col2;
		this.rowCtrl = rowCtrl;
		this.colCtrl = colCtrl;
	}
}

var connections = new Map();

// ******************************** MUTATORS *********************************************************************************************************************************
/**
 * Given an array of IDs, delete all these arcs  and line segments from the SVG, and remove them from the "connections" map.
 * @param {Object} svg The SVG that the elements are drawn on.
 * @param {Array} toBeDeleted An array of integers; each integer is the ID of a connection that will be removed from the SVG, and from the "connections" map.
 */
function massDelete(svg, toBeDeleted) {
	toBeDeleted.forEach( id => {
		var elt = svg.getElementById(id);
		svg.removeChild(elt);
		connections.delete(id);
	}); 
}

function cross(svg, gridPoint) {

	// Are these arcs going to connect to something? If not, leave.
	if (!surroundingPointsConnected(gridPoint))
		return;

	var toBeDeleted = allLinesConnectedTo(gridPoint);
	massDelete(svg, toBeDeleted);

	toBeDeleted = findHorizontalArcsFacingPoint(gridPoint);
	massDelete(svg, toBeDeleted);
	
	toBeDeleted = findVerticalArcsFacingPoint(gridPoint);
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

function verticalRejoin(svg, gridPos) {

	let topOfLeftArc = { row : gridPos.row - 1, col : gridPos.col - 1 };
	let topOfRightArc = { row: gridPos.row - 1, col : gridPos.col + 1 };

	// Are these arcs going to connect to something? If not, leave.
	if (!surroundingPointsConnected(gridPos))
		return;

	// Do these vertical arcs already exist? If so, leave.
	var existingVerticalArcs = findVerticalArcsFacingPoint(gridPos);
	if (existingVerticalArcs !== null && existingVerticalArcs.length > 0)
		return;

	// Are there already horizontal arcs in this story? If so, remove them.
	var existingHorizontalArcs = findHorizontalArcsFacingPoint(gridPos);
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

	// Are these arcs going to connect to something? If not, leave.
	if (!surroundingPointsConnected(gridPos))
		return;

	// Do these horizontal arcs already exist? If so, leave.
	var existingHorizontalArcs = findHorizontalArcsFacingPoint(gridPos);
	if (existingHorizontalArcs !== null && existingHorizontalArcs.length > 0)
		return;

	// Are there already vertical arcs in this story? If so, remove them.
	var existingVerticalArcs = findVerticalArcsFacingPoint(gridPos);
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

// ******************************** ACCESSORS *************************************************************************************************************************

function searchConnections(row1, col1, row2, col2) {
	var res = [];

	for (let [id,conn] of connections) {
		var bool1 = conn.row1 === row1 && conn.col1 == col1;
		var bool2 = conn.row2 === row2 && conn.col2 == col2;
		if (bool1 && bool2) {
			res.push(id);
		}
		var bool3 = conn.row1 === row2 && conn.col1 == col2;
		var bool4 = conn.row2 === row1 && conn.col2 == col1;
		if (bool3 && bool4) {
			res.push(id);
		}
	}

	return res;
}

/**
 * Get the ID's of all lines directly connected to a given point on the grid.
 * @param {Number} row Row coordinate of the grid point.
 * @param {Number} col Column coordinate of the grid point.
 * @return {[Number]} An array of ID's of all the arcs and line segments that start or end at the given grid point.
 */
function allLinesConnectedTo(row, col) {
	var res = [];
	for (let [id,conn] of connections) {
		if (conn.row1 === row && conn.col1 === col) {
			res.push(id);
		} else if (conn.row2 === row && conn.col2 === col) {
			res.push(id);
		}
	}
	return res;
}

/**
 * Finds the vertical arcs (if any) that surround the given grid position, AND are bent towards it.
 * @param {Object} gridPoint The grid point; should have a "row" member and a "col" member, both of which should be integers.
 * @return {Array} An array of IDs, where each ID is the ID of a vertical arc surrounding the given grid point. (So, size of the array varies from 0 to 2, inclusive).
 */
function findVerticalArcsFacingPoint(gridPoint) {
	// Find vertical arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var res = [];

	for (let [id,arc] of connections) {
		let test1 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col - 1);
		let test2 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col - 1);
		if (test1 || test2) {
			// The SVG element we found is a vertical arc, directly to the left of our grid point.
			// Test if the arc is bent towards the right (towards our grid point); we are only interested if it is.
			if (arc.colCtrl > gridPoint.col - 1) {
				res.push(id);
			}
		}
		
		let test3 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col + 1);
		let test4 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col + 1);
		if (test3 || test4) {
			// The SVG element we found is a vertical arc, directly to the right of our grid point.
			// Test if it bends towards the left (towards our grid point); we are only interested if it is.
			if (arc.colCtrl < gridPoint.col + 1) {
				res.push(id);
			}
		}
	}

	return res;
}

/**
 * Finds the horizontal arcs (if any) that surround the given grid position, AND are bent towards it.
 * @param {Object} gridPoint The grid point; should have a "row" member and a "col" member, both of which should be integers.
 * @return {Array} An array of IDs, where each ID is the ID of a horizontal arc surrounding the given grid point. (So, size of the array varies from 0 to 2, inclusive).
 */
function findHorizontalArcsFacingPoint(gridPoint) {
	// Find horizontal arcs surrounding this grid point.
	// Note that we should still check in which direction they bend!
	var res = [];

	for (let [id, arc] of connections) {
		let test1 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col + 1);
		let test2 = (arc.row1 == gridPoint.row - 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row - 1 && arc.col2 == gridPoint.col - 1);
		if (test1 || test2) {
			// The SVG element we found is a horizontal arc, directly above our grid point.
			// Test if it bends downwards (towards our grid point); we are only interested if it is.
			if (arc.rowCtrl > gridPoint.row - 1) {
				res.push(id);
			}
		}

		let test3 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col - 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col + 1);
		let test4 = (arc.row1 == gridPoint.row + 1 && arc.col1 == gridPoint.col + 1) && (arc.row2 == gridPoint.row + 1 && arc.col2 == gridPoint.col - 1);
		if (test3 || test4) {
			// The SVG element we found is a horizontal arc, directly below our grid point.
			// Test if it bends upwards (towards our grid point); we are only interested if it is.
			if (arc.rowCtrl < gridPoint.row + 1) {
				res.push(id);
			}
		}
	}

	return res;
}

/**
 * Check if the given grid point is connected to at least one arc or line segment.
 * @param {Number} row Row coordinate of the grid point.
 * @param {Number} col Column coordinate of the grid point.
 * @return {boolean} True if and only if there is at least one arc or line segment connected to the given grid point.
 */
function isConnected(row, col) {
	for (let [id,conn] of connections) {
		if (conn.row1 === row && conn.col1 === col) {
			return true;
		} else if (conn.row2 === row && conn.col2 === col) {
			return true;
		}
	}
	return false;
}

/**
 * Check if the points "diagonally" surrounding a grid point, all have a connection.
 * In other words, the point above left, the point above right, the point below left, and the point below right.
 * We do NOT look at the points directly above, below, left, or right of the grid point. (The points "horizontally" and "vertically" surrounding the point).
 * (Note: we may later update this to NOT count connections towards the grid point itself, not sure if that's required).
 * @param {Object} gridPoint A grid point (an object with a numeric "row" and "col" property).
 */
function surroundingPointsConnected(gridPoint) {

	if (!isConnected(gridPoint.row - 1, gridPoint.col - 1)) {
		return false;
	}

	if (!isConnected(gridPoint.row - 1, gridPoint.col + 1)) {
		return false;
	}

	if (!isConnected(gridPoint.row + 1, gridPoint.col - 1)) {
		return false;
	}

	if (!isConnected(gridPoint.row + 1, gridPoint.col + 1)) {
		return false;
	}

	return true;
}
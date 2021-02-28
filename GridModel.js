// This file stores the "model" for the grid: the list of connections.
// The variables and functions here keep track of which grid points are connected to which other ones.

//TODO!+ Add a way to see if arcs are bent leftwards, rightwards, upwards, or downwards.
//TODO!+ Make SVG an observer to this.

class Connection {
	constructor(row1,col1,row2,col2) {
		this.row1 = row1;
		this.col1 = col1;
		this.row2 = row2;
		this.col2 = col2;
	}
}

var connections = new Map();

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

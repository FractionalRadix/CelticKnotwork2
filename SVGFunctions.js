class SvgHelper {

	idx = 0;

	/**
	 * Auxiliary function to draw a dot (a small filled circle).
	 * @param {svg} svg The SVG object for the dot.
	 * @param {integer} cx x-coordinate of the center of the dot.
	 * @param {integer} cy y-coordinate of the center of the dot.
	 * @param {integer} r Radius of the dot.
	 * @param {string} color Color of the dot.
	 */
	drawDot(svg, cx, cy, r, color) {
		let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		circle.setAttribute("cx", cx);
		circle.setAttribute("cy", cy);
		circle.setAttribute("r", r);
		circle.setAttribute("fill", color);
		circle.setAttribute("id", ++this.idx);
		svg.appendChild(circle);
	}

	/**
	 * Auxiliary function to add a line.
	 * @param {Object} svg The SVG for the line.
	 * @param {integer} x1 x-coordinate of the starting point of the line.
	 * @param {integer} y1 y-coordinate of the starting point of the line.
	 * @param {integer} x2 x-coordinate of the ending point of the line.
	 * @param {integer} y2 y-coordinate of the ending point of the line.
	 * @param {integer} width Width of the line.
	 * @param {string} color Color of the line.
	 */
	addLine(svg, x1, y1, x2, y2, color, width) {
		this.idx++;
		this.drawLine(svg, this.idx, x1, y1, x2, y2, color, width);
		return this.idx;
	}

	drawLine(svg, id, x1, y1, x2, y2, color, width) {
		let lineSegment = document.createElementNS("http://www.w3.org/2000/svg", "line");
		lineSegment.setAttribute("x1", x1);
		lineSegment.setAttribute("y1", y1);
		lineSegment.setAttribute("x2", x2);
		lineSegment.setAttribute("y2", y2);
		lineSegment.setAttribute("id", id);
		lineSegment.style.stroke = color;
		lineSegment.style.strokeWidth = width;
		svg.appendChild(lineSegment);
	}

	/**
	 * Shorthand function to add a quadratic Bézier curve to an SVG element.
	 * @param {svg} The SVG to which the curve will be added.
	 * @param {startingPoint} Starting point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
	 * @param {controlPoint} Control point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
	 * @param {endingPoint} Ending point of the curve, in screen coordinates. Must have an "x" attribute and a "y" attribute.
	 */
	addQuadraticBezierCurve(svg, startingPoint, controlPoint, endingPoint, color, width) {
		this.idx++;
		this.drawQuadraticBezierCurve(svg, this.idx, startingPoint, controlPoint, endingPoint, color, width);
		return this.idx;
	}

	drawQuadraticBezierCurve(svg, id, startingPoint, controlPoint, endingPoint, color, width) {
		let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
		let pathVal =  "M " + pointToString(startingPoint) + " Q " + pointToString(controlPoint) + " " + pointToString(endingPoint);
		arc.setAttribute("d", pathVal);
		arc.setAttribute("id", id);
		arc.style.stroke = color;
		arc.style.strokeWidth = width;
		arc.style.fill="none";
		svg.appendChild(arc);
	}

	changeColor(svg, id, newColor) {
		var elt = svg.getElementById(id);
		elt.style.stroke = newColor;
	}

}
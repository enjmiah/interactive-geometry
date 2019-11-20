const React = require('react');
const d3 = require('d3');
const D3Component = require('idyll-d3-component');
import {Vec3} from './util/Vec3';

const animDuration = 500;
const margin = {top: 10, right: 10, bottom: 10, left: 10};
const canvasWidth = 600;
const canvasHeight = 0.666667 * canvasWidth;
const width = canvasWidth - margin.left - margin.right;
const height = canvasHeight - margin.top - margin.bottom;

export class HalfEdgeDiagram extends D3Component {

    initialize(node, props) {
        if (typeof props.mesh === "string") {
            console.error(props.mesh);
            return;
        }

        let svg = (this.svg = d3.select(node).append('svg'));
        svg = svg
            .attr("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`)
            .style("width", "100%")
            .style("height", "auto");
        // Define arrow-head
        // TODO: Change to harpoons
        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "6")
                    .attr("refY", "6")
                    .append("path")
                        .attr("d", "M 0 0 12 6 0 12 3 6")
                        .style("fill", "black");
        svg = svg
            .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const vertices = this.props.mesh.vertices;
        const edges = this.props.mesh.edges;

        this.x = d3.scaleLinear().range([0, height]);
        this.y = d3.scaleLinear().range([height, 0]);
        this.x.domain(d3.extent(vertices, (d) => d.getPosition().x()));
        this.y.domain(d3.extent(vertices, (d) => d.getPosition().y()));

        const vertex = svg
            .selectAll("circle")
            .data(vertices);
        vertex
            .enter()
            .append("circle")
                .attr("r", 4)
                .attr("cx", (d) => this.x(d.getPosition().x()))
                .attr("cy", (d) => this.y(d.getPosition().y()));

        const edge = svg
            .selectAll("line")
            .data(edges);
        edge
            .enter()
            .append("line")
                .attr("x1", (e) => this.x(this.getArrowStartX(e)))
                .attr("y1", (e) => this.y(this.getArrowStartY(e)))
                .attr("x2", (e) => this.x(this.getArrowEndX(e)))
                .attr("y2", (e) => this.y(this.getArrowEndY(e)))
                .attr("stroke-width", 1)
                .attr("marker-end", "url(#head)")
                .attr("stroke", "black");
    }

    update(props, oldProps) {
        if (typeof props.mesh === "string") {
            const svg = this.svg.select("g");
            svg.selectAll("*").remove();
            svg.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("class", "error")
                .text(props.mesh);
            return;
        }

        const vertices = props.mesh.vertices;
        const edges = props.mesh.edges;

        this.x.domain(d3.extent(vertices, (d) => d.getPosition().x()));
        this.y.domain(d3.extent(vertices, (d) => d.getPosition().y()));

        const svg = this.svg.select("g");
        svg.selectAll("text").remove();
        const vertex = svg
            .selectAll("circle")
            .data(vertices);
        // Add vertices as needed
        vertex.enter().append("circle")
            .attr("r", 4)
            .attr("cx", (d) => this.x(d.getPosition().x()))
            .attr("cy", (d) => this.y(d.getPosition().y()))
            .merge(vertex);
        // Remove excess vertices
        vertex.exit().remove();
        // Move vertices to new positions
        vertex.transition()
            .duration(animDuration)
            .attr("r", 4)
            .attr("cx", (d) => this.x(d.getPosition().x()))
            .attr("cy", (d) => this.y(d.getPosition().y()));

        const edge = svg
            .selectAll("line")
            .data(edges);
        edge.enter().append("line")
            .attr("x1", (e) => this.x(this.getArrowStartX(e)))
            .attr("y1", (e) => this.y(this.getArrowStartY(e)))
            .attr("x2", (e) => this.x(this.getArrowEndX(e)))
            .attr("y2", (e) => this.y(this.getArrowEndY(e)))
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#head)")
            .attr("stroke", "black")
            .merge(edge);
        edge.exit().remove();
        edge.transition()
            .duration(animDuration)
            .attr("x1", (e) => this.x(this.getArrowStartX(e)))
            .attr("y1", (e) => this.y(this.getArrowStartY(e)))
            .attr("x2", (e) => this.x(this.getArrowEndX(e)))
            .attr("y2", (e) => this.y(this.getArrowEndY(e)))
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#head)")
            .attr("stroke", "black");
    }

    getArrow(e) {
        let start = e.getOrigin().getPosition();
        start.setZ(0); // ignore Z
        let end = e.getTwin().getOrigin().getPosition();
        end.setZ(0);
        const direction = end.subtract(start).normalized();

        // Compute a normal vector, to do offset
        let normal = new Vec3(direction.y(), -direction.x(), 0);
        let startIt = e;
        if (e.getFace() === undefined) {
            startIt = e.getTwin();
        }
        let it = startIt;
        const faceVerts = [];
        do {
            faceVerts.push(it.getOrigin().getPosition());
            it = it.getNext();
        } while (it !== startIt);
        let faceCentroid = new Vec3(0, 0, 0);
        for (let pos of faceVerts) {
            faceCentroid = faceCentroid.add(pos);
        }
        faceCentroid = faceCentroid.multiply(1 / faceVerts.length);
        const midPoint = start.add(end).multiply(0.5);
        let toCentroid = faceCentroid.subtract(midPoint);
        if (normal.dot(toCentroid) < 0) {
            normal = normal.multiply(-1);
        }
        if (e.getFace() === undefined) {
            normal = normal.multiply(-1);
        }

        // Offset a little bit by normal vector
        // TODO: scale these offsets based on scale of visualizations
        const offset = normal.multiply(0.04);
        start = start.add(offset);
        end = end.add(offset);

        // TODO: scale these paddings based on scale of visualizations
        const padding = direction.multiply(0.14);
        return [start.add(padding), end.subtract(padding)];
    }

    getArrowStartX(e) {
        return this.getArrow(e)[0].x();
    }
    getArrowStartY(e) {
        return this.getArrow(e)[0].y();
    }
    getArrowEndX(e) {
        return this.getArrow(e)[1].x();
    }
    getArrowEndY(e) {
        return this.getArrow(e)[1].y();
    }
}

const React = require("react");
const d3 = require("d3");
const D3Component = require("idyll-d3-component");
import {Vec3} from "./util/Vec3";
import {Palette} from "./util/Color";

const animDuration = 500;
const margin = {top: 27, right: 27, bottom: 27, left: 27};
const canvasWidth = 600;
const canvasHeight = 0.666667 * canvasWidth;
const width = canvasWidth - margin.left - margin.right;
const height = canvasHeight - margin.top - margin.bottom;
const subShift = "3px";

function half_edge_class(e) {
    return (e.getFace() === undefined ? "boundary edge" : "interior edge");
}

export class HalfEdgeDiagram extends D3Component {

    initialize(node, props) {
        if (typeof props.mesh === "string") {
            console.error(props.mesh);
            return;
        }

        const vertices = this.props.mesh.vertices;
        const edges = this.props.mesh.edges;
        const faces = this.props.mesh.faces;

        let svg = (this.svg = d3.select(node).append('svg'));
        svg = svg
            .attr("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`)
            .attr("class", "half-edge-diagram");

        // Define arrow-heads
        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head_red")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "7")
                    .attr("refY", "4")
                    .append("path")
                        .attr("d", "M 0 0 8 4.25 0 4.25")
                        .style("fill", Palette.boundary);
        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head_blue")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "7")
                    .attr("refY", "4")
                    .append("path")
                        .attr("d", "M 0 0 8 4.25 0 4.25")
                        .style("fill", Palette.interior);
        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head_orange")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "7")
                    .attr("refY", "4")
                    .append("path")
                        .attr("d", "M 0 0 8 4.25 0 4.25")
                        .style("fill", Palette.hover);
        svg = svg
            .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.x = d3.scaleLinear().range([0, width]);
        this.y = d3.scaleLinear().range([height, 0]);

        this.update(props, undefined);
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
        const faces = props.mesh.faces;

        // Try to do "equal axis" axes -- i.e. 10 pixels in horizontal direction
        // corresponds to the same distance in vertex coordinate space as 10
        // pixels in vertical direction
        let x_extent = d3.extent(vertices, (d) => d.getPosition().x());
        let y_extent = d3.extent(vertices, (d) => d.getPosition().y());
        const norm_x_range =
            (x_extent[1] - x_extent[0]) * (canvasHeight / canvasWidth);
        if (norm_x_range > y_extent[1] - y_extent[0]) {
            const y_centre = 0.5 * (y_extent[0] + y_extent[1]);
            y_extent = [
                y_centre - 0.5 * norm_x_range,
                y_centre + 0.5 * norm_x_range,
            ];
        } else {
            const x_centre = 0.5 * (x_extent[0] + x_extent[1]);
            const norm_y_range =
                (y_extent[1] - y_extent[0]) * (canvasWidth / canvasHeight);
            x_extent = [
                x_centre - 0.5 * norm_y_range,
                x_centre + 0.5 * norm_y_range,
            ];
        }
        this.figure_scale = x_extent[1] - x_extent[0];
        this.x.domain(x_extent);
        this.y.domain(y_extent);

        const svg = this.svg.select("g");
        svg.selectAll(".error").remove(); // clear error message

        const vertex = svg.selectAll(".vertex").data(vertices);
        vertex.exit().remove();
        const vertex_enter =
            vertex.enter()
                .append("g")
                    .attr("class", "vertex")
                    .attr("id", (v) => "vertex" + v.getId())
                    .on("mouseover", (v, i) => {
                        props.onHoverChange({type: "vertex", id: i});
                    })
                    .on("mouseout", (v, i) => {
                        props.onHoverChange(null);
                    });
        vertex_enter
            .append("circle")
                .attr("r", 14)
                .attr("cx", (v) => this.x(v.getPosition().x()))
                .attr("cy", (v) => this.y(v.getPosition().y()));
        vertex_enter
            .append("text")
                .attr("x", (v) => this.x(v.getPosition().x()))
                .attr("y", (v) => this.y(v.getPosition().y()))
                .html((v) => `v<tspan dy="${subShift}">${v.getId() + 1}</tspan>`)
                .attr("class", "vertex-label");
        const vertex_merge = vertex.merge(vertex_enter);
        vertex_merge
            .selectAll("circle")
                .transition().duration(animDuration)
                // TODO: Bizarre, but v is a copy of the old value for some reason
                .attr("cx", (v) => this.x(vertices[v.getId()].getPosition().x()))
                .attr("cy", (v) => this.y(vertices[v.getId()].getPosition().y()));
        vertex_merge
            .selectAll("text")
                .transition().duration(animDuration)
                .attr("x", (v) => this.x(vertices[v.getId()].getPosition().x()))
                .attr("y", (v) => this.y(vertices[v.getId()].getPosition().y()));

        const edge = svg.selectAll(".edge").data(edges);
        edge.exit().remove();
        const edge_enter =
            edge.enter()
                .append("g")
                    .attr("class", (e) => half_edge_class(e))
                    .attr("id", (e) => "edge" + e.getId())
                    .on("mouseover", (e, i) => {
                        props.onHoverChange({type: "edge", id: i});
                    })
                    .on("mouseout", (e, i) => {
                        props.onHoverChange(null);
                    });
        edge_enter
            .append("line")
                .attr("x1", (e) => this.x(this.getArrowStartX(e)))
                .attr("y1", (e) => this.y(this.getArrowStartY(e)))
                .attr("x2", (e) => this.x(this.getArrowEndX(e)))
                .attr("y2", (e) => this.y(this.getArrowEndY(e)));
        edge_enter
            .append("text")
                .attr("x", (e) => this.x(this.getArrowMiddleX(e) + this.getArrow(e)[3].x()))
                .attr("y", (e) => this.y(this.getArrowMiddleY(e) + this.getArrow(e)[3].y()))
                .html((e) => `e<tspan dy="${subShift}">${e.getId()}</tspan>`);
        const edge_merge = edge.merge(edge_enter)
            .attr("class", (e) => half_edge_class(e));
        edge_merge
            .selectAll("line")
                .transition().duration(animDuration)
                .attr("x1", (e) => this.x(this.getArrowStartX(edges[e.getId()])))
                .attr("y1", (e) => this.y(this.getArrowStartY(edges[e.getId()])))
                .attr("x2", (e) => this.x(this.getArrowEndX(edges[e.getId()])))
                .attr("y2", (e) => this.y(this.getArrowEndY(edges[e.getId()])));
        edge_merge
            .selectAll("text")
                .transition().duration(animDuration)
                .attr("x", (e) =>
                      (this.x(this.getArrowMiddleX(edges[e.getId()])
                           + this.getArrow(edges[e.getId()])[3].x())))
                .attr("y", (e) =>
                      (this.y(this.getArrowMiddleY(edges[e.getId()])
                           + this.getArrow(edges[e.getId()])[3].y())));

        const face = svg.selectAll(".face").data(faces);
        face.exit().remove();
        const face_enter =
            face.enter()
                .append("text")
                .attr("x", (f) => this.x(this.getArrow(f.getHalfEdge())[2].x()))
                .attr("y", (f) => this.y(this.getArrow(f.getHalfEdge())[2].y()))
                .html((f) => `f<tspan dy="${subShift}">${f.getId()}</tspan>`)
                .attr("class", "face")
                .attr("id", (f) => `face${f.getId()}`)
                .on("mouseover", (f, i) => {
                    props.onHoverChange({type: "face", id: i});
                })
                .on("mouseout", (f, i) => {
                    props.onHoverChange(null);
                });
        face.merge(face_enter)
            .transition().duration(animDuration)
            .attr("x", (f) => this.x(this.getArrow(f.getHalfEdge())[2].x()))
            .attr("y", (f) => this.y(this.getArrow(f.getHalfEdge())[2].y()));

        svg.selectAll(".hover").classed("hover", false);
        if (props.hover) {
            if (props.hover.type === "vertex" || props.hover.type === "edge") {
                svg.select(`#${props.hover.type}${props.hover.id}`)
                    .classed("hover", true);
            } else if (props.hover.type === "face") {
                svg.select(`#face${props.hover.id}`).classed("hover", true);
                let it = faces[props.hover.id].getHalfEdge();
                const start_it = it;
                do {
                    svg.select(`#edge${it.getId()}`).classed("hover", true);
                    it = it.getNext();
                } while (it !== start_it);
            }
        }
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
        const offset = normal.multiply(0.01 * this.figure_scale);
        start = start.add(offset);
        end = end.add(offset);

        const padding = direction.multiply(0.04 * this.figure_scale);
        const edgeLabelOffset = offset.multiply(2.75);
        return [start.add(padding), end.subtract(padding),
                faceCentroid, edgeLabelOffset];

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

    getArrowMiddleX(e) {
        return (this.getArrow(e)[0].x() + this.getArrow(e)[1].x()) / 2
    }

    getArrowMiddleY(e) {
        return (this.getArrow(e)[0].y() + this.getArrow(e)[1].y()) / 2
    }
}

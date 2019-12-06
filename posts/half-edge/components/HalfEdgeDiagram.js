const React = require('react');
const d3 = require('d3');
const D3Component = require('idyll-d3-component');
import {Vec3} from './util/Vec3';

const animDuration = 500;
const margin = {top: 20, right: 20, bottom: 20, left: 20};
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

        const vertices = this.props.mesh.vertices;
        const edges = this.props.mesh.edges;
        const faces = this.props.mesh.faces;

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
                    .attr("id", "head_red")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "6")
                    .attr("refY", "6")
                    .append("path")
                        .attr("d", "M 0 0 12 6 0 6.5 0 6")
                        .style("fill", "red");

        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head_blue")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "6")
                    .attr("refY", "6")
                    .append("path")
                        .attr("d", "M 0 0 12 6 0 6.5 0 6")
                        .style("fill", "blue");     
                        
        svg
            .append("svg:defs")
                .append("svg:marker")
                    .attr("id", "head_orange")
                    .attr("orient", "auto")
                    .attr("markerWidth", "30")
                    .attr("markerHeight", "30")
                    .attr("refX", "6")
                    .attr("refY", "6")
                    .append("path")
                        .attr("d", "M 0 0 12 6 0 6.5 0 6")
                        .style("fill", "orange");   
        svg = svg
            .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.x = d3.scaleLinear().range([0, height]);
        this.y = d3.scaleLinear().range([height, 0]);
        this.x.domain(d3.extent(vertices, (d) => d.getPosition().x()));
        this.y.domain(d3.extent(vertices, (d) => d.getPosition().y()));

        const vertex = svg
            .selectAll("circle")
            .data(vertices)
            .enter().append("g");
        vertex
            .append("circle")
            .attr("r", 11)
            .attr("cx", (d) => this.x(d.getPosition().x()))
            .attr("cy", (d) => this.y(d.getPosition().y()))
            .attr("id", (d) => "circle"+d.getId())
            .style('stroke', 'black')
            .style('fill', 'none')
            .style("cursor", "pointer")
            .on('mouseover', function(d){
                d3.select(this)
                  .style('fill', 'orange')
                  .attr('r', 12);
                  props.onHoverChange(d.id);
              })
            .on('mouseout', function(){
                d3.select(this)
                  .style('fill', 'none')
                  .attr('r', 11);
                  props.onHoverChange(null);
              });

        vertex
            .append("text")
                .attr("x", (d) => this.x(d.getPosition().x()))
                .attr("y", (d) => this.y(d.getPosition().y()))
                .text((d) => "v"+d.getId())
                // .style("font-size", "1.5em")
                .attr("class", "node")
                .style("cursor", "pointer")
                .on('mouseover', function(d){
                    d3.select(this)
                      props.onHoverChange(d.id);
                  })
                .on('mouseout', function(){
                    d3.select(this)
                      props.onHoverChange(null);
                  });;

        const edge = svg
            .selectAll("line")
            .data(edges)
            .enter().append("g");

        //TODO: CHANGE COLOR OF ARROWHEAD ON HOVER
        edge
            .append("line")
                .attr("x1", (e) => this.x(this.getArrowStartX(e)))
                .attr("y1", (e) => this.y(this.getArrowStartY(e)))
                .attr("x2", (e) => this.x(this.getArrowEndX(e)))
                .attr("y2", (e) => this.y(this.getArrowEndY(e)))
                .attr("stroke-width", 1)
                .attr("marker-end", function(e) {
                    if (e.getFace() !== undefined) {
                        return "url(#head_red)";
                    } else {
                        return "url(#head_blue)" 
                    }
                })
                .attr("stroke", function(e) {
                    if (e.getFace() !== undefined) {
                        return "red"
                    }
                        return "blue"
                })
                .attr('id', (e) => "edge"+e.getId())
                .style("cursor", "pointer")
                .on('mouseover', function(d){
                    d3.select(this)
                      .attr('stroke-width', 1.3)
                      .attr('stroke', 'orange');
                      props.onEdgeHoverChange(d.id);
                  })
                .on('mouseout', function(){
                    d3.select(this)
                      .attr('stroke-width', 1)
                      .attr('stroke','black');
                      props.onEdgeHoverChange(null);
                  });

        edge
            .append("text")
                .attr("x", (e) => this.x(this.getArrowMiddleX(e) + this.getArrow(e)[3].x()))
                .attr("y", (e) => this.y(this.getArrowMiddleY(e) + this.getArrow(e)[3].y()))
                .text((e) => "e" + e.getId())
                .attr('class', 'edge')
                .style("cursor", "pointer")
                .on('mouseover', function(d){
                    d3.select(this)
                      props.onEdgeHoverChange(d.id);
                  })
                .on('mouseout', function(){
                    d3.select(this)
                      props.onEdgeHoverChange(null);
                  });

        
    
        const face = svg
                  .selectAll("square")
                  .data(faces)
                  .enter()
                  .append("g");

       var myText =  face 
            .append("text")
            .attr('x', (f) => this.x(this.getArrow(f.getHalfEdge())[2].x()))
            .attr('y', (f) => this.y(this.getArrow(f.getHalfEdge())[2].y()))
            .text((f) => "f" + f.getId())
            .attr('text-anchor', 'middle')
            .attr('class', 'face');

        // Append a bounding box around the text label to increase the surface area
        face
            .append('rect')
            .attr('x', (f) => 
                myText.nodes()[f.getId()].getBBox().x - 10
            )
            .attr('y', (f) => 
                myText.nodes()[f.getId()].getBBox().y - 10
            )
            .attr('width', (f) => 
                myText.nodes()[f.getId()].getBBox().width + 20
            )
            .attr('height', (f) => 
                myText.nodes()[f.getId()].getBBox().height + 20
            )
            .style('stroke','none')
            .style('fill', 'white')
            .style('opacity', 0)
            .style("cursor", "pointer")
            .attr('class', 'face_label');

        face
            .on('mouseover', (d) => {
                props.onFaceHoverChange(d);
            })
            .on('mouseout', (d) => {
                props.onFaceHoverChange(null);
            })

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

        this.x.domain(d3.extent(vertices, (d) => d.getPosition().x()));
        this.y.domain(d3.extent(vertices, (d) => d.getPosition().y()));

        const svg = this.svg.select("g");
        svg.selectAll(".error").remove(); // clear error message

        const vertex = svg
            .selectAll("circle")
            .data(vertices);
        const vertex_label = svg
            .selectAll(".node")
            .data(vertices);

        // Add vertices as needed
        vertex
            .enter()
            .append("circle")
            .attr("r", 11)
            .attr("cx", (d) => this.x(d.getPosition().x()))
            .attr("cy", (d) => this.y(d.getPosition().y()))
            .attr("id", (d) => "circle"+d.getId())
            .merge(vertex);

        vertex_label
            .enter()
            .append("text")
                .attr("x", (d) => this.x(d.getPosition().x()))
                .attr("y", (d) => this.y(d.getPosition().y()))
                .text((d) => "v" + d.getId())
                .attr("class", "node")
                .merge(vertex_label);

        // Remove excess vertices
        vertex.exit().remove();
        vertex_label.exit().remove();

        // Face update, remove excess faces and bounding rectangle
        const face = svg
                  .selectAll(".face")
                  .data(faces);

        const faceLabel = svg  
                        .selectAll('.face_label')
                        .data(faces);
        face.exit().remove();
        faceLabel.exit().remove();

        face.transition()
        .duration(animDuration)
        .attr('x', (f) => this.x(this.getArrow(f.getHalfEdge())[2].x()))
        .attr('y', (f) => this.y(this.getArrow(f.getHalfEdge())[2].y()));

        faceLabel.transition()
        .duration(animDuration)
        .attr('x', (f) => 
            faceLabel.nodes()[f.getId()].getBBox().x
    )
        .attr('y', (f) => 
            faceLabel.nodes()[f.getId()].getBBox().y
        );
            

        

        // Move vertices to new positions
        vertex.transition()
            .duration(animDuration)
            .attr("cx", (d) => this.x(d.getPosition().x()))
            .attr("cy", (d) => this.y(d.getPosition().y()));

        vertex_label.transition()
            .duration(animDuration)
            .attr("x", (d) => this.x(d.getPosition().x()))
            .attr("y", (d) => this.y(d.getPosition().y()));

        const edge = svg
            .selectAll("line")
            .data(edges);
        const edge_label = svg
            .selectAll(".edge")
            .data(edges);
        edge.enter().append("line")
            .attr("x1", (e) => this.x(this.getArrowStartX(e)))
            .attr("y1", (e) => this.y(this.getArrowStartY(e)))
            .attr("x2", (e) => this.x(this.getArrowEndX(e)))
            .attr("y2", (e) => this.y(this.getArrowEndY(e)))
            .attr('id', (e) => "edge" + e.getId())
            .attr("stroke-width", 1)
            .attr("marker-end", function(e) {
                if (e.getFace() !== undefined) {
                    return "url(#head_red)";
                } else {
                    return "url(#head_blue)" 
                }
            })
            .attr("stroke", function(e) {
                if (e.getFace() !== undefined) {
                    return "red"
                }
                    return "blue"
            })
            .merge(edge);

        edge_label.enter().append("text")
            .attr("x", (e) => this.x(this.getArrowMiddleX(e) + this.getArrow(e)[3].x()))
            .attr("y", (e) => this.y(this.getArrowMiddleY(e) + this.getArrow(e)[3].y()))
            .text((e) => "e" + e.getId())
            .attr('class', 'edge')
            .merge(edge_label);

        edge.exit().remove();
        edge_label.exit().remove();

        edge.transition()
            .duration(animDuration)
            .attr("x1", (e) => this.x(this.getArrowStartX(e)))
            .attr("y1", (e) => this.y(this.getArrowStartY(e)))
            .attr("x2", (e) => this.x(this.getArrowEndX(e)))
            .attr("y2", (e) => this.y(this.getArrowEndY(e)));

        edge_label.transition()
            .duration(animDuration)
            .attr("x", (e) => this.x(this.getArrowMiddleX(e) + this.getArrow(e)[3].x()))
            .attr("y", (e) => this.y(this.getArrowMiddleY(e) + this.getArrow(e)[3].y()));

        //Determines which node or edge to highlight
        if (props.hover !== null) {
            d3.select('#circle'+props.hover)
            .style('fill', 'orange');
        } else if (props.ieHover !== null) {
            d3.select('#edge'+props.ieHover)
            .style('stroke-width', 1.3)
            .style('stroke', 'orange')
            .attr('marker-end', 'url(#head_orange)');

        } else if (props.faceHover !== null && props.faceHover !== undefined) {
            var f = props.faceHover;
            const faceID = f.getId();
            const firstEdge = f.getHalfEdge().getId();
            const secondEdge = f.getHalfEdge().getNext().getId();
            const thirdEdge = f.getHalfEdge().getPrev().getId();
            
            var edgesID = [firstEdge,secondEdge,thirdEdge];
            var i;
            for(i = 0; i < edgesID.length; i++) {
                var id = edgesID[i];
                d3.select('#edge'+id)
                .style('stroke-width', 1.3)
                .style('stroke', 'orange')
                .attr('marker-end', 'url(#head_orange)');
            }
        } else {
            d3.selectAll('line')
            .style('stroke-width', 1)
            .style("stroke", function(e) {
                if (e.getFace() !== undefined) {
                    return "red"
                }
                    return "blue"
            })
            .attr('marker-end', function(e) {
                if (e.getFace() !== undefined) {
                    return "url(#head_red)";
                } 
                return "url(#head_blue)";
            });
            d3.selectAll('circle')
                .style('fill', 'none');
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
        // TODO: scale these offsets based on scale of visualizations
        const offset = normal.multiply(0.04);
        start = start.add(offset);
        end = end.add(offset);

        // TODO: scale these paddings based on scale of visualizations
        const padding = direction.multiply(0.22);
        const edgeLabelOffset = offset.multiply(2.8);
        return [start.add(padding), end.subtract(padding), faceCentroid, edgeLabelOffset];

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

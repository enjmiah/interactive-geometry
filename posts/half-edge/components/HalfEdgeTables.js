import { throws } from 'assert';
import { Vertex } from './util/Mesh';

const React = require('react');

function get_vertex_class_name(props, vertex_id) {
    return ((props.hover && props.hover.type === "vertex"
             && vertex_id === props.hover.id)
            ? "hover" : "");
}

function get_edge_class_name(props, edge) {
    var edgeType = edge.getFace() !== undefined ? 'interior' : 'boundary';

    if (props.hover && props.hover.type === "edge"
        && edge.getId() === props.hover.id) {
        return "hover " + edgeType;
    } else {
        return edgeType;
    }

}

function get_face_class_name(props, face_id) {
    return ((props.hover && props.hover.type === "face"
             && props.hover.id === face_id)
            ? "hover" : "");
}

function VertexTable(props) {
    const rows = props.mesh.vertices.map((v) => {
        const p = v.getPosition();
        const id = v.getId();
        const coordinate = <span>({p.x()}, {p.y()}, {p.z()})</span>;
        const vertex = <span><em>v</em><sub>{id + 1}</sub></span>;
        const edge =
            (v.getHalfEdge() !== undefined
             ? <span><em>e</em><sub>{v.getHalfEdge().getId()}</sub></span>
             : <span>∅</span>);
        const edge_id =
            (v.getHalfEdge() !== undefined
             ? v.getHalfEdge().getId()
             : undefined);
        const vertex_class_name = get_vertex_class_name(props, v.getId());
        const edge_class_name = (v.getHalfEdge() !== undefined ? get_edge_class_name(props, v.getHalfEdge()) : "");

        const on_edge =
            (edge_id !== undefined
             ? props.onChange.bind(props, {type: "edge", id: edge_id})
             : undefined);

        return (
            <tr key={id}>
                <td onMouseOver={props.onChange.bind(props, {type: "vertex", id: id})}
                    onMouseOut={props.onChangeOut}
                    className={vertex_class_name}>{vertex}</td>
                <td>{coordinate}</td>
                <td onMouseOver={on_edge}
                    onMouseOut={props.onChangeOut}
                    className={edge_class_name}>{edge}</td>
            </tr>
        );
    });

    return (
        <table className="vertices">
            <thead>
                <tr>
                    <th>Vertex</th>
                    <th>Coordinate</th>
                    <th>Incident edge</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function FaceTable(props) {
    const rows = props.mesh.faces.map((f) => {
        const id = f.getId();
        const face = <span><em>f</em><sub>{id}</sub></span>;
        // Note faces, unlike vertices, are guaranteed to have a half-edge
        const edge =
            (<span><em>e</em><sub>{f.getHalfEdge().getId()}</sub></span>);
        const face_class_name = get_face_class_name(props, id);
        const edge_class_name =
            (f.getHalfEdge() !== undefined
             ? get_edge_class_name(props, f.getHalfEdge()) : "");

        return (
            <tr key={id}>
                <td onMouseOver={props.onChange.bind(props, {type: "face", id: id})}
                    onMouseOut={props.onChangeOut}
                    className={face_class_name}>{face}</td>
                <td onMouseOver={props.onChange.bind(props, {type: "edge", id: f.getHalfEdge().getId()})}
                    onMouseOut={props.onChangeOut}
                    className={edge_class_name}>{edge}</td>
            </tr>
        );
    });

    return (
        <table className="faces">
            <thead>
                <tr>
                    <th>Face</th>
                    <th>Half-edge</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

function HalfEdgeTable(props) {
    const rows = props.mesh.edges.map((e) => {
        const id = e.getId();
        const edge_text = <span><em>e</em><sub>{id}</sub></span>;
        const origin_text = <span><em>v</em><sub>{e.getOrigin().getId() + 1}</sub></span>
        const twin_text = <span><em>e</em><sub>{e.getTwin().getId()}</sub></span>;
        const face_text =
            (e.getFace() !== undefined
             ? <span><em>f</em><sub>{e.getFace().getId()}</sub></span>
             : <span>∅</span>);
        const next_text = <span><em>e</em><sub>{e.getNext().getId()}</sub></span>;
        const prev_text = <span><em>e</em><sub>{e.getPrev().getId()}</sub></span>;

        const edge_class_name = get_edge_class_name(props, e);
        const origin_class_name =
            get_vertex_class_name(props, e.getOrigin().getId());
        const twin_class_name = get_edge_class_name(props, e.getTwin());
        const face_class_name =
            get_face_class_name(props, (e.getFace() !== undefined
                                        ? e.getFace().getId()
                                        : undefined));
        const next_class_name = get_edge_class_name(props, e.getNext());
        const prev_class_name = get_edge_class_name(props, e.getPrev());

        const on_face =
            (e.getFace() !== undefined
             ? props.onChange.bind(props, {type: "face", id: e.getFace().getId()})
             : undefined);

        return  (
            <tr key={id}>
                <td className={edge_class_name}
                    onMouseOver={props.onChange.bind(props, {type: "edge", id: id})}
                    onMouseOut={props.onChangeOut}>{edge_text}</td>
                <td className={origin_class_name}
                    onMouseOver={props.onChange.bind(props, {type: "vertex", id: e.getOrigin().getId()})}
                    onMouseOut={props.onChangeOut}>{origin_text}</td>
                <td className={twin_class_name}
                    onMouseOver={props.onChange.bind(props, {type: "edge", id: e.getTwin().getId()})}
                    onMouseOut={props.onChangeOut}>{twin_text}</td>
                <td className={face_class_name}
                    onMouseOver={on_face}
                    onMouseOut={props.onChangeOut}>{face_text}</td>
                <td className={next_class_name}
                    onMouseOver={props.onChange.bind(props, {type: "edge", id: e.getNext().getId()})}
                    onMouseOut={props.onChangeOut}>{next_text}</td>
                <td className={prev_class_name}
                    onMouseOver={props.onChange.bind(props, {type: "edge", id: e.getPrev().getId()})}
                    onMouseOut={props.onChangeOut}>{prev_text}</td>
            </tr>
        );
    });
    return (
        <table className="half-edges">
            <thead>
                <tr>
                    <th>Half-edge</th>
                    <th>Origin</th>
                    <th>Twin</th>
                    <th>Incident face</th>
                    <th>Next</th>
                    <th>Prev</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}

export class HalfEdgeTables extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onChangeOut = this.onChangeOut.bind(this);
    }

    onChange(h) {
        this.props.onHoverChange(h);
    }

    onChangeOut(h) {
        this.props.onHoverChange(null);
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        if (typeof this.props.mesh === 'string') {
            return (
                <div className="half-edge-tables">
                    <h4>Records</h4>
                </div>
            );
        }
        return (
          <div className="half-edge-tables">
            <h4>Records</h4>
            <VertexTable mesh={this.props.mesh}
                         hover={this.props.hover}
                         onChange={this.onChange}
                         onChangeOut={this.onChangeOut} />
            <FaceTable mesh={this.props.mesh}
                       hover={this.props.hover}
                       onChange={this.onChange}
                       onChangeOut={this.onChangeOut} />
            <HalfEdgeTable mesh={this.props.mesh}
                           hover={this.props.hover}
                           onChange={this.onChange}
                           onChangeOut={this.onChangeOut} />
          </div>
        );
    }
}

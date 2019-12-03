import { throws } from 'assert';
import { Vertex } from './util/Mesh';

const React = require('react');

function get_vertex_class_name(props, vertex_id) {
    return (vertex_id === props.hover ? "hover" : "");
}

function get_edge_class_name(props, edge_id) {
    return ((props.ieHover !== null && edge_id === props.ieHover)
            ? "hover" : "");
}

function get_face_class_name(props, face_id) {
    return ((props.faceHover !== null
             && parseInt(props.faceHover.split(',')[0]) === face_id)
            ? "hover" : "");
}

function VertexTable(props) {
    const rows = props.mesh.vertices.map((v) => {
        const p = v.getPosition();
        const id = v.getId();
        const coordinate = <span>({p.x()}, {p.y()}, {p.z()})</span>;
        const vertex = <span><em>v</em><sub>{id}</sub></span>;
        const edge =
            (v.getHalfEdge() !== undefined
             ? <span><em>e</em><sub>{v.getHalfEdge().getId()}</sub></span>
             : <span>∅</span>);
        const edge_id =
            (v.getHalfEdge() !== undefined
             ? v.getHalfEdge().getId()
             : undefined);
        const vertex_class_name = get_vertex_class_name(props, v.getId());
        const edge_class_name = get_edge_class_name(props, edge_id);

        return (
            <tr key={id}>
                <td onMouseOver={props.onChange.bind(props, v)}
                    onMouseOut={props.onChangeOut}
                    className={vertex_class_name}>{vertex}</td>
                <td>{coordinate}</td>
                <td onMouseOver={props.onChangeEdge.bind(props, v)}
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
            get_edge_class_name(props, f.getHalfEdge().getId());

        return (
            <tr key={id}>
                <td onMouseOver={props.onChangeFace.bind(props, f)}
                    onMouseOut={props.onChangeOut}
                    className={face_class_name}>{face}</td>
                <td onMouseOver={props.onChangeEdge.bind(props, f.getHalfEdge())}
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
        const origin_text = <span><em>v</em><sub>{e.getOrigin().getId()}</sub></span>
        const twin_text = <span><em>e</em><sub>{e.getTwin().getId()}</sub></span>;
        const face_text =
            (e.getFace() !== undefined
             ? <span><em>f</em><sub>{e.getFace().getId()}</sub></span>
             : <span>∅</span>);
        const next_text = <span><em>e</em><sub>{e.getNext().getId()}</sub></span>;
        const prev_text = <span><em>e</em><sub>{e.getPrev().getId()}</sub></span>;

        const edge_class_name = get_edge_class_name(props, e.getId());
        const origin_class_name =
            get_vertex_class_name(props, e.getOrigin().getId());
        const twin_class_name = get_edge_class_name(props, e.getTwin().getId());
        const face_class_name =
            get_face_class_name(props, (e.getFace() !== undefined
                                        ? e.getFace().getId()
                                        : undefined));
        const next_class_name = get_edge_class_name(props, e.getNext().getId());
        const prev_class_name = get_edge_class_name(props, e.getPrev().getId());

        return  (
            <tr key={id}>
                <td className={edge_class_name}
                    onMouseOver={props.onChangeEdge.bind(props, e)}
                    onMouseOut={props.onChangeOut}>{edge_text}</td>
                <td className={origin_class_name}
                    onMouseOver={props.onChange.bind(props, e)}
                    onMouseOut={props.onChangeOut}>{origin_text}</td>
                <td className={twin_class_name}
                    onMouseOver={props.onChangeEdge.bind(props, e.getTwin())}
                    onMouseOut={props.onChangeOut}>{twin_text}</td>
                <td className={face_class_name}
                    onMouseOver={props.onChangeFace.bind(props, e.getFace())}
                    onMouseOut={props.onChangeOut}>{face_text}</td>
                <td className={next_class_name}
                    onMouseOver={props.onChangeEdge.bind(props, e.getNext())}
                    onMouseOut={props.onChangeOut}>{next_text}</td>
                <td className={prev_class_name}
                    onMouseOver={props.onChangeEdge.bind(props, e.getPrev())}
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
        this.onChangeEdge = this.onChangeEdge.bind(this);
        this.onChangeFace = this.onChangeFace.bind(this);
    }

    onChange(d) {
        if(d instanceof Vertex) {
            this.props.onHoverChange(d.getId());
        } else {
            this.props.onHoverChange(d.getOrigin().getId());
        }
    }

    onChangeOut(d) {
        this.props.onHoverChange(null);
        this.props.onEdgeHoverChange(null);
        this.props.onFaceHoverChange(null);
    }

    onChangeEdge(e) {
        if(e instanceof Vertex) {
            this.props.onEdgeHoverChange(e.getHalfEdge().getId());
        } else {
            this.props.onEdgeHoverChange(e.getId());
        }
    }

    onChangeFace(f) {
        const faceID = f.getId();
        const firstEdge = f.getHalfEdge().getId();
        const secondEdge = f.getHalfEdge().getNext().getId();
        const thirdEdge = f.getHalfEdge().getPrev().getId();
        this.props.onFaceHoverChange(faceID+","+firstEdge+","+secondEdge+","+thirdEdge);
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
                         faceHover={this.props.faceHover}
                         ieHover={this.props.ieHover}
                         onChange={this.onChange}
                         onChangeFace={this.onChangeFace}
                         onChangeEdge={this.onChangeEdge}
                         onChangeOut={this.onChangeOut} />
            <FaceTable mesh={this.props.mesh}
                       hover={this.props.hover}
                       faceHover={this.props.faceHover}
                       ieHover={this.props.ieHover}
                       onChange={this.onChange}
                       onChangeFace={this.onChangeFace}
                       onChangeEdge={this.onChangeEdge}
                       onChangeOut={this.onChangeOut} />
            <HalfEdgeTable mesh={this.props.mesh}
                           hover={this.props.hover}
                           faceHover={this.props.faceHover}
                           ieHover={this.props.ieHover}
                           onChange={this.onChange}
                           onChangeFace={this.onChangeFace}
                           onChangeEdge={this.onChangeEdge}
                           onChangeOut={this.onChangeOut} />
          </div>
        );
    }
}

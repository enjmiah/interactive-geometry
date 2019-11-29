const React = require('react');

function VertexTable(props) {
    console.log("Current hovered vertex: "+props.hover);
    const rows = props.mesh.vertices.map((v) => {
        const p = v.getPosition();
        const id = v.getId();
        const coordinate = <span>({p.x()}, {p.y()}, {p.z()})</span>;
        const vertex = <span><em>v</em><sub>{id}</sub></span>;
        const edge =
            (v.getHalfEdge() !== undefined
             ? <span><em>e</em><sub>{v.getHalfEdge().getId()}</sub></span>
             : <span>∅</span>);
        if(props.hover == "" || id != props.hover) {
            return <tr key={id}><td>{vertex}</td><td>{coordinate}</td><td>{edge}</td></tr>;
        } else {
            return <tr bgcolor="FFA500" key={id}><td>{vertex}</td><td>{coordinate}</td><td>{edge}</td></tr>;
        }
    });

    console.log(rows);
    console.log(props.hover);
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
    return (
        <table className="faces">
            <thead>
                <tr>
                    <th>Face</th>
                    <th>Half-edge</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>todo</td>
                    <td>todo</td>
                </tr>
            </tbody>
        </table>
    );
}

function HalfEdgeTable(props) {
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
            <tbody>
                <tr>
                    <td>todo</td>
                    <td>todo</td>
                    <td>todo</td>
                    <td>todo</td>
                    <td>todo</td>
                    <td>todo</td>
                </tr>
            </tbody>
        </table>
    );
}

export class HalfEdgeTables extends React.Component {
    constructor(props) { super(props); }

    onChange(e) {}

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
            <VertexTable mesh={this.props.mesh} hover={this.props.hover} />
            <FaceTable mesh={this.props.mesh} hover={this.props.hover}/>
            <HalfEdgeTable mesh={this.props.mesh} hover={this.props.hover}/>
          </div>
        );
    }
}

const React = require('react');

function VertexTable(props) {
    const rows = props.mesh.vertices.map((v) => {
        const p = v.getPosition();
        const id = v.getId();
        const coordinate = <span>({p.x()}, {p.y()}, {p.z()})</span>;
        const vertex = <span>$v_{id}$</span>;
        const edge = <span>todo</span>;
        return <tr key={id}><td>{vertex}</td><td>{coordinate}</td><td>{edge}</td></tr>;
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
        return (
          <div className="half-edge-tables">
            <h4>Memory Layout</h4>
            <VertexTable mesh={this.props.mesh} />
            <FaceTable mesh={this.props.mesh} />
            <HalfEdgeTable mesh={this.props.mesh} />
          </div>
        );
    }
}

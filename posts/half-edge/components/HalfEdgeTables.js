const React = require('react');

function VertexTable(props) {
    // console.log("Current hovered vertex: "+props.hover);
    // console.log(props);
    //TOFIX: Row with key id 0 is not being highlighted. WHY?????
    const rows = props.mesh.vertices.map((v) => {
        const p = v.getPosition();
        const id = v.getId();
        const coordinate = <span>({p.x()}, {p.y()}, {p.z()})</span>;
        const vertex = <span><em>v</em><sub>{id}</sub></span>;
        const edge =
            (v.getHalfEdge() !== undefined
             ? <span><em>e</em><sub>{v.getHalfEdge().getId()}</sub></span>
             : <span>∅</span>);
        if(props.hover == null || id != props.hover) {
            return <tr value={id} key={id} onMouseOver={props.onChange.bind(props,v)} onMouseOut={props.onChangeOut.bind(props,v)}><td>{vertex}</td><td>{coordinate}</td><td>{edge}</td></tr>;
        } else {
            return <tr onMouseOver={props.onChange.bind(props,v)} onMouseOut={props.onChangeOut.bind(props, v)} value={id} bgcolor="FFA500" key={id}><td>{vertex}</td><td>{coordinate}</td><td>{edge}</td></tr>;
        }
    });

    // console.log(rows);
    // console.log(props.hover);
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
    constructor(props) { 
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onChangeOut = this.onChangeOut.bind(this);
    }

    onChange(d) {
        this.props.onHoverChange(d.getId());
    }

    onChangeOut(d) {
        this.props.onHoverChange("");
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
            <VertexTable mesh={this.props.mesh} hover={this.props.hover} onChange={this.onChange} onChangeOut={this.onChangeOut}/>
            <FaceTable mesh={this.props.mesh} hover={this.props.hover}/>
            <HalfEdgeTable mesh={this.props.mesh} hover={this.props.hover}/>
          </div>
        );
    }
}

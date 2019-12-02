import { throws } from 'assert';

const React = require('react');

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
        const edgeId = v.getHalfEdge().getId();
        // console.log(props.ieHover);
        if((props.hover == null || id != props.hover) && (props.ieHover == null || edgeId != props.ieHover)) {
            return <tr key={id}><td  onMouseOver={props.onChange.bind(props,v)} onMouseOut={props.onChangeOut.bind(props,v)}>{vertex}</td><td>{coordinate}</td><td onMouseOver={props.onChangeEdge.bind(props,v)} onMouseOut={props.onChangeOut.bind(props,v)}>{edge}</td></tr>;
        } else if (props.hover != null && id == props.hover) {
            return <tr key={id}><td onMouseOver={props.onChange.bind(props,v)} onMouseOut={props.onChangeOut.bind(props, v)} bgcolor="FFA500">{vertex}</td><td>{coordinate}</td><td onMouseOver={props.onChangeEdge.bind(props,v)} onMouseOut={props.onChangeOut.bind(props,v)}>{edge}</td></tr>;
        } else if (props.ieHover != null && edgeId == props.ieHover) {
            return <tr key={id}><td onMouseOver={props.onChange.bind(props,v)} onMouseOut={props.onChangeOut.bind(props, v)}>{vertex}</td><td>{coordinate}</td><td onMouseOver={props.onChangeEdge.bind(props,v)} onMouseOut={props.onChangeOut.bind(props,v)} bgcolor="FFA500">{edge}</td></tr>;
        }

        // if(props.hover == null || id != props.hover) {

        // } else if (props.ieHover == null || ) {

        // }
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
        this.onChangeEdge = this.onChangeEdge.bind(this);
    }

    onChange(d) {
        this.props.onHoverChange(d.getId());
    }

    onChangeOut(d) {
        this.props.onHoverChange(null);
        this.props.onEdgeHoverChange(null);
    }

    onChangeEdge(d) {
        this.props.onEdgeHoverChange(d.getHalfEdge().getId());
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
            <VertexTable mesh={this.props.mesh} hover={this.props.hover} ieHover={this.props.ieHover} onChange={this.onChange} onChangeOut={this.onChangeOut} onChangeEdge={this.onChangeEdge}/>
            <FaceTable mesh={this.props.mesh} hover={this.props.hover}/>
            <HalfEdgeTable mesh={this.props.mesh} hover={this.props.hover}/>
          </div>
        );
    }
}

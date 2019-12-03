import { throws } from 'assert';
import { Vertex } from './util/Mesh';

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
        if ((props.hover === null || id !== props.hover)
            && (props.ieHover == null || edgeId != props.ieHover)) {
            return (
                <tr key={id}>
                    <td onMouseOver={props.onChange.bind(props,v)}
                        onMouseOut={props.onChangeOut}>{vertex}</td>
                    <td>{coordinate}</td>
                    <td onMouseOver={props.onChangeEdge.bind(props,v)}
                        onMouseOut={props.onChangeOut}>{edge}</td>
                </tr>
            );
        } else if (props.hover != null && id == props.hover) {
            return (
                <tr key={id}>
                    <td onMouseOver={props.onChange.bind(props,v)}
                        onMouseOut={props.onChangeOut}
                        bgcolor="FFA500">{vertex}</td>
                    <td>{coordinate}</td>
                    <td onMouseOver={props.onChangeEdge.bind(props,v)}
                        onMouseOut={props.onChangeOut}>{edge}</td>
                </tr>
            );
        } else if (props.ieHover != null && edgeId == props.ieHover) {
            return (
                <tr key={id}>
                    <td onMouseOver={props.onChange.bind(props,v)}
                        onMouseOut={props.onChangeOut}>{vertex}</td>
                    <td>{coordinate}</td>
                    <td onMouseOver={props.onChangeEdge.bind(props,v)}
                        onMouseOut={props.onChangeOut}
                        bgcolor="FFA500">{edge}</td>
                </tr>
            );
        }
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
        const edge =
            (f.getHalfEdge() !== undefined
             ? <span><em>e</em><sub>{f.getHalfEdge().getId()}</sub></span>
             : <span>∅</span>);

        if(props.faceHover == null || props.faceHover.split(',')[0] != id ) {
            return <tr key={id}><td onMouseOver={props.onChangeFace.bind(props,f)} onMouseOut={props.onChangeOut}>{face}</td><td>{edge}</td></tr>;
        } else {
            return <tr key={id}><td onMouseOver={props.onChangeFace.bind(props,f)} onMouseOut={props.onChangeOut} bgcolor="FFA500">{face}</td><td>{edge}</td></tr>;
        }



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
        const edge = <span><em>e</em><sub>{id}</sub></span>;
        const origin = <span><em>v</em><sub>{e.getOrigin().getId()}</sub></span>
        const twin =
        (e.getTwin().getId() !== undefined
         ? <span><em>e</em><sub>{e.getTwin().getId()}</sub></span>
         : <span>∅</span>);
         const face =
        (e.getFace() !== undefined
         ? <span><em>f</em><sub>{e.getFace().getId()}</sub></span>
         : <span>∅</span>);
         const next =
        (e.getNext() !== undefined
         ? <span><em>e</em><sub>{e.getNext().getId()}</sub></span>
         : <span>∅</span>);
         const prev =
        (e.getPrev() !== undefined
         ? <span><em>e</em><sub>{e.getPrev().getId()}</sub></span>
         : <span>∅</span>);

         if ((props.ieHover == null || id != props.ieHover) && (props.hover == null || e.getOrigin().getId() != props.hover)) {
            return  <tr key={id}><td onMouseOver={props.onChangeEdge.bind(props,e)} onMouseOut={props.onChangeOut}>{edge}</td><td onMouseOver={props.onChange.bind(props,e)} onMouseOut={props.onChangeOut}>{origin}</td><td>{twin}</td><td>{face}</td><td>{next}</td><td>{prev}</td></tr> ;
         } else if (props.ieHover != null && id == props.ieHover) {
            return  <tr key={id}><td onMouseOver={props.onChangeEdge.bind(props,e)} onMouseOut={props.onChangeOut} bgcolor="FFA500">{edge}</td><td onMouseOver={props.onChange.bind(props,e)} onMouseOut={props.onChangeOut}>{origin}</td><td>{twin}</td><td>{face}</td><td>{next}</td><td>{prev}</td></tr> ;
         } else if (props.hover != null && props.hover == e.getOrigin().getId()) {
            return  <tr key={id}><td onMouseOver={props.onChangeEdge.bind(props,e)} onMouseOut={props.onChangeOut} >{edge}</td><td onMouseOver={props.onChange.bind(props,e)} onMouseOut={props.onChangeOut} bgcolor="FFA500">{origin}</td><td>{twin}</td><td>{face}</td><td>{next}</td><td>{prev}</td></tr> ;
         }
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
                         ieHover={this.props.ieHover}
                         onChange={this.onChange}
                         onChangeOut={this.onChangeOut}
                         onChangeEdge={this.onChangeEdge}/>
            <FaceTable mesh={this.props.mesh}
                       hover={this.props.hover}
                       faceHover={this.props.faceHover}
                       onChangeFace={this.onChangeFace}
                       onChangeOut={this.onChangeOut}/>
            <HalfEdgeTable mesh={this.props.mesh}
                           hover={this.props.hover}
                           ieHover={this.props.ieHover}
                           onChange={this.onChange}
                           onChangeOut={this.onChangeOut}
                           onChangeEdge={this.onChangeEdge}/>
          </div>
        );
    }
}

const React = require('react');
const OBJLoader = require('./util/OBJLoader');
import {HalfEdgeDiagram} from './HalfEdgeDiagram';
import {HalfEdgeTables} from './HalfEdgeTables';

const stageZeroDefaultHighlight = {type: "edge", id: 3};

function flipEdge(mesh, e, stage) {
    const e5 = e.getPrev();
    const e4 = e.getNext();
    const twin = e.getTwin();
    const e1 = twin.getPrev();
    const e0 = twin.getNext();
    if (stage >= 1) {
        for (const he of [e0, e1, e4, e5]) {
            he.getOrigin().setHalfEdge(he);
        }
        e1.getFace().setHalfEdge(e1);
        e5.getFace().setHalfEdge(e5);
    }
    if (stage >= 2) {
        e.setNext(e5);
        e.setPrev(e0);
        e.setOrigin(e1.getOrigin());
        e.setFace(e5.getFace());
        twin.setNext(e1);
        twin.setPrev(e4);
        twin.setOrigin(e5.getOrigin());
        twin.setFace(e1.getFace());
    }
    if (stage >= 3) {
        e0.setNext(e);
        e1.setNext(e4);
        e4.setNext(twin);
        e5.setNext(e0);
        e0.setPrev(e5);
        e1.setPrev(twin);
        e4.setPrev(e1);
        e5.setPrev(e);
    }
}

class EdgeFlipConsistencyChecker extends React.Component {
    constructor(props) {
        super(props);

        this.handleHoverChange = this.handleHoverChange.bind(this);

        // Stage 0
        const mesh = OBJLoader.parse(`
v 0.0 1.0 0.0
v 1.0 1.0 0.0
v 0.0 0.0 0.0
v 1.0 0.0 0.0
f 1 3 4
f 1 4 2
`);
        let drawMesh = mesh.copy(); // Mesh to draw

        // Partial edge flip
        flipEdge(mesh, mesh.edges[3], props.stage);
        // Stage 2 is inconsistent and can't be drawn so we draw the closest
        // thing
        flipEdge(drawMesh, drawMesh.edges[3],
                 (props.stage === 2 ? 3 : props.stage));

        this.state = {
            mesh: mesh,
            drawMesh: drawMesh,
            hover: (props.stage === 0 ? stageZeroDefaultHighlight : null)
        };
    }

    initialize(node, props) {}

    handleHoverChange(new_hover) {
        if (this.props.stage === 0 && new_hover === null) {
            // Special case: we want to highlight the input half-edge when
            // nothing else is highlighted
            this.setState({hover: stageZeroDefaultHighlight});
        } else {
            this.setState({hover: new_hover});
        }
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <div className="consistency-checker">
                <HalfEdgeDiagram mesh={this.state.drawMesh}
                                 hover={this.state.hover}
                                 onHoverChange={this.handleHoverChange} />
                <HalfEdgeTables mesh={this.state.mesh}
                                hover={this.state.hover}
                                stage={this.props.stage}
                                check={this.props.check}
                                onHoverChange={this.handleHoverChange} />
            </div>
        );
    }
}

module.exports = EdgeFlipConsistencyChecker;

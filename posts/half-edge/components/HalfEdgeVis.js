const React = require('react');
const OBJLoader = require('./util/OBJLoader');
import {OBJEditor} from './OBJEditor';
import {HalfEdgeDiagram} from './HalfEdgeDiagram';
import {HalfEdgeTables} from './HalfEdgeTables';

class HalfEdgeVis extends React.Component {
    constructor(props) {
        super(props);

        this.handleOBJChange = this.handleOBJChange.bind(this);
        this.handleHoverChange = this.handleHoverChange.bind(this);

        this.state = {
            obj: `# Enter your mesh definition in OBJ format below...
v 1.0 4.0 0.0
v 3.0 4.0 0.0
v 0.0 2.0 0.0
v 2.0 2.0 0.0
v 4.0 2.0 0.0
v 1.0 0.0 0.0
v 3.0 0.0 0.0
f 1 3 4
f 1 4 2
f 2 4 5
f 3 6 4
f 4 6 7
f 4 7 5
`,
            mesh: null,
            hover: null,
        };

        this.reloadMesh(this.state.obj);
    }

    initialize(node, props) {}

    handleOBJChange(text) {
        this.setState({obj: text});

        this.reloadMesh(text);
    }

    handleHoverChange(new_hover) {
        this.setState({hover: new_hover});
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <div className="half-edge-vis">
                <div className="pin-container">
                    <OBJEditor obj={this.state.obj}
                               onOBJChange={this.handleOBJChange} />
                    <HalfEdgeDiagram mesh={this.state.mesh}
                                     hover={this.state.hover}
                                     onHoverChange={this.handleHoverChange} />
                </div>
                <HalfEdgeTables mesh={this.state.mesh}
                                hover={this.state.hover}
                                allow_pinning={true}
                                onHoverChange={this.handleHoverChange} />
            </div>
        );
    }

    reloadMesh(obj_text) {
        const mesh = OBJLoader.parse(obj_text);
        if (this.state.mesh === null) {
            this.state.mesh = mesh;
        } else {
            this.setState({mesh: mesh});
        }
    }
}

module.exports = HalfEdgeVis;

const React = require('react');
const OBJLoader = require('./util/OBJLoader');
import {HalfEdgeDiagram} from './HalfEdgeDiagram';

function startingState(type) {
    if (type === "ccw_face") {
        const mesh = OBJLoader.parse(`
v 1.0 4.0 0.0
v 3.0 4.0 0.0
v 0.0 2.0 0.0
v 4.0 2.0 0.0
v 1.0 0.0 0.0
v 3.0 0.0 0.0
f 1 3 5 6 4 2`);
        const hover = {type: "edge", id: 5};
        return {mesh: mesh, hover: hover};
    } else {
        const mesh = OBJLoader.parse(`
v 1.0 4.0 0.0
v 3.0 4.0 0.0
v 0.0 2.0 0.0
v 2.0 2.0 0.0
v 4.0 2.0 0.0
v 1.0 0.0 0.0
v 3.0 0.0 0.0
f 1 3 6 4
f 1 4 2
f 2 4 5
f 4 7 5`);
        const hover = {type: "edge", id: 8};
        return {mesh: mesh, hover: hover};
    }
}

function buttonText(type) {
    if (type === "ccw_face") {
        return "he = he.next";
    } else if (type === "ccw_vertex") {
        return "he = he.prev.twin";
    } else if (type === "cw_vertex") {
        return "he = he.twin.next";
    } else  {
        return "???";
    }
}

class HalfEdgeStepper extends React.Component {
    constructor(props) {
        super(props);

        this.state = startingState(props.type);
        // Since the user might hit the button before the animation is complete,
        // we need to maintain a queue of things to do
        this.actions = [];
    }

    initialize(node, props) {}

    step() {
        // There is technically a race condition here...
        const doActionsAfterQueueing = (this.actions.length === 0);

        if (this.props.type === "ccw_face") {
            this.actions.push(() => {
                let he = this.state.mesh.edges[this.state.hover.id];
                he = he.getNext();
                this.setState({hover: {type: "edge", id: he.getId()}});
            });
        } else if (this.props.type === "ccw_vertex") {
            this.actions.push(() => {
                let he = this.state.mesh.edges[this.state.hover.id];
                he = he.getPrev();
                this.setState({hover: {type: "edge", id: he.getId()}});
            });
            this.actions.push(() => {
                let he = this.state.mesh.edges[this.state.hover.id];
                he = he.getTwin();
                this.setState({hover: {type: "edge", id: he.getId()}});
            });
        } else if (this.props.type === "cw_vertex") {
            this.actions.push(() => {
                let he = this.state.mesh.edges[this.state.hover.id];
                he = he.getTwin();
                this.setState({hover: {type: "edge", id: he.getId()}});
            });
            this.actions.push(() => {
                let he = this.state.mesh.edges[this.state.hover.id];
                he = he.getNext();
                this.setState({hover: {type: "edge", id: he.getId()}});
            });
        }

        if (doActionsAfterQueueing) {
            this.animate_step();
        }
    }

    animate_step() {
        if (this.actions.length > 0) {
            const todo = this.actions.shift();
            todo();
            if (this.actions.length > 0) {
                // Queue next action
                setTimeout(this.animate_step.bind(this), 450);
            }
        }
    }

    randomize() {
        this.actions = [];
        this.setState({hover: {
            type: "edge",
            id: Math.floor(Math.random() * this.state.mesh.edges.length)
        }});
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <div className="half-edge-stepper">
                <HalfEdgeDiagram mesh={this.state.mesh}
                                 hover={this.state.hover}
                                 onHoverChange={() => {}} />
                <button name="step" onClick={this.step.bind(this)}>
                    {buttonText(this.props.type)}
                </button>
                {(this.props.randomize
                    ? (<span>&emsp;
                       <button name="randomize" onClick={this.randomize.bind(this)}>
                           Start from a random edge
                       </button>
                       </span>)
                    : undefined)}
            </div>
        );
    }
}

module.exports = HalfEdgeStepper;

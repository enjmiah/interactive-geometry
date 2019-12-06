const React = require('react');

export class OBJEditor extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.onOBJChange(e.target.value);
    }

    render() {
        const { hasError, idyll, updateProps, ...props } = this.props;
        return (
            <textarea value={this.props.obj} onChange={this.onChange}>
            </textarea>
        );
    }
}

const React = require('react');

class Cover extends React.Component {
  render() {
    const { hasError, idyll, updateProps,
            title, author,
            ...props } = this.props;

    return (
      <header className="cover">
        <h1>Geometry Processing Algorithms</h1>
        <div className="author">Jerry Yin and Jeffrey Goh</div>
      </header>
    );
  }
}

module.exports = Cover;

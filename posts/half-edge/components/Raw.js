import React from 'react';

/**
 * Sometimes, the most straightforward thing to do is to write raw HTML,
 * especially if tight control is needed or to work around the many bizarre
 * quirks in Idyll's parser.  This component helps achieve that.
 *
 * Usage:
 *
 *     [Raw]
 *     ```
 *     <div id="woohoo">Look, <span style="top: -2px">raw HTML</span></div>!
 *     ```
 *     [/Raw]
 *
 *     [Raw]`<span class="sc">Raw span.</span>`[/Raw]
 *
 * Note that we wrap the HTML in backticks so that Idyll's parser doesn't kick
 * in and mess with the markup.
 */
class Raw extends React.PureComponent {
    render() {
        let inner;
        if (this.props.children[0].type === 'pre') {
            // unwrap <pre>, then unwrap <code>
            inner = this.props.children[0].props.children[0].props.children[0];
        } else {
            // unwrap <code>
            inner = this.props.children[0].props.children[0];
        }
        return (
            <span dangerouslySetInnerHTML={{__html: inner}} />
        );
    }
}

Raw._idyll = {
    name: "Raw",
    tagType: "open"
}

export default Raw;

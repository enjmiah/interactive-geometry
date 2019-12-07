import React from 'react';

function hover(id) {
    document.querySelector(`.triangle-fig [id^='${id}']`)
        .setAttribute("class", "hover");
}

function clear(id) {
    document.querySelector(`.triangle-fig [id^='${id}']`)
        .setAttribute("class", "");
}

class TriangleCaption extends React.PureComponent {
    render() {
        return (
            <span>
                Visualization of a half-edge <em>h</em>, along with its{' '}
                <span className="can-hover"
                      onMouseOver={() => hover("twin")}
                      onMouseOut={() => clear("twin")}>
                    twin
                </span>,{' '}
                <span className="can-hover"
                      onMouseOver={() => hover("next")}
                      onMouseOut={() => clear("next")}>
                    next
                </span>, and{' '}
                <span className="can-hover"
                      onMouseOver={() => hover("prev")}
                      onMouseOut={() => clear("prev")}>
                    previous
                </span> half-edges.{' '}
                <em>h</em> also stores references to its{' '}
                <span className="can-hover"
                      onMouseOver={() => hover("origin")}
                      onMouseOut={() => clear("origin")}>
                    origin vertex
                </span> and{' '}
                <span className="can-hover"
                      onMouseOver={() => hover("incident-face")}
                      onMouseOut={() => clear("incident-face")}>
                    incident face
                </span>.
            </span>
        );
    }
}

TriangleCaption._idyll = {
    name: "TriangleCaption",
    tagType: "closed"
}

export default TriangleCaption;

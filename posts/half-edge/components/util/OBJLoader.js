"use strict;"

import {Mesh} from "./Mesh.js";

/**
 * Parse an OBJ file.
 *
 * @param   string       str - The contents of an OBJ file
 * @return  Mesh|string  The mesh constructed from OBJ file, or a string
 *                       describing an error if an error occurred.
 */
export function parse(str) {
    const vertices = [];
    const normals = [];
    const faces = [];

    const lines = str.trim().split("\n");
    let state = 0;
    for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        const tokens = line.trim().split(/\s+/g);
        if (tokens.length === 0) {
            continue;
        }
        switch (tokens[0]) {
            case '#':
                // comment
                break;
            case 'v': {
                if (state > 0) {
                    return `l. ${i+1}: Found vertex at unexpected place in file`;
                }
                if (tokens.length !== 4) {
                    return `l. ${i+1}: Expected three components per vertex, got ${tokens.length}`;
                }
                const maybeVec = parseFloats([tokens[1], tokens[2], tokens[3]]);
                if (typeof maybeVec === "string") {
                    return `l. ${i+1}: ${maybeVec}`;
                }
                vertices.push(maybeVec);
                break;
            }
            case 'vt':
                if (state > 1) {
                    return `l. ${i+1}: Found texture coordinate at unexpected place in file`;
                }
                state = 1;
                // ignore
                break;
            case 'vn': {
                if (state > 2) {
                    return `l. ${i+1}: Found normal at unexpected place in file`;
                }
                state = 2;
                if (tokens.length !== 4) {
                    return `l. ${i+1}: Expected three components per normal, got ${tokens.length}`;
                }
                const maybeVec = parseFloats([tokens[1], tokens[2], tokens[3]]);
                if (typeof maybeVec === "string") {
                    return `l. ${i+1}: ${maybeVec}`;
                }
                normals.push(maybeVec);
                break;
            }
            case 'f':
                if (state > 3) {
                    return `l. ${i+1}: Found face at unexpected place in file`;
                }
                state = 3;
                if (tokens.length < 4) {
                    return `l. ${i+1}: Each face must have at least three vertices`;
                }
                const face = [];
                for (let j = 1; j < tokens.length; ++j) {
                    face.push(tokens[j].split("/")[0]);
                }

                for (let j = 0; j < face.length; ++j) {
                    const index = Number(face[j]);
                    if (Number.isNaN(index) || !Number.isInteger(index)) {
                        return `l. ${i+1}: Invalid face index '${face[j]}'`;
                    }
                    face[j] = (index >= 0 ? index - 1 : vertices.length + index);
                    if (face[j] < 0 || face[j] >= vertices.length) {
                        return `l. ${i+1}: Face index ${face[j]+1} out of bounds`;
                    }
                }
                faces.push(face);
                break;
            default:
                break;
        }
    }

    const mesh = new Mesh();
    try {
        mesh.buildMesh(vertices, normals, faces);
    } catch (e) {
        return e.message;
    }
    return mesh;
}

function parseFloats(tokens) {
    const values = [];
    for (const t of tokens) {
        const f = Number(t);
        if (Number.isNaN(f)) {
            return `Failed to parse token '${t}' as a number`;
        }
        values.push(f);
    }
    return values;
}

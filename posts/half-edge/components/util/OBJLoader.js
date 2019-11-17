import {Mesh} from "./Mesh.js";

/**
 * Parse an OBJ file.
 *
 * @param   string  str - The contents of an OBJ file
 * @return  Mesh    The mesh constructed from OBJ file
 */
exports.parse = function(str) {
    const out = {
        vertices : [],
        normals : [],
        texCoords : [],
        faces : []
    };

    let lines = str.split("\n");
    while (lines.length) {
        lines = parseLine(lines, out);
    }

    const mesh = new Mesh();
    mesh.buildMesh(out.vertices, out.normals, out.faces);
    return mesh;
};

/**
 * Parse a line of an OBJ file.
 *
 * @param   array<string>  lines - The contents of a .obj file
 * @return  object         out - The object to be used to construct mesh
 */
function parseLine(lines, out) {
    const vertices = out.vertices;
    const normals = out.normals;
    const coords = out.texCoords;
    const faces = out.faces;

    let i = 0;
    for (; i < lines.length; i++) {
        const tokens = lines[i].replace(/\s+/g, " ").split(" ");
        switch (tokens[0]) {
            case 'v':
                vertices.push([ parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]) ]);
                break;
            case 'vt':
                coords.push([ parseFloat(tokens[1]), parseFloat(tokens[2]) ]);
                break;
            case 'vn':
                normals.push([ parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]) ]);
                break;
            case 'f':
                var face =  [ tokens[1].split("/"),  tokens[2].split("/"), tokens[3].split("/") ]

                for (var n = 0; n < face.length; n++) {
                    var v = face[n];
                    for (var m = 0; m < v.length; m++) {
                        var str = v[m];
                        if (str.length) {
                            var value = parseInt(str);
                            v[m] = (value >= 0)? value - 1 : vertices.length + value;
                        } else {
                            v[m] = null;
                        }
                    }

                    for (var j = v.length; j < 3; j++) {
                        v[j] = null;
                    }
                }
                faces.push(face);
                break;
        }
    }

    return lines.splice(i+1);
};

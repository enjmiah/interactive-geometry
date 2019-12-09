/**
 * Half-edge data structure.
 *
 * Based on the code from UBC CPSC 424's Assignment 7.
 */

"use strict";

import {Vec3} from "./Vec3.js";

const assert = require('assert');

export class Vertex {
    constructor(x, y, z, idx) {
        this.position = new Vec3(x, y, z);
        this.id = idx;
    }

    getId() { return this.id; }

    getPosition() { return this.position; }

    setPosition(new_x, new_y, new_z) {
        this.position.value[0] = new_x;
        this.position.value[1] = new_y;
        this.position.value[2] = new_z;
    }

    getHalfEdge() { return this.he; }

    setHalfEdge(e) { this.he = e; }

    copy() {
        return new Vertex(this.position.value[0], this.position.value[1],
                          this.position.value[2], this.id);
    }
}

export class HalfEdge {
    constructor(idx) {
        this.id = idx;
    }

    getId() { return this.id; }
    getOrigin() { return this.origin; }
    getTwin() { return this.twin; }
    getPrev() { return this.prev; }
    getNext() { return this.next; }
    getFace() { return this.face; }

    setOrigin(v) { this.origin = v; }
    setTwin(e) { this.twin = e; }
    setPrev(e) { this.prev = e; }
    setNext(e) { this.next = e; }
    setFace(f) { this.face = f; }

    copy() {
        return new HalfEdge(this.id);
    }
}

export class Face {
    constructor(idx) {
        this.id = idx;
    }

    getId() { return this.id; }

    getHalfEdge() { return this.he; }

    setHalfEdge(e) { this.he = e; }

    copy() {
        return new Face(this.id);
    }
}

/**
 * Half-edge data structure.
 */
export class Mesh {
    constructor () {
        this.vertices = [];
        this.edges = [];
        this.faces = [];
        this.normals = [];
        this.edgeMap = new Map();
    }

    buildMesh(verts, normals, faces) {
        this.clear();

        // Add vertices and vertex normals
        for (let i = 0; i < verts.length; i++) {
            this.addVertexPos(verts[i][0], verts[i][1], verts[i][2], i);

            if (normals.length > 0) {
                let n = new Vec3(normals[i][0], normals[i][1], normals[i][2]);
                this.normals.push(n);
            }
        }

        // Add faces
        for (const f of faces) {
            this.addFaceByVerts(f.map(i => this.vertices[i]));
        }

        // Fix boundary half-edges
        for (let i = 0, len = this.edges.length; i < len; ++i) {
            const he = this.edges[i];
            if (he.getTwin() === undefined) {
                this.addEdge(he.getNext().getOrigin(), he.getOrigin());
            }
        }
        for (const he of this.edges) {
            if (he.getFace() === undefined) {
                // Boundary half-edges will be missing next and prev info
                let next = he.getTwin();
                do {
                    next = next.getPrev().getTwin();
                } while (next.getFace() !== undefined);
                he.setNext(next);
                next.setPrev(he);
            }
        }

        this.edgeMap.clear();
    }

    clear() {
        this.vertices = [];
        this.edges = [];
        this.faces = [];
        this.normals = [];
        this.edgeMap.clear();
    }

    addVertexPos(x, y, z, i) {
        var v = new Vertex(x, y, z, i);
        this.vertices.push(v);
        return this.vertices[this.vertices.length - 1];
    }

    addFaceByVerts(verts) {
        const createOrFail = (v1, v2) => {
            if (this.findEdge(v1, v2) !== undefined) {
                throw Error(`Duplicate half edge between v${v1.getId()} and v${v2.getId()}`);
            }
            return this.addEdge(v1, v2);
        };

        const edges = [];
        for (let i = 1; i < verts.length; ++i) {
            edges.push(createOrFail(verts[i -1], verts[i]));
        }
        edges.push(createOrFail(verts[verts.length - 1], verts[0]));

        return this._addFaceByHalfEdges(edges);
    }

    _addFaceByHalfEdges(edges) {
        // Add the face to the mesh
        const f = this.addFace();

        // Initialize face-edge relationship
        f.setHalfEdge(edges[0]);

        // Initialize edge-face relationship
        for (const e of edges) {
            e.setFace(f);
        }

        // Connect edge cycle around face
        const len = edges.length;
        for (let i = 0; i < len; ++i) {
            edges[i].setNext(edges[(i + 1) % len]);
            edges[i].setPrev(edges[(i - 1 + len) % len]);
        }

        return f;
    }

    addFace() {
        var f = new Face(this.faces.length);
        this.faces.push(f);
        return f;
    }

    addHalfEdge() {
        var he = new HalfEdge(this.edges.length);
        this.edges.push(he);
        return he;
    }

    addEdge(v1, v2) {
        var he = this.addHalfEdge();

        var key = String(v1.getId()) + "," + String(v2.getId());
        this.edgeMap.set(key, he);

        // Associate edge with its origin vertex
        he.setOrigin(v1);
        if (v1.getHalfEdge() === undefined) {
            v1.setHalfEdge(he);
        }

        // Associate edge with its twin, if it exists
        var t_he = this.findEdge(v2, v1);
        if (t_he !== undefined) {
            he.setTwin(t_he);
            t_he.setTwin(he);
        }

        return he;
    }

    findEdge(v1, v2) {
        const key = String(v1.getId()) + "," + String(v2.getId());
        return this.edgeMap.get(key);
    }

    getBoundingBox() {
        if (this.vertices.length == 0) return;

        var min = this.vertices[0].getPosition().copy();
        var max = this.vertices[0].getPosition().copy();

        for (var i = 0; i < this.vertices.length; i++) {
            for (var j = 0; j < 3; j++) {
                var pos = this.vertices[i].getPosition();

                if (min.value[j] > pos.value[j]) {
                    min.value[j] = pos.value[j];
                }
                if (max.value[j] < pos.value[j]) {
                    max.value[j] = pos.value[j];
                }
            }
        }

        return [min, max];
    }

    copy() {
        const other = new Mesh();
        // Start by copying everything except for references, which are circular
        for (const v of this.vertices) {
            other.vertices.push(v.copy());
        }
        for (const f of this.faces) {
            other.faces.push(f.copy());
        }
        for (const e of this.edges) {
            other.edges.push(e.copy());
        }
        for (const n of this.normals) {
            other.normals.push(n.copy());
        }

        // Update references
        for (const v of this.vertices) {
            const i = v.getId();
            other.vertices[i].setHalfEdge(other.edges[v.getHalfEdge().getId()]);
        }
        for (const f of this.faces) {
            const i = f.getId();
            other.faces[i].setHalfEdge(other.edges[f.getHalfEdge().getId()]);
        }
        for (const e of this.edges) {
            const he = other.edges[e.getId()];
            he.setOrigin(other.vertices[e.getOrigin().getId()]);
            he.setTwin(other.edges[e.getTwin().getId()]);
            if (e.getFace() !== undefined)
                he.setFace(other.faces[e.getFace().getId()]);
            he.setNext(other.edges[e.getNext().getId()]);
            he.setPrev(other.edges[e.getPrev().getId()]);
        }
        this.edgeMap.forEach((e, key) => {
            other.edgeMap[key] = other.edges[e.getId()];
        });

        return other;
    }

    checkConsistency() {
        for (const he of this.edges) {
            if (he !== he.getTwin().getTwin()) {
                console.error("he inconsistent twin");
            }
            if (he.getFace() !== he.getNext().getFace()) {
                console.error("next face was inconsistent");
            }
            if (he.getFace() !== he.getPrev().getFace()) {
                console.error("prev face was inconsistent");
            }
            if (he !== he.getPrev().getNext()) {
                console.error("he inconsistent next");
            }
            if (he !== he.getNext().getPrev()) {
                console.error("he inconsistent prev");
            }
        }
        for (const v of this.vertices) {
            if (v.getHalfEdge() !== undefined && v !== v.getHalfEdge().getOrigin()) {
                console.error("v inconsistent he");
            }
        }
        for (const f of this.faces) {
            if (f !== f.getHalfEdge().getFace()) {
                console.error("f inconsistent he");
            }
        }
    }
}

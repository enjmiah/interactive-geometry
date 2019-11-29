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

    //Offset the label based on the position of vertex
    //TODO: Implement a better algorthim? This does not cover all cases.
    getLabelPosition(boundingBox) {
        var min_x = boundingBox[0].x();
        var min_y = boundingBox[0].y();

        var max_x = boundingBox[1].x();
        var max_y = boundingBox[1].y();
        

        var x = this.position.x();
        var y = this.position.y();

        if (x == min_x && y == min_y) {
            return new Vec3(-10, -10, 0);
        } else if (x == min_x && y != min_y) {
            return new Vec3(20, 20, 0);
        } else if (x != min_x && y == min_y) {
            return new Vec3(20, -15, 0);
        } else if (x == max_x && y == max_y) {
            return new Vec3(10, 10, 0);
        } else if (x == max_x && y != max_y) {
            return new Vec3(10, 0, 0);
        } else if (x != max_x && y == max_y) {
            return new Vec3(20, 20, 0);
        } else{
            return new Vec3(20, 20, 0);
        }
    }

    // getLabelPosition(centroid) {

    // }
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
}

export class Face {
    constructor(idx) {
        this.id = idx;
    }

    getId() { return this.id; }

    getHalfEdge() { return this.he; }

    setHalfEdge(e) { this.he = e; }
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
        // FIXME: support non-triangular faces
        for (let i = 0; i < faces.length; i++) {
            let v0 = this.vertices[faces[i][0]];
            let v1 = this.vertices[faces[i][1]];
            let v2 = this.vertices[faces[i][2]];
            this.addFaceByVerts(v0, v1, v2);
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

    addFaceByVerts(v1, v2, v3) {
        const createOrFail = (v1, v2) => {
            let e = this.findEdge(v1, v2);
            if (e !== undefined && e.getFace() !== undefined) {
                throw Error(`Duplicate half edge between v${v1.getId()} and v${v2.getId()}`);
            }
            return this.addEdge(v1, v2);
        };
        const findOrCreate = (v1, v2) => {
            let e = this.findEdge(v1, v2);
            if (!e) {
                e = this.addEdge(v1, v2);
            }
            return e;
        };

        const e1 = createOrFail(v1, v2);
        const e2 = createOrFail(v2, v3);
        const e3 = createOrFail(v3, v1);
        const t1 = findOrCreate(v2, v1);
        const t2 = findOrCreate(v3, v2);
        const t3 = findOrCreate(v1, v3);

        assert(t1.getTwin() === e1);
        assert(t2.getTwin() === e2);
        assert(t3.getTwin() === e3);

        return this._addFaceByHalfEdges(e1, e2, e3, t1, t2, t3);
    }

    _addFaceByHalfEdges(e1, e2, e3, t1, t2, t3) {
        // Add the face to the mesh
        const f = this.addFace();

        // Initialize face-edge relationship
        f.setHalfEdge(e1);

        // Initialize edge-face relationship
        e1.setFace(f);
        e2.setFace(f);
        e3.setFace(f);

        // Connect edge cycle around face
        e1.setNext(e2); e2.setPrev(e1);
        e2.setNext(e3); e3.setPrev(e2);
        e3.setNext(e1); e1.setPrev(e3);

        const twins = [t1, t2, t3];
        for (let i = 0; i < twins.length; ++i) {
            // Boundary half-edges will be missing next and prev info
            const he = twins[i];
            if (he.getFace() === undefined) {
                assert(he.getNext() === undefined);
                let next = he.getTwin();
                while (next.getFace() !== undefined) {
                    next = next.getPrev().getTwin();
                }
                he.setNext(next);
                next.setPrev(he);
            }
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

    getCentroid() {
        var boundingBox = this.getBoundingBox();

        var min = boundingBox[0];
        var max = boundingBox[1];

        var centroid = min.add(max);
        return centroid.multiply(0.5);
    }
}

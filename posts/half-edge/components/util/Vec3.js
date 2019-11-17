"use strict";

/**
 * A 3D vector of floating point values.
 */
export function Vec3(dx, dy, dz) {
    // Components
    this.value = new Float32Array(3);

    if (arguments.length >= 1) this.value[0] = dx;
    if (arguments.length >= 2) this.value[1] = dy;
    if (arguments.length >= 3) this.value[2] = dz;

    this.x = function() { return this.value[0]; }
    this.y = function() { return this.value[1]; }
    this.z = function() { return this.value[2]; }

    /**
     * Return a deep copy of this vector.
     */
    this.copy = function() {
        return new Vec3(this.value[0], this.value[1], this.value[2]);
    };

    /**
     * Set the vector's components.
     */
    this.set = function(new_x, new_y, new_z) {
        this.value[0] = new_x;
        this.value[1] = new_y;
        this.value[2] = new_z;
    };

    /**
     * Return the Euclidean norm of this vector.
     */
    this.norm = function () {
        return Math.sqrt(this.value[0] * this.value[0] +
                         this.value[1] * this.value[1] +
                         this.value[2] * this.value[2]);
    };

    /**
     * Return a unit-length vector which points in the same direction.
     */
    this.normalized = function () {
        let length = this.norm();
        if (Math.abs(length) < 0.0000001) {
            throw Exception("Cannot normalize an almost zero vector.");
        }

        let factor = 1.0 / length;
        let new_x = this.value[0] * factor;
        let new_y = this.value[1] * factor;
        let new_z = this.value[2] * factor;
        return new Vec3(new_x, new_y, new_z);
    };

    /**
     * Return the result of adding  v` to `this`.
     */
    this.add = function(v) {
        var new_x = this.value[0] + v.value[0];
        var new_y = this.value[1] + v.value[1];
        var new_z = this.value[2] + v.value[2];
        return new Vec3(new_x, new_y, new_z);
    };

    /**
     * Return the result of subtracting `v` from `this`.
     */
    this.subtract = function(v) {
        var new_x = this.value[0] - v.value[0];
        var new_y = this.value[1] - v.value[1];
        var new_z = this.value[2] - v.value[2];
        return new Vec3(new_x, new_y, new_z);
    };

    /**
     * Return `this` scaled by scalar `s`.
     */
    this.multiply = function(s) {
        var new_x = this.value[0] * s;
        var new_y = this.value[1] * s;
        var new_z = this.value[2] * s;
        return new Vec3(new_x, new_y, new_z);
    };

    /**
     * Return true if and only if `this` is mathematically equivalent to
     * `other`.`
     */
    this.equals = function(other) {
        return (this.value[0] == other.value[0] &&
                this.value[1] == other.value[1] &&
                this.value[2] == other.value[2] );
    };
}

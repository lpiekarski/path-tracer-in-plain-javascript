var MIN_R = 1e-2;
//var MAX_TRIANGLES = 1;
var MAX_TRIANGLES = 32;
var OCTREE_COUNT = 0;
var TRIANGLE_COUNT = 0;

function Octree(o, r) {
    this.o = o;
    this.r = r;
    this.triangles = [];
    OCTREE_COUNT++;
}

Octree.addTriangle = function (octree, triangle) {
    var test = intersectionTriangleAABB(triangle, octree.o, octree.r);
    if (test == false)
        return;
    if (octree.ch == undefined && (octree.triangles.length < MAX_TRIANGLES || octree.r / 2 < MIN_R)) {
        octree.triangles.push(triangle);
        TRIANGLE_COUNT++;
    }
    else {
        if (octree.ch == undefined) {
            var r2 = octree.r / 2;
            octree.ch = [new Octree(new vec3(octree.o.x + r2, octree.o.y + r2, octree.o.z + r2), r2),
                new Octree(new vec3(octree.o.x - r2, octree.o.y + r2, octree.o.z + r2), r2),
                new Octree(new vec3(octree.o.x + r2, octree.o.y - r2, octree.o.z + r2), r2),
                new Octree(new vec3(octree.o.x + r2, octree.o.y + r2, octree.o.z - r2), r2),
                new Octree(new vec3(octree.o.x - r2, octree.o.y - r2, octree.o.z + r2), r2),
                new Octree(new vec3(octree.o.x + r2, octree.o.y - r2, octree.o.z - r2), r2),
                new Octree(new vec3(octree.o.x - r2, octree.o.y + r2, octree.o.z - r2), r2),
                new Octree(new vec3(octree.o.x - r2, octree.o.y - r2, octree.o.z - r2), r2)];
        }
        for (var i = 0; i < octree.triangles.length; i++)
            for (var j = 0; j < 8; j++)
                Octree.addTriangle(octree.ch[j], octree.triangles[i]);
        for (var j = 0; j < 8; j++)
            Octree.addTriangle(octree.ch[j], triangle);
        TRIANGLE_COUNT -= octree.triangles.length;
        octree.triangles = [];
    }
}

function findMinMax(x0, x1, x2) {
    var min = x0, max = x0;
    if (x1 < min)
        min = x1;
    if (x1 > max)
        max = x1;
    if (x2 < min)
        min = x2;
    if (x2 > max)
        max = x2;
    return [min, max];
}

function planeBoxOverlap(normal, vert, r) {
    var q;
    var vmin = new vec3(0, 0, 0), vmax = new vec3(0, 0, 0), v;
    v = vert.x;
    if (normal.x > 0) {
        vmin.x = -r - v;
        vmax.x = r - v;
    }
    else {
        vmin.x = r - v;
        vmax.x = -r - v;
    }
    v = vert.y;
    if (normal.y > 0) {
        vmin.y = -r - v;
        vmax.y = r - v;
    }
    else {
        vmin.y = r - v;
        vmax.y = -r - v;
    }
    v = vert.z;
    if (normal.z > 0) {
        vmin.z = -r - v;
        vmax.z = r - v;
    }
    else {
        vmin.z = r - v;
        vmax.z = -r - v;
    }
    if (vec3.dot(normal, vmin) > 0)
        return false;
    if (vec3.dot(normal, vmax) >= 0)
        return true;
    return false;
}

function intersectionTriangleAABB(t, o, r) {
    var min, max, p0, p1, p2, rad;
    var normal;


    var v0 = vec3.sub(t.points[0], o);
    var v1 = vec3.sub(t.points[1], o);
    var v2 = vec3.sub(t.points[2], o);


    var e0 = vec3.sub(v1, v0);
    var e1 = vec3.sub(v2, v1);
    var e2 = vec3.sub(v0, v2);


    var fex = Math.abs(e0.x);
    var fey = Math.abs(e0.y);
    var fez = Math.abs(e0.z);
    p0 = e0.z * v0.y - e0.y * v0.z;
    p2 = e0.z * v2.y - e0.y * v2.z;
    if (p0 < p2) {
        min = p0;
        max = p2;
    }
    else {
        min = p2;
        max = p0;
    }
    var rad = fez * r + fey * r;
    if (min > rad || max < -rad)
        return false;
    p0 = -e0.z * v0.x + e0.x * v0.z;
    p2 = -e0.z * v2.x + e0.x * v2.z;
    if (p0 < p2) {
        min = p0;
        max = p2;
    }
    else {
        min = p2;
        max = p0;
    }
    rad = fez * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    p1 = e0.y * v1.x - e0.x * v1.y;
    p2 = e0.y * v2.x - e0.x * v2.y;
    if (p2 < p1) {
        min = p2;
        max = p1;
    }
    else {
        min = p1;
        max = p2;
    }
    rad = fey * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    fex = Math.abs(e1.x);
    fey = Math.abs(e1.y);
    fez = Math.abs(e1.z);
    p0 = e1.z * v0.y - e1.y * v0.z;
    p2 = e1.z * v2.y - e1.y * v2.z;
    if (p0 < p2) {
        min = p0;
        max = p2;
    }
    else {
        min = p2;
        max = p0;
    }
    var rad = fez * r + fey * r;
    if (min > rad || max < -rad)
        return false;
    p0 = -e1.z * v0.x + e1.x * v0.z;
    p2 = -e1.z * v2.x + e1.x * v2.z;
    if (p0 < p2) {
        min = p0;
        max = p2;
    }
    else {
        min = p2;
        max = p0;
    }
    rad = fez * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    p0 = e1.y * v0.x - e1.x * v0.y;
    p1 = e1.y * v1.x - e1.x * v1.y;
    if (p0 < p1) {
        min = p0;
        max = p1;
    }
    else {
        min = p1;
        max = p0;
    }
    rad = fey * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    fex = Math.abs(e2.x);
    fey = Math.abs(e2.y);
    fez = Math.abs(e2.z);
    var p0 = e2.z * v0.y - e2.y * v0.z;
    var p1 = e2.z * v1.y - e2.y * v1.z;
    if (p0 < p1) {
        min = p0;
        max = p1;
    }
    else {
        min = p1;
        max = p0;
    }
    rad = fez * r + fey * r;
    if (min > rad || max < -rad)
        return false;
    p0 = -e2.z * v0.x + e2.x * v0.z;
    p1 = -e2.z * v1.x + e2.x * v1.z;
    if (p0 < p1) {
        min = p0;
        max = p1;
    }
    else {
        min = p1;
        max = p0;
    }
    rad = fez * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    p1 = e2.y * v1.x - e2.x * v1.y;
    p2 = e2.y * v2.x - e2.x * v2.y;
    if (p2 < p1) {
        min = p2;
        max = p1;
    }
    else {
        min = p1;
        max = p2;
    }
    rad = fey * r + fex * r;
    if (min > rad || max < -rad)
        return false;
    var minmax;
    minmax = findMinMax(v0.x, v1.x, v2.x);
    if (minmax[0] > r || minmax[1] < -r)
        return false;

    minmax = findMinMax(v0.y, v1.y, v2.y);
    if (minmax[0] > r || minmax[1] < -r)
        return false;

    minmax = findMinMax(v0.z, v1.z, v2.z);
    if (minmax[0] > r || minmax[1] < -r)
        return false;

    normal = vec3.cross(e0, e1);
    return planeBoxOverlap(normal, v0, r);
}

var TIME_AABB = 0;

function intersectionRayAABB(ray, o, r) {
    var DT = (new Date()).getTime();
    var tx = [], ty = [], tz = [], tx1, tx2, ty1, ty2, tz1, tz2;
    var o_diff = vec3.sub(o, ray.o);
    tx1 = (o_diff.x + r) / ray.dir.x;
    tx2 = (o_diff.x - r) / ray.dir.x;
    ty1 = (o_diff.y + r) / ray.dir.y;
    ty2 = (o_diff.y - r) / ray.dir.y;
    tz1 = (o_diff.z + r) / ray.dir.z;
    tz2 = (o_diff.z - r) / ray.dir.z;
    tx[0] = Math.min(tx1, tx2);
    tx[1] = Math.max(tx1, tx2);
    ty[0] = Math.min(ty1, ty2);
    ty[1] = Math.max(ty1, ty2);
    tz[0] = Math.min(tz1, tz2);
    tz[1] = Math.max(tz1, tz2);
    if (isNaN(tx[0]))
        tx[0] = -Infinity;
    if (isNaN(tx[1]))
        tx[1] = Infinity;
    if (isNaN(ty[0]))
        ty[0] = -Infinity;
    if (isNaN(ty[1]))
        ty[1] = Infinity;
    if (isNaN(tz[0]))
        tz[0] = -Infinity;
    if (isNaN(tz[1]))
        tz[1] = Infinity;
    var p_min = 0, p_max = Infinity;
    p_min = Math.max(p_min, Math.max(tx[0], Math.max(ty[0], tz[0])));
    p_max = Math.min(p_max, Math.min(tx[1], Math.min(ty[1], tz[1])));
    TIME_AABB += new Date().getTime() - DT;
    if (p_max < p_min)
        return [Infinity, Infinity];
    return [p_min, p_max];
}

var TESTED_TRIANGLES = 0;
var TESTED_AABB = 0;
Octree.rayIntersection = function (octree, ray, group = "", minimal_distance = 1e-8) {
    if (octree.ch == undefined) {
        var id = -1, min_dist = Infinity, absolute_max = 0;
        for (var i = 0; i < octree.triangles.length; i++) {
            var dist = Triangle.intersection(ray, octree.triangles[i]);
            TESTED_TRIANGLES++;
            if (octree.triangles[i].group == group) {
                if (dist > absolute_max)
                    absolute_max = dist;
                continue;
            }
            if (dist > minimal_distance && dist < min_dist) {
                id = i;
                min_dist = dist;
            }
        }
        if (id == -1)
            return new Collision(undefined, Infinity, undefined, undefined, absolute_max, undefined);
        var col_point = vec3.add(ray.o, vec3.mult(ray.dir, min_dist));
        var material = octree.triangles[id].getMaterial(col_point);
        return new Collision(octree.triangles[id], min_dist, material, col_point, absolute_max, octree.triangles[id].getNormal(ray.dir, col_point));
    }
    else {
        var dist = [];
        for (var i = 0; i < 8; i++)
            dist[i] = [intersectionRayAABB(ray, octree.ch[i].o, octree.ch[i].r), i];
        TESTED_AABB += 8;
        dist.sort(function (a, b) {
            return a[0][0] - b[0][0];
        });
        //console.log(dist);
        for (var i = 0; i < 8; i++) {
            var id = dist[i][1];
            var d1 = dist[i][0][0];
            var d2 = dist[i][0][1];
            if (d1 == Infinity)
                continue;
            var res = Octree.rayIntersection(octree.ch[id], ray);
            if (res.distance <= d2 + 1e-8 && res.distance >= d1 - 1e-8)
                return res;
        }
        return new Collision(undefined, Infinity, undefined, undefined, Infinity, undefined);
    }
}

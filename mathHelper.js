Math.clamp = function (val, min, max) {
    if (max < min)
        return val;
    if (val > max)
        val = max;
    if (val < min)
        val = min;
    return val;
}

function vec3(x, y, z, basis) {
    if (basis == undefined) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    else {
        var v = vec3.add(vec3.add(vec3.mult(basis[0], x), vec3.mult(basis[1], y)), vec3.mult(basis[2], z));
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
    }
}

vec3.len2 = function (v) {
    return (v.x * v.x + v.y * v.y + v.z * v.z);
}
vec3.len = function (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
vec3.minus = function (v) {
    return new vec3(-v.x, -v.y, -v.z);
}
vec3.dot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
vec3.cross = function (v1, v2) {
    return new vec3(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}
vec3.add = function (v1, v2) {
    return new vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}
vec3.sub = function (v1, v2) {
    return new vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}
vec3.mult = function (v, s) {
    return new vec3(v.x * s, v.y * s, v.z * s);
}
vec3.normal = function (v) {
    var len2 = v.x * v.x + v.y * v.y + v.z * v.z;
    if (len2 == 0 || len2 == 1)
        return v;
    return vec3.mult(v, 1 / Math.sqrt(len2));
}
vec3.mult_matrix3 = function (v, mat) {
    return new vec3(mat[0][0] * v.x + mat[1][0] * v.y + mat[2][0] * v.z,
        mat[0][1] * v.x + mat[1][1] * v.y + mat[2][1] * v.z,
        mat[0][2] * v.x + mat[1][2] * v.y + mat[2][2] * v.z);
}
vec3.rotate = function (v, u, theta) {
    u = vec3.normal(u);
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    var mat = [
        [cos + u.x * u.x * (1 - cos), u.x * u.y * (1 - cos) - u.z * sin, u.x * u.z * (1 - cos) + u.y * sin],
        [u.y * u.x * (1 - cos) + u.z * sin, cos + u.y * u.y * (1 - cos), u.y * u.z * (1 - cos) - u.x * sin],
        [u.z * u.x * (1 - cos) - u.y * sin, u.z * u.y * (1 - cos) + u.x * sin, cos + u.z * u.z * (1 - cos)]
    ];
    return vec3.mult_matrix3(v, mat);
}
vec3.basis = function (v) {
    var x = vec3.cross(new vec3(0, 0, 1), v);
    if (vec3.len2(x) < 1e-8)
        x = new vec3(1, 0, 0);
    var y = v;
    var z = vec3.cross(y, x);
    x = vec3.normal(x);
    y = vec3.normal(y);
    z = vec3.normal(z);
    return [x, y, z];
}
vec3.diffuse = function (I, N) {
    N = vec3.normal(N);
    var r1 = Math.random();
    var r2 = Math.random();
    r2 = 2 * Math.PI * r2;
    var A, B, C;
    var cross = vec3.cross(N, new vec3(0, 1, 0));
    if (vec3.len2(cross) < 1e-8)
        cross = new vec3(1, 0, 0);
    var p = vec3.rotate(vec3.mult(cross, r1 / vec3.len(cross)), N, r2);
    A = N.x * N.x + N.y * N.y + N.z * N.z;
    B = 2 * (N.x * p.x + N.y * p.y + N.z * p.z);
    C = p.x * p.x + p.y * p.y + p.z * p.z - 1;
    var delta = Math.sqrt(B * B - 4 * A * C);
    var t1, t2;
    t1 = (-B + delta) / (2 * A);
    t2 = (-B - delta) / (2 * A);
    var x1, x2, y1, y2, z1, z2;
    x1 = N.x * t1 + p.x;
    y1 = N.y * t1 + p.y;
    z1 = N.z * t1 + p.z;
    x2 = N.x * t2 + p.x;
    y2 = N.y * t2 + p.y;
    z2 = N.z * t2 + p.z;
    var v = new vec3(x1, y1, z1);
    if (vec3.dot(v, N) > 0)
        return vec3.normal(v);
    return vec3.normal(new vec3(x2, y2, z2));
}
vec3.reflect = function (I, N) {
    return vec3.sub(I, vec3.mult(N, vec3.dot(N, I) * 2));
}
vec3.refract = function (I, N, eta) {
    var dot = vec3.dot(N, I);
    var k = 1.0 - eta * eta * (1.0 - dot * dot);
    if (k < 0.0)
        return new vec3(0, 0, 0);
    else
        return vec3.sub(vec3.mult(I, eta), vec3.mult(N, eta * dot + Math.sqrt(k)));
}
vec3.fromArray = function (a) {
    if (a == undefined)
        return new vec3(0, 0, 0);
    return new vec3(a[0], a[1], a[2]);
}
vec3.vectorBlend = function (vec, ip) {
    return new vec3(vec[0].x * ip[0] + vec[1].x * ip[1] + vec[2].x * ip[2],
        vec[0].y * ip[0] + vec[1].y * ip[1] + vec[2].y * ip[2],
        vec[0].z * ip[0] + vec[1].z * ip[1] + vec[2].z * ip[2]);
}
vec3.randomVector = function () {
    var x = Math.random() * 2 - 1;
    var y = Math.random() * 2 - 1;
    var z = Math.random() * 2 - 1;
    while (x * x + y * y + z * z > 1) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
    }
    return vec3.normal(new vec3(x, y, z));
}

function ray3(o, dir) {
    this.o = o;
    this.dir = dir;
    this.dir = vec3.normal(this.dir);
}

ray3.step = function (r, s) {
    var ndir = vec3.normal(r.dir);
    return new ray3(r.o + vec3.mult(ndir, s), ndir);
}


function col3(r, g, b, i) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.i = i;

}

col3.validate = function (c) {
    var mx = Math.max(Math.max(c.r, c.g), c.b);
    if (mx == 0)
        return c;
    return new col3(c.r / mx, c.g / mx, c.b / mx, c.i * mx);
}
col3.getRGB = function (c) {
    var R = Math.max(Math.floor(c.r * c.i * 255), 0);
    var G = Math.max(Math.floor(c.g * c.i * 255), 0);
    var B = Math.max(Math.floor(c.b * c.i * 255), 0);
    var flooded = Math.max(R - 255, 0) + Math.max(G - 255, 0) + Math.max(B - 255, 0);
    R += flooded / 3;
    G += flooded / 3;
    B += flooded / 3;
    R = Math.floor(Math.clamp(R, 0, 255));
    G = Math.floor(Math.clamp(G, 0, 255));
    B = Math.floor(Math.clamp(B, 0, 255));
    return "rgb(" + R + "," + G + "," + B + ")";
}
col3.getGrayScaleRGB = function (c) {
    var avg = (c.r + c.g + c.b) / 3;
    var C = Math.clamp(Math.floor(avg * c.i * 255), 0, 255);
    return "rgb(" + C + "," + C + "," + C + ")";
}
col3.energy = function (c) {
    return c.i * c.r + c.i * c.g + c.i * c.b;
}
col3.negative = function (c) {
    return new col3(1 - c.r, 1 - c.g, 1 - c.b, c.i);
}
col3.mult = function (c1, c2) {
    return new col3(c1.r * c2.r, c1.g * c2.g, c1.b * c2.b, c1.i * c2.i);
}
col3.add = function (c1, c2) {
    return col3.validate(new col3(c1.r * c1.i + c2.r * c2.i, c1.g * c1.i + c2.g * c2.i, c1.b * c1.i + c2.b * c2.i, 1));
}
col3.addMany = function (cols) {
    var R = 0, G = 0, B = 0;
    for (var i = 0; i < cols.length; i++) {
        R += cols[i].r * cols[i].i;
        G += cols[i].g * cols[i].i;
        B += cols[i].b * cols[i].i;
    }
    return col3.validate(new col3(R, G, B, 1));
}
col3.add_insec = function (c1, c2) {
    return new col3(c1.r + c2.r, c1.g + c2.g, c1.b + c2.b, c1.i + c2.i);
}
col3.fromArray = function (a) {
    if (a == undefined)
        return new col3(0, 0, 0, 0);
    return new col3(a[0], a[1], a[2], a[3]);
}
col3.colorBlend = function (col0, c0, col1, c1, col2, c2) {
    return new col3(col0.r * c0 + col1.r * c1 + col2.r * c2,
        col0.g * c0 + col1.g * c1 + col2.g * c2,
        col0.b * c0 + col1.b * c1 + col2.b * c2,
        col0.i * c0 + col1.i * c1 + col2.i * c2);
}

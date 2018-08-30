function Triangle(points, materials, normals, group, texture, uv, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta) {
    this.points = points;
    this.materials = materials;
    this.normals = normals;
    this.group = group;
    this.texture = texture;
    this.uv = uv;
    this.tex_normal = tex_normal;
    this.tex_reflect = tex_reflect;
    this.tex_refract = tex_refract;
    this.tex_emission = tex_emission;
    this.tex_sss = tex_sss;
    this.tex_eta = tex_eta;

    this.getNormal = function (dir, p = undefined) {
        if (this.tex_normal != undefined) {
            var ip = Triangle.interpolation(this.points, p);
            var n_col = textureManager.getColor(textureManager.getId(this.tex_normal), vec3.vectorBlend(this.uv, ip));
            var n = vec3.normal(vec3.cross(vec3.sub(this.points[1], this.points[0]), vec3.sub(this.points[2], this.points[0])));
            if (dir != undefined && vec3.dot(dir, n) > 0)
                n = vec3.minus(n);
            var basis = vec3.basis(n);
            var q = vec3.normal(new vec3(n_col.r - 0.5, n_col.b - 0.5, n_col.g - 0.5));
            var normal = vec3.normal(vec3.add(vec3.add(vec3.mult(basis[0], q.x), vec3.mult(basis[1], q.y)), vec3.mult(basis[2], q.z)));
            if (dir != undefined && vec3.dot(dir, n) > 0)
                normal = vec3.minus(normal);
            return normal;
        }
        else if (this.normals == undefined || this.normals.length < 3) {
            var n = vec3.normal(vec3.cross(vec3.sub(this.points[1], this.points[0]), vec3.sub(this.points[2], this.points[0])));
            if (dir == undefined || vec3.dot(dir, n) < 0)
                return n;
            return vec3.minus(n);
        }
        else {
            var ip = Triangle.interpolation(this.points, p);
            var n = vec3.vectorBlend(this.normals, ip);
            if (n.len() == 0) {
                n = vec3.normal(vec3.cross(vec3.sub(this.points[1], this.points[0]), vec3.sub(this.points[2], this.points[0])));
                if (dir == undefined || vec3.dot(dir, n) < 0)
                    return n;
                return vec3.minus(n);
            }
            if (vec3.dot(dir, n) > 0)
                return vec3.normal(vec3.minus(n));
            return vec3.normal(n);
        }
    }

    this.getMaterial = function (p) {
        var c0, c1, c2;
        var ip = Triangle.interpolation(this.points, p);
        c0 = ip[0];
        c1 = ip[1];
        c2 = ip[2];
        var diffuse = col3.colorBlend(this.materials[0].diffuse, c0, this.materials[1].diffuse, c1, this.materials[2].diffuse, c2);
        if (this.texture != undefined)
            diffuse = col3.mult(diffuse, textureManager.getColor(textureManager.getId(this.texture), vec3.vectorBlend(this.uv, ip)));

        var reflect = col3.colorBlend(this.materials[0].reflect, c0, this.materials[1].reflect, c1, this.materials[2].reflect, c2);
        if (this.tex_reflect != undefined)
            reflect = col3.mult(reflect, textureManager.getColor(textureManager.getId(this.tex_reflect), vec3.vectorBlend(this.uv, ip)));

        var refract = col3.colorBlend(this.materials[0].refract, c0, this.materials[1].refract, c1, this.materials[2].refract, c2);
        if (this.tex_refract != undefined)
            refract = col3.mult(refract, textureManager.getColor(textureManager.getId(this.tex_refract), vec3.vectorBlend(this.uv, ip)));

        var emission = col3.colorBlend(this.materials[0].emission, c0, this.materials[1].emission, c1, this.materials[2].emission, c2);
        if (this.tex_emission != undefined)
            emission = col3.mult(emission, textureManager.getColor(textureManager.getId(this.tex_emission), vec3.vectorBlend(this.uv, ip)));

        var sss = this.materials[0].sss_radius * c0 + this.materials[1].sss_radius * c1 + this.materials[2].sss_radius * c2;
        if (this.tex_sss != undefined) {
            var col = textureManager.getColor(textureManager.getId(this.tex_sss), vec3.vectorBlend(this.uv, ip));
            sss *= (col.r + col.g + col.b) / 3;
        }

        var eta = this.materials[0].eta * c0 + this.materials[1].eta * c1 + this.materials[2].eta * c2;
        if (this.tex_eta != undefined) {
            var col = textureManager.getColor(textureManager.getId(this.tex_eta), vec3.vectorBlend(this.uv, ip));
            eta *= 1 / ((col.r + col.g + col.b) / 3);
        }


        return new Material(diffuse, reflect, refract, eta, emission, sss);
    }
}

Triangle.interpolation = function (points, p) {
    var c0 = 0, c1 = 0, c2 = 0;
    var a0 = vec3.len(vec3.cross(vec3.sub(points[1], p), vec3.sub(points[2], p)));
    var a1 = vec3.len(vec3.cross(vec3.sub(points[0], p), vec3.sub(points[2], p)));
    var a2 = vec3.len(vec3.cross(vec3.sub(points[1], p), vec3.sub(points[0], p)));
    c0 = a0 / (a0 + a1 + a2);
    c1 = a1 / (a0 + a1 + a2);
    c2 = a2 / (a0 + a1 + a2);
    return [c0, c1, c2];
}
/*
triangle json fields:
* offset
* materials
* normals
* group
* texture
* uv
* normal_map
* reflect_map
* refract_map
* emission_map
* eta_map
*/
Triangle.loadJSON = function (triangle) {
    var points = [vec3.fromArray(triangle.points[0]), vec3.fromArray(triangle.points[1]), vec3.fromArray(triangle.points[2])];
    if (triangle.offset != undefined) {
        var offset = vec3.fromArray(triangle.offset);
        points[0] = vec3.add(offset, points[0]);
        points[1] = vec3.add(offset, points[1]);
        points[2] = vec3.add(offset, points[2]);
    }
    var materials = [];
    if (triangle.materials == undefined) {
        var material = Material.loadJSON(triangle.material);
        materials = [material, material, material];
    }
    else {
        for (var i = 0; i < triangle.materials.length; i++)
            materials[i] = Material.loadJSON(triangle.materials[i]);
    }
    var normals = [];
    if (triangle.normals != undefined) {
        normals = [vec3.fromArray(triangle.normals[0]), vec3.fromArray(triangle.normals[1]), vec3.fromArray(triangle.normals[2])];
    }
    var group = undefined;
    if (triangle.group != undefined) {
        group = triangle.group;
    }
    var texture = undefined;
    if (triangle.texture != undefined) {
        texture = triangle.texture;
        textureManager.loadTexture(texture);

    }
    var uv = [];
    if (triangle.uv != undefined) {
        for (var i = 0; i < triangle.uv.length; i++) {
            uv[i] = vec3.fromArray(triangle.uv[i]);
        }
    }
    var tex_normal = undefined;
    if (triangle.normal_map != undefined) {
        tex_normal = triangle.normal_map;
        textureManager.loadTexture(tex_normal);
    }
    var tex_reflect = undefined;
    if (triangle.reflect_map != undefined) {
        tex_reflect = triangle.reflect_map;
        textureManager.loadTexture(tex_reflect);
    }
    var tex_refract = undefined;
    if (triangle.refract_map != undefined) {
        tex_refract = triangle.refract_map;
        textureManager.loadTexture(tex_refract);
    }
    var tex_emission = undefined;
    if (triangle.emission_map != undefined) {
        tex_emission = triangle.emission_map;
        textureManager.loadTexture(tex_emission);
    }
    var tex_sss = undefined;
    if (triangle.sss_map != undefined) {
        tex_sss = triangle.sss_map;
        textureManager.loadTexture(tex_sss);
    }
    var tex_eta = undefined;
    if (triangle.eta_map != undefined) {
        tex_eta = triangle.eta_map;
        textureManager.loadTexture(tex_eta);
    }

    return new Triangle(points, materials, normals, group, texture, uv, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta);
}

Triangle.loadFromQuadJSON = function (quad) {
    var points1 = [vec3.fromArray(quad.points[0]), vec3.fromArray(quad.points[1]), vec3.fromArray(quad.points[2])];
    var materials1 = [];
    if (quad.materials == undefined) {
        var material = Material.loadJSON(quad.material);
        materials1 = [material, material, material];
    }
    else {
        for (var i = 0; i < 3; i++)
            materials1[i] = Material.loadJSON(quad.materials[i]);
    }
    var normals1 = [];
    if (quad.normals != undefined) {
        normals1 = [vec3.fromArray(quad.normals[0]), vec3.fromArray(quad.normals[1]), vec3.fromArray(quad.normals[2])];
    }
    var group = undefined;
    if (quad.group != undefined) {
        group = quad.group;
    }
    var texture = undefined;
    var uv1 = [];
    var uv2 = [];
    if (quad.uv != undefined) {
        for (var i = 0; i < 3; i++) {
            uv1[i] = vec3.fromArray(quad.uv[i]);
        }
        for (var i = 0; i < 3; i++) {
            uv2[i] = vec3.fromArray(quad.uv[i + 1]);
        }
    }

    if (quad.texture != undefined) {
        texture = quad.texture;
        textureManager.loadTexture(texture);

    }
    var tex_normal = undefined;
    if (quad.normal_map != undefined) {
        tex_normal = quad.normal_map;
        textureManager.loadTexture(tex_normal);
    }

    var points2 = [vec3.fromArray(quad.points[1]), vec3.fromArray(quad.points[2]), vec3.fromArray(quad.points[3])];
    var materials2 = [];
    if (quad.materials == undefined) {
        var material = Material.loadJSON(quad.material);
        materials2 = [material, material, material];
    }
    else {
        for (var i = 1; i < 4; i++)
            materials2[i] = Material.loadJSON(quad.materials[i]);
    }
    var normals2 = [];
    if (quad.normals != undefined) {
        normals1 = [vec3.fromArray(quad.normals[1]), vec3.fromArray(quad.normals[2]), vec3.fromArray(quad.normals[3])];
    }
    if (quad.offset != undefined) {
        var offset = vec3.fromArray(quad.offset);
        points1[0] = vec3.add(offset, points1[0]);
        points1[1] = vec3.add(offset, points1[1]);
        points1[2] = vec3.add(offset, points1[2]);
        points2[0] = vec3.add(offset, points2[0]);
        points2[1] = vec3.add(offset, points2[1]);
        points2[2] = vec3.add(offset, points2[2]);
    }
    var tex_reflect = undefined;
    if (quad.reflect_map != undefined) {
        tex_reflect = quad.reflect_map;
        textureManager.loadTexture(tex_reflect);
    }
    var tex_refract = undefined;
    if (quad.refract_map != undefined) {
        tex_refract = quad.refract_map;
        textureManager.loadTexture(tex_refract);
    }
    var tex_emission = undefined;
    if (quad.emission_map != undefined) {
        tex_emission = quad.emission_map;
        textureManager.loadTexture(tex_emission);
    }
    var tex_sss = undefined;
    if (quad.sss_map != undefined) {
        tex_sss = quad.sss_map;
        textureManager.loadTexture(tex_sss);
    }
    var tex_eta = undefined;
    if (quad.eta_map != undefined) {
        tex_eta = quad.eta_map;
        textureManager.loadTexture(tex_eta);
    }
    return [new Triangle(points1, materials1, normals1, group, texture, uv1, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta), new Triangle(points2, materials2, normals2, group, texture, uv2, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta)];
}

var TIME_TRIANGLE = 0;
// orig and dir defines the ray. v0, v1, v2 defines the triangle.
// returns the distance from the ray origin to the intersection or undefined.
Triangle.intersection = function (ray, t) {
    var DT = (new Date()).getTime();
    var e1 = vec3.sub(t.points[1], t.points[0]);
    var e2 = vec3.sub(t.points[2], t.points[0]);
    // Calculate planes normal vector
    var pvec = vec3.cross(ray.dir, e2);
    var det = vec3.dot(e1, pvec);

    // Ray is parallel to plane
    if (det < 1e-8 && det > -1e-8) {
        TIME_TRIANGLE += new Date().getTime() - DT;
        return undefined;
    }

    var inv_det = 1.0 / det;
    var tvec = vec3.sub(ray.o, t.points[0]);
    var u = vec3.dot(tvec, pvec) * inv_det;
    if (u < 0 || u > 1) {
        TIME_TRIANGLE += new Date().getTime() - DT;
        return undefined;
    }

    var qvec = vec3.cross(tvec, e1);
    var v = vec3.dot(ray.dir, qvec) * inv_det;
    if (v < 0 || u + v > 1) {
        TIME_TRIANGLE += new Date().getTime() - DT;
        return undefined;
    }
    TIME_TRIANGLE += new Date().getTime() - DT;
    return vec3.dot(e2, qvec) * inv_det;
}

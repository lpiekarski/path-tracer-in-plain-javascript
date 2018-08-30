function LineReader(line) {
    this.line = line;
    this.id = 0;
    this.next = function () {
        this.id++;
        while (this.id < this.line.length && this.line[this.id] == "") {
            this.id++;
        }
        if (this.id < this.line.length)
            return this.line[this.id];
        return "";
    }
}

function ObjLoader() {
    this.vertices = [];
    this.coords = [];
    this.normals = [];
    this.triangles = [];
    this.load = function (file, offset, material, group, texture, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta) {
        var data = fileReader.readAsText(file);
        var lines = data.split("\n");
        this.material = material;
        this.group = group;
        this.offset = offset;
        this.texture = texture;
        this.tex_normal,
            this.tex_reflect = tex_reflect;
        this.tex_refract = tex_refract;
        this.tex_emission = tex_emission;
        this.tex_sss = tex_sss;
        this.tex_eta = tex_eta;
        for (var i = 0; i < lines.length; i++) {
            this.executeLine(lines[i]);
        }
    }
    this.executeLine = function (line) {
        if (line.startsWith("#")) {
            return;
        }
        if (line.startsWith("v ")) {
            var a = new LineReader(line.split(" "));
            var x, y, z;
            x = parseFloat(a.next());
            y = parseFloat(a.next());
            z = parseFloat(a.next());
            this.vertices.push(new vec3(x, y, z));
        }
        if (line.startsWith("vt ")) {
            var a = new LineReader(line.split(" "));
            var u, v, w;
            u = parseFloat(a.next());
            v = parseFloat(a.next());
            w = parseFloat(a.next());
            if (isNaN(w))
                w = 0;
            this.coords.push(new vec3(u, v, w));
        }
        if (line.startsWith("vn ")) {
            var a = new LineReader(line.split(" "));
            var x, z, y;
            x = parseFloat(a.next());
            y = parseFloat(a.next());
            z = parseFloat(a.next());
            this.normals.push(new vec3(x, y, z));
        }
        if (line.startsWith("f ")) {
            var a = new LineReader(line.split(" "));

            var p1, p2, p3, t1, t2, t3, n1, n2, n3;
            var k1, k2, k3;
            k1 = new LineReader(a.next().split("/"));
            k2 = new LineReader(a.next().split("/"));
            k3 = new LineReader(a.next().split("/"));
            p1 = parseInt(k1.line[0]);
            p2 = parseInt(k2.line[0]);
            p3 = parseInt(k3.line[0]);
            t1 = parseInt(k1.next());
            t2 = parseInt(k2.next());
            t3 = parseInt(k3.next());
            n1 = parseInt(k1.next());
            n2 = parseInt(k2.next());
            n3 = parseInt(k3.next());
            var triangle = {};
            triangle.material = this.material;
            triangle.group = this.group;
            triangle.offset = this.offset;
            if (this.texture != undefined)
                triangle.texture = this.texture;
            if (this.tex_normal != undefined)
                triangle.normal_map = this.tex_normal;
            if (this.tex_reflect != undefined)
                triangle.reflect_map = this.tex_reflect;
            if (this.tex_refract != undefined)
                triangle.refract_map = this.tex_refract;
            if (this.tex_emission != undefined)
                triangle.emission_map = this.tex_emission;
            if (this.tex_sss != undefined)
                triangle.sss_map = this.tex_sss;
            if (this.tex_eta != undefined)
                triangle.eta_map = this.tex_eta;
            triangle.points = [[this.vertices[p1 - 1].x, this.vertices[p1 - 1].y, this.vertices[p1 - 1].z],
                [this.vertices[p2 - 1].x, this.vertices[p2 - 1].y, this.vertices[p2 - 1].z],
                [this.vertices[p3 - 1].x, this.vertices[p3 - 1].y, this.vertices[p3 - 1].z]];
            if (isNaN(t1) == false && isNaN(t2) == false && isNaN(t3) == false) {
                triangle.uv = [[this.coords[t1 - 1].x, this.coords[t1 - 1].y, this.coords[t1 - 1].z],
                    [this.coords[t2 - 1].x, this.coords[t2 - 1].y, this.coords[t2 - 1].z],
                    [this.coords[t3 - 1].x, this.coords[t3 - 1].y, this.coords[t3 - 1].z]];
            }
            if (isNaN(n1) == false && isNaN(n2) == false && isNaN(n3) == false) {
                triangle.normals = [[this.normals[n1 - 1].x, this.normals[n1 - 1].y, this.normals[n1 - 1].z],
                    [this.normals[n2 - 1].x, this.normals[n2 - 1].y, this.normals[n2 - 1].z],
                    [this.normals[n3 - 1].x, this.normals[n3 - 1].y, this.normals[n3 - 1].z]];
            }
            this.triangles.push(triangle);
        }
    }
}

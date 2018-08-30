/*var TRIANGLE = 0;
var DISTANCE = 1;
var MATERIAL = 2;
var COL_POINT = 3;
var MAX_DIST_INSIDE = 4;
var NORMAL = 5;*/
function RayTracer() {

    this.getCollision = function (scene, ray, group = "", minimal_distance = 1e-8) {
        if (scene.octree == undefined) {
            var min_dist = Infinity;
            var id = -1;
            var absolute_max = 0;
            for (var i = 0; i < scene.triangles.length; i++) {
                var dist = Triangle.intersection(ray, scene.triangles[i]);
                if (scene.triangles[i].group == group) {
                    if (dist > absolute_max) {
                        absolute_max = dist;
                    }
                    continue;
                }
                if (dist < min_dist && dist > minimal_distance) {
                    min_dist = dist;
                    id = i;
                }
            }
            if (id == -1)
                return new Collision(undefined, Infinity, undefined, undefined, absolute_max, undefined);
            var col_point = vec3.add(ray.o, vec3.mult(ray.dir, min_dist));
            var material = scene.triangles[id].getMaterial(col_point);
            return new Collision(scene.triangles[id], min_dist, material, col_point, absolute_max, scene.triangles[id].getNormal(ray.dir, col_point));
        }
        else {
            return Octree.rayIntersection(scene.octree, ray, group, minimal_distance);
        }
    }

    this.getColor = function (ray, collision, scene, diffused, reflected, refracted, sss) {
        if (diffused == undefined || isNaN(diffused.i)) {
            diffused = new col3(0, 0, 0, 0);
        }
        if (reflected == undefined || isNaN(reflected.i)) {
            reflected = new col3(0, 0, 0, 0);
        }
        if (refracted == undefined || isNaN(refracted.i)) {
            refracted = new col3(0, 0, 0, 0);
        }
        if (sss == undefined || isNaN(sss.i)) {
            sss = new col3(0, 0, 0, 0);
        }
        var collision_point = collision.colPoint;
        var normal = collision.normal;
        var angle = vec3.dot(normal, vec3.minus(ray.dir));
        var sssdiff;
        if (collision.material.sss_radius > 0)
            sssdiff = col3.add(col3.mult(diffused, new col3(1 - collision.material.sss_freq, 1 - collision.material.sss_freq, 1 - collision.material.sss_freq, 1 - collision.material.sss_freq)), col3.mult(sss, new col3(collision.material.sss_freq, collision.material.sss_freq, collision.material.sss_freq, collision.material.sss_freq)));
        else
            sssdiff = diffused;
        var diff_col = col3.mult(sssdiff, collision.material.diffuse);
        var refl_col = col3.mult(reflected, collision.material.reflect);
        var refr_col = col3.mult(refracted, collision.material.refract);
        var emis_col = collision.material.emission;

        var color = col3.addMany([diff_col, refl_col, refr_col, emis_col]);
        return [color, diffused, sss, reflected, refracted, collision.material.emission];
    }

    this.traceDiffused = function (scene, ray, bounce, collision, inside, distance) {
        var normal = collision.normal;
        var diffused = vec3.diffuse(ray.dir, normal);
        var origin = collision.colPoint;
        var newRay = new ray3(origin, diffused);
        var c = 1/*distance + collision.distance*/;
        var trace = this.traceRay(scene, newRay, bounce + 1, inside);
        var from_lights = new col3(0, 0, 0, 0);
        for (var i = 0; i < scene.lights.length; i++) {
            var light_color = scene.lights[i].getColor(this, scene, ray, collision)[0];
            from_lights = col3.add(from_lights, light_color);
        }
        return col3.add(col3.mult(trace[0], new col3(c, c, c, c)), from_lights);
    }
    this.traceReflected = function (scene, ray, bounce, collision, inside, distance) {
        var reflected = vec3.reflect(ray.dir, collision.normal);
        var newRay = new ray3(collision.colPoint, reflected);
        return this.traceRay(scene, newRay, bounce + 1, inside, distance + collision.distance)[0];
    }
    this.traceRefracted = function (scene, ray, bounce, collision, inside, distance) {
        var normal = collision.normal;
        var group = collision.triangle.group;
        var eta = collision.material.eta;
        var prev_eta = 1;
        if (group != undefined) {
            var index = inside.indexOf(group);
            if (index > -1) {
                inside.splice(index, 1);
                eta = 1 / eta;
                if (inside.length > 0)
                    prev_eta = inside[inside.length - 1];
            }
            else {
                if (inside.length > 0)
                    prev_eta = inside[inside.length - 1];
                inside.push(group);
            }
        }

        var refracted = vec3.refract(ray.dir, normal, eta / prev_eta);
        var orig = collision.colPoint;
        var newRay = new ray3(orig, refracted);
        var trace = this.traceRay(scene, newRay, bounce + 1, inside, distance + collision.distance);
        /*var from_lights = new col3(0,0,0,0);
        for(var i=0;i<scene.lights.length;i++) {
            var light_color = scene.lights[i].getCaustic(this, scene, collision, refracted);
            from_lights = col3.add(from_lights,light_color);
        }*/
        return /*vec3.add(*/trace[0]/*,from_lights)*/;
    }
    this.traceSubSurfaced = function (scene, ray, bounce, collision, inside, distance) {
        var normal = collision.normal;
        var sss = vec3.randomVector();
        /*if(vec3.dot(sss,normal)>0)
            sss = vec3.minus(sss);*/
        var origin = vec3.sub(collision.colPoint, vec3.mult(normal, collision.material.sss_radius));
        var displace = vec3.randomVector();
        origin = vec3.add(origin, vec3.mult(displace, Math.random() * collision.material.sss_radius));
        var newRay = new ray3(origin, sss);
        var trace = this.traceRay(scene, newRay, bounce + 1, inside, collision.triangle.group);
        var from_lights = new col3(0, 0, 0, 0);
        //collision[3] = origin;
        for (var i = 0; i < scene.lights.length; i++) {
            var light_color = scene.lights[i].getColor(this, scene, /*new ray3(ray.o,vec3.minus(ray.dir))*/undefined, collision, group = collision.triangle.group);
            var scalar = 1 - Math.min(1, light_color[1].maxDistInside / (collision.material.sss_trans));
            scalar *= scalar;
            from_lights = col3.add(from_lights, col3.mult(light_color[0], new col3(scalar, scalar, scalar, scalar)));
        }
        var traced = trace[0];
        var scalar = 1 - Math.min(1, trace[1].maxDistInside / (collision.material.sss_trans));
        scalar *= scalar;
        /*console.log("begin");
        console.log(scalar);
        console.log(trace[1]);*/
        return col3.add(col3.mult(trace[0], new col3(scalar, scalar, scalar, scalar)), from_lights);
    }
    this.traceRay = function (scene, ray, bounce = 0, inside = [], group = "", distance = 0) {
        if (bounce >= ImgCreator.bounces)
            return [scene.background(ray.dir), new Collision(undefined, Infinity, undefined, undefined, Infinity), undefined];
        var collision = this.getCollision(scene, ray, group);
        if (collision.triangle == undefined)
            return [scene.background(ray.dir), new Collision(undefined, Infinity, undefined, undefined, Infinity), undefined];
        var diffused = undefined;
        var reflected = undefined;
        var refracted = undefined;
        var sss = undefined;
        if (collision.material.diffuse != undefined && col3.energy(collision.material.diffuse) > 1e-8)
            diffused = this.traceDiffused(scene, ray, bounce, collision, inside, distance);
        if (collision.material.reflect != undefined && col3.energy(collision.material.reflect) > 1e-8)
            reflected = this.traceReflected(scene, ray, bounce, collision, inside, distance);
        if (collision.material.refract != undefined && col3.energy(collision.material.refract) > 1e-8)
            refracted = this.traceRefracted(scene, ray, bounce, collision, inside, distance);
        if (collision.material.sss_radius != undefined && collision.material.sss_radius > 0)
            sss = this.traceSubSurfaced(scene, ray, bounce, collision, inside, distance);
        var color = this.getColor(ray, collision, scene, diffused, reflected, refracted, sss);
        return [color[0], collision, color];
    }
}

var rayTracer = new RayTracer();

function Light(type, color, position, direction, radius) {
    this.type = type;
    this.color = color;
    this.position = position;
    this.direction = direction;
    this.radius = radius;
    if (this.radius == undefined)
        this.radius = 0;
    this.getColor = function (rayTracer, scene, ray, collision, group = "") {
        switch (this.type) {
            case "sun":
                var shadow_ray = new ray3(collision.colPoint, vec3.minus(this.direction));
                var shadow_col = rayTracer.getCollision(scene, shadow_ray, group);
                if (shadow_col.colPoint == undefined) {
                    if (ray == undefined)
                        return [this._getColor(collision.colPoint), shadow_col];
                    else
                        return [this._getColor(collision.colPoint, collision.normal, vec3.normal(this.direction), vec3.minus(ray.dir)), shadow_col];
                }
                return [new col3(0, 0, 0, 0), shadow_col];
            case "ambient":
                return [this._getColor(), shadow_col];
            case "point":
                if (ray != undefined)
                    var normal = collision.normal;
                var rand = Math.random();
                var position = vec3.add(this.position, vec3.mult(vec3.randomVector(), this.radius * rand * rand));
                var ctl = vec3.sub(position, collision.colPoint);
                var dist = vec3.len(ctl);
                var shadow_ray = new ray3(collision.colPoint, vec3.normal(ctl));
                var shadow_col = rayTracer.getCollision(scene, shadow_ray, group);
                if (shadow_col.triangle == undefined || shadow_col.distance > dist) {
                    if (ray == undefined)
                        return [this._getColor(collision.colPoint, undefined, undefined, undefined, dist), shadow_col];
                    else
                        return [this._getColor(collision.colPoint, normal, vec3.minus(shadow_ray.dir), vec3.minus(ray.dir), dist), shadow_col];
                }
                return [new col3(0, 0, 0, 0), shadow_col];
        }
    }
    this._getColor = function (point, normal, entering, leaving, dist) {	//entering, leaving with photon path direction
        switch (this.type) {
            case "sun":
                if (normal == undefined)
                    return this.color;
                var scalar = vec3.dot(vec3.minus(entering), normal);
                if (scalar <= 0)
                    return new col3(0, 0, 0, 0);
                var multiplier = new col3(scalar, scalar, scalar, scalar);
                return col3.mult(this.color, multiplier);
            case "point":
                var r = 1 / dist;
                if (normal == undefined)
                    return col3.mult(this.color, new col3(r, r, r, r));
                var scalar = vec3.dot(vec3.minus(entering), normal) * r;
                if (scalar <= 0)
                    return new col3(0, 0, 0, 0);
                var multiplier = new col3(scalar, scalar, scalar, scalar);
                return col3.mult(this.color, multiplier);
            case "ambient":
                return this.color;
            default:
                return new col3(0, 0, 0, 0);
        }
    }
}

Light.loadJSON = function (light) {
    return new Light(light.type,
        col3.fromArray(light.color),
        vec3.fromArray(light.position),
        vec3.fromArray(light.direction),
        light.radius);
}

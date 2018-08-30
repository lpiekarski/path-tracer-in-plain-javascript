function Material(diffuse, reflect, refract, eta, emission, sss_radius, sss_freq, sss_trans) {
    this.diffuse = diffuse;
    this.reflect = reflect;
    this.refract = refract;
    this.eta = eta;
    this.emission = emission;
    this.sss_radius = sss_radius;
    this.sss_freq = sss_freq;
    this.sss_trans = sss_trans;
    if (this.diffuse == undefined)
        this.diffuse = new col3(0, 0, 0, 0);
    if (this.reflect == undefined)
        this.reflect = new col3(0, 0, 0, 0);
    if (this.refract == undefined)
        this.refract = new col3(0, 0, 0, 0);
    if (this.eta == undefined)
        this.eta = 1;
    /*if(isNaN(this.eta))
        this.eta = 1;*/
    if (this.emission == undefined)
        this.emission = new col3(0, 0, 0, 0);
    if (this.sss_radius == undefined)
        this.sss_radius = 0;
    if (this.sss_freq == undefined)
        this.sss_freq = 0.5;
    if (this.sss_trans == undefined)
        this.sss_trans = 1;
    /*if(this.diffuse.i+this.reflect.i+this.refract.i>1) {
        var inv_sum = 1/(this.diffuse.i+this.reflect.i+this.refract.i);
        this.diffuse = col3.mult(this.diffuse,new col3(inv_sum,inv_sum,inv_sum,inv_sum));
        this.reflect = col3.mult(this.reflect,new col3(inv_sum,inv_sum,inv_sum,inv_sum));
        this.refract = col3.mult(this.refract,new col3(inv_sum,inv_sum,inv_sum,inv_sum));
    }*/
}

Material.loadJSON = function (material) {
    return new Material(col3.fromArray(material.diffuse),
        col3.fromArray(material.reflect),
        col3.fromArray(material.refract),
        material.eta,
        col3.fromArray(material.emission),
        material.sub_surface_radius,
        material.sub_surface_frequency,
        material.sub_surface_transparency);
}

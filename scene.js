function Scene() {
	this.load = function(input) {
		if(typeof input == "string")
			this.data = JSON.parse(fileReader.readAsText(input));
		else if(typeof input == "object")
			this.data = input;
		else
			return undefined;
		this.lights = [];
		if(this.data.lights != undefined) {
			for(var i=0;i<this.data.lights.length;i++)
				this.lights[i] = Light.loadJSON(this.data.lights[i]);
		}
		this.octree = new Octree(vec3.fromArray(this.data.octree_origin), this.data.octree_size);
		this.triangles = [];
		if(this.data.triangles != undefined) {
			for(var i=0;i<this.data.triangles.length;i++)
				//this.triangles[i] = Triangle.loadJSON(this.data.triangles[i]);
				Octree.addTriangle(this.octree, Triangle.loadJSON(this.data.triangles[i]));
		}
		if(this.data.quads != undefined) {
			for(var i=0;i<this.data.quads.length;i++) {
				var ts = Triangle.loadFromQuadJSON(this.data.quads[i]);
				//this.triangles.push(ts[0]);
				//this.triangles.push(ts[1]);
				Octree.addTriangle(this.octree, ts[0]);
				Octree.addTriangle(this.octree, ts[1]);
			}
		}
		if(this.data.meshes != undefined) {
			for(var i=0;i<this.data.meshes.length;i++) {
				var objLoader = new ObjLoader();
				var mat = this.data.meshes[i].material;
				var group = this.data.meshes[i].group;
				var offset = this.data.meshes[i].offset;
				var texture = this.data.meshes[i].texture;
				var tex_normal = this.data.meshes[i].normal_map;
				var tex_reflect = this.data.meshes[i].reflect_map;
				var tex_refract = this.data.meshes[i].refract_map;
				var tex_emission = this.data.meshes[i].emission_map;
				var tex_sss = this.data.meshes[i].sss_map;
				var tex_eta = this.data.meshes[i].eta_map;
				objLoader.load(this.data.meshes[i].file, offset, mat, group, texture, tex_normal, tex_reflect, tex_refract, tex_emission, tex_sss, tex_eta);
				for(var j=0;j<objLoader.triangles.length;j++) {
					//this.triangles.push(Triangle.loadJSON(objLoader.triangles[j]));
					Octree.addTriangle(this.octree, Triangle.loadJSON(objLoader.triangles[j]));
				}
			}
		}
		this._background = col3.fromArray(this.data.background);
		
	}
	this.background = function(dir) {
		/*var r = Math.sin(dir.x*dir.z*6)*Math.cos(dir.y*12);
		var g = Math.sin(dir.x*6)*Math.sin(dir.y*dir.z*12);
		var b = Math.cos(dir.z*12);
		var col = new col3(r/2+0.5,g/2+0.5,b/2+0.5,1);
		col = new col3(col.r*col.g*col.b,(col.r+col.g+col.b)/3,col.r*col.g+col.r*col.b+col.g*col.b,1);
		var g = 1;
		var w = 0.2;
		if(Math.abs(dir.y)<=w)
			g = (dir.y+w)/(2*w);
		if(dir.y<-w)
			g = 0;
		col = new col3((col.r+col.g+col.b),(col.r+col.g+col.b),(col.r+col.g+col.b),g/3);
		return col;*/
		return this._background;
	}
}

var scene = new Scene();

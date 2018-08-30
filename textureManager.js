
function TextureManager() {
	this.textures = [];
	
	this.loadTexture = function(filepath) {
		TextureManager.loaded = false;
		if(this.getId(filepath) != -1)
			return;
		var tex = document.createElement("IMG");
		tex.onload = function() {console.log("loaded");}
		tex.src = filepath;
		var canv = document.createElement('canvas');
		canv.width = tex.width;
		canv.height = tex.height;
		canv.getContext('2d').drawImage(tex, 0, 0, tex.width, tex.height);
		var data = [];
		var d = canv.getContext('2d').getImageData(0, 0, tex.width, tex.height).data;
		for(var x=0;x<tex.width;x++)
			data[x] = [];
		for(var y=0;y<tex.height;y++) {
			for(var x=0;x<tex.width;x++) {
				data[x][y] = [d[4*(x+y*tex.width)],d[4*(x+y*tex.width)+1],d[4*(x+y*tex.width)+2],d[4*(x+y*tex.width)+3]];			
			}		
		}
		this.textures.push([tex,data,filepath,canv]);
	}
	this.getId = function(filepath) {
		for(var i=0;i<this.textures.length;i++) {
			if(this.textures[i][2]==filepath)
				return i;
		}
		return -1;
	}
	this.unloadTexture = function(id) {
		this.textures.slice(id,1);
	}
	this.getColor = function(texId, coord) {
		var p = this.textures[texId][1][Math.floor((coord.x-Math.floor(coord.x))*this.textures[texId][3].width)][Math.floor((coord.y-Math.floor(coord.y))*this.textures[texId][3].height)];
		var col = new col3(p[0]/255,p[1]/255,p[2]/255,p[3]/255);
		return col;
	}
}

textureManager = new TextureManager();

function ImgCreator() {

    ImgCreator._drawLinePersp = function () {
        //console.log("rendering line "+ImgCreator.y+"("+ImgCreator.ctx+", "+ImgCreator.scene+", "+ImgCreator.samples+", "+ImgCreator.width+" "+ImgCreator.height+", "+ImgCreator.dw+", "+ImgCreator.dh+")");
        var mx_dim = Math.max(ImgCreator.width, ImgCreator.height);
        if (ImgCreator.y > 10) {
            ImgCreator.ctx.fillStyle = "rgb(255,255,255)";
            ImgCreator.ctx.fillRect(0, ImgCreator.y * ImgCreator.scale_h, ImgCreator.width * ImgCreator.scale_w, ImgCreator.scale_h + 1);
        }

        for (var x = 0; x < ImgCreator.width; x++) {
            var col = new col3(0, 0, 0, 0);
            var diff = new col3(0, 0, 0, 0);
            var sss = new col3(0, 0, 0, 0);
            var refl = new col3(0, 0, 0, 0);
            var refr = new col3(0, 0, 0, 0);
            var dist = 0;
            var normal = new vec3(0, 0, 0);
            for (var i = 0; i < ImgCreator.samples; i++) {
                var r1 = Math.random(), r2 = Math.random();
                dir = new vec3(((x + r1) - ImgCreator.width / 2) / (mx_dim / 2) * ImgCreator.dw, ((ImgCreator.height - (ImgCreator.y + r2)) - ImgCreator.height / 2) / (mx_dim / 2) * ImgCreator.dh, 1, ImgCreator.basis);
                dir = vec3.mult(dir, ImgCreator.depth);
                var dpos = new vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, 0, ImgCreator.basis);
                dpos = vec3.mult(dpos, ImgCreator.net_size);
                var pos = vec3.add(ImgCreator.position, dpos);//new vec3(ImgCreator.position.x+(Math.random()*2-1)*ImgCreator.net_size,ImgCreator.position.y+(Math.random()*2-1)*ImgCreator.net_size,ImgCreator.position.z+(Math.random()*2-1)*ImgCreator.net_size);
                var ray = new ray3(pos, vec3.sub(dir, vec3.sub(pos, ImgCreator.position)));
                var traced = rayTracer.traceRay(ImgCreator.scene, ray, 0);
                col = col3.add(col, traced[0]);
                if (ImgCreator.additional_screens) {
                    dist += traced[1][1];
                    if (traced[2] != undefined) {
                        sss = col3.add(sss, traced[2][1]);
                        diff = col3.add(diff, traced[2][2]);
                        refl = col3.add(refl, traced[2][3]);
                        refr = col3.add(refr, traced[2][4]);
                    }

                    if (traced[1][0] != undefined)
                        normal = vec3.add(normal, traced[1][0].getNormal(ray.dir, traced[1][3]));
                    else
                        normal = vec3.add(normal, new vec3(0, 0, -1));
                }
            }
            col.i /= ImgCreator.samples;
            col.i *= ImgCreator.exposure;
            if (ImgCreator.additional_screens) {
                sss.i /= ImgCreator.samples;
                sss.i *= ImgCreator.exposure;
                diff.i /= ImgCreator.samples;
                diff.i *= ImgCreator.exposure;
                refl.i /= ImgCreator.samples;
                refl.i *= ImgCreator.exposure;
                refr.i /= ImgCreator.samples;
                refr.i *= ImgCreator.exposure;

                dist /= ImgCreator.samples;
                dist /= ImgCreator.zScale;

                normal = vec3.mult(normal, 1 / ImgCreator.samples);
                normal = new col3(normal.x / 2 + 0.5, normal.z / 2 + 0.5, normal.y / 2 + 0.5, vec3.len(normal));
            }
            ImgCreator.ctx.fillStyle = col3.getRGB(col);
            ImgCreator.ctx.fillRect(x * ImgCreator.scale_w, ImgCreator.y * ImgCreator.scale_h, ImgCreator.scale_w, ImgCreator.scale_h);

            if (ImgCreator.additional_screens) {
                var off_x = 0, off_y = 0;
                //sub surface scattering screen
                ImgCreator.ctx.fillStyle = col3.getRGB(sss);
                ImgCreator.ctx.fillRect((x * ImgCreator.scale_w) / 2 + ImgCreator.width * ImgCreator.scale_w + off_x * ImgCreator.width * ImgCreator.scale_w / 2, (ImgCreator.y * ImgCreator.scale_h) / 2 + off_y * ImgCreator.height * ImgCreator.scale_h / 2, Math.max(ImgCreator.scale_w / 2, 1), Math.max(ImgCreator.scale_h / 2, 1));
                off_x = 1;
                off_y = 0;
                //diffuse screen
                ImgCreator.ctx.fillStyle = col3.getRGB(diff);
                ImgCreator.ctx.fillRect((x * ImgCreator.scale_w) / 2 + ImgCreator.width * ImgCreator.scale_w + off_x * ImgCreator.width * ImgCreator.scale_w / 2, (ImgCreator.y * ImgCreator.scale_h) / 2 + off_y * ImgCreator.height * ImgCreator.scale_h / 2, Math.max(ImgCreator.scale_w / 2, 1), Math.max(ImgCreator.scale_h / 2, 1));
                off_x = 0;
                off_y = 1;
                //reflect screen
                ImgCreator.ctx.fillStyle = col3.getRGB(refl);
                ImgCreator.ctx.fillRect((x * ImgCreator.scale_w) / 2 + ImgCreator.width * ImgCreator.scale_w + off_x * ImgCreator.width * ImgCreator.scale_w / 2, (ImgCreator.y * ImgCreator.scale_h) / 2 + off_y * ImgCreator.height * ImgCreator.scale_h / 2, Math.max(ImgCreator.scale_w / 2, 1), Math.max(ImgCreator.scale_h / 2, 1));
                off_x = 1;
                off_y = 1;
                //refract screen
                ImgCreator.ctx.fillStyle = col3.getRGB(refr);
                ImgCreator.ctx.fillRect((x * ImgCreator.scale_w) / 2 + ImgCreator.width * ImgCreator.scale_w + off_x * ImgCreator.width * ImgCreator.scale_w / 2, (ImgCreator.y * ImgCreator.scale_h) / 2 + off_y * ImgCreator.height * ImgCreator.scale_h / 2, Math.max(ImgCreator.scale_w / 2, 1), Math.max(ImgCreator.scale_h / 2, 1));
            }
        }
        ImgCreator.lines_done++;
        if (ImgCreator.lines_done >= ImgCreator.height) {
            if (ImgCreator.preview) {
                ImgCreator.done = true;
                console.log("done preview");
                ImgCreator.samples = ImgCreator._samples;
                ImgCreator.width = ImgCreator._width;
                ImgCreator.height = ImgCreator._height;
                ImgCreator.scale_w = ImgCreator._scale_w;
                ImgCreator.scale_h = ImgCreator._scale_h;
                ImgCreator.y = 0;
                ImgCreator.lines_done = 0;
                ImgCreator.reminder = 0;
                clearInterval(ImgCreator._drawLineInterval);
                ImgCreator.preview = false;
                ImgCreator._drawLineInterval = setInterval(ImgCreator._drawLinePersp, 0);
            }
            else {
                ImgCreator.done = true;
                console.log("done");
                clearInterval(ImgCreator._drawLineInterval);
                canvas.export(ImgCreator.input + ".png");
            }

        }
        ImgCreator.y += ImgCreator.jump;
        if (ImgCreator.y >= ImgCreator.height) {
            ImgCreator.reminder++;
            ImgCreator.y = ImgCreator.reminder;
        }
    }
    this.drawImageByLine = function (input, ctx, scene) {
        if (typeof input == "string")
            ImgCreator.data = JSON.parse(fileReader.readAsText(input));
        else if (typeof input == "object")
            ImgCreator.data = input;
        else
            return undefined;
        ImgCreator.input = input;

        ImgCreator.ctx = ctx;
        ImgCreator.scene = scene;
        ImgCreator.additional_screens = ImgCreator.data.additional_screens;
        ImgCreator.bounces = ImgCreator.data.bounces;
        ImgCreator._samples = ImgCreator.data.samples;
        if (ImgCreator.data.preview)
            ImgCreator.samples = 1;
        else
            ImgCreator.samples = ImgCreator.data.samples;
        if (ImgCreator.additional_screens) {
            ImgCreator._width = canvas.width / ImgCreator.data.pixel_size / 2;
            ImgCreator.width = (canvas.width / ImgCreator.data.pixel_size / 2);
            ImgCreator._height = canvas.height / ImgCreator.data.pixel_size;
            ImgCreator.height = (canvas.height / ImgCreator.data.pixel_size);
        }
        else {
            ImgCreator._width = canvas.width / ImgCreator.data.pixel_size;
            ImgCreator.width = (canvas.width / ImgCreator.data.pixel_size);
            ImgCreator._height = canvas.height / ImgCreator.data.pixel_size;
            ImgCreator.height = (canvas.height / ImgCreator.data.pixel_size);
        }

        ImgCreator.dw = ImgCreator.data.dw;
        ImgCreator.dh = ImgCreator.data.dh;
        ImgCreator.exposure = ImgCreator.data.exposure;
        ImgCreator.y = 0;
        ImgCreator.lines_done = 0;
        ImgCreator.reminder = 0;
        ImgCreator.jump = ImgCreator.data.jump;
        ImgCreator._scale_w = ImgCreator.data.pixel_size;
        ImgCreator.scale_w = ImgCreator.data.pixel_size;
        ImgCreator._scale_h = ImgCreator.data.pixel_size;
        ImgCreator.scale_h = ImgCreator.data.pixel_size;
        ImgCreator.done = false;
        ImgCreator.position = vec3.fromArray(ImgCreator.data.position);
        ImgCreator.rotx = ImgCreator.data.rotx;
        ImgCreator.roty = ImgCreator.data.roty;
        ImgCreator.zScale = ImgCreator.data.zScale;
        ImgCreator.net_size = ImgCreator.data.net_size;
        ImgCreator.depth = ImgCreator.data.depth;
        var dir = new vec3(0, 0, 1);
        dir = vec3.rotate(dir, new vec3(1, 0, 0), ImgCreator.roty);
        dir = vec3.rotate(dir, new vec3(0, 1, 0), ImgCreator.rotx);
        ImgCreator.basis = [];
        ImgCreator.basis[2] = new vec3(dir.x, dir.y, dir.z);
        ImgCreator.basis[0] = vec3.cross(ImgCreator.basis[2], new vec3(0, 1, 0));
        if (vec3.len2(ImgCreator.basis[0]) == 0)
            ImgCreator.basis[0] = new vec3(1, 0, 0);
        ImgCreator.basis[1] = vec3.cross(ImgCreator.basis[0], ImgCreator.basis[2]);
        ImgCreator.basis[0] = vec3.minus(vec3.normal(ImgCreator.basis[0]));
        ImgCreator.basis[1] = vec3.normal(ImgCreator.basis[1]);
        ImgCreator.basis[2] = vec3.normal(ImgCreator.basis[2]);

        ImgCreator.preview = ImgCreator.data.preview;

        ImgCreator._drawLineInterval = setInterval(ImgCreator._drawLinePersp, 0);
    }

}

var imgCreator = new ImgCreator();

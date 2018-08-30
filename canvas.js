function Canvas(canvas_id) {
    this._canvas = document.getElementById(canvas_id);
    this.height = this._canvas.height;
    this.width = this._canvas.width;
    this.ctx = this._canvas.getContext("2d");
    this.setFillColor = function (col) {
        this.ctx.fillStyle = col;
    }
    this.setStrokeColor = function (col) {
        this.ctx.strokeStyle = col;
    }
    this.drawAlpha = function (RW, RH, col1 = "rgb(60,60,60)", col2 = "rgb(150,150,150)") {
        for (var y = 0; y < this.height / RH; y++) {
            for (var x = 0; x < this.width / RW; x++) {
                if ((x + y) % 2 == 0)
                    this.setFillColor(col1);
                else
                    this.setFillColor(col2);
                this.ctx.fillRect(x * RW, y * RH, RW, RH);
            }
        }
    }


    this.export = function (fileName) {

        var MIME_TYPE = "image/png";

        var imgURL = this._canvas.toDataURL(MIME_TYPE);

        var dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    }


}

var canvas = new Canvas("CANVAS_ID");

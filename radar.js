class Radar {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.blips = new MessageBlips();

        this.message = "Hello from Java Script!";
        this.persistence = 0;
        this.blipParams = Radar.getBlipParams(this.persistence);

        this.screenColor = "rgb(0, 100, 0)"
        this.angle = 0.0;
        this.degrees = 0;
        this.step = (2.0 * Math.PI) / 90.0;

        this.words = this.message.split(" ");
        this.wordIdx = 0;
        this.wordBlips = [];

        window.requestAnimationFrame(()=>this.draw());
    }

    draw() {
        const x = 60.0 + (Math.cos(this.angle) * 55.0);
        const y = 60.0 - (Math.sin(this.angle) * 55.0);

        this.angle -= this.step;
        this.degrees -= 4;
        if (this.degrees < 0) {
            this.angle = 2 * Math.PI - this.step;
            this.degrees = 356;
        } else if (this.degrees === 272) {
            this.blips.word(this.words[this.wordIdx]).map(
                (coord) => new Blip(coord.x, coord.y, this.blipParams)
            ).forEach((b) => this.wordBlips.push(b));
            this.wordIdx = (this.wordIdx + 1) % this.words.length;
        }

        this.ctx.strokeStyle = "rgb(255, 255, 255)";
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0, 0, 120, 120);
        this.ctx.fillStyle = this.screenColor;
        this.ctx.beginPath();
        this.ctx.arc(60, 60, 55, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = "rgb(255,255,255)"

        this.wordBlips = this.wordBlips.filter((blip) => {
            blip.display(this.degrees, this.ctx);
            return !blip.done;
        });

        this.ctx.beginPath();
        this.ctx.moveTo(60, 60);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        window.requestAnimationFrame(()=>this.draw());
    }



    static getBlipParams(persistence) {
        switch(persistence) {
            case 0:
                return {step: {r: 4, g: 2, b: 4}, delay: 0, fade: false};
            case 1:
                return {step: {r: 8, g: 4, b: 8}, delay: 0, fade: true};
            case 2:
                return {step: {r: 2, g: 1, b: 2}, delay: 0, fade: false};
            case 3:
            default:
                return {step: {r: 8, g: 4, b: 8}, delay: 50, fade: false};
        }
    }
}

class Blip {
    constructor(xin, yin, params) {
        this.x = xin;
        this.y = yin;
        this.params = params;

        this.showing = false;
        this.onAngle = 0;
        this.fade = params.fade;
        this.delay = params.delay;
        this.done = false;
        this.red = 255;
        this.green = 255;
        this.blue = 255;

        const rx = xin-60;
        const ry = 60-yin;

        if (rx === 0) {
            this.onAngle = (ry > 0) ? 88 : 268;

            return;
        }

        let rAngle = Math.atan(ry / rx);
        this.onAngle = Math.trunc((180 * rAngle) / Math.PI);

        if (rx < 0) {
            this.onAngle += 180;
        } else if (ry < 0) {
            this.onAngle += 360;
        }
        this.onAngle = Math.trunc(this.onAngle / 4) * 4 - 4;
        if (this.onAngle <= -4) {
            this.onAngle = 356;
        }
    }

    display(angle, ctx) {
        if (this.done) {
            return;
        }

        if (this.showing) {
            if (this.fade) {
                if (angle === 268) {
                    this.fade = false;
                }
            } else if (this.delay !== 0) {
                this.delay--;
            } else {
                this.red -= this.params.step.r;
                this.green -= this.params.step.g;
                this.blue -= this.params.step.b;

                if (this.red < 0) { this.red = 0; }
                if (this.green < 100) { this.green = 100; }
                if (this.blue < 0) { this.blue = 0; }

                if (this.red === 0 && this.green === 100 && this.blue === 0) {
                    this.done = true;

                    return;
                }
            }

            ctx.fillStyle = "rgb("+this.red+","+this.green+","+this.blue+")";
            ctx.fillRect(this.x-1, this.y-1, 2, 2);
        } else if (angle === this.onAngle) {
            this.showing = true;
        }
    }
}

document.addEventListener("DOMContentLoaded", ()=>new Radar(document.getElementById("radar")))

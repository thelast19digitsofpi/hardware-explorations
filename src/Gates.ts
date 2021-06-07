// Gates.ts

import Component from "./Component";
import Wire from "./Wire";

abstract class Gate implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public rotation: number;

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, size: number, rotation: number, bits: number) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: size,
            y: size
        };

        this.state = {
            bits: [false],
        };

        this.rotation = rotation * Math.PI / 180;

        const cosine = Math.cos(this.rotation);
        const sine = Math.sin(this.rotation);
        // transform [±0.3, -0.5]
        if (bits == 2) {
            this.inputSockets = [
                {
                    x: size * (-0.2*cosine + 0.5*sine),
                    y: size * (-0.5*cosine - 0.2*sine),
                },
                {
                    x: size * (0.2*cosine + 0.5*sine),
                    y: size * (-0.5*cosine + 0.2*sine)
                }
            ];
        } else {
            this.inputSockets = [{
                x: size * 0.5*sine,
                y: size * -0.5*cosine,
            }]
        }

        this.outputSockets = [
            {
                x: size * -0.4*sine,
                y: size * 0.4*cosine,
            }
        ];

        this.inputWires = [];
    }
    beforeUpdate: undefined;

    onClick(_offsetX: number, _offsetY: number): void {
        return;
    };

    abstract drawGate(ctx: CanvasRenderingContext2D): void;

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // base
        ctx.fillStyle = "#cccccc";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        // draw the wires coming in
        ctx.beginPath();
        if (this.inputSockets.length === 2) {
            ctx.moveTo(this.size.x * -0.2, this.size.y * -0.5);
            ctx.lineTo(this.size.x * -0.2, 0);
            ctx.moveTo(this.size.x * 0.2, this.size.y * -0.5);
            ctx.lineTo(this.size.x * 0.2, 0);
            ctx.stroke();
        }

        this.drawGate(ctx);

        ctx.restore();
    }

    abstract evaluate(bits: boolean[]): boolean[];
}

class AndGate extends Gate {
    constructor(x: number, y: number, size: number, degrees: number) {
        super(x, y, size, degrees, 2);
    }
    drawGate(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.size.x * 0.4, -this.size.y * 0.4);
        ctx.lineTo(this.size.x * 0.4, 0);
        ctx.arc(0, 0, this.size.x * 0.4, 0, Math.PI);
        ctx.lineTo(-this.size.x * 0.4, -this.size.y * 0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    };
    evaluate(bits: boolean[]): boolean[] {
        return [bits[0] && bits[1]];
    };
}

class OrGate extends Gate {
    constructor(x: number, y: number, size: number, degrees: number) {
        super(x, y, size, degrees, 2);
    }
    drawGate(ctx: CanvasRenderingContext2D) {
        const s = this.size.x;
        ctx.beginPath();
        ctx.moveTo(s * 0.4, s * -0.4);
        ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
        ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.4);
        ctx.quadraticCurveTo(s * 0, s * -0.2, s * 0.4, s * -0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    };
    evaluate(bits: boolean[]): boolean[] {
        return [bits[0] || bits[1]];
    };
}

class XorGate extends Gate {
    constructor(x: number, y: number, size: number, degrees: number) {
        super(x, y, size, degrees, 2);
    }
    drawGate(ctx: CanvasRenderingContext2D) {
        const s = this.size.x;
        // do the or's path...
        ctx.beginPath();
        ctx.moveTo(s * 0.4, s * -0.35);
        ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
        ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.35);
        ctx.quadraticCurveTo(s * 0, s * -0.15, s * 0.4, s * -0.35);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        // and the extra thing
        ctx.beginPath();
        ctx.moveTo(s * -0.4, s * -0.5);
        ctx.quadraticCurveTo(s * 0, s * -0.3, s * 0.4, s * -0.5);
        ctx.stroke();
    };
    evaluate(bits: boolean[]): boolean[] {
        return [bits[0] !== bits[1]];
    };
}

class Not extends Gate {
    constructor(x: number, y: number, size: number, degrees: number) {
        super(x, y, size, degrees, 1);
    }

    drawGate(ctx: CanvasRenderingContext2D) {
        const s = this.size.y;
        // wire in
        ctx.beginPath();
        ctx.moveTo(0, s * -0.5);
        ctx.lineTo(0, 0);
        ctx.stroke();
        // triangle for the not
        ctx.beginPath();
        ctx.moveTo(0, s * 0.2);
        ctx.lineTo(s * -0.25, s * -0.35);
        ctx.lineTo(s * 0.25, s * -0.35);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, s * 0.3, s * 0.1, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    render(ctx: CanvasRenderingContext2D) {
        Gate.prototype.render.call(this, ctx);
    };
    onClick(_: number, __: number) {};
    evaluate(bits: boolean[]): boolean[] {
        return [!bits[0]];
    };
}

export {AndGate, OrGate, XorGate, Not};

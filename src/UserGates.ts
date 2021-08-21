// NotSwitch.ts
//
// Switch between NOT gate and simple wire

import Component from "./Component";
import Wire from "./Wire";

// NOTE: Make this abstract

abstract class UserGate implements Component {
    public state: {
        bits: boolean[],
        whichGate: number,
    };
    public numGates: number;
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public rotation: number;
    public symbol: string = "";

    constructor(x: number, y: number, size: number, rotation: number, bits: number, numGates: number) {
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
            whichGate: 0,
        };
        this.numGates = numGates;

        this.rotation = rotation * Math.PI / 180;

        const cosine = Math.cos(this.rotation);
        const sine = Math.sin(this.rotation);
        // transform [±0.3, -0.5]
        if (bits == 2) {
            this.inputSockets = [
                {
                    x: size * (-0.15*cosine + 0.5*sine),
                    y: size * (-0.5*cosine - 0.15*sine),
                },
                {
                    x: size * (0.15*cosine + 0.5*sine),
                    y: size * (-0.5*cosine + 0.15*sine)
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
                x: size * -0.5*sine,
                y: size * 0.5*cosine,
            }
        ];

        this.inputWires = [];
    }
    onClick(offsetX: number, offsetY: number): boolean {
        // rotate them
        const cosine = Math.cos(this.rotation);
        const sine = Math.sin(this.rotation);
        // the sizes are both the same
        const realX = (offsetX * cosine + offsetY * sine) / this.size.x;
        const realY = (offsetY * cosine - offsetY * sine) / this.size.y;
        if (-0.3 < realY && realY < 0.3) {
            if (-0.5 < realX && realX < -0.3) {
                this.state.whichGate = (this.state.whichGate - 1 + this.numGates) % this.numGates;
                return true;
            }
            if (0.3 < realX && realX < 0.5) {
                this.state.whichGate = (this.state.whichGate + 1) % this.numGates;
                return true;
            }
        }
        return false;
    };
    beforeUpdate: undefined;


    abstract drawGate(ctx: CanvasRenderingContext2D): void;

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.save();

        // base
        ctx.fillStyle = isDark ? "#222" : "#ddd";
        ctx.strokeStyle = isDark ? "#aaa" : "black";
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

        // this is new
        const sx = this.size.x, sy = this.size.y;
        ctx.beginPath();
        ctx.moveTo(0,        sy * -0.5);
        ctx.lineTo(sx *  0.4, sy * -0.5);
        ctx.arcTo (sx *  0.5, sy * -0.5, sx *  0.5, sy * -0.4, sy * 0.1);
        ctx.lineTo(sx *  0.5, sy *  0.4);
        ctx.arcTo (sx *  0.5, sy *  0.5, sx *  0.4, sy *  0.5, sy * 0.1);
        ctx.lineTo(sx * -0.4, sy *  0.5);
        ctx.arcTo (sx * -0.5, sy *  0.5, sx * -0.5, sy *  0.4, sy * 0.1);
        ctx.lineTo(sx * -0.5, sy * -0.4);
        ctx.arcTo (sx * -0.5, sy * -0.5, sx * -0.4, sy * -0.5, sy * 0.1);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        this.drawGate(ctx);

        // arrow buttons
        ctx.fillStyle = isDark ? "#939699" : "#333";
        ctx.beginPath();
        ctx.moveTo(sx * 0.5, 0);
        ctx.lineTo(sx * 0.3, sy * -0.3);
        ctx.lineTo(sx * 0.3, sy * +0.3);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx * -0.5, 0);
        ctx.lineTo(sx * -0.3, sy * -0.3);
        ctx.lineTo(sx * -0.3, sy * +0.3);
        ctx.fill();

        ctx.rotate(-this.rotation);
        ctx.font = Math.round(this.size.y * 0.4) + "px monospace";
        ctx.fillStyle = isDark ? "#939699" : "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.symbol, 0, 0);

        ctx.restore();
    };

    abstract evaluate(bits: boolean[]): boolean[];
};

// binary, as in operator, as in takes two inputs (and/or/xor)
class BinarySwitch extends UserGate {
    constructor(x: number, y: number, size: number, rotation: number) {
        super(x, y, size, rotation, 2, 3);
    }
    beforeUpdate: undefined;

    drawGate(ctx: CanvasRenderingContext2D) {
        const s = this.size.y * 0.6;
        // wire in
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.size.y * +0.5);
        const xOffset = this.size.x * 0.15;
        ctx.moveTo(-xOffset, 0);
        ctx.lineTo(-xOffset, this.size.y * -0.5);
        ctx.moveTo(xOffset, 0);
        ctx.lineTo(xOffset, this.size.y * -0.5);
        ctx.stroke();

        switch (this.state.whichGate) {
            case 0: // and
                ctx.beginPath();
                ctx.moveTo(s * 0.4, -s * 0.4);
                ctx.lineTo(s * 0.4, 0);
                ctx.arc(0, 0, s * 0.4, 0, Math.PI);
                ctx.lineTo(-s * 0.4, -s * 0.4);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                this.symbol = "&";
                break;
            case 1: // or
                ctx.beginPath();
                ctx.moveTo(s * 0.4, s * -0.4);
                ctx.quadraticCurveTo(s * 0.4, s * 0.1, 0, s * 0.4);
                ctx.quadraticCurveTo(s * -0.4, s * 0.1, s * -0.4, s * -0.4);
                ctx.quadraticCurveTo(s * 0, s * -0.2, s * 0.4, s * -0.4);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                this.symbol = "O";
                break;
            case 2: // xor
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
                this.symbol = "X";
                break;
        }
    }

    evaluate(bits: boolean[]): boolean[] {
        switch (this.state.whichGate) {
            case 0:
                return [bits[0] && bits[1]];
            case 1:
                return [bits[0] || bits[1]];
            case 2:
                return [bits[0] !== bits[1]];
            default:
                throw new Error(`Invalid state ${this.state.whichGate}`);
        }
    };
}

class NotSwitch extends UserGate {
    constructor(x: number, y: number, size: number, rotation: number) {
        super(x, y, size, rotation, 1, 2);
        this.state = {
            bits: [false],
            whichGate: 0,
        }
    }
    beforeUpdate: undefined;

    drawGate(ctx: CanvasRenderingContext2D) {
        const s = this.size.y * 0.75;
        // wire in
        ctx.beginPath();
        ctx.moveTo(0, this.size.y * -0.5);
        ctx.lineTo(0, this.size.y * +0.5);
        ctx.stroke();

        if (this.state.whichGate === 1) {
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
    }

    evaluate(bits: boolean[]): boolean[] {
        return [(this.state.whichGate === 1) ? !bits[0] : bits[0]];
    }
}

export {NotSwitch, BinarySwitch};

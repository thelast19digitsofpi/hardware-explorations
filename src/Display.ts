// Display.ts
//
// Given a set of bits, displays its value as a signed or unsigned integer.

import Component from "./Component";
import Wire from "./Wire";

class Display implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public numBits: number;

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, bits: number) {
        this.position = {
            x: x,
            y: y,
        };

        const width = 200;
        this.size = {
            x: width,
            y: 100
        };

        this.state = {
            bits: [],
        };

        this.numBits = bits;

        this.inputSockets = [];
        // spacing between the bits
        const spacing = width / (2 * bits);
        for (let i = 0; i < bits; i++) {
            this.inputSockets.push({
                x: -spacing * (i + 0.5) + width/2,
                y: -this.size.y/2,
            });
            this.inputSockets.unshift({
                x: spacing * (i + 0.5) - width/2,
                y: -this.size.y/2,
            });
        }

        this.outputSockets = [];
        for (let i = 0; i < bits; i++) {
            this.outputSockets.push({
                x: -spacing * (i - (bits-1)/2),
                y: this.size.y/2,
            });
        }
        // carry
        this.outputSockets.push({
            x: -this.size.x*0.375,
            y: 0,
        });

        this.inputWires = [];
    }

    onClick(_offsetX: number, _offsetY: number): void {
        return;
    };

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        // base
        ctx.fillStyle = "#cccccc";
        ctx.beginPath();
        ctx.moveTo(left,               top);
        ctx.lineTo(left + this.size.x, top);
        ctx.lineTo(left + this.size.x, top + this.size.y);
        ctx.lineTo(left,               top + this.size.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = Math.round(Math.min(this.size.x/2, this.size.y*2/3)) + "px monospace";
        

        ctx.restore();
    }

    evaluate(bits: boolean[]): boolean[] {
        let num1 = 0, num2 = 0;
        // cheating here but that's not the point
        for (let i = 0; i < this.numBits; i++) {
            num1 += Number(bits[i]) * (1 << i);
            num2 += Number(bits[i + this.numBits]) * (1 << i);
        }

        const answer = num1 + num2;
        let answerBits = Array(this.numBits + 1);
        for (let i = 0; i <= this.numBits; i++) {
            answerBits[i] = (answer & (1 << i)) > 0;
        }
        console.log(answerBits);
        return answerBits;
    }
}

export default Display;

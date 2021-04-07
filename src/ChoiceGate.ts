// RegisterBit.ts
//
// Has an "on" input and an "off" input.
// Does nothing if both are on or both are off.

import Component from "./Component";
import Wire from "./Wire";

class ChoiceGate implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, size: number = 30) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: size*2,
            y: size,
        };

        this.state = {
            bits: [false],
        };
        const offset = size * 0.44;
        this.inputSockets = [
            {x: -this.size.x * 1/3, y: 0},
            {x: -offset, y: -this.size.y/2},
            {x: +offset, y: -this.size.y/2}
        ];

        this.outputSockets = [
            {x: 0, y: size/2},
        ];

        this.inputWires = [];
    }

    onClick(_offsetX: number, _offsetY: number): void {
        return;
    };

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        ctx.translate(left, top);
        // base
        ctx.fillStyle = "#cccccc";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size.x*1.0, 0);
        ctx.lineTo(this.size.x*0.67, this.size.y);
        ctx.lineTo(this.size.x*0.33, this.size.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // red input

        ctx.restore();
    }
    // If the "set" input is on, change to the "what" input
    evaluate(bits: boolean[]): boolean[] {
        return [bits[0] ? bits[1] : bits[2]];
    }
}

export default ChoiceGate;

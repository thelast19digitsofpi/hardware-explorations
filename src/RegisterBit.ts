// RegisterBit.ts
//
// Has an "on" input and an "off" input.
// Does nothing if both are on or both are off.

import Component from "./Component";
import { getBitColor, getStrokeColor } from "./dark";
import Wire from "./Wire";

class RegisterBit implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    beforeUpdate: undefined;

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, size: number = 30) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: size,
            y: size,
        };

        this.state = {
            bits: [false],
        };

        // [0] is the off switch and [1] is the on switch
        const offset = size * 0.45;
        this.inputSockets = [
            {x: -offset, y: -offset},
            {x:  offset, y: -offset}
        ];

        this.outputSockets = [
            {x: 0, y: size/2},
        ];

        this.inputWires = [];
    }

    onClick: undefined;

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        ctx.translate(left, top);
        // base
        ctx.fillStyle = getBitColor(this.state.bits[0], isDark);
        ctx.beginPath();
        ctx.moveTo(this.size.x*0.5, 0);
        ctx.lineTo(this.size.x*1.0, this.size.y*0.5);
        ctx.lineTo(this.size.x*0.5, this.size.y);
        ctx.lineTo(this.size.x*0.0, this.size.y*0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // load input
        ctx.fillStyle = isDark ? "#446666" : "#ccffff";
        ctx.strokeStyle = getStrokeColor(isDark);
        ctx.beginPath();
        ctx.arc(this.size.x * 0.25, this.size.y * 0.25, this.size.x * 0.25, 135*Math.PI/180, 315*Math.PI/180);
        ctx.fill();
        ctx.stroke();
        /*ctx.fillStyle = "#33ff33";
        ctx.beginPath();
        ctx.arc(this.size.x * 0.75, this.size.y * 0.25, this.size.x * 0.25, -135*Math.PI/180, 45*Math.PI/180);
        ctx.fill();
        ctx.stroke();*/
        if (this.inputWires[0] && this.inputWires[0].get()) {
            ctx.beginPath();
            ctx.moveTo(this.size.x * 0.75, this.size.y * 0.25);
            ctx.lineTo(this.size.x * 1.0, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
    // If the "set" input is on, change to the "what" input
    evaluate(bits: boolean[]): boolean[] {
        return bits[0] ? [bits[1]] : this.state.bits;
    }
}

export default RegisterBit;

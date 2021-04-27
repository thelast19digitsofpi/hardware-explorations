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
    public signed: boolean;
    public components: Component[];
    beforeUpdate: undefined;

    // bits=8 means an 8-bit plus 8-bit
    // note that I'm thinking about using this for InputBits, OutputBits, and RegisterBits
    // and those only have one state to get
    constructor(x: number, y: number, components: Component[], signed: boolean = false, size: number = 30) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: size * 2,
            y: size
        };
        this.signed = signed;
        this.components = components;

        this.state = {
            // unused
            bits: [],
        };
        // unused, it doesn't use wires because they make visual clutter
        this.inputSockets = [];
        this.outputSockets = [];
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

        // get the state
        let totalValue = 0;
        for (let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            const value = (comp.state.bits[0] ? 1 : 0) << i;
            // use 2's complement if signed on the last bit
            totalValue += (this.signed && i == this.components.length-1) ? -value : value;
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = Math.round(this.size.y*4/5) + "px monospace";
        ctx.fillStyle = "#000";
        ctx.fillText(String(totalValue), this.position.x, this.position.y);

        ctx.restore();
    }

    evaluate(bits: boolean[]): boolean[] {
        return [];
    }
}

export default Display;

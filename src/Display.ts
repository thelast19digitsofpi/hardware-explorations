// Display.ts
//
// Given a set of bits, displays its value as a signed or unsigned integer.

import Component from "./Component";
import Wire from "./Wire";

type DisplaySigned = (boolean | "signmag" | "1comp" | "2comp");

class Display implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public signed: DisplaySigned;
    public components: Component[];
    beforeUpdate: undefined;

    // I think this only works on components with exactly 1 output
    constructor(x: number, y: number, components: Component[], signed: DisplaySigned = false, size: number = 30) {
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

    onClick: undefined;

    getValue() {
        let totalValue: number = 0;
        for (let i = 0; i < this.components.length; i++) {
            const comp = this.components[i];
            const value = (comp.state.bits[0] ? 1 : 0) << i;
            // use 2's complement if signed on the last bit
            if (i == this.components.length - 1) {
                if (this.signed === "signmag") {
                    // MSB flips sign if on
                    totalValue *= (value == 0) ? 1 : -1;
                } else if (this.signed === "1comp") {
                    // 1's complement is equivalent to MSB value -2^n+1
                    totalValue -= (value ? value - 1 : 0);
                } else if (this.signed === true || this.signed === "2comp") {
                    // 2's complement is equivalent to MSB value -2^n
                    totalValue -= value;
                } else {
                    // unsigned
                    totalValue += value;
                }
            } else {
                // all other bits are normal
                totalValue += value;
            }
        }
        let displayText = String(totalValue);
        // negative zero
        if (displayText === "0" && this.components[this.components.length - 1].state.bits[0]) {
            displayText = "-0";
        }
        return displayText;
    }

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        // base
        ctx.fillStyle = isDark ? "#333" : "#cccccc";
        ctx.strokeStyle = isDark ? "#999" : "#000";
        ctx.beginPath();
        ctx.moveTo(left,               top);
        ctx.lineTo(left + this.size.x, top);
        ctx.lineTo(left + this.size.x, top + this.size.y);
        ctx.lineTo(left,               top + this.size.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // get the state

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = Math.round(this.size.y*4/5) + "px monospace";
        ctx.fillStyle = isDark ? "#909396" : "#000";


        ctx.fillText(this.getValue(), this.position.x, this.position.y);

        ctx.restore();
    }

    evaluate(_: boolean[]): boolean[] {
        return [];
    }
}

export default Display;

// InputBit.ts
// Can be clicked to change state

import Component from './Component';
import { getBitColor, getStrokeColor } from './dark';

class InputBit implements Component {
    state: {bits: boolean[]};
    position: { x: number; y: number; };
    size: { x: number; y: number; };
    inputSockets: [];
    inputWires: [];
    outputSockets: {x: number, y: number}[];
    beforeUpdate: undefined;

    // If this bit is toggled, all linked bits are toggled as well
    linkedBits: InputBit[];

    constructor(x: number, y: number, value: boolean = false, size: number = 20) {
        this.position = {
            x: x,
            y: y,
        };
        this.size = {
            x: size,
            y: size,
        };

        this.state = {
            bits: [value],
        };

        this.inputSockets = []; // it is input, it needs no input from elsewhere
        this.inputWires = [];
        this.outputSockets = [
            {x: 0, y: 0}
        ];

        this.linkedBits = [];
    }

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.fillStyle = getBitColor(this.state.bits[0], isDark);
        ctx.strokeStyle = "2px solid " + getStrokeColor(isDark);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size.x / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    };

    onClick(_offsetX: number, _offsetY: number): boolean {
        console.log("[InputBit] clicked");
        this.state.bits[0] = !this.state.bits[0];

        // also update everything else
        for (let otherBit of this.linkedBits) {
            otherBit.state.bits[0] = this.state.bits[0];
        }
        // bits will be updated when everything is
        return true;
    };

    evaluate(_: boolean[]): boolean[] {
        return this.state.bits;
    }
}

export default InputBit;

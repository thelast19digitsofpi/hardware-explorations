// InputBit.ts
// Can be clicked to change state

import Component from './Component';

class InputBit implements Component {
    state: {bits: boolean[], active: boolean};
    position: { x: number; y: number; };
    size: { x: number; y: number; };
    inputSockets: [];
    inputWires: [];
    outputSockets: {x: number, y: number}[];
    beforeUpdate: undefined;

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
            active: value,
            bits: [value],
        };

        this.inputSockets = []; // it is input, it needs no input from elsewhere
        this.inputWires = [];
        this.outputSockets = [
            {x: 0, y: 0}
        ];
    }

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        if (this.state.active !== this.state.bits[0]) {
            // panic
            throw new Error("[InputBit.render] State does not match bit array");
        }
        if (isDark) {
            ctx.fillStyle = (this.state.active ? "#00cc00" : "#990000");
        } else {
            ctx.fillStyle = (this.state.active ? "#33ff33" : "#990000");
        }
        ctx.strokeStyle = "2px solid black";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size.x / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    };

    onClick(_offsetX: number, _offsetY: number): boolean {
        console.log("[InputBit] clicked");
        this.state.active = !this.state.active;
        this.state.bits[0] = this.state.active;
        // bits will be updated when everything is
        return true;
    };

    evaluate(_: boolean[]): boolean[] {
        return [this.state.active];
    }
}

export default InputBit;

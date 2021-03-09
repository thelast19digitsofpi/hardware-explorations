// OutputBit.ts
// Need a good way to distinguish from InputBits

import Component from './Component';
import Wire from './Wire';

class OutputBit implements Component {
    state: { bits: boolean[] };
    position: { x: number; y: number; };
    size: { x: number; y: number; };
    inputSockets: { x: number; y: number; }[];
    outputSockets: { x: number; y: number; }[];
    inputWires: Wire[];

    constructor(x: number, y: number) {
        this.position = { x: x, y: y };
        this.size = { x: 20, y: 20 };
        this.state = { bits: [false] };

        this.inputSockets = [{x: 0, y: 0}];
        this.outputSockets = [];
        this.inputWires = [];
    }
    render(ctx: CanvasRenderingContext2D): void {
        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        ctx.fillStyle = "black";
        ctx.fillRect(left, top, this.size.x, this.size.y);
        ctx.fillStyle = (this.state.bits[0] ? "#33ff33" : "#990000");
        ctx.fillRect(
            left + this.size.x * 0.1,
            top + this.size.y * 0.1,
            this.size.x * 0.8,
            this.size.y * 0.8
        );
    };
    onClick(offsetX: number, offsetY: number): void {
        return;
    };
    evaluate(bits: boolean[]): boolean[] {
        console.log(bits);
        return bits;
    };
}

export default OutputBit;
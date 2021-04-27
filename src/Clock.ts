// Clock.ts
//
// These clocks can have an arbitrary period.

import Component from "./Component";
import Wire from "./Wire";

class ChoiceGate implements Component {
    public state: {bits: boolean[], clock: number};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public numBits: number;

    //
    constructor(x: number, y: number, bits: number, width: number = 100, height: number = 50) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: width,
            y: height,
        };
        // because .fill() isn't supported?!
        const bitArray: boolean[] = Array(bits).map(_ => false);
        this.state = {
            bits: bitArray,
            clock: -1,
        };
        this.numBits = bits;
        // "power supply" or more accurately a way to reset the clock
        this.inputSockets = [
            {x: 0, y: -this.size.y/2 - 1},
        ];

        this.outputSockets = [];
        const spacing = width / bits;
        for (let i = 0; i < bits; i++) {
            this.outputSockets.push({
                x: (i - bits/2 + 1/2) * spacing,
                y: this.size.y/2,
            });
        }

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
        let r = Math.min(this.size.y * 0.2, this.size.x * 0.1);
        const w = this.size.x, h = this.size.y;
        ctx.moveTo(w*0.5, 0);
        ctx.arcTo(w*1.0, 0, w*1.0, h*0.5, r);
        ctx.arcTo(w*1.0, h*1.0, w*0.5, h*1.0, r);
        ctx.arcTo(0, h*1.0, 0, h*0.5, r);
        ctx.arcTo(0, 0, w*0.5, 0, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // power
        ctx.translate(w/2, 0); // move origin to top-middle
        ctx.beginPath();
        ctx.moveTo(2, -5);
        ctx.lineTo(2, -1);
        ctx.lineTo(-2, -1);
        ctx.lineTo(-2, -5);
        ctx.stroke();

        // clock
        ctx.fillStyle = "#e0e0e4";
        r = Math.min(w/3, h/3);
        ctx.translate(0, h/2); // move origin to center
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        // ticks
        ctx.save();
        const angle = 2*Math.PI / this.numBits;
        for (let i = 0; i < this.numBits; i++) {
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(0, -r * 0.8 + 1);
            ctx.stroke();

            ctx.rotate(angle);
        }
        ctx.restore();

        // hand
        ctx.save();
        ctx.rotate(this.state.clock * angle);
        ctx.lineWidth *= 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, r*0.25);
        ctx.lineTo(0, -r * 0.8);
        ctx.stroke();
        ctx.lineWidth *= 5/3;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, 2*Math.PI);
        ctx.stroke();
        ctx.restore();

        // outputs
        for (let i = 0; i < this.outputSockets.length; i++) {
            const socket = this.outputSockets[i];
            ctx.fillStyle = (i == this.state.clock) ? "#33ff33" : "#990000";
            ctx.beginPath();
            ctx.arc(socket.x, socket.y, 5, 0, 2*Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
    // Evaluation: the clock's state is set on
    evaluate(bits: boolean[]): boolean[] {
        let result = [];
        for (let i = 0; i < this.numBits; i++) {
            result.push(i == this.state.clock);
        }
        return result;
    }

    beforeUpdate() {
        if (this.inputWires[0]?.get()) {
            this.state.clock = (this.state.clock + 1) % this.numBits;
        } else {
            this.state.clock = -1;
        }
    }
}

export default ChoiceGate;

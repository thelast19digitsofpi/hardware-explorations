// Countdown.ts
//
// These clocks can have an arbitrary period.

import Component from "./Component";
import { getApplianceColor, getBitColor, getTextColor } from "./dark";
import Wire from "./Wire";

class Countdown implements Component {
    public state: {bits: boolean[], count: number};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public numBits: number;

    public startValue: number;

    //
    constructor(x: number, y: number, cap: number, width: number = 60, height: number = 50) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: width,
            y: height,
        };
        // because .fill() isn't supported?!
        const bitArray: boolean[] = Array(2).map(_ => false);
        this.state = {
            bits: bitArray,
            count: cap,
        };
        this.startValue = cap;
        this.numBits = 2;
        // "power supply" or more accurately a way to reset the clock
        this.inputSockets = [
            {x: 0, y: -this.size.y/2 - 1},
            {x: -this.size.x/2, y: -this.size.y/2},
        ];

        this.outputSockets = [
            {x: 0, y: this.size.y/2}
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
        ctx.fillStyle = getApplianceColor(isDark);
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

        // clock icon
        r = Math.min(w/8, h/8);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(r*0.6, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, -r);
        ctx.stroke();

        // power
        ctx.translate(w/2, 0); // move origin to top-middle
        ctx.beginPath();
        ctx.moveTo(2, -5);
        ctx.lineTo(2, -1);
        ctx.lineTo(-2, -1);
        ctx.lineTo(-2, -5);
        ctx.stroke();

        r *= 0.8;
        ctx.lineWidth *= 2;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(r*0.4, r*0.5);
        ctx.lineTo(-r*0.8, r*1.5);
        ctx.lineTo(r*0.8, r*1.5);
        ctx.lineTo(-r*0.4, r*2.5);
        ctx.stroke();

        ctx.lineWidth /= 2;

        // clock
        ctx.fillStyle = getTextColor(isDark);
        ctx.font = String(Math.round(this.size.y * 0.6)) + "px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.state.count.toString(), 0, h*0.50);

        ctx.translate(0, h/2);

        // outputs
        ctx.fillStyle = getBitColor(this.state.count == 0, isDark);
        ctx.beginPath();
        ctx.arc(0, h/2, 5, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
    // Evaluation: we give a "1" output when it expires
    evaluate(bits: boolean[]): boolean[] {
        return [this.state.count == 0];
    }

    beforeUpdate() {
        // 0 = the power button, if off it resets
        if (this.inputWires[0]?.get()) {
            // 1 = the clock input, if off it holds
            if (this.inputWires[1]?.get()) {
                this.state.count--;
                if (this.state.count < 0) this.state.count = 0;
            }
        } else {
            this.state.count = this.startValue;
        }
    }
}

export default Countdown;

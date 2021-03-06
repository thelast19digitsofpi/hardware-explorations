// Adder.ts

import Component from "./Component";
import { getBitColor, getStrokeColor, getTextColor } from "./dark";
import Wire from "./Wire";

class Adder implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: (Wire | null)[];
    public outputSockets: {x: number, y: number}[];
    public numBits: number;

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, bits: number, width: number = bits*50, height: number = width/2) {
        this.position = {
            x: x,
            y: y,
        };

        this.size = {
            x: width,
            y: height,
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

        // carry input
        this.inputSockets.push({
            x: this.size.x * 3/8,
            y: 0,
        });

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

    onClick: undefined;

    render(ctx: CanvasRenderingContext2D, isDark: boolean) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        // base
        ctx.fillStyle = isDark ? "#333333" : "#cccccc";
        ctx.beginPath();
        ctx.moveTo(left,                    top);
        ctx.lineTo(left + this.size.x,      top);
        ctx.lineTo(left + this.size.x*0.75, top + this.size.y);
        ctx.lineTo(left + this.size.x*0.25, top + this.size.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < this.inputSockets.length; i++) {
            let socket = this.inputSockets[i];
            ctx.fillStyle = isDark ? "#223388" : "#3333cc";
            ctx.beginPath();
            ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2*Math.PI);
            ctx.fill();
            /*ctx.fillStyle = "black";
            ctx.fillText(String(i), this.position.x + socket.x, this.position.y + socket.y - 15);*/
        }

        for (let i = 0; i < this.outputSockets.length; i++) {
            let socket = this.outputSockets[i];
            ctx.fillStyle = isDark ? "#666666" : "#333333";
            ctx.strokeStyle = getBitColor(this.state.bits[i], isDark);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2*Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        let num1 = 0, num2 = 0;
        for (let i = 0; i < this.numBits; i++) {
            const wire1 = this.inputWires[i], wire2 = this.inputWires[i + this.numBits];
            num1 += ((wire1 && wire1.toComponent.state.bits[wire1.toOutput]) ? 1 : 0) * (1 << i);
            num2 += ((wire2 && wire2.toComponent.state.bits[wire2.toOutput]) ? 1 : 0) * (1 << i);
        }
        const textSize = Math.round(Math.min(this.size.x * 0.125, this.size.y * 0.5));
        ctx.font = textSize + "px monospace";
        ctx.fillStyle = getTextColor(isDark);
        ctx.fillText(String(num1) + " + " + String(num2), this.position.x, this.position.y);

        const carryWire = this.inputWires[2*this.numBits];
        if (carryWire && carryWire.get()) {
            ctx.font = Math.round(textSize*0.5) + "px monospace";
            ctx.fillText("(+1 carry in)", this.position.x, this.position.y + this.size.y*0.25);
        }

        ctx.restore();
    }

    evaluate(bits: boolean[]): boolean[] {
        let num1 = 0, num2 = 0;
        // cheating here but that's not the point
        for (let i = 0; i < this.numBits; i++) {
            num1 += Number(bits[i]) * (1 << i);
            num2 += Number(bits[i + this.numBits]) * (1 << i);
        }

        // add plus the carry
        const answer = num1 + num2 + (bits[2*this.numBits] ? 1 : 0);
        let answerBits = Array(this.numBits + 1);
        for (let i = 0; i <= this.numBits; i++) {
            answerBits[i] = (answer & (1 << i)) > 0;
        }
        if (this.position.x === 430 && this.numBits === 4) console.log("Adder gives ", answerBits, "with input", bits);
        return answerBits;
    }

    beforeUpdate() {
        // The simulation was having some bugs without this
        let inputs = [];
        for (let i = 0; i <= 2*this.numBits; i++) {
            const wire = this.inputWires[i];
            inputs.push(wire ? wire.get() : false);
        }
        console.log("num inputs: ", inputs.length);
        this.state.bits = this.evaluate(inputs);
    }
}

export default Adder;

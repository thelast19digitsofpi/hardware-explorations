// AndGate.ts

import Component from "./Component";
import Wire from "./Wire";

abstract class Gate implements Component {
    public state: {bits: boolean[]};
    public position: {x: number, y: number};
    public size: {x: number, y: number};
    public inputSockets: {x: number, y: number}[];
    public inputWires: Wire[];
    public outputSockets: {x: number, y: number}[];
    public rotation: number;

    // bits=8 means an 8-bit plus 8-bit
    constructor(x: number, y: number, rotation: number) {
        this.position = {
            x: x,
            y: y,
        };

        const width = 60;
        this.size = {
            x: width,
            y: width
        };

        this.state = {
            bits: [],
        };

        this.rotation = rotation * Math.PI / 180;

        const cosine = Math.cos(this.rotation);
        const sine = Math.sin(this.rotation);
        // transform [±0.3, -0.5]
        this.inputSockets = [
            {
                x: -0.3*cosine + 0.5*sine,
                y: -0.5*cosine - 0.3*sine,
            },
            {
                x: 0.3*cosine + 0.5*sine,
                y: -0.5*cosine + 0.3*sine
            }
        ];

        this.outputSockets = [
            {
                x: -0.5*sine,
                y: -0.5*cosine,
            }
        ];

        this.inputWires = [];
    }

    onClick(_offsetX: number, _offsetY: number): void {
        return;
    };

    drawGate(ctx: CanvasRenderingContext2D) {};

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();

        const left = this.position.x - this.size.x/2;
        const top = this.position.y - this.size.y/2;
        // base
        ctx.fillStyle = "#cccccc";
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
            ctx.fillStyle = "#3333cc";
            ctx.beginPath();
            ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillText(String(i), this.position.x + socket.x, this.position.y + socket.y - 15);
        }

        for (let i = 0; i < this.outputSockets.length; i++) {
            let socket = this.outputSockets[i];
            ctx.fillStyle = "#333333";
            ctx.strokeStyle = (this.state.bits[i] ? '#33ff33' : '#990000');
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x + socket.x, this.position.y + socket.y, 6, 0, 2*Math.PI);
            ctx.fill();
            ctx.stroke();
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

        const answer = num1 + num2;
        let answerBits = Array(this.numBits + 1);
        for (let i = 0; i <= this.numBits; i++) {
            answerBits[i] = (answer & (1 << i)) > 0;
        }
        console.log(answerBits);
        return answerBits;
    }
}

export {AndGate, OrGate, XorGate, Not};

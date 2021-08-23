// AnswerChecker.ts
//
// Runs through all possible combinations of given input bits.

import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Component, { StateObject } from './Component';
import Wire from './Wire';
import Exploration from './Exploration';
import { getApplianceColor } from './dark';


type CheckFunctionType = (arg0: boolean[]) => boolean[];

class AnswerChecker implements Component {
    state: StateObject;
    position: { x: number; y: number; };
    size: { x: number; y: number; };
    inputSockets: { x: number; y: number; }[];
    outputSockets: { x: number; y: number; }[];
    inputWires: (Wire | null)[];
    beforeUpdate: (() => void) | null | undefined;

    timer: number;

    // arrays mean you can have 2 inputs always be the same
    inputs: (InputBit | InputBit[])[];
    outputs: OutputBit[];
    checkFunction: CheckFunctionType;
    exploration: Exploration;

    constructor(exploration: Exploration, x: number, y: number, inputs: (InputBit | InputBit[])[], outputs: OutputBit[], checkFunction: CheckFunctionType) {
        this.exploration = exploration;
        this.position = {
            x: x,
            y: y,
        };
        this.size = {
            x: 160,
            y: 90,
        };
        this.inputSockets = [];
        this.outputSockets = [];
        this.inputWires = [];

        this.inputs = inputs;
        this.outputs = outputs;
        this.checkFunction = checkFunction;

        this.state = {
            bits: [],

            running: false,
            counter: -1,
            win: false,
            lose: false,
            loseCorrectAnswer: [],
            loseWrongAnswer: [],
        };

        this.timer = -1;
    }

    onClick(offsetX: number, offsetY: number) {
        if (offsetX >= -60 && offsetX <= 60 && Math.abs(offsetY + 17) <= 20) {
            this.launch();
            return true;
        }

        return false;
    }

    launch() {
        if (this.state.running) {
            clearTimeout(this.timer);
            this.state.running = false;
            this.state.counter = -1;
        } else {
            this.state.running = true;
            this.state.win = false;
            this.state.lose = false;
            this.state.counter = -1;
            this.nextTest();
        }
    }

    nextTest() {
        this.state.counter++;
        console.log("testing with", this.state.counter);
        if (this.state.counter >= (1 << this.inputs.length)) {
            this.state.win = true;
            this.state.running = false;
            return;
        }

        // set all the bits
        let inputBits = [];
        for (let i = 0; i < this.inputs.length; i++) {
            const bit = Boolean((this.state.counter >> i) & 1);
            // it's either a single input or an array
            let array = this.inputs[i];
            if (array instanceof InputBit) {
                array = [array];
            }
            for (let j = 0; j < array.length; j++) {
                array[j].state.bits[0] = bit;
            }
            inputBits.push(bit);
        }

        // update the exploration
        this.exploration.update();

        // check it
        const outputBits = this.checkFunction(inputBits);
        for (let i = 0; i < this.outputs.length; i++) {
            if (outputBits[i] != this.outputs[i].state.bits[0]) {
                this.state.lose = true;
                this.state.running = false;
                this.state.loseCorrectAnswer = outputBits;
                this.state.loseWrongAnswer = this.outputs.map(x => x.state.bits[0]);
                return;
            }
        }

        // if it survived...
        let timeDelay = 1000;
        let escalation = 2;
        while (escalation < this.state.counter-1) {
            escalation++;
        }
        timeDelay = 1000 / (escalation - 1);
        this.timer = window.setTimeout(this.nextTest.bind(this), timeDelay);
    }

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

        // test button
        // red = stopped or failed, green = win, yellow = running
        if (this.state.win) {
            ctx.fillStyle = isDark ? "#228822" : "#33cc33";
            ctx.strokeStyle = isDark ? "#006600" : "#009900";
        } else if (this.state.running) {
            ctx.fillStyle = isDark ? "#999922" : "#eeee22";
            ctx.strokeStyle = isDark ? "#666600" : "#999900";
        } else {
            ctx.fillStyle = isDark ? "#993333" : "#cc3333";
            ctx.strokeStyle = isDark ? "#660000" : "#990000";
        }
        ctx.lineWidth = 6;
        ctx.beginPath();
        const y = 28;
        r = 30;
        ctx.moveTo(80, y-20);
        ctx.lineTo(120, y-20);
        ctx.arc(120, y, 20, -Math.PI/2, Math.PI/2);
        ctx.lineTo(40, y+20);
        ctx.arc(40, y, 20, Math.PI/2, 3*Math.PI/2);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isDark ? "#999" : "#000";
        ctx.font = "30px monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.state.running ? "STOP" : "TEST", 80, y+9);

        ctx.font = "20px sans-serif";
        let message: string;
        if (this.state.win) {
            message = "Good job!";
        } else if (this.state.lose) {
            message = "";
            ctx.font = (this.inputs.length < 4 ? "16" : "14") + "px sans-serif";
            ctx.fillText("Oops! That should", 80, 67);
            const correct = this.state.loseCorrectAnswer.map(Number).join("");
            const wrong = this.state.loseWrongAnswer.map(Number).join("");
            ctx.fillText("be [" + correct + "], not [" + wrong + "].", 80, 84);
        } else if (this.state.running) {
            message = `${this.state.counter + 1} of ${1 << this.inputs.length}`;
        } else {
            message = "are you ready?";
            ctx.font = "18px sans-serif";
        }
        ctx.fillText(message, 80, 76);

        ctx.restore();
    }

    evaluate(bits: boolean[]) {
        return [];
    }
}

export default AnswerChecker;

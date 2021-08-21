// MultiplierExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import RegisterBit from './RegisterBit';
import Adder from './Adder';
import Wire from './Wire';
import Clock from './Clock';
import Display from './Display';
import {AndGate, OrGate, Not} from './Gates';
import ChoiceGate from './ChoiceGate';
import Text from './Text';

class MultiplierExploration extends Exploration {
    countdown: Clock;
    regSpacing: number;
    regRight: number;
    productRegister: OutputBit[];
    numBits: number;
    startButton: InputBit;

    animated: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        canvas.width = 750;
        canvas.height = 600;

        const BITS = 6;
        this.numBits = BITS;

        const startButton = new InputBit(710, 60, false, 50);
        this.startButton = startButton;
        const startText = new Text(startButton.position.x, startButton.position.y - 35, 24, function() {
            return (startButton.state.bits[0]) ? "ABORT" : "START";
        });
        this.components.push(startText);

        const thisExploration = this;
        startButton.onClick = function() {
            startButton.constructor.prototype.onClick.apply(startButton, arguments);
            if (startButton.state.active) {
                thisExploration.resume();
            }
            return true;
        };

        const startNot = new Not(startButton.position.x - 60, 40, 30, 90);
        startNot.inputWires.push(new Wire(startButton, 0));
        this.components.push(startNot);

        const clockX = startButton.position.x - 5;

        const clockAnd = new AndGate(clockX, 110, 25, 0);
        const clockNot = new Not(clockX, 150, 25, 0);
        const clockBit = new OutputBit(clockX, 200);

        clockAnd.inputWires.push(new Wire(clockNot, 0, [
            {x: clockX - 5, y: startButton.position.y + 30},
            {x: clockX - 15, y: startButton.position.y + 30},
            {x: clockX - 15, y: clockNot.position.y + 30},
            {x: clockX, y: clockNot.position.y + 30}
        ]));
        clockAnd.inputWires.push(new Wire(startButton, 0));
        clockBit.inputWires.push(new Wire(clockNot, 0));
        clockNot.inputWires.push(new Wire(clockAnd, 0));
        this.components.push(clockAnd, clockNot, clockBit);
        this.outputComponents.push(clockBit);

        // ironic that I called the above a "clock"
        // when the clock strikes 2*BITS + 1 it will end the operation
        const countdown = new Clock(clockX - 20, 260, 80, 50);
        countdown.inputWires.push(new Wire(startButton, 0, [
            {x: countdown.position.x, y: countdown.position.y - 40},
            {x: clockX - 30, y: countdown.position.y - 40},
            {x: clockX - 30, y: startButton.position.y},
        ]));
        this.countdown = countdown;

        const adder = new Adder(180, 185, BITS, 270, 100);
        //this.outputComponents.push(adder);

        // The "Register" that really isn't.
        // The Add and Shift steps should be successfully separated...
        let productRegister = [];
        this.regRight = 660;
        this.regSpacing = 50;
        for (let i = 0; i < 2*BITS+1; i++) {
            const reg = new OutputBit(this.regRight - this.regSpacing*i, 400, 20);
            productRegister.push(reg);
            this.outputComponents.unshift(reg); // todo: is needed?
            this.components.push(reg);
        }

        // Wire Coloring
        const purple = {color: "rgb(128, 32, 128)", darkColor: "rgb(160, 80, 160)"};
        const purpleFaded = {color: "rgba(128, 0, 128, 0.4)", darkColor: "rgba(160, 80, 160, 0.6)"};
        const teal = {color: "rgb(0, 128, 128)"};
        const tealFaded = {color: "rgba(0, 128, 128, 0.35)"};

        // Wires from the registers to the adder.
        for (let i = 0; i < BITS; i++) {
            const d = 2;
            const bit = productRegister[i + BITS];
            // basically, we want the most significant bit to be highest
            const y1 = bit.position.y + 15 + d * (BITS - i);
            adder.inputWires.push(new Wire(bit, 0, [
                {x: adder.position.x + adder.inputSockets[i].x, y: 110 + d*i},
                {x: 10 + d*i, y: 110 + d*i},
                {x: 10 + d*i, y: y1},
                {x: bit.position.x, y: y1},
            ], {color: "rgba(128, 0, 128, 0.75)", darkColor: "rgba(160, 80, 160, 0.67)"}));
        }

        // And Gates coming out of the adder (for the clock).
        let adderChoiceGates = [];
        for (let i = 0; i <= BITS; i++) {
            // and gate
            //const x = adder.position.x + adder.outputSockets[i].x;
            const y = adder.position.y + adder.outputSockets[0].y; // put them all on the same line
            // space them a bit
            const choice = new ChoiceGate(productRegister[i+BITS].position.x + 7, y + 50, 10);
            // this will be input 0 temporarily but we will unshift later
            choice.inputWires.push(new Wire(adder, i));
            adderChoiceGates.push(choice);
            this.components.push(choice);
        }

        // Shifting the Multiplication Register
        for (let i = 0; i < 2*BITS + 1; i++) {
            const regBit = productRegister[i];
            /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
            this.components.push(or);
            regBit.inputWires.push(new Wire(or, 0));*/

            const choice = new ChoiceGate(regBit.position.x, regBit.position.y - 40, 14);
            // Selection Wire (from clock's NOT)
            choice.inputWires.push(new Wire(clockNot, 0, [
                {x: choice.position.x - 18, y: choice.position.y},
                {x: choice.position.x - 18, y: choice.position.y - 38 - 2*i},
                {x: 630 - 2*i, y: choice.position.y - 38 - 2*i},
            ], tealFaded));
            // Shifting
            if (i < 2*BITS) {
                choice.inputWires.push(new Wire(productRegister[i+1], 0, [
                    {x: regBit.position.x - 7, y: choice.position.y - 20},
                    {x: regBit.position.x - 24, y: choice.position.y - 20},
                    {x: regBit.position.x - 24, y: regBit.position.y},
                ], teal));
            } else {
                choice.inputWires.push(null);
            }
            if (i >= BITS) {
                // Upper Half of the Register: Conditionally connect to the adder.
                choice.inputWires.push(new Wire(adderChoiceGates[i - BITS], 0, [], purple));
            } else {
                // Lower Half of the Register: Connect to itself.
                choice.inputWires.push(new Wire(regBit, 0, [
                    {x: regBit.position.x + 7, y: choice.position.y - 20},
                    {x: regBit.position.x + 20, y: choice.position.y - 20},
                    {x: regBit.position.x + 20, y: regBit.position.y},
                ], purple));
            }

            this.components.push(choice);
            regBit.inputWires.push(new Wire(choice, 0));
        }

        // Input Numbers (A and B).
        let inputA = [];
        let inputB = [];
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(320 - i*30, 60, false, 25);
            this.components.push(input);
            adder.inputWires.push(new Wire(input, 0));
            inputA.push(input); // in case we need it
        }
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(630 - i*50, 60, false, 25);
            this.components.push(input);
            inputB.push(input);
        }

        // The second input register that is actually a register.
        let multiplierRegister: RegisterBit[] = [];
        let multiplierRegisterChoice = [];
        for (let i = 0; i < BITS; i++) {
            const reg = new RegisterBit(inputB[i].position.x - 4, 170, 20);
            multiplierRegister.push(reg);
            this.components.push(reg);
            this.outputComponents.push(reg);
        }
        // Wiring to the Registers
        for (let i = 0; i < BITS; i++) {
            const reg = multiplierRegister[i];
            const or = new OrGate(reg.position.x - 9, reg.position.y - 25, 20, 0);
            const choice = new ChoiceGate(reg.position.x + 9, reg.position.y - 60, 12);
            reg.inputWires.push(new Wire(or, 0), new Wire(choice, 0));

            const wirePath = [
                {x: reg.position.x - 13, y: choice.position.y, node: true},
                {x: reg.position.x - 13, y: startNot.position.y, node: (i < BITS-1)},
            ];
            or.inputWires.push(new Wire(startNot, 0, wirePath, {color: "rgba(100, 100, 130, 0.75)"}));
            or.inputWires.push(new Wire(clockNot, 0, [
                {x: or.position.x + 10, y: or.position.y - 18 - i/2},
                {x: clockNot.position.x - 40, y: or.position.y - 18 - i},
            ], tealFaded));

            // choice gate is [0] ? [1] : [2]
            // the selection comes first
            choice.inputWires.push(new Wire(startNot, 0, wirePath, {color: "rgba(100, 100, 130, 0.75)"}));

            // If the clock is off, the registers need to use the input bits
            choice.inputWires.push(new Wire(inputB[i], 0));
            // Otherwise hold
            choice.inputWires.push(new Wire(multiplierRegister[i+1] || null, 0, [
                {x: reg.position.x + 15, y: reg.position.y - 80},
                {x: reg.position.x - 22, y: reg.position.y - 80},
                {x: reg.position.x - 22, y: reg.position.y + 10},
            ]));

            this.components.push(or, choice);
        }

        // Control Wire from the final register bit to the adder's output
        const regLSB = multiplierRegister[0];
        for (let i = 0; i <= BITS; i++) {
            const choice = adderChoiceGates[i];
            // Selector Wire
            choice.inputWires.unshift(new Wire(regLSB, 0, [
                {x: choice.position.x - 13, y: choice.position.y},
                {x: choice.position.x - 13, y: choice.position.y - 20},
                {x: 400, y: choice.position.y - 20},
                {x: 400, y: regLSB.position.y + 20},
                {x: regLSB.position.x, y: regLSB.position.y + 20},
            ], {color: "#7f7f7f", darkColor: "#555"}));

            // Else wire
            const outBit = productRegister[i + BITS];
            choice.inputWires.push(new Wire(outBit, 0, [
                {x: choice.position.x + 4, y: choice.position.y - 10},
                {x: choice.position.x + 11, y: choice.position.y - 10},
                {x: outBit.position.x + 18, y: 305 + 2*i},
                {x: outBit.position.x + 18, y: outBit.position.y - 18},
            ], purpleFaded));
        }

        // Answer Register
        const finalAnswer: RegisterBit[] = [];
        for (let i = 0; i <= 2*BITS; i++) {
            const offset = 5;
            const bit = new RegisterBit(productRegister[i].position.x + offset, 510, 30);
            this.components.push(bit);
            this.outputComponents.push(bit);

            // set wire: on at the 12th clock cycle
            bit.inputWires.push(new Wire(countdown, 1, [
                {x: bit.position.x - 15, y: bit.position.y - 15},
                {x: bit.position.x - 15, y: bit.position.y - 30},
                {x: clockX + 20, y: bit.position.y - 30},
                {x: clockX + 20, y: countdown.position.y + 40},
                {x: countdown.position.x + countdown.outputSockets[1].x, y: countdown.position.y + 40},
            ], {color: "rgb(128, 128, 128)"}));

            // what wire: from the corresponding from the product "register"
            const from = productRegister[i];
            const diagonal = 16;
            bit.inputWires.push(new Wire(from, 0, [
                {x: bit.position.x + diagonal, y: bit.position.y - diagonal},
                {x: from.position.x + diagonal + offset, y: from.position.y + diagonal + offset},
            ]));

            finalAnswer.push(bit);
        }

        // finally, add displays
        const displayA = new Display(245, 25, inputA, false, 30);
        const displayB = new Display(510, 20, inputB, false, 30);
        const displayEnd = new Display(375, 565, finalAnswer, false, 60);
        displayEnd.size.x = 2*displayEnd.size.y;

        // rendering trick, because input wires are drawn with a component
        // so pushing these last makes them render last so it looks cleaner
        this.components.push(adder, countdown, startButton, displayA, displayB, displayEnd);
        this.productRegister = productRegister;
    }

    drawProductGuide(left: number, right: number, color: string, text: string) {
        const ctx = this.context;
        const x1 = (this.regRight - left*this.regSpacing) - 15;
        const x2 = (this.regRight - right*this.regSpacing) + 15;
        const y = 435;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "none";
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 + 10, y + 10);
        ctx.lineTo(x2 - 10, y + 10);
        ctx.lineTo(x2, y);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 16;
        ctx.fillStyle = color;
        ctx.font = "30px monospace";
        ctx.strokeText(text, (x1 + x2)/2, y + 25);
        ctx.fillText(text, (x1 + x2)/2, y + 25);
        ctx.restore();
    }

    afterRender = () => {
        const ctx = this.context;

        const cycle = this.countdown.state.clock;
        if (cycle >= 0) {
            const n = (cycle + 1) >> 1;
            if (n <= 5) {
                ctx.fillStyle = "rgba(255,255,255,0.75)";
                const west = (this.regRight - this.regSpacing * (5-n)) - 20;
                const north = 340, south = 480;
                const east = (this.regRight) + 22;
                ctx.beginPath();
                ctx.moveTo(west, north);
                ctx.lineTo(east, north);
                ctx.lineTo(east, south);
                ctx.lineTo(west, south);
                ctx.fill();
            }

            if (n <= 6) {
                // product value
                let productValue = 0;
                for (let i = 0; i < this.numBits + n; i++) {
                    const bit = this.productRegister[i + (6-n)];
                    productValue += Number(bit.state.bits[0]) * (1 << i);
                }

                this.drawProductGuide(2 * this.numBits, this.numBits - n, "#33c", `Product (${productValue})`);
            }
        }

        if (cycle == 2*this.numBits + 1) {
            this.startButton.state.active = false;
            this.startButton.state.bits = [false];
        }
    }
}

export default MultiplierExploration;

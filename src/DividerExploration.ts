// DividerExploration.ts

/*

steps:
1. Start with dividend (numerator) in RIGHT half of remainder register
2. Shift the remainder left
3. Send the LEFT half in for subtraction
4. If the result is negative, write it, else keep the remainder as is
5. Put the opposite of the sign bit on the new 1 position
6. Go back to step 2, although when the larger clock strikes, record the results (I expect it to be 2*6+3 or 3*6+5 cycles).

next steps:
- carry from the subtractor needs to enter the choice gates
- on purple, we get the subtraction results, and if the sign bit is off, we insert it into the register
- also on purple, that sign bit needs to shift the LEFT

I think I need to totally reconfigure the remainder part

Remainder register:
- If power button is off, set to zero (6-12) or numerator (0-5)
- If power button is on:
    - on purple we may receive a subtraction, but this only applies to bits 6-12
    - on green we need to shift left, setting a carry bit. (This will require an additional register.)



*/

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import RegisterBit from './RegisterBit';
import Subtractor from './Subtractor';
import Wire from './Wire';
import Clock from './Clock';
import Display from './Display';
import {AndGate, Not} from './Gates';
import ChoiceGate from './ChoiceGate';

class DividerExploration extends Exploration {
    countdown: Clock;
    remainderRight: number;
    remainderSpacing: number;
    startButton: InputBit;
    numBits: number;

    animated: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        canvas.width = 800;
        canvas.height = 600;

        // A lot of the same stuff happens compared to Multiplier...

        const BITS = 6;
        this.numBits = BITS;

        const startButton = new InputBit(695, 40, false, 50);
        this.startButton = startButton;

        // probably more user friendly
        const thisExploration = this;
        startButton.onClick = function() {
            startButton.constructor.prototype.onClick.apply(startButton, arguments);
            if (startButton.state.active) {
                thisExploration.resume();
            }
            return true;
        };

        //const startNot = new Not(startButton.position.x - 50, 40, 30, 90);
        //startNot.inputWires.push(new Wire(startButton, 0));
        //this.components.push(startNot);

        const clockX = 690;

        const clockAnd = new AndGate(clockX, 100, 25, 0);
        const clockNot = new Not(clockX, 150, 25, 0);
        const clockBit = new OutputBit(clockX, 200);

        clockAnd.inputWires.push(new Wire(clockNot, 0, [
            {x: clockX - 5, y: 75},
            {x: clockX - 20, y: 75},
            {x: clockX - 20, y: 175},
            {x: clockX, y: 175}
        ]));
        clockAnd.inputWires.push(new Wire(startButton, 0));
        clockBit.inputWires.push(new Wire(clockNot, 0));
        clockNot.inputWires.push(new Wire(clockAnd, 0));
        this.components.push(clockAnd, clockNot, clockBit);
        this.outputComponents.push(clockBit);

        // ironic that I called the above a "clock"
        // when the clock strikes 2*BITS + 4 it will end the operation
        // but I add one more to avoid confusion
        const countdown = new Clock(750, 230, 2*BITS + 4, 80, 50);
        countdown.inputWires.push(new Wire(startButton, 0, [
            {x: countdown.position.x, y: countdown.position.y - 40},
            {x: countdown.position.x, y: 40},
        ]));
        this.countdown = countdown;

        const subtractor = new Subtractor(210, 180, BITS, 260, 80);
        //this.outputComponents.push(subtractor);

        // Also not really a register.
        let remainderRegister = [];
        this.remainderRight = 680;
        this.remainderSpacing = 52;
        for (let i = 0; i < 2*BITS+1; i++) {
            const reg = new OutputBit(this.remainderRight - this.remainderSpacing*i, 460, 20);
            remainderRegister.push(reg);
            this.outputComponents.unshift(reg); // todo: is needed?
            this.components.push(reg);
        }

        // Wire Coloring
        const purple = {color: "rgb(128, 32, 128)"};
        const purpleFaded = {color: "rgba(128, 0, 128, 0.25)"};
        const teal = {color: "rgb(0, 128, 128)"};
        const tealFaded = {color: "rgba(0, 128, 128, 0.35)"};
        const blue = {color: "rgba(32, 64, 128, 0.8)"};
        const blueFaded = {color: "rgba(32, 64, 128, 0.4)"};
        //const yellow = {color: "rgba(160, 160, 0)"};

        // Input Numbers (N/D). D = divisor, N = dividend
        let inputN = [];
        let inputD = [];
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(340 - i*25, 40);
            this.components.push(input);
            inputN.push(input); // in case we need it
        }
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(340 - i*25, 110);
            this.components.push(input);
            inputD.push(input);
        }

        // Wires from the registers to the subtractor.
        for (let i = 0; i < BITS; i++) {
            const d = 3;
            const bit = remainderRegister[i + BITS];
            // basically, we want the most significant bit to be highest
            const y1 = bit.position.y + 15 + d * (BITS - i);
            const y2 = subtractor.position.y - 70;
            subtractor.inputWires.push(new Wire(bit, 0, [
                {x: subtractor.position.x + subtractor.inputSockets[i].x - 30 + d*i, y: y2 + d*i},
                {x: 10 + d*i, y: y2 + d*i},
                {x: 10 + d*i, y: y1},
                {x: bit.position.x, y: y1},
            ], {color: "rgba(128, 0, 128, 0.75)"}));
        }
        // The other subtractor registers (to the divisor)
        for (let i = 0; i < BITS; i++) {
            subtractor.inputWires.push(new Wire(inputD[i], 0));
        }

        // Choice Gates coming out of the subtractor (writes if subtracted).
        let subtractorChoiceGates = [];
        for (let i = 0; i < BITS; i++) {
            //const x = subtractor.position.x + subtractor.outputSockets[i].x;
            const y = subtractor.position.y + subtractor.outputSockets[0].y; // put them all on the same line
            // space them a bit
            const choice = new ChoiceGate(remainderRegister[i+BITS].position.x, y + 50, 10);
            // choice depends on whether or not the carry bit is positive or negative
            choice.inputWires.push(new Wire(subtractor, BITS, [
                {x: choice.position.x - 15, y: choice.position.y},
                {x: choice.position.x - 15, y: choice.position.y - 20},
                {x: subtractor.position.x - subtractor.size.x/2, y: choice.position.y - 20},
                {x: subtractor.position.x - subtractor.size.x/2, y: subtractor.position.y},
            ], {color: "#888"}));
            // if negative, we just re-use the remainder register
            const regBit = remainderRegister[i + BITS];
            choice.inputWires.push(new Wire(regBit, 0, [
                {x: choice.position.x + 5, y: choice.position.y - 10},
                {x: choice.position.x + 20, y: choice.position.y - 10},
                {x: choice.position.x + 20, y: regBit.position.y},
            ], purple));
            // otherwise we use the subtraction
            choice.inputWires.push(new Wire(subtractor, i, [
                {x: choice.position.x + 5, y: choice.position.y - 30},
            ]));
            subtractorChoiceGates.push(choice);
            this.components.push(choice);
        }

        // Shifting the Remainder Register
        // includes many wires
        // also includes register for holding the quotient input
        const fullRow = [];
        for (let i = 0; i <= 2*BITS; i++) {
            const regBit = remainderRegister[i];
            /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
            this.components.push(or);
            regBit.inputWires.push(new Wire(or, 0));*/

            // This is the middle (full) row
            const choice = new ChoiceGate(regBit.position.x + (i < BITS ? 5 : -1), regBit.position.y - 100, 14);
            // Selection Wire (from clock's NOT)
            choice.inputWires.push(new Wire(clockAnd, 0, [
                {x: choice.position.x - 18, y: choice.position.y},
                {x: choice.position.x - 18, y: choice.position.y - 40},
                {x: 580 - 2*i, y: choice.position.y - 50 - 1*i},
            ], purpleFaded));
            // Purple action
            if (i >= BITS && i < 2*BITS) {
                // Upper Half of the Register: Conditionally connect to the subtractor.
                choice.inputWires.push(new Wire(subtractorChoiceGates[i - BITS], 0, [], purple));
            } else {
                // Lower Half of the Register: Connect to itself.
                choice.inputWires.push(new Wire(regBit, 0, [
                    {x: choice.position.x - 7, y: choice.position.y - 25},
                    {x: regBit.position.x - 19, y: choice.position.y - 25},
                    {x: regBit.position.x - 19, y: regBit.position.y},
                ], purple));
            }
            // Shifting
            if (i > 0) {
                choice.inputWires.push(new Wire(remainderRegister[i-1], 0, [
                    {x: choice.position.x + 7, y: choice.position.y - 25},
                    {x: regBit.position.x + 26, y: choice.position.y - 25},
                    {x: regBit.position.x + 26, y: regBit.position.y + 0},
                ], teal));
            } else {
                const holdWrite = new OutputBit(choice.position.x + 30, choice.position.y - 25, 20);
                const notY = subtractorChoiceGates[0].position.y - 20;
                const not = new Not(500, notY, 30, -90);
                not.inputWires.push(new Wire(subtractor, BITS, [
                    {x: subtractor.position.x - subtractor.size.x/2, y: notY},
                    {x: subtractor.position.x - subtractor.size.x/2, y: subtractor.position.y}
                ], {color: "#888"}));
                // set on green
                //holdWrite.inputWires.push(new Wire(clockNot, 0, [], teal));
                // value is negated result of subtraction
                holdWrite.inputWires.push(new Wire(not, 0, [], teal));
                // maybe?
                //choice.inputWires[1] = new Wire(holdWrite, 0, [], purple);
                choice.inputWires.push(new Wire(holdWrite, 0, [], teal));
                this.components.push(not, holdWrite);
                this.outputComponents.push(holdWrite);
            }

            this.components.push(choice);
            fullRow.push(choice);
        }

        // Computing the Quotient

        // The second input register that is actually a register.
        /*let divisorRegister: RegisterBit[] = [];
        let divisorRegisterChoice = [];
        for (let i = 0; i < BITS; i++) {
            const reg = new RegisterBit(inputD[i].position.x - 4, 150, 20);
            subtractor.inputWires.push(new Wire(reg, 0));
            divisorRegister.push(reg);
            this.components.push(reg);
            this.outputComponents.push(reg);
        }
        // Wiring Divisor (denominator) to the Registers
        for (let i = 0; i < BITS; i++) {
            const reg = divisorRegister[i];
            const or = new OrGate(reg.position.x - 9, reg.position.y - 25, 20, 0);
            const choice = new ChoiceGate(reg.position.x + 9, reg.position.y - 55, 12);
            reg.inputWires.push(new Wire(or, 0), new Wire(choice, 0));

            const wirePath = [
                {x: reg.position.x - 13, y: choice.position.y},
                {x: reg.position.x - 13, y: startNot.position.y},
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
            choice.inputWires.push(new Wire(inputD[i], 0));
            // Else, move up
            choice.inputWires.push(new Wire(divisorRegister[i+1] || null, 0, [
                {x: reg.position.x + 15, y: choice.position.y - 15},
                {x: reg.position.x - 22, y: choice.position.y - 15},
                {x: reg.position.x - 22, y: reg.position.y + 10},
            ]));

            this.components.push(or, choice);
        }*/

        // Wiring Dividend to seed the remainder register
        // (blue wires)
        let dividendChoice: ChoiceGate[] = [];
        for (let i = 0; i < BITS; i++) {
            const regBit = remainderRegister[i];
            const inBit = inputN[i];

            // This is the one close to the lowest 6 registers
            const choice = new ChoiceGate(regBit.position.x + 3, regBit.position.y - 50, 12);
            // Wire coming from the start button
            choice.inputWires.push(new Wire(startButton, 0, [
                {x: choice.position.x - 15, y: choice.position.y},
                {x: choice.position.x - 15, y: choice.position.y + 15},
                {x: 770, y: choice.position.y + 15},
                {x: 770, y: countdown.position.y + 40},
                {x: clockX - 30, y: countdown.position.y + 40},
                {x: clockX - 30, y: startButton.position.y + (startButton.position.x - clockX + 30)},
            ], blue));

            // If power is on, make it come from the teal/purple stuff
            choice.inputWires.push(new Wire(fullRow[i], 0));

            // Otherwise, set it to the input
            const d = 3;
            const y1 = countdown.position.y + 50;
            const y2 = inBit.position.y + 30;
            choice.inputWires.push(new Wire(inBit, 0, [
                {x: choice.position.x + 6, y: choice.position.y - 10 - d*i},
                {x: 760 - d*i, y: choice.position.y - 10 - d*i},
                {x: 760 - d*i, y: y1 + d*i},
                {x: clockX - 40 - d*i, y: y1 + d*i},
                {x: clockX - 40 - d*i, y: y2 + d*i},
                {x: inBit.position.x, y: y2 + d*i},
            ], blueFaded));

            this.components.push(choice);
            dividendChoice.push(choice);
            regBit.inputWires.push(new Wire(choice, 0));
        }

        // Clearing the "remainder" (heh heh) of the register
        // (blue wires)
        for (let i = 0; i <= BITS; i++) {
            const regBit = remainderRegister[i + BITS];
            const and = new AndGate(regBit.position.x, regBit.position.y - 50, 24, 0);
            // similar to above, use the full row if the power is on
            and.inputWires.push(new Wire(fullRow[i+BITS], 0));
            and.inputWires.push(new Wire(startButton, 0, [
                {x: and.position.x + 5, y: and.position.y - 20},
                {x: and.position.x + 13, y: and.position.y - 20},
                {x: and.position.x + 13, y: and.position.y + 15},
                {x: 770, y: and.position.y + 15},
                {x: 770, y: countdown.position.y + 40},
                {x: clockX - 30, y: countdown.position.y + 40},
                {x: clockX - 30, y: startButton.position.y + (startButton.position.x - clockX + 30)},
            ], blue));

            this.components.push(and);
            regBit.inputWires.push(new Wire(and, 0));
        }

        // Control Wire from the final register bit to the subtractor's output
        /*const regLSB = divisorRegister[0];
        for (let i = 0; i <= BITS; i++) {
            const choice = subtractorChoiceGates[i];
            // Selector Wire
            choice.inputWires.unshift(new Wire(regLSB, 0, [
                {x: choice.position.x - 13, y: choice.position.y},
                {x: choice.position.x - 13, y: choice.position.y - 20},
                {x: 282, y: choice.position.y - 20},
                {x: 282, y: regLSB.position.y + 20},
                {x: regLSB.position.x, y: regLSB.position.y + 20},
            ], {color: "rgb(127, 127, 127)"}));
            choice.inputWires.unshift(null);

            // Else wire
            const outBit = remainderRegister[i + BITS];
            choice.inputWires.push(new Wire(outBit, 0, [
                {x: choice.position.x + 5, y: choice.position.y - 10},
                {x: outBit.position.x + 19, y: choice.position.y - 10},
                {x: outBit.position.x + 19, y: outBit.position.y - 19},
            ], purpleFaded));
        }*/

        // Answer Register
        const finalAnswer: RegisterBit[] = [];
        for (let i = 0; i < 2*BITS; i++) {
            const offset = (i < BITS ? 5 : -10);
            const from = remainderRegister[i + (i >= BITS ? 1 : 0)];
            const bit = new RegisterBit(from.position.x + offset, 580, 25);
            this.components.push(bit);
            this.outputComponents.push(bit);

            // set wire: on at the 14th clock cycle
            bit.inputWires.push(new Wire(countdown, 14, [
                {x: bit.position.x - 15, y: bit.position.y - 15},
                {x: bit.position.x - 15, y: bit.position.y - 30},
                {x: 790, y: bit.position.y - 30},
                {x: 790, y: countdown.position.y + 40},
                {x: countdown.position.x + countdown.outputSockets[14].x, y: countdown.position.y + 40},
            ], {color: "rgb(128, 128, 128)"}));

            // what wire: from the corresponding from the product "register"
            const diagonal = 15;
            bit.inputWires.push(new Wire(from, 0, [
                {x: bit.position.x + diagonal, y: bit.position.y - diagonal},
                {x: from.position.x + diagonal + offset, y: from.position.y + diagonal + offset},
            ]));

            finalAnswer.push(bit);
        }

        // finally, add displays
        const displayN = new Display(inputN[0].position.x + 50, inputN[0].position.y, inputN, false, 30);
        const displayD = new Display(inputD[0].position.x + 50, inputD[0].position.y, inputD, false, 30);
        const displayQ = new Display(557, 540, finalAnswer.slice(0, BITS), false, 30);
        const displayR = new Display(200, 540, finalAnswer.slice(BITS, 2*BITS), false, 30);

        // rendering trick, because input wires are drawn with a component
        // so pushing these last makes them render last so it looks cleaner
        this.components.push(subtractor, countdown, startButton, displayN, displayD, displayQ, displayR);
    }

    drawRemainderGuide(left: number, right: number, color: string, text: string) {
        const ctx = this.context;
        const x1 = (this.remainderRight - left*this.remainderSpacing) - 15;
        const x2 = (this.remainderRight - right*this.remainderSpacing) + 15;
        const y = 480;
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

        ctx.strokeStyle = "rgba(255, 255, 255, 0.33)";
        ctx.fillStyle = color;
        ctx.font = "30px monospace";
        ctx.strokeText(text, (x1 + x2)/2, y + 25);
        ctx.fillText(text, (x1 + x2)/2, y + 25);
    }

    afterRender = () => {
        // display the quotient
        const ctx = this.context;
        ctx.save();

        // get the clock cycle
        const cycle = this.countdown.state.clock;
        if (cycle >= 0 && cycle < 2*this.numBits+3) {
            const n = (cycle+1) >> 1;
            this.drawRemainderGuide(n + 5, n + 0, "#33c", "Remainder");

            if (n > 1) {
                this.drawRemainderGuide(n-2, Math.max(n-7, 0), "#990", "Quotient");
            }
        }

        ctx.restore();

        // not sure where to put this
        if (cycle == 2 * this.numBits + 3) {
            this.startButton.state.active = false;
            this.startButton.state.bits = [false];
        }
    }
}

export default DividerExploration;

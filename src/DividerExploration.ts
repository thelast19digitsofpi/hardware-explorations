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
import Countdown from './Countdown';

class DividerExploration extends Exploration {
    countdown: Countdown;
    remainderRight: number;
    remainderSpacing: number;
    startButton: InputBit;
    numBits: number;

    animated: boolean = true;
    remainderRegister: OutputBit[];
    clock: Clock;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        canvas.width = 720;
        canvas.height = 600;

        // A lot of the same stuff happens compared to Multiplier...

        const BITS = 5;
        this.numBits = BITS;

        const startButton = new InputBit(660, 40, false, 50);
        this.startButton = startButton;

        // probably more user friendly
        const thisExploration = this;
        startButton.onClick = function() {
            thisExploration.update(); // get the bits ready
            startButton.constructor.prototype.onClick.apply(startButton, arguments);
            if (startButton.state.bits[0]) {
                setTimeout(function() {
                    thisExploration.resume();
                }, 1000);
            }
            return true;
        };


        const clockX = startButton.position.x;
        const clock = new Clock(clockX, 125, 50, 50);
        clock.inputWires.push(new Wire(startButton, 0));
        this.components.push(clock);
        this.clock = clock;

        // when this clock strikes 2*BITS + 4 it will end the operation
        // but I add one more to avoid confusion
        const countdown = new Countdown(clockX + 20, 220, BITS+1, 60, 45);
        countdown.inputWires.push(new Wire(startButton, 0, [
            {x: countdown.position.x, y: countdown.position.y - 40},
            {x: startButton.position.x + 40, y: countdown.position.y - 40},
            {x: startButton.position.x + 40, y: startButton.position.y},
        ]));
        countdown.inputWires.push(new Wire(clock, 1));
        this.countdown = countdown;

        const subtractor = new Subtractor(210, 180, BITS, 11*26, 90);
        //this.outputComponents.push(subtractor);

        // Also not really a register.
        let remainderRegister = [];
        this.remainderRight = 585;
        this.remainderSpacing = 54;
        for (let i = 0; i < 2*BITS+1; i++) {
            const reg = new OutputBit(this.remainderRight - this.remainderSpacing*i, 460, 20);
            remainderRegister.push(reg);
            this.outputComponents.unshift(reg); // todo: is needed?
            this.components.push(reg);
        }

        // Wire Coloring
        const purple = {color: "rgb(128, 32, 128)", darkColor: "rgba(160, 48, 160)"};
        const purpleFaded = {color: "rgba(128, 0, 128, 0.25)", darkColor: "rgba(160, 40, 160, 0.33)"};
        const teal = {color: "rgb(0, 128, 128)"};
        const tealFaded = {color: "rgba(0, 128, 128, 0.35)"};
        const blue = {color: "rgba(32, 64, 128, 0.8)", darkColor: "rgba(96, 112, 160, 0.8)"};
        const blueFaded = {color: "rgba(32, 64, 128, 0.4)", darkColor: "rgba(96, 112, 160, 0.4)"};
        //const yellow = {color: "rgba(160, 160, 0)"};

        // Input Numbers (N/D). D = divisor, N = dividend
        let inputN = [];
        let inputD = [];
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(subtractor.position.x + subtractor.inputSockets[BITS+i].x, 30, false, 22);
            this.components.push(input);
            inputN.push(input); // in case we need it
        }
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(inputN[i].position.x, 95, false, 22);
            this.components.push(input);
            inputD.push(input);
        }

        // Wires from the registers to the subtractor.
        for (let i = 0; i < BITS; i++) {
            const d = 2;
            const bit = remainderRegister[i + BITS];
            // basically, we want the most significant bit to be highest
            const y1 = bit.position.y + 15 + d * (BITS - i);
            const y2 = subtractor.position.y - 70;
            subtractor.inputWires.push(new Wire(bit, 0, [
                {x: subtractor.position.x + subtractor.inputSockets[i].x - 0, y: y2 + d*i},
                {x: 3 + d*i, y: y2 + d*i},
                {x: 3 + d*i, y: y1},
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
            // space them out a little
            const choice = new ChoiceGate(remainderRegister[i+BITS].position.x - 2, y + 60, 14);
            // choice depends on whether or not the carry bit is positive or negative
            choice.inputWires.push(new Wire(subtractor, BITS, [
                {x: choice.position.x - 20, y: choice.position.y},
                {x: choice.position.x - 20, y: choice.position.y - 25},
                {x: subtractor.position.x - subtractor.size.x/2, y: choice.position.y - 25},
                {x: subtractor.position.x - subtractor.size.x/2, y: subtractor.position.y},
            ], {color: "#888"}));
            // if negative, we just re-use the remainder register
            const regBit = remainderRegister[i + BITS];
            choice.inputWires.push(new Wire(regBit, 0, [
                {x: choice.position.x - 7, y: choice.position.y - 17},
                {x: regBit.position.x + 20, y: choice.position.y - 17},
                {x: regBit.position.x + 20, y: regBit.position.y},
            ], purple));
            // otherwise we use the subtraction
            const y2 = choice.position.y - 32 - Math.round(Math.abs(i - BITS/2)) * 4
            choice.inputWires.push(new Wire(subtractor, i, [
                {x: choice.position.x + 7, y: y2},
                {x: subtractor.position.x + subtractor.outputSockets[i].x, y: y2}
            ]));
            subtractorChoiceGates.push(choice);
            this.components.push(choice);
        }

        // Shifting the Remainder Register
        // wires:
        // (1) the faded purple wires from the clock control
        // includes many wires
        // also includes register for holding the quotient input
        const fullRow = [];
        for (let i = 0; i <= 2*BITS; i++) {
            const regBit = remainderRegister[i];
            /*const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
            this.components.push(or);
            regBit.inputWires.push(new Wire(or, 0));*/

            // This is the middle (full) row
            const choice = new ChoiceGate(regBit.position.x + (i < BITS ? 5 : -1), regBit.position.y - 95, 14);
            // Selection Wire (from clock's left end)
            choice.inputWires.push(new Wire(clock, 0, [
                {x: choice.position.x - 18, y: choice.position.y},
                {x: choice.position.x - 18, y: choice.position.y - 40},
                {x: 540 - 2*i, y: choice.position.y - 50 - 1*i},
                {x: clockX - 60, y: clock.position.y + clock.size.y/2},
            ], purpleFaded));
            // Purple action
            if (i >= BITS && i < 2*BITS) {
                // Upper Half of the Register: Conditionally connect to the subtractor.
                choice.inputWires.push(new Wire(subtractorChoiceGates[i - BITS], 0, [], purple));
            } else {
                // Lower Half of the Register: Connect to itself.
                choice.inputWires.push(new Wire(regBit, 0, [
                    {x: choice.position.x - 7, y: choice.position.y - 25},
                    {x: regBit.position.x - 18, y: choice.position.y - 25},
                    {x: regBit.position.x - 18, y: regBit.position.y},
                ], purple));
            }
            // Shifting and the Ones Bit
            if (i > 0) {
                choice.inputWires.push(new Wire(remainderRegister[i-1], 0, [
                    {x: choice.position.x + 7, y: choice.position.y - 25},
                    {x: regBit.position.x + 26, y: choice.position.y - 25},
                    {x: regBit.position.x + 26, y: regBit.position.y + 0},
                ], teal));
            } else {
                const holdWrite = new OutputBit(choice.position.x + 7, choice.position.y - 40, 20);
                const notY = subtractorChoiceGates[0].position.y - 25;
                const not = new Not(this.remainderRight - this.remainderSpacing*1.5, notY, 40, -90);
                not.inputWires.push(new Wire(subtractor, BITS, [
                    {x: subtractor.position.x - subtractor.size.x/2, y: notY},
                    {x: subtractor.position.x - subtractor.size.x/2, y: subtractor.position.y}
                ], {color: "#888"}));
                // set on green
                //holdWrite.inputWires.push(new Wire(clockNot, 0, [], teal));
                // value is negated result of subtraction
                holdWrite.inputWires.push(new Wire(not, 0, [
                    {x: holdWrite.position.x, y: not.position.y},
                ], teal));
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

        // Wiring Dividend to seed the remainder register
        // (blue wires, including faded ones)
        const blueRightEdge = this.remainderRight + 33 + 2*BITS;
        let dividendChoice: ChoiceGate[] = [];
        for (let i = 0; i < BITS; i++) {
            const regBit = remainderRegister[i];
            const inBit = inputN[i];

            // This is the one close to the lowest 6 registers
            const choice = new ChoiceGate(regBit.position.x + 3, regBit.position.y - 50, 12);
            // Wire coming from the start button
            choice.inputWires.push(new Wire(startButton, 0, [
                {x: choice.position.x - 15, y: choice.position.y},
                {x: choice.position.x - 15, y: choice.position.y + 15, node: true},
                {x: blueRightEdge, y: choice.position.y + 15},
                {x: blueRightEdge, y: startButton.position.y + (startButton.position.x - blueRightEdge)},
            ], blue));

            // If power is on, make it come from the teal/purple stuff
            choice.inputWires.push(new Wire(fullRow[i], 0));

            // Otherwise, set it to the input
            const d = 2;
            const y1 = fullRow[0].position.y - 70 - d*BITS;
            const y2 = inBit.position.y + 30;
            const x1 = this.remainderRight + 24 + d*BITS;
            choice.inputWires.push(new Wire(inBit, 0, [
                {x: choice.position.x + 6, y: choice.position.y - 10 - d*i},
                {x: x1 - d*i, y: choice.position.y - 10 - d*i},
                {x: x1 - d*i, y: y1 + d*i},
                {x: clockX - 90 - d*i, y: y1 + d*i},
                {x: clockX - 90 - d*i, y: y2 + d*i},
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
                {x: and.position.x + 14, y: and.position.y - 20},
                {x: and.position.x + 14, y: and.position.y + 15, node: i < BITS},
                {x: blueRightEdge, y: and.position.y + 15},
                {x: blueRightEdge, y: startButton.position.y + (startButton.position.x - blueRightEdge)},
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
            const x1 = countdown.position.x + countdown.outputSockets[0].x;
            bit.inputWires.push(new Wire(countdown, 0, [
                {x: bit.position.x - 15, y: bit.position.y - 15},
                {x: bit.position.x - 15, y: bit.position.y - 30},
                {x: x1, y: bit.position.y - 30},
                {x: x1, y: countdown.position.y + 40},
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
        const displayN = new Display(inputN[0].position.x + 54, inputN[0].position.y, inputN, false, 36);
        const displayD = new Display(inputD[0].position.x + 54, inputD[0].position.y, inputD, false, 36);
        const displayQ = new Display(557, 540, finalAnswer.slice(0, BITS), false, 30);
        const displayR = new Display(200, 540, finalAnswer.slice(BITS, 2*BITS), false, 30);

        // rendering trick, because input wires are drawn with a component
        // so pushing these last makes them render last so it looks cleaner
        this.components.push(subtractor, countdown, startButton, displayN, displayD, displayQ, displayR);

        this.remainderRegister = remainderRegister;
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
        ctx.lineWidth = 8;
        ctx.fillStyle = color;
        ctx.font = "30px monospace";
        ctx.strokeText(text, (x1 + x2)/2, y + 25);
        ctx.fillText(text, (x1 + x2)/2, y + 25);
    }

    afterRender = () => {
        // display the quotient
        const ctx = this.context;
        ctx.save();

        const B = this.numBits;

        // get the clock cycle
        const cycle = this.countdown.state.count;
        const n = cycle + (1-this.clock.state.clock);
        if (n <= B+1 && this.clock.state.clock >= 0) {
            let rValue = 0, qValue = 0;
            const rOffset = B + 2 - n; // a quirk of my hardware
            for (let i = 0; i < B; i++) {
                const bit = this.remainderRegister[i + rOffset];
                rValue += Number(bit.state.bits[0]) * (1 << i);
            }
            for (let i = 0; i < (B - n); i++) {
                const bit = this.remainderRegister[i];
                qValue += Number(bit.state.bits[0]) * (1 << (i + n - 1));
            }
            this.drawRemainderGuide(rOffset + this.numBits - 1, rOffset, "#33c", `Remainder (${rValue})`);

            if (n <= B) {
                this.drawRemainderGuide(B - n, 0, "#990", `Quotient (${qValue})`);
            }
        }

        ctx.restore();

        // not sure where to put this
        if (cycle == 0) {
            this.startButton.state.bits = [false];
            if (!this.paused) this.paused = true;
        }
    }
}

export default DividerExploration;

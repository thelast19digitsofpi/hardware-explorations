// MultiplierExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import RegisterBit from './RegisterBit';
import Adder from './Adder';
import Wire from './Wire';
import {AndGate, OrGate, XorGate, Not} from './Gates';
import ChoiceGate from './ChoiceGate';

class MultiplierExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const BITS = 6;

        const startButton = new InputBit(600, 40, false, 50);
        const startNot = new Not(550, 40, 30, 90);
        startNot.inputWires.push(new Wire(startButton, 0));
        this.components.push(startNot);

        const clockX = 595;

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

        const adder = new Adder(160, 190, BITS, 210, 90);

        // The "Register" that really isn't.
        // The Add and Shift steps should be successfully separated...
        let productRegister = [];
        for (let i = 0; i < 2*BITS+1; i++) {
            const reg = new OutputBit(600 - 45*i, 400, 20);
            productRegister.push(reg);
            this.outputComponents.unshift(reg); // todo: is needed?
            this.components.push(reg);
        }

        // Wire Coloring
        const purple = {color: "rgb(128, 32, 128)"};
        const purpleFaded = {color: "rgba(128, 0, 128, 0.25)"};
        const teal = {color: "rgb(0, 128, 128)"};
        const tealFaded = {color: "rgba(0, 128, 128, 0.25)"};

        // Wires from the registers to the adder.
        for (let i = 0; i < BITS; i++) {
            const d = 3;
            const bit = productRegister[i + BITS];
            // basically, we want the most significant bit to be highest
            const y1 = bit.position.y + 20 + d * (BITS - i);
            adder.inputWires.push(new Wire(bit, 0, [
                {x: adder.position.x + adder.inputSockets[i].x, y: 110 + d*i},
                {x: 10 + d*i, y: 110 + d*i},
                {x: 10 + d*i, y: y1},
                {x: bit.position.x, y: y1},
            ], {color: "rgba(128, 0, 128, 0.75)"}));
        }

        // And Gates coming out of the adder (for the clock).
        let adderAndGates = [];
        for (let i = 0; i <= BITS; i++) {
            // and gate
            const x = adder.position.x + adder.outputSockets[i].x;
            const y = adder.position.y + adder.outputSockets[0].y; // put them all on the same line
            // space them a bit
            const and = new AndGate(x + 4 * ((BITS - 1)/2 - i), y + 40, 20, 0);
            and.inputWires.push(new Wire(adder, i));
            adderAndGates.push(and);
            this.components.push(and);
        }

        // Shifting the Multiplication Register
        for (let i = 0; i < 2*BITS + 1; i++) {
            const regBit = productRegister[i];
            const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
            this.components.push(or);
            regBit.inputWires.push(new Wire(or, 0));

            const and1 = new AndGate(regBit.position.x - 10, regBit.position.y - 60, 20, 0);
            and1.inputWires.push(new Wire(clockNot, 0, [
                {x: regBit.position.x + 6, y: regBit.position.y - 100},
                {x: 540 - 2*i, y: regBit.position.y - 110 - 1*i},
            ], tealFaded));
            // Shifting
            if (i < 2*BITS) {
                and1.inputWires.push(new Wire(productRegister[i+1], 0, [
                    {x: regBit.position.x - 6, y: regBit.position.y - 80},
                    {x: regBit.position.x - 21, y: regBit.position.y - 80},
                    {x: regBit.position.x - 21, y: regBit.position.y},
                ], teal));
            }
            const and2 = new AndGate(regBit.position.x + 10, regBit.position.y - 60, 20, 0);
            and2.inputWires.push(new Wire(clockAnd, 0, [
                {x: regBit.position.x + 6, y: regBit.position.y - 100},
                {x: 540 - 2*i, y: regBit.position.y - 110 - 1*i},
            ], purpleFaded));
            this.components.push(and1, and2);

            if (i >= BITS) {
                // Upper Half of the Register: Connect to the adder.
                and2.inputWires.push(new Wire(adderAndGates[i - BITS], 0, [], purple));
            } else {
                // Lower Half of the Register: Connect to itself.
                and2.inputWires.push(new Wire(regBit, 0, [
                    {x: regBit.position.x + 14, y: regBit.position.y - 75},
                    {x: regBit.position.x + 21, y: regBit.position.y - 75},
                    {x: regBit.position.x + 21, y: regBit.position.y},
                ], purple));
            }

            or.inputWires.push(new Wire(and1, 0));
            or.inputWires.push(new Wire(and2, 0));
        }

        // Input Numbers (A and B).
        let inputA = [];
        let inputB = [];
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(270 - i*25, 60);
            this.components.push(input);
            adder.inputWires.push(new Wire(input, 0));
            inputA.push(input); // in case we need it
        }
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(540 - i*45, 60);
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
            choice.inputWires.push(new Wire(inputB[i], 0));
            // Otherwise use the
            choice.inputWires.push(new Wire(multiplierRegister[i+1] || null, 0, [
                {x: reg.position.x + 14, y: reg.position.y - 80},
                {x: reg.position.x - 22, y: reg.position.y - 80},
                {x: reg.position.x - 22, y: reg.position.y + 10},
            ]));

            this.components.push(or, choice);
        }

        // Control Wire from the final register bit to the adder's output
        const regLSB = multiplierRegister[0];
        for (let i = 0; i < BITS; i++) {
            const and = adderAndGates[i];
            console.log(regLSB);
            and.inputWires.push(new Wire(regLSB, 0, [
                {x: and.position.x + 10, y: and.position.y - 20},
                {x: 282, y: and.position.y - 20},
                {x: 282, y: regLSB.position.y + 20},
                {x: regLSB.position.x, y: regLSB.position.y + 20},
            ], {color: "rgb(127, 127, 127)"}));
        }

        const testBit = new OutputBit(640, 100);
        this.components.push(testBit);
        this.outputComponents.push(testBit);
        testBit.inputWires.push(new Wire(clockAnd, 0, [], purple));

        // rendering trick, because input wires are drawn with a component
        // so rendering these last makes it look cleaner
        this.components.push(adder, startButton);
    }
}

export default MultiplierExploration;

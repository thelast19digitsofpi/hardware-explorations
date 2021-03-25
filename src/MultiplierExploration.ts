// MultiplierExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import RegisterBit from './RegisterBit';
import Adder from './Adder';
import Wire from './Wire';
import {AndGate, OrGate, XorGate, Not} from './Gates';

class MultiplierExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const BITS = 6;

        const startButton = new InputBit(50, 50, false, 40);
        this.components.push(startButton);

        const clockAnd = new AndGate(50, 100, 25, 0);
        const clockNot = new Not(50, 150, 25, 0);
        const clockBit = new OutputBit(50, 200);


        clockAnd.inputWires.push(new Wire(clockNot, 0, [
            {x: 45, y: 75},
            {x: 30, y: 75},
            {x: 30, y: 175},
            {x: 50, y: 175}
        ]));
        clockAnd.inputWires.push(new Wire(startButton, 0));
        clockBit.inputWires.push(new Wire(clockNot, 0));
        clockNot.inputWires.push(new Wire(clockAnd, 0));
        this.components.push(clockAnd, clockNot, clockBit);
        this.outputComponents.push(clockBit);

        const adder = new Adder(300, 200, BITS, 240);
        for (let i = 0; i < BITS; i++) {
            const d = 3;
            adder.inputWires.push(new Wire(adder, i, [
                {x: adder.position.x + adder.inputSockets[i].x, y: 110 + d*i},
                {x: 110 + d*i, y: 110 + d*i},
                {x: 110 + d*i, y: 290 - d*i},
                {x: adder.position.x + adder.outputSockets[i].x, y: 290 - d*i},
            ], {color: "rgba(0, 128, 128, 0.75)"}));
        }

        // Two inputs.
        let inputA = [];
        let inputB = [];
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(400 - i*25, 50);
            adder.inputWires.push(new Wire(input, 0, []));
            this.components.push(input);
            inputA.push(input); // in case we need it
        }
        for (let i = 0; i < BITS; i++) {
            const input = new InputBit(600 - i*25, 50);
            //adder.inputWires.push(new Wire(input, 0, []));
            this.components.push(input);
            inputB.push(input);
        }

        for (let i = 0; i < BITS; i++) {
            const output = new OutputBit(270 + i*20, 350);
            this.outputComponents.push(output);
            output.inputWires.push(new Wire(adder, i, []));
        }

        // Registers
        let productRegister = [];
        for (let i = 0; i < 2*BITS+1; i++) {
            const reg = new OutputBit(600 - 45*i, 400, 20);
            productRegister.push(reg);
            this.outputComponents.push(reg); // todo: is needed?
            this.components.push(reg);
        }

        // Wire Coloring
        const purple = {color: "rgb(128, 0, 128)"};
        const purpleFaded = {color: "rgba(128, 0, 128, 0.25)"};
        const teal = {color: "rgb(0, 128, 128)"};
        const tealFaded = {color: "rgba(0, 128, 128, 0.25)"};

        // Shifting the Multiplication Register
        for (let i = 0; i < 2*BITS + 1; i++) {
            const regBit = productRegister[i];
            const or = new OrGate(regBit.position.x, regBit.position.y - 30, 20, 0);
            this.components.push(or);
            regBit.inputWires.push(new Wire(or, 0));

            const and1 = new AndGate(regBit.position.x - 10, regBit.position.y - 60, 20, 0);
            and1.inputWires.push(new Wire(clockNot, 0, [], purpleFaded));
            // Shifting
            if (i < 2*BITS) {
                and1.inputWires.push(new Wire(productRegister[i+1], 0, [
                    {x: regBit.position.x - 6, y: regBit.position.y - 80},
                    {x: regBit.position.x - 21, y: regBit.position.y - 80},
                    {x: regBit.position.x - 21, y: regBit.position.y},
                ], purple));
            }
            const and2 = new AndGate(regBit.position.x + 10, regBit.position.y - 60, 20, 0);
            and2.inputWires.push(new Wire(clockAnd, 0, [], tealFaded));
            this.components.push(and1, and2);

            if (i >= BITS && i < 2*BITS) {
                // Upper Half of the Register: Connect to the adder.
                and2.inputWires.push(new Wire(adder, i - BITS, [], teal));
            } else {
                // Lower Half of the Register: Connect to itself.
                and2.inputWires.push(new Wire(regBit, 0, [
                    {x: regBit.position.x + 14, y: regBit.position.y - 75},
                    {x: regBit.position.x + 21, y: regBit.position.y - 75},
                    {x: regBit.position.x + 21, y: regBit.position.y},
                ], teal));
            }

            or.inputWires.push(new Wire(and1, 0));
            or.inputWires.push(new Wire(and2, 0));
        }

        this.components.push(adder);
    }
}

export default MultiplierExploration;

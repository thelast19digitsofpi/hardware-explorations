// RegisterExploration
//
// Exploration that shows how a register bit works.
// Most of these (not multipliers and dividers) have the expanded version on the left and a compact version on the right.

import Component from './Component';
import Exploration from './Exploration';
import Wire from './Wire';
import RegisterBit from './RegisterBit';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

class OldRegisterExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const inputOff = new InputBit(50, 100);
        this.components.push(inputOff);

        const inputOn = new InputBit(150, 100);
        this.components.push(inputOn);

        const inverter = new Not(50, 150, 40, 0);
        this.components.push(inverter);
        inverter.inputWires.push(new Wire(inputOff, 0));

        // recursive components are a bit weird
        const and = new AndGate(100, 230, 50, 0);
        const or = new OrGate(160, 150, 50, 0);
        this.components.push(and, or);
        and.inputWires.push(new Wire(inverter, 0, [{x: 90, y: 180}, {x: 50, y: 180}]));
        and.inputWires.push(new Wire(or, 0, [{x: 110, y: 180}, {x: 160, y: 180}]));
        or.inputWires.push(new Wire(inputOn, 0));
        or.inputWires.push(new Wire(and, 0, [
            {x: 190, y: 125},
            {x: 190, y: 260},
            {x: 100, y: 260},
        ]));

        const output = new OutputBit(100, 300);
        output.inputWires.push(new Wire(and, 0))
        this.components.push(output);
        this.outputComponents.push(output);

        // the simplified version
        const inputOff2 = new InputBit(250, 150);
        const inputOn2 = new InputBit(350, 150);
        const register = new RegisterBit(300, 200, 40);
        const output2 = new OutputBit(300, 250);
        register.inputWires.push(new Wire(inputOff2, 0));
        register.inputWires.push(new Wire(inputOn2, 0));
        output2.inputWires.push(new Wire(register, 0));

        this.components.push(inputOn2, inputOff2, register, output2);
        this.outputComponents.push(output2);
    }

}

export default OldRegisterExploration;

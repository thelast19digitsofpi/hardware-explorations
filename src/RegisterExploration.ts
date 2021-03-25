// RegisterExploration
//
// Exploration that shows how a register bit works.
// Most of these (not multipliers and dividers) have the expanded version on the left and a compact version on the right.

import Exploration from './Exploration';
import Wire from './Wire';
import RegisterBit from './RegisterBit';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

class RegisterExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const inputSet = new InputBit(50, 100);
        this.components.push(inputSet);

        const inputWhat = new InputBit(150, 100);
        this.components.push(inputWhat);

        const inverter = new Not(50, 150, 30, 0);
        this.components.push(inverter);
        inverter.inputWires.push(new Wire(inputSet, 0));

        // recursive components are a bit weird
        const andWhat = new AndGate(140, 150, 50, 0);
        const andStay = new AndGate(80, 200, 50, 0);
        const or = new OrGate(100, 250, 50, 0);

        andWhat.inputWires= [
            new Wire(inputSet, 0, [
                {x: 50, y: 125},
            ]),
            new Wire(inputWhat, 0, [])
        ];
        andStay.inputWires = [
            new Wire(or, 0, [
                {x: 50, y: 175},
                {x: 50, y: 270},
            ]),
            new Wire(inverter, 0, [
                {x: 90, y: 165},
                {x: 50, y: 165},
            ])
        ];
        or.inputWires = [
            new Wire(andStay, 0, []),
            new Wire(andWhat, 0, []),
        ];
        this.components.push(andWhat, andStay, or);


        const output = new OutputBit(100, 300);
        output.inputWires.push(new Wire(or, 0))
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

export default RegisterExploration;

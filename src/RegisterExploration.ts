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
import ChoiceGate from './ChoiceGate';

class RegisterExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const inputSet = new InputBit(40, 80, false, 30);
        this.components.push(inputSet);

        const inputWhat = new InputBit(140, 80, false, 30);
        this.components.push(inputWhat);

        const choice = new ChoiceGate(100, 200, 50);
        this.components.push(choice);

        choice.inputWires.push(new Wire(inputSet, 0, [
            {x: inputSet.position.x, y: choice.position.y},
        ]));
        choice.inputWires.push(new Wire(inputWhat, 0, [
            {x: choice.position.x + choice.inputSockets[1].x, y: choice.position.y - 70},
            {x: inputWhat.position.x, y: choice.position.y - 70},
        ]));
        choice.inputWires.push(new Wire(choice, 0, [
            {x: choice.position.x + choice.inputSockets[2].x, y: choice.position.y - 50},
            {x: choice.position.x + 60, y: choice.position.y - 50},
            {x: choice.position.x + 60, y: choice.position.y + 50},
            {x: choice.position.x, y: choice.position.y + 50, node: true},
        ]));


        const output = new OutputBit(100, 320, 32);
        output.inputWires.push(new Wire(choice, 0))
        this.components.push(output);
        this.outputComponents.push(output);

        // the simplified version
        const inputOff2 = new InputBit(250, 150, false, 32);
        const inputOn2 = new InputBit(350, 150, false, 32);
        const register = new RegisterBit(300, 200, 40);
        const output2 = new OutputBit(300, 250);
        register.inputWires.push(new Wire(inputOff2, 0));
        register.inputWires.push(new Wire(inputOn2, 0));
        output2.inputWires.push(new Wire(register, 0));

        this.components.push(register, output2, inputOn2, inputOff2);
        this.outputComponents.push(output2);
    }

}

export default RegisterExploration;

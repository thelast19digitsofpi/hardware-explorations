// ChoiceExploration
//
// Exploration that shows how a multiplexer works.
// I called it a "choice gate" because "multiplexer" and "multiplier" look too similar.

import Exploration from './Exploration';
import Wire from './Wire';
import ChoiceGate from './ChoiceGate';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

class ChoiceExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const inputChoice = new InputBit(50, 90, false, 30);
        const inputElse = new InputBit(100, 90, false, 30);
        const inputIf = new InputBit(150, 90, false, 30);
        this.components.push(inputChoice, inputIf, inputElse);

        const inverter = new Not(115, 150, 30, 0);
        this.components.push(inverter);
        inverter.inputWires.push(new Wire(inputChoice, 0, [
            {x: 115, y: 125},
            {x: 50, y: 125},
        ]));

        // recursive components are a bit weird
        const andIf = new AndGate(125, 200, 50, 0);
        const andElse = new AndGate(75, 200, 50, 0);
        const or = new OrGate(100, 250, 50, 0);

        andIf.inputWires = [
            new Wire(inverter, 0, []),
            new Wire(inputIf, 0, [
                {x: 135, y: 170},
                {x: 150, y: 170},
            ]),
        ];
        andElse.inputWires = [
            new Wire(inputChoice, 0, [
                {x: 65, y: 170},
                {x: 50, y: 170},
            ]),
            new Wire(inputElse, 0, [
                {x: 85, y: 170},
                {x: 100, y: 170},
            ]),
        ];
        or.inputWires = [
            new Wire(andElse, 0, []),
            new Wire(andIf, 0, []),
        ];
        this.components.push(andIf, andElse, or);


        const output = new OutputBit(100, 300);
        output.inputWires.push(new Wire(or, 0))
        this.components.push(output);
        this.outputComponents.push(output);

        // the simplified version
        const inputChoice2 = new InputBit(240, 120, false, 30);
        const inputIf2 = new InputBit(280, 120, false, 30);
        const inputElse2 = new InputBit(320, 120, false, 30);
        const choice = new ChoiceGate(300, 200, 40);
        const output2 = new OutputBit(300, 250);
        choice.inputWires.push(new Wire(inputChoice2, 0, [
            {x: inputChoice2.position.x, y: choice.position.y},
        ]));
        choice.inputWires.push(new Wire(inputIf2, 0));
        choice.inputWires.push(new Wire(inputElse2, 0));
        output2.inputWires.push(new Wire(choice, 0));

        this.components.push(inputChoice2, inputIf2, inputElse2, choice, output2);
        this.outputComponents.push(output2);
    }

}

export default ChoiceExploration;

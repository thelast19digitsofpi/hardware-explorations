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
import { BinarySwitch, NotSwitch } from './UserGates';
import AnswerChecker from './AnswerChecker';

class ChoiceExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const inputChoice = new InputBit(20, 100, false, 30);
        const inputIf = new InputBit(90, 70, false, 30);
        const inputElse = new InputBit(150, 70, false, 30);


        const inverterLeft = new NotSwitch(50, 135, 40, 0);
        this.components.push(inverterLeft);
        inverterLeft.inputWires.push(new Wire(inputChoice, 0, [
            {x: inverterLeft.position.x, y: inputChoice.position.y, node: true},
            {x: inputChoice.position.x, y: inputChoice.position.y},
        ]));

        const inverterRight = new NotSwitch(125, 135, 40, 0);
        this.components.push(inverterRight);
        inverterRight.inputWires.push(new Wire(inputChoice, 0, [
            {x: inverterRight.position.x, y: inputChoice.position.y},
            {x: inputChoice.position.x, y: inputChoice.position.y},
        ]));

        // recursive components are a bit weird
        const andIf = new BinarySwitch(inverterLeft.position.x + 9, 210, 60, 0);
        const andElse = new BinarySwitch(141, 210, 60, 0);
        const or = new BinarySwitch(100, 300, 60, 0);

        andIf.inputWires = [
            new Wire(inverterLeft, 0, []),
            new Wire(inputIf, 0, [
                {x: andIf.position.x + 9, y: 170},
                {x: inputIf.position.x, y: 170},
            ]),
        ];
        andElse.inputWires = [
            new Wire(inverterRight, 0, [
                {x: andElse.position.x - 9, y: 170},
                {x: inverterRight.position.x, y: 170},
            ]),
            new Wire(inputElse, 0, [
                {x: andElse.position.x + 9, y: 170},
                {x: inputElse.position.x, y: 170},
            ]),
        ];
        or.inputWires = [
            new Wire(andIf, 0, []),
            new Wire(andElse, 0, []),
        ];
        this.components.push(andIf, andElse, or);
        this.components.push(inputChoice, inputIf, inputElse);

        // for people to debug their circuits
        const helpLeft = new OutputBit(andIf.position.x, andIf.position.y + 35, 10);
        helpLeft.inputWires.push(new Wire(andIf, 0));
        const helpRight = new OutputBit(andElse.position.x, andElse.position.y + 35, 10);
        helpRight.inputWires.push(new Wire(andElse, 0));
        this.components.push(helpLeft, helpRight);
        this.outputComponents.push(helpLeft, helpRight);

        const output = new OutputBit(100, 345, 30);
        output.inputWires.push(new Wire(or, 0))
        this.components.push(output);
        this.outputComponents.push(output);

        // the simplified version
        const inputChoice2 = new InputBit(240, 160, false, 30);
        const inputIf2 = new InputBit(280, 120, false, 30);
        const inputElse2 = new InputBit(320, 120, false, 30);
        const choice = new ChoiceGate(300, 200, 40);
        const output2 = new OutputBit(300, 250, 30);
        choice.inputWires.push(new Wire(inputChoice2, 0, [
            {x: inputChoice2.position.x, y: choice.position.y},
        ]));
        choice.inputWires.push(new Wire(inputIf2, 0));
        choice.inputWires.push(new Wire(inputElse2, 0));
        output2.inputWires.push(new Wire(choice, 0));

        this.components.push(choice, output2, inputChoice2, inputIf2, inputElse2);
        this.outputComponents.push(output2);

        const checker = new AnswerChecker(this, 310, 350, [
            [inputChoice, inputChoice2],
            [inputIf, inputIf2],
            [inputElse, inputElse2]
        ], [output], function(bits: boolean[]) {
            return [bits[0] ? bits[1] : bits[2]];
        });
        this.components.push(checker);
        this.outputComponents.push(checker);
    }

}

export default ChoiceExploration;

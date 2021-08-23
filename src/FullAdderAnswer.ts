// FullAdderGates.ts
//
// Still just one bit each. That is, three total (A,B,carry).

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import Text from './Text';
import { AndGate, OrGate, XorGate } from './Gates';
import { BinarySwitch } from './UserGates';
import AnswerChecker from './AnswerChecker';

class FullAdderAnswer extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 300, 400);

        const inputA = new InputBit(40, 50, false, 32);
        const inputB = new InputBit(160, 50, false, 32);
        const inputC = new InputBit(250, 180, false, 32);
        const output1 = new OutputBit(inputB.position.x - 1, 340, 30);
        const output2 = new OutputBit(inputA.position.x + 19, 340, 30);

        const and1 = new AndGate(inputA.position.x + 10, 125, 50, 0);
        and1.inputWires.push(new Wire(inputA, 0));
        and1.inputWires.push(new Wire(inputB, 0, [
            {x: and1.position.x + 10, y: and1.position.y - 35},
        ]));

        const xor1 = new XorGate(inputB.position.x - 10, 125, 50, 0);
        xor1.inputWires.push(new Wire(inputA, 0, [
            {x: xor1.position.x - 10, y: and1.position.y - 35},
        ]));
        xor1.inputWires.push(new Wire(inputB, 0));

        const xor2 = new XorGate(output1.position.x, 280, 45, 0);
        xor2.inputWires.push(new Wire(xor1, 0));
        xor2.inputWires.push(new Wire(inputC, 0, [
            {x: xor2.position.x + 9, y: inputC.position.y, node: true},
        ]));

        output1.inputWires.push(new Wire(xor2, 0));

        const and2 = new AndGate(output2.position.x + 30, 220, 45, 0);
        and2.inputWires.push(new Wire(xor1, 0, [
            {x: and2.position.x - 9, y: 165},
            {x: xor1.position.x, y: 165, node: true},
        ]));
        and2.inputWires.push(new Wire(inputC, 0, [
            {x: and2.position.x + 9, y: inputC.position.y},
        ]));

        // or gate for the "2" output
        const or2 = new OrGate(output2.position.x, output2.position.y - 44, 45, 0);
        or2.inputWires.push(new Wire(and1, 0));
        or2.inputWires.push(new Wire(and2, 0, [
            // add 12 because of the output bit
            {x: or2.position.x + 9, y: (and2.position.y + or2.position.y + 6)/2},
            {x: and2.position.x, y: (and2.position.y + or2.position.y + 6)/2}
        ]));
        output2.inputWires.push(new Wire(or2, 0));

        this.components.push(output1, output2, and1, xor1, and2, xor2, or2, inputA, inputB, inputC);

        // for ease of visualization
        const aid1 = new OutputBit(xor1.position.x, xor1.position.y + 27, 12);
        aid1.inputWires.push(new Wire(xor1, 0));
        const aid2 = new OutputBit(and1.position.x, and1.position.y + 27, 12);
        aid2.inputWires.push(new Wire(and1, 0));
        const aid3 = new OutputBit(and2.position.x, and2.position.y + 30, 12);
        aid3.inputWires.push(new Wire(and2, 0));
        this.components.push(aid1, aid2, aid3);

        // Number Display
        const displayResult = new Display(240, 340, [output1, output2], false, 42);
        this.components.push(displayResult);

        const labelA = new Text(inputA.position.x, 20, 30, "A");
        const labelB = new Text(inputB.position.x, 20, 30, "B");
        const labelC = new Text(inputC.position.x, inputC.position.y - 40, 30, "C");
        const text1 = new Text(output1.position.x, 375, 30, "1", { color: '#333' });
        const text2 = new Text(output2.position.x, 375, 30, "2", { color: '#333' });
        this.components.push(labelA, labelB, labelC, text1, text2);

        // Updating
        this.outputComponents.push(output1, output2, aid1, aid2, aid3);
    }
}

export default FullAdderAnswer;

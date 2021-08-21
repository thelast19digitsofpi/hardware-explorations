// HalfAdderCheat.ts
//
// The finished product with no accompanying circuit.

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import Text from './Text';

class HalfAdderCheat extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 300, 300);

        const inputA = new InputBit(100, 40, false, 30);
        const inputB = new InputBit(200, 40, false, 30);
        const output1 = new OutputBit(150, 240, 30);
        const output2 = new OutputBit(75, 240, 30);
        const adder = new Adder(150, 150, 1, 200, 100);
        this.components.push(adder, inputA, inputB, output1, output2);
        adder.inputWires.push(new Wire(inputA, 0));
        adder.inputWires.push(new Wire(inputB, 0));
        output1.inputWires.push(new Wire(adder, 0));
        output2.inputWires.push(new Wire(adder, 1));

        const displayResult = new Display(240, 250, [output1, output2], false, 40);
        this.components.push(displayResult);
        this.outputComponents.push(output1, output2);

        const text1 = new Text(150, 275, 24, "1", { color: '#333' });
        const text2 = new Text(75, 275, 24, "2", { color: '#333' });
        this.components.push(text1, text2);
    }
}

export default HalfAdderCheat;

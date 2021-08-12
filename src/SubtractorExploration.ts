// adderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import { Not } from './Gates';

class SubtractorExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 400, 400);

        const adder = new Adder(200, 200, 4, 216);
        this.components.push(adder);

        let inputA = [], inputB = [];
        for (let i = 0; i < 4; i++) {
            const bit = new InputBit(adder.position.x + adder.inputSockets[3-i].x, 60);
            adder.inputWires.unshift(new Wire(bit, 0));
            this.components.push(bit);
            inputA.unshift(bit);

            const bit2 = new InputBit(adder.position.x + adder.inputSockets[4+i].x, 60);
            const not = new Not(bit2.position.x, bit2.position.y + 50, 30, 0);
            not.inputWires.push(new Wire(bit2, 0));
            adder.inputWires.push(new Wire(not, 0));
            this.components.push(bit2, not);
            inputB.push(bit2);
        }
        const floatingNot = new Not(320, 200, 30, 90);
        adder.inputWires.push(new Wire(floatingNot, 0));
        this.components.push(floatingNot);
        const outputBits = [];
        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(adder.position.x + adder.outputSockets[i].x, 310);
            output.inputWires.push(new Wire(adder, i, []));
            outputBits.push(output);
        }
        this.outputComponents.push(...outputBits);
        this.components.push(...outputBits);

        this.components.push(new Display(150, 25, inputA, true));
        this.components.push(new Display(250, 25, inputB, true));
        this.components.push(new Display(adder.position.x, 360, outputBits, true, 40));

    }
}

export default SubtractorExploration;

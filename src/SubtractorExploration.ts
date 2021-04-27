// SubtractorExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Subtractor from './Subtractor';
import Wire from './Wire';
import Display from './Display';

class SubtractorExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const subtractor = new Subtractor(200, 200, 4);
        this.components.push(subtractor);

        for (let i = 0; i < 4; i++) {
            const bit = new InputBit(40 + i*40, 30);
            subtractor.inputWires.unshift(new Wire(bit, 0, [
                {x: 112.5 + i*25, y: 120 - i*20},
                {x: 40 + i*40, y: 120 - i*20},
            ]));
            this.components.push(bit);

            const bit2 = new InputBit(360 - i*40, 40);
            subtractor.inputWires.push(new Wire(bit2, 0, []));
            this.components.push(bit2);
        }
        const outputBits = [];
        for (let i = 0; i < 5; i++) {
            const output = new OutputBit(245 - i*30, 300);
            output.inputWires.push(new Wire(subtractor, i, []));
            outputBits.push(output);
        }
        this.outputComponents.push(...outputBits);
        this.components.push(...outputBits);

        this.components.push(new Display(200, 330, outputBits, true));
    }
}

export default SubtractorExploration;

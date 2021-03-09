// AdderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';

class AdderExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        const adder = new Adder(200, 200, 4);
        this.components.push(adder);

        for (let i = 0; i < 4; i++) {
            const bit = new InputBit(40 + i*40, 30);
            adder.inputWires.unshift(new Wire(bit, 0, [
                {x: 112.5 + i*25, y: 120 - i*20},
                {x: 40 + i*40, y: 120 - i*20},
            ]));
            this.components.push(bit);

            const bit2 = new InputBit(360 - i*40, 40);
            adder.inputWires.push(new Wire(bit2, 0, []));
            this.components.push(bit2);
        }

        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(245 - i*30, 300);
            output.inputWires.push(new Wire(adder, i, []));
            this.components.push(output);
            this.outputComponents.push(output);
        }
    }
}

export default AdderExploration;

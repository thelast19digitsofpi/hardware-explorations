// AdderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';

// for testing
import {AndGate, OrGate, XorGate, Not} from './Gates';

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

        const andGate = new AndGate(365, 240, 60, 0);
        const orGate = new OrGate(425, 240, 60, 0);
        const xorGate = new XorGate(485, 240, 60, 0);
        const not = new Not(545, 240, 60, 0);

        this.components.push(andGate);
        this.components.push(orGate);
        this.components.push(xorGate);
        this.components.push(not);

        for (let i = 0; i < 7; i++) {
            const bit = new InputBit(350 + i*30, 180);
            this.components.push(bit);

            if (i < 2) {
                andGate.inputWires.push(new Wire(bit, 0, []));
            } else if (i < 4) {
                orGate.inputWires.push(new Wire(bit, 0, []));
            } else if (i < 6) {
                xorGate.inputWires.push(new Wire(bit, 0, []));
            } else {
                not.inputWires.push(new Wire(bit, 0, []));
            }
        }

        const testGates = [andGate, orGate, xorGate, not];
        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(365 + 60*i, 300);
            this.components.push(output);
            this.outputComponents.push(output);
            output.inputWires.push(new Wire(testGates[i], 0, []));
        }
    }
}

export default AdderExploration;

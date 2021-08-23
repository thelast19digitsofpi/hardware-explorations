// AdderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import {AndGate, OrGate, XorGate} from './Gates';
import Display from './Display';

class AdderFailExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 400, 300);

        const adder = new Adder(200, 170, 4);
        this.components.push(adder);

        let inputA = [];
        let inputB = [];

        for (let i = 0; i < 4; i++) {
            const y = 105 - i*15;
            const bitA = new InputBit(adder.position.x - 100 + i*25, 30);
            adder.inputWires.unshift(new Wire(bitA, 0, [
                {x: bitA.position.x + 12.5, y: 105 - i*15},
                {x: bitA.position.x, y: 105 - i*15},
            ]));
            inputA.unshift(bitA);

            const bitB = new InputBit(adder.position.x + 100 - i*25, 30);
            adder.inputWires.push(new Wire(bitB, 0, [
                {x: bitB.position.x - 12.5, y: 105 - i*15},
                {x: bitB.position.x, y: 105 - i*15},
            ]));
            inputB.push(bitB);
        }

        let outputBits = [];
        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(adder.position.x + 37.5 - i*25, 260);
            output.inputWires.push(new Wire(adder, i, []));
            outputBits.push(output);
        }

        this.components.push(...inputA, ...inputB, ...outputBits);

        const displayA = new Display(35, 30, inputA, "signmag");
        const displayB = new Display(365, 30, inputB, "signmag");
        const displayResult = new Display(320, 260, outputBits, "signmag", 40);

        this.components.push(displayA, displayB, displayResult);

        this.outputComponents.push(...outputBits);
    }
}

export default AdderFailExploration;

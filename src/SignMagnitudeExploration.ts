// BinaryExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import Text from './Text';

class SignMagnitudeExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 480, 240);

        const NUM_BITS = 6;
        let bitArray = [];
        for (let i = 0; i < NUM_BITS; i++) {
            const bit = new InputBit(440 - 80*i, 80, false, 30);
            bitArray.push(bit);

            const text = new Text(bit.position.x, bit.position.y / 2, 30,
                i == 5 ? "±" : String(2**i));
            this.components.push(text);
        }

        this.components.push(...bitArray);
        this.outputComponents.push(...bitArray);

        const display = new Display(240, 160, bitArray, "signmag", 48);
        this.components.push(display);
        this.outputComponents.push(display);
    }
}

export default SignMagnitudeExploration;

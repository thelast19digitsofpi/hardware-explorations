// AdderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import Text from './Text';

class TwosCompAdderExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 400, 300);

        const adder = new Adder(200, 160, 4);
        this.components.push(adder);

        let inputA = [];
        let inputB = [];

        for (let i = 0; i < 4; i++) {
            const y = 90 - i*10;
            const bitA = new InputBit(adder.position.x - 100 + i*25, 30);
            adder.inputWires.unshift(new Wire(bitA, 0, [
                {x: bitA.position.x + 12.5, y: y},
                {x: bitA.position.x, y: y},
            ]));
            inputA.unshift(bitA);

            const bitB = new InputBit(adder.position.x + 100 - i*25, 30);
            adder.inputWires.push(new Wire(bitB, 0, [
                {x: bitB.position.x - 12.5, y: y},
                {x: bitB.position.x, y: y},
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

        const displayA = new Display(35, 30, inputA, "2comp");
        const displayB = new Display(365, 30, inputB, "2comp");
        const displayResult = new Display(200, 350, outputBits, "2comp", 40);

        const calc1 = new Text(330, 230, 20, function() {
            const a = Number(displayA.getValue());
            const b = Number(displayB.getValue());
            return `Correct: ${a + b}`;
        });
        const calc2 = new Text(calc1.position.x, calc1.position.y + 25, 20, function() {
            const displayed = displayResult.getValue();
            return `Guess: ${displayed}`;
        });
        const calc3 = new Text(calc2.position.x, calc2.position.y + 25, 20, function() {
            const a = Number(displayA.getValue());
            const b = Number(displayB.getValue());
            const sum = Number(displayResult.getValue());
            const error = sum - a - b;
            return `Error: ${(error <= 0 ? '' : '+')}${error}`;
        });

        this.components.push(displayA, displayB, displayResult, calc1, calc2, calc3);

        this.outputComponents.push(...outputBits);
    }
}

export default TwosCompAdderExploration;

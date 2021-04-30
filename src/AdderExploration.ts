// AdderExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import {AndGate, OrGate, XorGate, Not} from './Gates';
import Display from './Display';

class AdderExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        canvas.width = 600;
        canvas.height = 400;

        const adder = new Adder(120, 200, 4);
        this.components.push(adder);

        for (let i = 0; i < 4; i++) {
            const bit = new InputBit(adder.position.x - 100 + i*25, 30);
            adder.inputWires.unshift(new Wire(bit, 0, [
                {x: bit.position.x + 12.5, y: 120 - i*20},
                {x: bit.position.x, y: 120 - i*20},
            ]));
            this.components.push(bit);

            const bit2 = new InputBit(adder.position.x + 100 - i*25, 30);
            adder.inputWires.push(new Wire(bit2, 0, [
                {x: bit2.position.x - 12.5, y: 120 - i*20},
                {x: bit2.position.x, y: 120 - i*20},
            ]));
            this.components.push(bit2);
        }

        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(adder.position.x + 37.5 - i*25, 300);
            output.inputWires.push(new Wire(adder, i, []));
            this.components.push(output);
            this.outputComponents.push(output);
        }

        let rightInputA = [];
        let rightInputB = [];
        let rightOutput = [];
        let carryOuts = [];
        for (let i = 0; i < 4; i++) {
            const bitA = new InputBit(530 - i*80, 30);
            rightInputA.push(bitA);

            const bitB = new InputBit(570 - i*80, 90);
            rightInputB.push(bitB);

            // full adder
            const x1 = (bitA.position.x + bitB.position.x)/2;
            const y1 = bitB.position.y + 60;
            const and = new AndGate(x1 - 20, y1, 24, 0);
            and.inputWires.push(new Wire(bitA, 0, []));
            and.inputWires.push(new Wire(bitB, 0, []));
            const xor = new XorGate(x1 + 20, y1, 24, 0);
            xor.inputWires.push(new Wire(bitA, 0, []));
            xor.inputWires.push(new Wire(bitB, 0, []));

            const outBit = new OutputBit(x1, 300, 20);
            rightOutput.push(outBit);

            if (i > 0) {
                // need a second phase of the adder
                const and2 = new AndGate(x1 - 10, y1 + 50, 24, 0);
                and2.inputWires.push(new Wire(xor, 0, []));
                and2.inputWires.push(new Wire(carryOuts[i-1], 0, []));

                const xor2 = new XorGate(x1 + 15, y1 + 70, 24, 0);
                xor2.inputWires.push(new Wire(xor, 0, []));
                xor2.inputWires.push(new Wire(carryOuts[i-1], 0, []));

                const or2 = new OrGate(x1 - 20, y1 + 80, 24, 0);
                or2.inputWires.push(new Wire(and, 0, []));
                or2.inputWires.push(new Wire(and2, 0, []));

                carryOuts[i] = or2;
                outBit.inputWires.push(new Wire(xor2, 0, []));
                this.components.push(or2, and2, xor2);
            } else {
                carryOuts[i] = and;
                outBit.inputWires.push(new Wire(xor, 0, []));
            }

            this.components.push(and, xor, outBit);
        }

        const finalCarry = new OutputBit(250, 250, 20);
        finalCarry.inputWires.push(new Wire(carryOuts[3], 0, []));
        rightOutput.push(finalCarry);

        this.components.push(finalCarry, ...rightInputA, ...rightInputB);

        const displayA = new Display(570, 30, rightInputA);
        const displayB = new Display(570, 90, rightInputB);
        const displayResult = new Display(400, 350, rightOutput, false, 40);

        this.components.push(displayA, displayB, displayResult);

        this.outputComponents.push(...rightOutput);
    }
}

export default AdderExploration;

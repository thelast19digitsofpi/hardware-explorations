// MultiplierNaiveExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import {AndGate, OrGate, XorGate} from './Gates';
import Display from './Display';

class MultiplierNaiveExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 600, 600);

        const blue = {color: "rgba(32,32,128,0.75)"};
        const teal = {color: "rgba(96,160,160,1)"};

        const numBits = 4;

        let inputA = [], inputB = [], outputBits = [];

        for (let i = 0; i < numBits; i++) {
            const bitA = new InputBit(140 - 35*i, 30, false, 30);
            inputA.push(bitA);

            const bitB = new InputBit(465 - 35*i, 30, false, 30);
            inputB.push(bitB);
        }

        let adders = [];
        for (let i = 0; i < numBits; i++) {
            const adder = new Adder(430 - 75*i, 170 + 105*i, numBits, 200, 60);
            adders.push(adder);

            for (let j = 0; j < numBits; j++) {
                const and = new AndGate(
                    adder.position.x + adder.inputSockets[j].x,
                    adder.position.y - adder.size.y/2 - 20,
                    20,
                    0
                );
                and.inputWires.push(new Wire(inputA[i], 0, [
                    {x: and.position.x - 6, y: and.position.y - 20},
                    {x: inputA[i].position.x, y: and.position.y - 20},
                ], blue));

                const d1 = 24 + 3*i - (8+i)*j;
                and.inputWires.push(new Wire(inputB[j], 0, (i > 0) ? [
                    {x: and.position.x + 4, y: and.position.y - 28},
                    {x: and.position.x + 4 - d1, y: and.position.y - 28 - d1},
                    {x: and.position.x + 4 - d1, y: inputB[j].position.y + 30 + 8*j, node: true},
                    {x: inputB[j].position.x, y: inputB[j].position.y + 30 + 8*j, node: true},
                ] : [
                    // don't need the bending
                    {x: and.position.x + 4, y: and.position.y - 28},
                    {x: inputB[j].position.x, y: inputB[j].position.y + 30 + 8*j},
                    {x: inputB[j].position.x, y: inputB[j].position.y + 30 + 8*j, node: true},
                ], teal));
                this.components.push(and);
                adder.inputWires.push(new Wire(and, 0));
            }

            if (i > 0) {
                for (let j = 0; j < numBits; j++) {
                    adder.inputWires.push(new Wire(adders[i-1], j + 1));
                }
            } else {
                for (let j = 0; j < numBits; j++) {
                    adder.inputWires.push(null);
                }
            }
        }


        for (let i = 0; i < 2*numBits; i++) {
            const outBit = new OutputBit(440 - 50*i, 570, 25);
            if (i < numBits) {
                outBit.inputWires.push(new Wire(adders[i], 0));
            } else {
                outBit.inputWires.push(new Wire(adders[numBits-1], i - numBits + 1));
            }
            outputBits.push(outBit);
        }


        const displayA = new Display(200, 30, inputA, false, 32);
        const displayB = new Display(525, 30, inputB, false, 32);
        const displayOutput = new Display(550, 570, outputBits, false, 40);
        this.components.push(...outputBits, ...adders, ...inputA, ...inputB);
        this.components.push(displayA, displayB, displayOutput);
        this.outputComponents.push(...outputBits);
    }
}

export default MultiplierNaiveExploration;

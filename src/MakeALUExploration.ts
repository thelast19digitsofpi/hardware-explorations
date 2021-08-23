// MakeALUExploration.ts

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import { Not } from './Gates';
import { NotSwitch, BinarySwitch } from './UserGates';
import Text from './Text';

class MakeALUExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 500, 500);

        const adder = new Adder(180, 280, 4, 288, 120);
        this.components.push(adder);

        // need this up here...
        const operBit = new InputBit(460, 70, false, 40);

        let inputA = [], inputB = [];
        for (let i = 0; i < 4; i++) {
            const bit = new InputBit(30 + 36*i, 60, false, 25);
            adder.inputWires.unshift(new Wire(bit, 0, [
                {x: adder.position.x + adder.inputSockets[3-i].x, y: bit.position.y + 120 - 25*i},
                {x: bit.position.x, y: bit.position.y + 120 - 25*i},
            ]));
            this.components.push(bit);
            inputA.unshift(bit);

            // right side is more complicated
            const bit2 = new InputBit(380 - 60*i, 60, false, 25);
            const gate = new BinarySwitch(bit2.position.x + 6, bit2.position.y + 70, 40, 0);
            gate.inputWires.push(new Wire(bit2, 0));
            gate.inputWires.push(new Wire(operBit, 0, [
                {x: gate.position.x + 6, y: gate.position.y - 30, node: (i !== 3)},
                {x: operBit.position.x, y: gate.position.y - 30, node: true},
            ]));
            adder.inputWires.push(new Wire(gate, 0, [
                {x: adder.position.x + adder.inputSockets[4+i].x, y: gate.position.y + 70 - 10*i},
                {x: gate.position.x, y: gate.position.y + 70 - 10*i},
            ]));
            this.components.push(gate, bit2);
            inputB.push(bit2);
        }

        // operation control
        const operSwitch = new NotSwitch(operBit.position.x, operBit.position.y + 100, 50, 0);
        operSwitch.state.whichGate = 1; // start you off with the wrong gate, heh heh
        const operText1 = new Text(operBit.position.x, operBit.position.y - 50, 20, "OPER");
        const operText2 = new Text(operBit.position.x, operBit.position.y - 32, 20, function() {
            return (operBit.state.bits[0]) ? "(SUB)" : "(ADD)";
        });
        operSwitch.inputWires.push(new Wire(operBit, 0));
        adder.inputWires.push(new Wire(operSwitch, 0, [
            {x: operSwitch.position.x, y: adder.position.y},
        ]));
        this.components.push(operSwitch, operBit, operText1, operText2);
        const outputBits = [];
        for (let i = 0; i < 4; i++) {
            const output = new OutputBit(adder.position.x + adder.outputSockets[i].x, 410, 25);
            output.inputWires.push(new Wire(adder, i, []));
            outputBits.push(output);
        }
        this.outputComponents.push(...outputBits);
        this.components.push(...outputBits);

        // Displays
        const displayA = new Display((inputA[1].position.x + inputA[2].position.x)/2, 25, inputA, true);
        const displayB = new Display((inputB[1].position.x + inputB[2].position.x)/2, 25, inputB, true);
        this.components.push(displayA, displayB, new Display(adder.position.x, 460, outputBits, true, 50));

        // Error
        const calc1 = new Text(370, 430, 30, function() {
            const a = Number(displayA.getValue());
            const b = Number(displayB.getValue());
            const op = operBit.state.bits[0];
            const raw = op ? (a+b) : (a-b);
            // add 8, mod 16, then subtract 8 makes it return in -8..7
            const overflow = ((raw + 24) % 16) - 8;
            return `Actual: ${overflow}` + (raw === overflow ? "" : "*");
        });
        const overflowNote = new Text(370, 460, 20, "* means overflow");
        this.components.push(calc1, overflowNote);
    }
}

export default MakeALUExploration;

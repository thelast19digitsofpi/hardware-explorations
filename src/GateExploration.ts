// GateExploration
//
// Basic exploration of AND, OR, XOR, and NOT gates

import Exploration from './Exploration';
import Wire from './Wire';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

class GateExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 480, 240);

        const types = [AndGate, OrGate, XorGate];
        for (let i = 0; i < 3; i++) {
            const bit1 = new InputBit(i*120 + 60, 40, false, 30);
            const bit2 = new InputBit(i*120 + 120, 40, false, 30);
            const gate = new types[i](i*120 + 90, 120, 60, 0);
            gate.inputWires.push(new Wire(bit1, 0, [
                {x: gate.position.x - 12, y: gate.position.y - 40},
                {x: bit1.position.x, y: gate.position.y - 40},
            ]));
            gate.inputWires.push(new Wire(bit2, 0, [
                {x: gate.position.x + 12, y: gate.position.y - 40},
                {x: bit2.position.x, y: gate.position.y - 40},
            ]));
            const out = new OutputBit(i*120 + 90, 200, 30);
            out.inputWires.push(new Wire(gate, 0));
            this.components.push(gate, bit1, bit2, out);
            this.outputComponents.push(out);
        }

        const notInput = new InputBit(420, 40, false, 30);
        const notGate = new Not(420, 120, 60, 0);
        notGate.inputWires.push(new Wire(notInput, 0));
        const notOutput = new OutputBit(420, 200, 30);
        notOutput.inputWires.push(new Wire(notGate, 0));
        this.components.push(notGate, notInput, notOutput);
        this.outputComponents.push(notOutput);
    }

}

export default GateExploration;

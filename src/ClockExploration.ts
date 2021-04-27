// RegisterExploration
//
// Exploration that shows how a register bit works.
// Most of these (not multipliers and dividers) have the expanded version on the left and a compact version on the right.

import Component from './Component';
import Exploration from './Exploration';
import Wire from './Wire';
import Clock from './Clock';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

// pass the components and output components arrays
function makeClock(x: number, y: number, bits: number, components: Component[], outputComponents: Component[]) {
    const clock = new Clock(x, y, bits, 100, 60);
    const powerButton = new InputBit(x, y - 100, false, 40);
    clock.inputWires.push(new Wire(powerButton, 0));
    components.push(clock, powerButton);
    for (let i = 0; i < bits; i++) {
        const output = new OutputBit(x + clock.outputSockets[i].x, y + 100);
        output.inputWires.push(new Wire(clock, i));
        components.push(output);
        outputComponents.push(output);
    }
}

class ClockExploration extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        makeClock(120, 200, 2, this.components, this.outputComponents);
        makeClock(280, 200, 6, this.components, this.outputComponents);
    }

}

export default ClockExploration;

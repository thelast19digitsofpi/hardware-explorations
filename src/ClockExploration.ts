// ClockExploration.ts
//
// Exploration of a clock, more meant to illustrate the time-based explorations.

import Component from './Component';
import Exploration from './Exploration';
import Wire from './Wire';
import Clock from './Clock';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import {AndGate, OrGate, XorGate, Not} from './Gates';

// pass the components and output components arrays
function makeClock(x: number, y: number, components: Component[], outputComponents: Component[]) {
    const clock = new Clock(x, y, 100, 60);
    const powerButton = new InputBit(x, y - 100, true, 40);
    clock.inputWires.push(new Wire(powerButton, 0));
    components.push(clock, powerButton);
    for (let i = 0; i < 2; i++) {
        const output = new OutputBit(x + clock.outputSockets[i].x, y + 100);
        output.inputWires.push(new Wire(clock, i));
        components.push(output);
        outputComponents.push(output);
    }
}

class ClockExploration extends Exploration {
    animated: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 300, 300);
        makeClock(150, 150, this.components, this.outputComponents);
    }

}

export default ClockExploration;

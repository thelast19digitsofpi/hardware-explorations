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
import Countdown from './Countdown';
import Subtractor from './Subtractor';

// pass the components and output components arrays
class CountdownExploration extends Exploration {
    animated: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 300, 300);

        const power = new InputBit(150, 60, false, 40);

        const clock = new Clock(100, 130);
        this.components.push(clock);
        clock.inputWires.push(new Wire(power, 0, [
            {x: clock.position.x, y: power.position.y},
        ]))

        const countdown = new Countdown(200, 200, 5);
        countdown.inputWires.push(new Wire(power, 0, [
            {x: countdown.position.x, y: power.position.y},
        ]));
        countdown.inputWires.push(new Wire(clock, 0, [
            {
                x: clock.position.x + clock.outputSockets[0].x,
                y: countdown.position.y + countdown.inputSockets[0].y,
            }
        ]));
        this.components.push(countdown);

        const countdownOutput = new OutputBit(countdown.position.x, 260, 30);
        this.components.push(countdownOutput);
        countdownOutput.inputWires.push(new Wire(countdown, 0));

        this.components.push(power);

        this.outputComponents.push(countdownOutput);

        // some logic
        const thisExploration = this;
        power.onClick = function() {
            if (!power.state.bits[0]) {
                thisExploration.update();
                power.constructor.prototype.onClick.apply(power, arguments);
                thisExploration.resume();
            } else {
                thisExploration.pause();
                power.constructor.prototype.onClick.apply(power, arguments);
            }
            return true;
        };

        /*
        // on the right...
        const countdown = new Countdown(450, 200, 5);
        this.components.push(countdown);

        const countdownSwitch = new InputBit(countdown.position.x, 125, false, 40);
        this.components.push(countdownSwitch);
        countdown.inputWires.push(new Wire(countdownSwitch, 0));

        const countdownOutput = new OutputBit(countdown.position.x, 275, 30);
        this.components.push(countdownOutput);
        countdownOutput.inputWires.push(new Wire(countdown, 0));
        */

        /*

        // on the left...
        const numBits = 3;
        const start = 5;

        const powerLeft = new InputBit(100, 50, false, 42);

        const subtractor = new Subtractor(160, 200, numBits, 7 * 24, 80);
        for (let i = 0; i < numBits; i++) {
            if (i == 0) {
                const x1 = subtractor.position.x + subtractor.inputSockets[i].x;
                const y1 = 110;
                const comp = new Not(x1, y1, 30, 0);
                subtractor.inputWires.push(new Wire(comp, 0));
                this.components.push(comp);
            } else {
                subtractor.inputWires.push(new Wire(null, 0));
            }
        }

        // Subtractor self-wiring
        for (let i = 0; i < numBits; i++) {
            const d = 12 + 12*i;
            const y1 = subtractor.position.y + subtractor.size.y/2 + d + 10;
            const y2 = subtractor.position.y - subtractor.size.y/2 - d - 10;
            subtractor.inputWires.push(new Wire(subtractor, i, [
                {x: subtractor.position.x + subtractor.inputSockets[3+i].x, y: y2},
                {x: subtractor.position.x + subtractor.size.x/2 + d, y: y2},
                {x: subtractor.position.x + subtractor.size.x/2 + d, y: y1},
                {x: subtractor.position.x + subtractor.outputSockets[i].x, y: y1, node: true},
            ]))
        }

        this.components.push(subtractor, powerLeft);

        powerLeft.linkedBits.push(countdownSwitch);
        countdownSwitch.linkedBits.push(powerLeft);
        */
    }

}

export default CountdownExploration;

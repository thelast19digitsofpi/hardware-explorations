// HalfAdderCheat.ts
//
// The finished product with no accompanying circuit.

import Exploration from './Exploration';
import InputBit from './InputBit';
import OutputBit from './OutputBit';
import Adder from './Adder';
import Wire from './Wire';
import Display from './Display';
import Text from './Text';
import { BinarySwitch } from './UserGates';
import AnswerChecker from './AnswerChecker';

class HalfAdderBuild extends Exploration {
    constructor(canvas: HTMLCanvasElement) {
        super(canvas, 480, 320);

        // left side
        const adder = new Adder(120, 160, 1, 180, 80);
        const inputA = new InputBit(adder.position.x + adder.inputSockets[0].x, 60, false, 30);
        const inputB = new InputBit(adder.position.x + adder.inputSockets[1].x, 60, false, 30);
        const output1 = new OutputBit(adder.position.x + adder.outputSockets[0].x, 260, 30);
        const output2 = new OutputBit(adder.position.x + adder.outputSockets[1].x, 260, 30);
        this.components.push(adder, inputA, inputB, output1, output2);
        adder.inputWires.push(new Wire(inputA, 0));
        adder.inputWires.push(new Wire(inputB, 0));
        output1.inputWires.push(new Wire(adder, 0));
        output2.inputWires.push(new Wire(adder, 1));

        // const displayResult = new Display(180, 240, [output1, output2], false, 40);
        // this.components.push(displayResult);
        this.outputComponents.push(output1, output2);

        const thisIsYourTarget = new Text(adder.position.x, 30, 18, "Can you make this...");
        const text1 = new Text(output1.position.x, 295, 30, "1");
        const text2 = new Text(output2.position.x, 295, 30, "2");
        this.components.push(thisIsYourTarget, text1, text2);


        // right side
        const x2 = 390;
        const userA = new InputBit(x2 - 45, 60, false, 30);
        const userB = new InputBit(x2 + 45, 60, false, 30);

        const switch1 = new BinarySwitch(userB.position.x - 9, 160, 60, 0);
        switch1.state.whichGate = 1;
        const switch2 = new BinarySwitch(userA.position.x + 9, 160, 60, 0);
        switch2.state.whichGate = 1;

        switch1.inputWires.push(new Wire(userA, 0));
        switch1.inputWires.push(new Wire(userB, 0));
        switch2.inputWires.push(new Wire(userA, 0));
        switch2.inputWires.push(new Wire(userB, 0));

        const userOutput1 = new OutputBit(switch1.position.x, 260, 30);
        const userOutput2 = new OutputBit(switch2.position.x, 260, 30);
        userOutput1.inputWires.push(new Wire(switch1, 0));
        userOutput2.inputWires.push(new Wire(switch2, 0));

        const thisIsYourCanvas = new Text(x2, 30, 18, "...on this side?");
        this.components.push(thisIsYourCanvas, switch1, switch2, userA, userB, userOutput1, userOutput2);
        this.outputComponents.push(userOutput1, userOutput2);

        const userText1 = new Text(userOutput1.position.x, 295, 30, "1");
        const userText2 = new Text(userOutput2.position.x, 295, 30, "2");
        this.components.push(userText1, userText2);

        const testButton = new AnswerChecker(this, 235, 270, [
            [userA, inputA],
            [userB, inputB],
        ], [userOutput2, userOutput1], function(bits: boolean[]): boolean[] {
            return [bits[0] && bits[1], bits[0] !== bits[1]];
        });
        this.components.push(testButton);

        // Link the bits for easy comparison
        inputA.linkedBits.push(userA);
        userA.linkedBits.push(inputA);
        inputB.linkedBits.push(userB);
        userB.linkedBits.push(inputB);
    }
}

export default HalfAdderBuild;

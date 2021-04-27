// Component.ts
// A module that actually does absolutely nothing.

import Wire from './Wire';

interface StateObject {
    bits: boolean[],
    [propName: string]: any,
}

interface Component {
    state: StateObject,
    // position marks center
    position: {x: number, y: number},
    size: {x: number, y: number},
    inputSockets: {x: number, y: number}[],
    outputSockets: {x: number, y: number}[],
    inputWires: (Wire | null)[],

    render: (ctx: CanvasRenderingContext2D) => void,
    onClick: (offsetX: number, offsetY: number) => void,
    evaluate: (bits: boolean[]) => boolean[],

    // optional function
    beforeUpdate: (() => void) | null | undefined;
}

export default Component;
export {StateObject};

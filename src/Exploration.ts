// Exploration.ts
//
// This might be something a little more interesting

import Component, {StateObject} from './Component';

class Exploration {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public components: Array<Component>;
    // The idea is that all components update their state recursively starting here
    public outputComponents: Array<Component>;

    public paused: boolean = false;
    public updateTime: number = 1000;
    public lastUpdated: number = Date.now();
    public animationFrame: any;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.components = [];
        this.outputComponents = [];

        // TS-safe way of putting a random debug name
        let id = Math.floor(Math.random() * 1e6);
        Object.defineProperty(window, "exploration" + id, {
            value: this,
        });
        console.log(id, this);
    }

    // todo: addComponent() maybe?

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.components.length; i++) {
            this.context.save();
            // render wires first
            const comp = this.components[i];
            for (let j = 0; j < comp.inputWires.length; j++) {
                const position = {
                    x: comp.position.x + comp.inputSockets[j].x,
                    y: comp.position.y + comp.inputSockets[j].y,
                };
                comp.inputWires[j]?.render(this.context, position);
            }
            this.components[i].render(this.context);
            this.context.restore();
        }
    }

    onClick(canvasX: number, canvasY: number) {
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            const offsetX = canvasX - component.position.x;
            const offsetY = canvasY - component.position.y;
            if (Math.abs(offsetX) < component.size.x/2 && Math.abs(offsetY) < component.size.y/2) {
                component.onClick(offsetX, offsetY);
            }
        }

        // Right now I have nothing better than re-updating the whole tree
        this.update();
    }

    pause() {
        this.paused = true;
        cancelAnimationFrame(this.animationFrame);
    }

    resume() {
        this.paused = false;
        this.animationFrame = requestAnimationFrame(this.updateLoop.bind(this));
    }

    updateLoop() {
        // Not paused or turned off, and been long enough since last update
        if (!this.paused && this.updateTime > 0 && Date.now() - this.lastUpdated > this.updateTime) {
            this.update();

            this.animationFrame = requestAnimationFrame(this.updateLoop.bind(this));
        }
    }

    update() {
        // Recursively loop backwards through the tree
        // stores a hash of component indices because we have to check the same component multiple times
        // We hash anything that is listed as an output component

        const visitedNodes: {[i: number]: boolean} = {};
        const savedState = [];
        for (let i = 0; i < this.outputComponents.length; i++) {
            const comp = this.outputComponents[i];
            let old: boolean[] = [];
            for (let j = 0; j < comp.state.bits.length; j++) {
                old.push(comp.state.bits[j]);
            }
            savedState.push({bits: old});
        }
        for (let i = 0; i < this.outputComponents.length; i++) {
            this.updateComponent(this.outputComponents[i], visitedNodes, savedState);
        }

        for (let i = 0; i < this.outputComponents.length; i++) {
            console.log("After Update: ", this.outputComponents[i].position, savedState[i].bits, this.outputComponents[i].state.bits)
        }

        console.warn("UPDATE FINISHED");

        this.lastUpdated = Date.now();
    }

    updateComponent(component: Component,
        visitedNodes: {[i: number]: boolean},
        savedState: StateObject[]) {
        let index = this.components.indexOf(component); // if this gets too slow I can add IDs
        if (!visitedNodes[index]) {
            visitedNodes[index] = true; // prevents infinite loops, although cyclic explorations are invalid anyway
            // has not been visited, so we need to evaluate it
            //console.log("visiting " + String(index), component);
            let parentBits = [];
            for (let i = 0; i < component.inputWires.length; i++) {
                const wire = component.inputWires[i];
                if (wire) {
                    const to = wire.toComponent;
                    if (!to) {
                        parentBits.push(false); // null = 0
                    } else {
                        this.updateComponent(wire.toComponent, visitedNodes, savedState);


                        // all we need is this one bit
                        // (note: null or missing wires give a 0)
                        // did we save it?
                        const ocIndex = this.outputComponents.indexOf(to);
                        if (ocIndex >= 0) {
                            //console.log("Using saved state", ocIndex, savedState[ocIndex].bits);
                            // Use the stored state instead of updating immediately
                            parentBits.push(savedState[ocIndex].bits[wire.toOutput]);
                        } else {
                            parentBits.push(to.state.bits[wire.toOutput]);
                        }
                    }
                } else {
                    // no wire = 0
                    parentBits.push(false);
                }
            }
            // Update the component's state.
            component.state.bits = component.evaluate(parentBits);
        }
    }
};

export default Exploration;

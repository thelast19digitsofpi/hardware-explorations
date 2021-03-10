// Exploration.ts
//
// This might be something a little more interesting

import Component from './Component';

class Exploration {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public components: Array<Component>;
    // The idea is that all components update their state recursively starting here
    public outputComponents: Array<Component>;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.components = [];
        this.outputComponents = [];

        window['exploration'] = this;
    }

    // addComponent() maybe?

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
                comp.inputWires[j].render(this.context, position);
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

    update() {
        // Recursively loop backwards through the tree
        // stores a hash of component indices because we have to check the same component multiple times
        const visitedNodes: {[i: number]: boolean} = {};
        for (let i = 0; i < this.outputComponents.length; i++) {
            this.updateComponent(this.outputComponents[i], visitedNodes);
        }
    }

    updateComponent(component: Component, visitedNodes: {[i: number]: boolean}) {
        let index = this.components.indexOf(component); // if this gets too slow I can add IDs
        if (!visitedNodes[index]) {
            visitedNodes[index] = true; // prevents infinite loops, although cyclic explorations are invalid anyway
            // has not been visited, so we need to evaluate it
            //console.log("visiting " + String(index), component);
            let parentBits = [];
            for (let i = 0; i < component.inputWires.length; i++) {
                const wire = component.inputWires[i];
                this.updateComponent(wire.toComponent, visitedNodes);
                // all we need is this one bit
                parentBits.push(wire.toComponent.state.bits[wire.toOutput]);
            }
            component.state.bits = component.evaluate(parentBits);
        }
    }
};

export default Exploration;

// Wire.ts

import Component from "./Component"

type WireOptions = {color?: string};

// not sure a wire really is a component but it uses them
class Wire {
    // I use "from" and "to" because "input" and "output" are ambiguous
    toComponent: Component;
    toOutput: number;

    color: string;

    // in case you want the wire to bend
    waypoints: Array<{x: number, y: number}> = [];

    constructor(
        to: Component,
        toOutput: number,
        waypoints: {x: number, y: number}[] = [],
        options: WireOptions = {}
    ) {
        this.toComponent = to;
        this.toOutput = toOutput;
        this.waypoints = waypoints;

        this.color = options.color ?? "#333";
    }

    get(): boolean {
        // empty wire is zero
        if (!this.toComponent) return false;
        // coerce undefined to false
        return this.toComponent.state.bits[this.toOutput] || false;
    }

    addWaypoint(x: number, y: number) {
        this.waypoints.push({x: x, y: y});
    }

    render(ctx: CanvasRenderingContext2D, from: {x: number, y: number}) {
        if (!this.toComponent) return;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        for (let i = 0; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        const endOffset = this.toComponent.outputSockets[this.toOutput];
        ctx.lineTo(endOffset.x + this.toComponent.position.x, endOffset.y + this.toComponent.position.y);
        ctx.stroke();
        ctx.restore();
    }
}

export default Wire;

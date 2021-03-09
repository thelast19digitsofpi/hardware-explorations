// Wire.ts

import Component from "./Component"

// not sure a wire really is a component but it uses them
class Wire {
    // I use "from" and "to" because "input" and "output" are ambiguous
    toComponent: Component;
    toOutput: number;

    // in case you want the wire to bend
    waypoints: Array<{x: number, y: number}> = [];

    constructor(to: Component, toOutput: number, waypoints: {x: number, y: number}[]) {
        this.toComponent = to;
        this.toOutput = toOutput;
        this.waypoints = waypoints;
    }

    addWaypoint(x: number, y: number) {
        this.waypoints.push({x: x, y: y});
    }

    render(ctx: CanvasRenderingContext2D, from: {x: number, y: number}) {
        ctx.strokeStyle = "2px solid black";
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        for (let i = 0; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        const endOffset = this.toComponent.outputSockets[this.toOutput];
        ctx.lineTo(endOffset.x + this.toComponent.position.x, endOffset.y + this.toComponent.position.y);
        ctx.stroke();
    }
}

export default Wire;

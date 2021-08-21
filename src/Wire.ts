// Wire.ts

import Component from "./Component"

type WireOptions = {color?: string, darkColor?: string};

// not sure a wire really is a component but it uses them
class Wire {
    // I use "from" and "to" because "input" and "output" are ambiguous
    toComponent: Component;
    toOutput: number;

    color: string | undefined;
    darkColor: string | undefined;

    // in case you want the wire to bend
    waypoints: Array<{x: number, y: number, node?: boolean}> = [];

    constructor(
        to: Component,
        toOutput: number,
        waypoints: {x: number, y: number, node?: boolean}[] = [],
        options: WireOptions = {}
    ) {
        this.toComponent = to;
        this.toOutput = toOutput;
        this.waypoints = waypoints;

        this.color = options.color;
        this.darkColor = options.darkColor;
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

    render(ctx: CanvasRenderingContext2D, from: {x: number, y: number}, isDark: boolean) {
        if (!this.toComponent) return;
        ctx.save();
        if (isDark && this.darkColor) {
            ctx.strokeStyle = this.darkColor;
        } else if (this.color) {
            ctx.strokeStyle = this.color;
        } else {
            ctx.strokeStyle = (isDark ? "#606468" : "#333");
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        for (let i = 0; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        const endOffset = this.toComponent.outputSockets[this.toOutput];
        ctx.lineTo(endOffset.x + this.toComponent.position.x, endOffset.y + this.toComponent.position.y);
        ctx.stroke();

        ctx.lineWidth = 6;
        for (let i = 0; i < this.waypoints.length; i++) {
            if (this.waypoints[i].node) {
                ctx.beginPath();
                ctx.arc(this.waypoints[i].x, this.waypoints[i].y, 1, 0, 2*Math.PI);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

export default Wire;

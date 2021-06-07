// Text.ts
//
// Simple text display

import Component from './Component';

interface TextOptions {
    color?: string | (() => string);
}

class Text implements Component {
    state = {bits: []};
    position: { x: number; y: number; };
    size: { x: number; y: number; };
    inputSockets = [];
    outputSockets = [];
    inputWires = [];
    onClick = () => {};
    evaluate = () => [];
    beforeUpdate = undefined;

    text: string | (() => string);
    options: TextOptions;

    constructor(x: number, y: number, size: number, text: string | (() => string), options: TextOptions = {}) {
        this.position = {x: x, y: y};
        this.size = {x: 0, y: size};
        this.text = text;
        this.options = options;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const message = (typeof this.text === "function" ? this.text() : this.text);
        ctx.font = `${this.size.y}px monospace`;
        // if function, call it; if string, use it; if undefined, default to #333
        ctx.fillStyle = (typeof this.options.color === "function" ? this.options.color() : this.options.color || "#333");
        // positioning
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, this.position.x, this.position.y);
        ctx.restore();
    }
}

export default Text;

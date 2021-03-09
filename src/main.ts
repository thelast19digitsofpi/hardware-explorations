

import AdderExploration from './AdderExploration';


function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}


const canvas: HTMLCanvasElement = createCanvas(640, 480);
document.getElementById('1')!.appendChild(canvas);

const adderExploration = new AdderExploration(canvas);

function renderLoop() {
    adderExploration.render();
    requestAnimationFrame(renderLoop);
}
renderLoop();

canvas.addEventListener("click", function(event) {
    adderExploration.onClick(event.offsetX, event.offsetY);
});

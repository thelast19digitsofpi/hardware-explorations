
import Exploration from './Exploration';
//import TestExploration from './TestExploration';
import AdderExploration from './AdderExploration';
import MultiplierExploration from './MultiplierExploration';
import RegisterExploration from './RegisterExploration';

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function createExploration(id: string, width: number, height: number, type: typeof Exploration): Exploration {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error("Document element " + id + " not found.");
    }

    const canvas = createCanvas(width, height);
    element.appendChild(canvas);

    const exploration = new type(canvas);
    exploration.update();
    canvas.addEventListener("click", function(event) {
        exploration.onClick(event.offsetX, event.offsetY);
    });

    const controls = document.createElement("div");
    controls.innerHTML = `
        <form>
            <p><strong>Speed:</strong> Slow
                <input id="speed-${id}" name="speed" type="range" min="0.5" max="2" step="0.25" />
                Fast
            </p>
        </form>
    `;
    controls.querySelector("#speed-" + id)!.addEventListener("change", function(event) {
        exploration.updateTime = 1000 / Number((event.target as HTMLInputElement).value);
    });
    element.appendChild(controls);

    return exploration;
}


// Explorations
let ALL_EXPLORATIONS: Exploration[] = [];
ALL_EXPLORATIONS.push(createExploration('1', 640, 480, AdderExploration));
ALL_EXPLORATIONS.push(createExploration('2', 640, 480, MultiplierExploration));
ALL_EXPLORATIONS.push(createExploration('3', 400, 400, RegisterExploration));

function renderLoop() {
    for (let i = 0; i < ALL_EXPLORATIONS.length; i++) {
        const exploration = ALL_EXPLORATIONS[i];
        exploration.render();
        if (Date.now() - exploration.lastUpdated > exploration.updateTime) {
            exploration.update();
        }
    }
    requestAnimationFrame(renderLoop);
}
renderLoop();

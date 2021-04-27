
import Exploration from './Exploration';
//import TestExploration from './TestExploration';
import AdderExploration from './AdderExploration';
import ChoiceExploration from './ChoiceExploration';
import ClockExploration from './ClockExploration';
import DividerExploration from './DividerExploration';
import MultiplierExploration from './MultiplierExploration';
import RegisterExploration from './RegisterExploration';
import SubtractorExploration from './SubtractorExploration';

function createCanvas(): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    return canvas;
}

// in milliseconds
const UPDATE_TIMES = [4000, 2500, 1600, 1000, 630, 400, 250]

function createExploration(id: string, type: typeof Exploration): Exploration {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error("Document element " + id + " not found.");
    }

    const canvas = createCanvas();
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
                <input id="speed-${id}" name="speed" type="range" min="0" max="${UPDATE_TIMES.length - 1}" />
                Fast
            </p>
        </form>
        <button id="pause-${id}">Pause</button>
        <button id="resume-${id}">Resume</button>
        <button id="step-${id}">Step</button>
    `;
    controls.querySelector("#speed-" + id)!.addEventListener("change", function(event) {
        exploration.updateTime = UPDATE_TIMES[Number((event.target as HTMLInputElement).value)];
    });
    element.appendChild(controls);

    controls.querySelector("#pause-" + id)!.addEventListener("click", exploration.pause.bind(exploration));
    controls.querySelector("#resume-" + id)!.addEventListener("click", exploration.resume.bind(exploration));
    controls.querySelector("#step-" + id)!.addEventListener("click", exploration.update.bind(exploration));

    exploration.resume();

    return exploration;
}


// Explorations
let ALL_EXPLORATIONS: Exploration[] = [];
ALL_EXPLORATIONS.push(createExploration('adder', AdderExploration));
ALL_EXPLORATIONS.push(createExploration('subtractor', SubtractorExploration));
//ALL_EXPLORATIONS.push(createExploration('choice', ChoiceExploration));
//ALL_EXPLORATIONS.push(createExploration('clock', ClockExploration));

ALL_EXPLORATIONS.push(createExploration('multiplier-full', MultiplierExploration));
ALL_EXPLORATIONS.push(createExploration('divider-full', DividerExploration));
//ALL_EXPLORATIONS.push(createExploration('3', RegisterExploration));

function renderLoop() {
    // TODO: Put this in exploration
    for (let i = 0; i < ALL_EXPLORATIONS.length; i++) {
        const exploration = ALL_EXPLORATIONS[i];
        exploration.render();
    }
    requestAnimationFrame(renderLoop);
}
renderLoop();

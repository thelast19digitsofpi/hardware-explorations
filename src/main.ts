
import Exploration from './Exploration';

// Alphabetized because... idunno
import AdderExploration from './AdderExploration';
import BinaryExploration from './BinaryExploration';
import ChoiceExploration from './ChoiceExploration';
import ClockExploration from './ClockExploration';
import DividerExploration from './DividerExploration';
import FullAdderExploration1 from './FullAdderGates';
import GateExploration from './GateExploration';
import HalfAdderCheat from './HalfAdderCheat';
import MultiplierExploration from './MultiplierExploration';
import RegisterExploration from './RegisterExploration';
import SubtractorExploration from './SubtractorExploration';

function createCanvas(): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    return canvas;
}

// in milliseconds
const UPDATE_TIMES = [4000, 2500, 1600, 1000, 630, 400, 250]

function createExploration(id: string, type: typeof Exploration): Exploration | undefined {
    const element = document.getElementById(id);
    if (!element) {
        console.warn("Document element " + id + " not found.");
        return;
    }

    element.className += " row";

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "canvas-wrapper col-auto";
    const canvas = createCanvas();
    canvasWrapper.appendChild(canvas);
    element.appendChild(canvasWrapper);

    const exploration = new type(canvas);
    exploration.update();
    canvas.addEventListener("click", function(event) {
        exploration.onClick(event.offsetX, event.offsetY);
    });

    // For animated explorations, have speed controls
    if (exploration.animated) {
        const controls = document.createElement("div");
        controls.className = "controls col-auto";
        controls.innerHTML = `
            <h4>Speed</h4>
            <p style="margin-top: 0">
                Slow
                <input id="speed-${id}" name="speed" type="range" min="0" max="${UPDATE_TIMES.length - 1}" />
                Fast
            </p>
            <div class="buttons">
                <button id="pause-${id}">Pause</button>
                <button id="resume-${id}">Play</button>
                <button id="step-${id}">Step</button>
            </div>
        `;
        // get those buttons
        controls.querySelector("#speed-" + id)!.addEventListener("change", function(event) {
            exploration.updateTime = UPDATE_TIMES[Number((event.target as HTMLInputElement).value)];
        });
        element.appendChild(controls);

        const pauseButton = (controls.querySelector("#pause-" + id) as HTMLButtonElement);
        pauseButton.addEventListener("click", function() {
            exploration.pause();
            pauseButton.disabled = true;
            resumeButton.disabled = false;
        });
        pauseButton.disabled = true;
        const resumeButton = controls.querySelector("#resume-" + id) as HTMLButtonElement;
        resumeButton.addEventListener("click", function() {
            exploration.resume();
            pauseButton.disabled = false;
            resumeButton.disabled = true;
        });
        controls.querySelector("#step-" + id)!.addEventListener("click", exploration.update.bind(exploration));

        //exploration.resume();
    }

    return exploration;
}


// Explorations
let ALL_EXPLORATIONS: (Exploration | undefined)[] = [];
ALL_EXPLORATIONS.push(
    createExploration('binary-basic', BinaryExploration),
    createExploration('adder', AdderExploration),
    createExploration('gates', GateExploration),
//ALL_EXPLORATIONS.push(createExploration('subtractor', SubtractorExploration));
    createExploration('choice', ChoiceExploration),
    createExploration('half-adder-cheat', HalfAdderCheat),
    createExploration('gates-again', GateExploration),
    createExploration('full-adder1', FullAdderExploration1)
);
//ALL_EXPLORATIONS.push(createExploration('clock', ClockExploration));

ALL_EXPLORATIONS.push(createExploration('multiplier-full', MultiplierExploration));
ALL_EXPLORATIONS.push(createExploration('divider-full', DividerExploration));
//ALL_EXPLORATIONS.push(createExploration('3', RegisterExploration));

function renderLoop() {
    // TODO: Put this in exploration
    for (let i = 0; i < ALL_EXPLORATIONS.length; i++) {
        const exploration = ALL_EXPLORATIONS[i];
        if (exploration) {
            exploration.render();
        }
    }
    requestAnimationFrame(renderLoop);
}
renderLoop();

// some other stuff
function fillInteractiveTable(table: HTMLTableElement) {
    if (table === null) return;
    const html = `<input type="number" min="0" max="1" size="3" />`;
    const fillIn = table.tBodies[0].getElementsByTagName("tr");
    for (let i = 0; i < fillIn.length; i++) {
        const out1 = document.createElement("td");
        out1.innerHTML = html;
        const out2 = document.createElement("td");
        out2.innerHTML = html;
        fillIn[i].appendChild(out1);
        fillIn[i].appendChild(out2);
    }
}
fillInteractiveTable(document.getElementById("fill-in"));

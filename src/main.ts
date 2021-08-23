
import Exploration from './Exploration';

// Alphabetized because... idunno
import AdderExploration from './AdderExploration';
import AdderFailExploration from './AdderFailExploration';
import BinaryExploration from './BinaryExploration';
import ChoiceExploration from './ChoiceExploration';
import ClockExploration from './ClockExploration';
import DividerExploration from './DividerExploration';
import FullAdderExploration1 from './FullAdderGates';
import FullSubtractorExploration1 from './FullSubtractorGates';
import GateExploration from './GateExploration';
import HalfAdderBuild from './HalfAdderBuild';
import MakeALUExploration from './MakeALUExploration';
import MultiplierExploration from './MultiplierExploration';
import MultiplierNaiveExploration from './MultiplierNaiveExploration';
import OnesComplementExploration from './OnesComplementExploration';
import RegisterExploration from './RegisterExploration';
import SignMagnitudeExploration from './SignMagnitudeExploration';
import SubtractorExploration from './SubtractorExploration';
import TwosCompAdderExploration from './TwosCompAdderExploration';
import FullAdderAnswer from './FullAdderAnswer';
import CountdownExploration from './CountdownExploration';

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
        exploration.pause = function() {
            exploration.constructor.prototype.pause.call(exploration);
            pauseButton.disabled = true;
            resumeButton.disabled = false;
        };
        pauseButton.addEventListener("click", exploration.pause);
        pauseButton.disabled = true;
        const resumeButton = controls.querySelector("#resume-" + id) as HTMLButtonElement;
        exploration.resume = function() {
            exploration.constructor.prototype.resume.call(exploration);
            pauseButton.disabled = false;
            resumeButton.disabled = true;
        };
        resumeButton.addEventListener("click", exploration.resume);
        controls.querySelector("#step-" + id)!.addEventListener("click", exploration.update.bind(exploration));

        //exploration.resume();
    }

    return exploration;
}



// Explorations
// {htmlId: Class}
const explorationMap: {[id: string]: typeof Exploration} = {
    // part 1 (and maybe part 2 as well)
    'binary-basic': BinaryExploration,
    'adder': AdderExploration,
    'gates': GateExploration,
    'half-adder-build': HalfAdderBuild,
    'gates-again': GateExploration,
    'full-adder1': FullAdderExploration1,
    'clock': ClockExploration,

    // part 2
    'signmag': SignMagnitudeExploration,
    'adder-fail': AdderFailExploration,
    'full-subtractor1': FullSubtractorExploration1,
    'full-adder-answer': FullAdderAnswer,
    'ones-complement': OnesComplementExploration,
    'twos-comp-adder': TwosCompAdderExploration,
    'subtractor': SubtractorExploration,
    'make-alu': MakeALUExploration,

    // part 3
    'multiplier-naive': MultiplierNaiveExploration,
    'choice': ChoiceExploration,
    'register': RegisterExploration,
    'countdown': CountdownExploration,
    'multiplier-full': MultiplierExploration,
    'divider-full': DividerExploration,
};
let ALL_EXPLORATIONS: (Exploration | undefined)[] = [];
for (let id in explorationMap) {
    ALL_EXPLORATIONS.push(createExploration(id, explorationMap[id]));
}

let isDark = false;

function renderLoop() {
    // TODO: Put this in exploration
    for (let i = 0; i < ALL_EXPLORATIONS.length; i++) {
        const exploration = ALL_EXPLORATIONS[i];
        if (exploration) {
            exploration.render(isDark);
        }
    }
    requestAnimationFrame(renderLoop);
}
renderLoop();

// some other stuff
function fillInteractiveTable(table: HTMLTableElement | null) {
    if (table === null) return;
    const html = `<input type="number" min="0" max="1" size="4" style="min-width: 3em" />`;
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
fillInteractiveTable(document.getElementById("fill-in") as (HTMLTableElement | null));

function setDark(on: boolean) {
    if (on) {
        document.body.style.backgroundColor = "#212529";
        document.body.style.color = "#909396";
        isDark = true;
    } else {
        document.body.style.backgroundColor = "#fff";
        document.body.style.color = "#212519";
        isDark = false;
    }
    renderLoop();
}

setDark(false);

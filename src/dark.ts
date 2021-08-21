// dark.ts

// order of params is important here
function getBitColor(bit: boolean, dark: boolean) {
    if (dark) {
        return bit ? "#00aa00" : "#770000";
    } else {
        return bit ? "#33ff33" : "#990000";
    }
}

function getApplianceColor(dark: boolean) {
    return dark ? "#333333" : "#cccccc";
}

function getStrokeColor(dark: boolean) {
    return dark ? "#aaa" : "#222";
}

function getTextColor(dark: boolean) {
    return dark ? "#888" : "#333";
}

export {getBitColor, getApplianceColor, getStrokeColor, getTextColor};

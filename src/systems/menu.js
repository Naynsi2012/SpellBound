const OPTIONS = [
    { label: "Start Game", mapId: "spawn" },
    { label: "Training Area", mapId: "training" },
    { label: "Endless Mode (Coming Soon)" }
];

let selectedIndex = 0;

export function getMenuOptions() {
    return OPTIONS;
}

export function getSelectedIndex() {
    return selectedIndex;
}

export function moveSelection(direction) {
    selectedIndex = (selectedIndex + direction + OPTIONS.length) % OPTIONS.length;
}

export function getSelectedOption() {
    return OPTIONS[selectedIndex];
}

export function resetSelection() {
    selectedIndex = 0;
}
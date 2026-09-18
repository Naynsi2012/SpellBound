let typedBuffer = "";

export function initInput(){
    window.addEventListener("keydown", (e)=>{
        if (e.key === "Backspace"){
            typedBuffer = typedBuffer.slice(0, -1);
            return;
        }

        // Filters multi-character key names (eg: Shift, Enter, ArrowLeft)
        if (e.key.length === 1){
            typedBuffer += e.key.toLowerCase()
        }
    })
}

export function getTypedBuffer(){
    return typedBuffer;
}

export function clearTypedBuffer(){
    typedBuffer = "";
}
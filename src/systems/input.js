export function initInput(onKeyDown){
    window.addEventListener("keydown", (e)=>{
        onKeyDown(e);
    })
}
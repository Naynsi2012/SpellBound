const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(gameLoop);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

gameLoop();
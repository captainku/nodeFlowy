
function isMouseInsideRectangle(rect, mouseX, mouseY) {
    return (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
    );
}

function isMouseInsideHandle(rect, handle, mouseX, mouseY) {
    return (
        mouseX >= rect.x + handle.x &&
        mouseX <= rect.x + handle.x + handle.width &&
        mouseY >= rect.y + handle.y &&
        mouseY <= rect.y + handle.y + handle.height
    );
}

function isMouseInsideControlPoint(line, mouseX, mouseY) {
    if (line.selected) {
        for (let i = 0; i < line.controlPointsCount; i++) {
            const controlPointX = line.controlPoint[i].x;
            const controlPointY = line.controlPoint[i].y;
            const distanceToCursor = Math.sqrt(Math.pow(controlPointX - mouseX, 2) + Math.pow(controlPointY - mouseY, 2));
            if (distanceToCursor <= 20) {
                return true;
            }
        }
    }
    return false;
}

window.isMouseInsideControlPoint = isMouseInsideControlPoint;
window.isMouseInsideHandle = isMouseInsideHandle;
window.isMouseInsideRectangle = isMouseInsideRectangle;

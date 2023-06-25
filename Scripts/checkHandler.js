
function isMouseInsideRectangle(rect, mouseX, mouseY) {
    return (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
    );
}
function isMouseInsideCircle(circ, mouseX, mouseY) {
    var dx = mouseX - circ.x;
    var dy = mouseY - circ.y;  
    return dx * dx + dy * dy <= circ.radius * circ.radius;
}

function isMouseInsideHandle(shape, handle, mouseX, mouseY) {
    let handleX;
    let handleY;

    if ('radius' in shape) { // If the shape is a circle
        handleX = shape.x + Math.cos(handle.angle) * (shape.radius - handle.radius); // handle position is determined by the angle
        handleY = shape.y + Math.sin(handle.angle) * (shape.radius - handle.radius);

        const distanceFromCenter = Math.sqrt(Math.pow(mouseX - handleX, 2) + Math.pow(mouseY - handleY, 2));
        return distanceFromCenter <= handle.radius; // Check if the mouse is inside the handle's radius

    } else { // If the shape is a rectangle
        handleX = shape.x + handle.x;
        handleY = shape.y + handle.y;

        return (
            mouseX >= handleX &&
            mouseX <= handleX + handle.width &&
            mouseY >= handleY &&
            mouseY <= handleY + handle.height
        );
    }
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
window.isMouseInsideCircle = isMouseInsideCircle;

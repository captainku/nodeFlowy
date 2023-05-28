function handleCanvasPanning(canvas, rectangles) {
    let isPanning = false;
    let lastMousePosition = { x: 0, y: 0 };
    const canvasDiv = canvas.parentElement;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function isClickInsideAnyRectangle(event) {
        for (let i = 0; i < rectangles.length; i++) {
            const rect = rectangles[i];
            const rectLeft = rect.x;
            const rectTop = rect.y;
            const rectRight = rect.x + rect.width;
            const rectBottom = rect.y + rect.height;

            if (
                event.offsetX >= rectLeft &&
                event.offsetX <= rectRight &&
                event.offsetY >= rectTop &&
                event.offsetY <= rectBottom
            ) {
                return true;
            }
        }
        return false;
    }

    function handleMouseDown(event) {
        if ((event.button === 0 || event.button === 1) && !isClickInsideAnyRectangle(event)) { 
            isPanning = true;
            lastMousePosition = { x: event.clientX, y: event.clientY };
            event.preventDefault(); 
        }
    }

    function handleMouseMove(event) {
        if (isPanning) {
            const deltaX = event.clientX - lastMousePosition.x;
            const deltaY = event.clientY - lastMousePosition.y;
            canvasDiv.scrollLeft -= deltaX;
            canvasDiv.scrollTop -= deltaY;
            lastMousePosition = { x: event.clientX, y: event.clientY };
        }
    }

    function handleMouseUp(event) {
        if (event.button === 0 || event.button === 1) {
            isPanning = false;
            event.preventDefault();
        }
    }

    function handleMouseLeave(event) {
        if (isPanning) {
            isPanning = false;
        }
    }
}

export default handleCanvasPanning;

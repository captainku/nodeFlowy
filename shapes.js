import handleCanvasPanning from './canvasHandler.js';

document.addEventListener('DOMContentLoaded', (event) => {
    const canvasDiv = document.getElementById('canvasDiv');
    const canvas = document.getElementById('myCanvas');
    // set the width and height of the canvas to match the div
    canvas.width = 5000;
    canvas.height = 5000;
    const context = canvas.getContext('2d');


    let rectangles = [];
    let selectedShape = null;
    let currentMousePosition = { x: 0, y: 0 };
    let lines = [];
    const snapThreshold = 50; // Adjust the threshold as needed

    // Call the handleCanvasPanning function
    handleCanvasPanning(canvas, rectangles);

    // Allow canvas to accept drops
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    
// Define an array of objects, each containing an element id and the data to be set
const draggableItems = [
    { id: 'greenBlock', color: 'Green' },
    { id: 'blueBlock', color: 'Blue' },
    { id: 'orangeBlock', color: 'Orange' },
    { id: 'redBlock', color: 'Red' },
];

// Loop through the array and add the event listeners
draggableItems.forEach(item => {
    const element = document.getElementById(item.id);

    if (element) {
        element.addEventListener('dragstart', event => {
            event.dataTransfer.setData('text/plain', item.color);
        });
    }
});



    function handleMouseUp(event) {
        if (selectedShape && selectedShape.handle) {
          let endRect = null;
          let endHandle = null;
          let minDistance = Infinity;
          
          rectangles.forEach(rect => {
            rect.handles.forEach(handle => {
              const handleCenter = {
                x: rect.x + handle.x + handle.width / 2,
                y: rect.y + handle.y + handle.height / 2,
              };
              const distance = Math.sqrt(
                (handleCenter.x - event.offsetX) ** 2 + (handleCenter.y - event.offsetY) ** 2
              );
              
              if (distance <= snapThreshold && distance < minDistance) {
                minDistance = distance;
                endRect = rect;
                endHandle = handle;
              }
            });
          });
          
          if (endRect && endRect !== selectedShape.rectangle && endHandle) {
            // Snap to the end point handle
            lines.push({
              start: selectedShape.rectangle,
              end: endRect,
              startHandle: selectedShape.handle,
              endHandle: endHandle,
              color: 'white',
              selected: false
            });
          }
        }
        selectedShape = null;
        drawRectangles();
      }
      
      
      
      
    
      function drawRectangles() {
        const roundness = 10; // Adjust the roundness value here
    
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw lines between rectangles first
        drawLines();
    
        rectangles.forEach(rect => {
            context.fillStyle = rect.color;
            roundRect(context, rect.x, rect.y, rect.width, rect.height, roundness, rect.color);
    
            // Draw handles
            rect.handles.forEach(handle => {
                context.fillStyle = handle.color;
                context.fillRect(rect.x + handle.x, rect.y + handle.y, handle.width, handle.height);
            });
        });
    
        // Draw the temporary line (from the selected handle to the current mouse position) over everything else
        if (selectedShape && selectedShape.handle) {
            const handleCenter = {
                x: selectedShape.rectangle.x + selectedShape.handle.x + selectedShape.handle.width / 2,
                y: selectedShape.rectangle.y + selectedShape.handle.y + selectedShape.handle.height / 2,
            };
            
            context.beginPath();
            context.moveTo(handleCenter.x, handleCenter.y);
            context.lineTo(currentMousePosition.x, currentMousePosition.y);
            context.strokeStyle = 'white';
            context.stroke();
    
            // Reset the strokeStyle
            context.strokeStyle = 'white';
        }
    }
    
    function drawLines() {
        // Draw lines between rectangles
        lines.forEach(line => {
            const startHandleCenter = {
                x: line.start.x + line.startHandle.x + line.startHandle.width / 2,
                y: line.start.y + line.startHandle.y + line.startHandle.height / 2,
            };
            const endHandleCenter = {
                x: line.end.x + line.endHandle.x + line.endHandle.width / 2,
                y: line.end.y + line.endHandle.y + line.endHandle.height / 2,
            };
        
            context.beginPath();
            context.moveTo(startHandleCenter.x, startHandleCenter.y);
        
            const controlPoint1 = {
                x: startHandleCenter.x,
                y: line.startHandle.y === 0 ? startHandleCenter.y - 50 : startHandleCenter.y + 50
            };
        
            const controlPoint2 = {
                x: endHandleCenter.x,
                y: line.endHandle.y === 0 ? endHandleCenter.y - 50 : endHandleCenter.y + 50
            };
        
            context.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endHandleCenter.x, endHandleCenter.y);
        
            context.strokeStyle = line.color;  // Use the color of the line for the strokeStyle
            context.stroke();
            // Set strokeStyle back to white after each line
            context.strokeStyle = 'white';
        });
    }
    
    function isPointNearLine(line, mouseX, mouseY) {
        const startHandleCenter = {
            x: line.start.x + line.startHandle.x + line.startHandle.width / 2,
            y: line.start.y + line.startHandle.y + line.startHandle.height / 2,
        };
        const endHandleCenter = {
            x: line.end.x + line.endHandle.x + line.endHandle.width / 2,
            y: line.end.y + line.endHandle.y + line.endHandle.height / 2,
        };
    
        const controlPoint1 = {
            x: startHandleCenter.x,
            y: line.startHandle.y === 0 ? startHandleCenter.y - 50 : startHandleCenter.y + 50
        };
    
        const controlPoint2 = {
            x: endHandleCenter.x,
            y: line.endHandle.y === 0 ? endHandleCenter.y - 50 : endHandleCenter.y + 50
        };
    
        const threshold = 5; // You can adjust this value to whatever suits your needs
    
        for (let t = 0; t <= 1; t += 0.01) {
            const pointOnLine = {
                x: Math.pow(1 - t, 3) * startHandleCenter.x + 3 * Math.pow(1 - t, 2) * t * controlPoint1.x + 3 * (1 - t) * Math.pow(t, 2) * controlPoint2.x + Math.pow(t, 3) * endHandleCenter.x,
                y: Math.pow(1 - t, 3) * startHandleCenter.y + 3 * Math.pow(1 - t, 2) * t * controlPoint1.y + 3 * (1 - t) * Math.pow(t, 2) * controlPoint2.y + Math.pow(t, 3) * endHandleCenter.y
            };
    
            const distanceToCursor = Math.sqrt(Math.pow(pointOnLine.x - mouseX, 2) + Math.pow(pointOnLine.y - mouseY, 2));
            if (distanceToCursor <= threshold) {
                return true;
            }
        }
    
        return false;
    }
    
      
      
      
      
      
    
    
    function handleMouseDown(event) {
        const rect = rectangles.find(rect => isMouseInsideRectangle(rect, event.offsetX, event.offsetY));
        let handle = null;
        if (rect) {
            handle = rect.handles.find(hdl => isMouseInsideHandle(rect, hdl, event.offsetX, event.offsetY));
            selectedShape = {
                rectangle: rect,
                handle: handle
            };
        }
        
        // If the mouse down event occurred outside a rectangle, clear the selectedShape
        if (!rect) {
            selectedShape = null;
        }
        
        // Ignore line selections if a rectangle handle is clicked
        if (!handle && event.button === 0) {
            const clickedLine = lines.find(line => isPointNearLine(line, event.offsetX, event.offsetY));
            if (clickedLine) {
                // Toggle the 'selected' property
                clickedLine.selected = !clickedLine.selected;
            
                // Change the color based on the 'selected' state
                clickedLine.color = clickedLine.selected ? '#FF0000' : 'white'; 
            }
        }
        
        // Update the currentMousePosition with the new coordinates
        currentMousePosition = { x: event.offsetX, y: event.offsetY };
        
        drawRectangles();
    }
    

    
    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        
        const x = event.offsetX 
        const y = event.offsetY;
        let color = '#429053';
        const draggedId = event.dataTransfer.getData('text');
        if(draggedId== "Green"){color = '#429053'};
        if(draggedId== "Blue"){color = '#0678FF'};
        if(draggedId== "Orange"){color = '#F6993F'};
        if(draggedId== "Red"){color = '#DB4437'};

        
    
      
        addRectangle(x, y, color)
    });
    
    
    
    
    function addRectangle(x, y, color) {
        const rectWidth = 100;
        const rectHeight = 50;
        const handleWidth = 20;
        const handleHeight = 10;
        const newRect = {
            x: x - rectWidth/2,
            y: y - rectHeight/2,
            width: rectWidth,
            height: rectHeight,
            color: color,
            handles: [
                {
                    x: rectWidth / 2 - handleWidth / 2, 
                    y: 0,
                    width: handleWidth,
                    height: handleHeight,
                    color: '#FFFFFF'
                },
                {
                    x: rectWidth / 2 - handleWidth / 2,
                    y: rectHeight - handleHeight,
                    width: handleWidth,
                    height: handleHeight,
                    color: '#FFFFFF'
                }
            ]
        };
        rectangles.push(newRect);
        drawRectangles();
    }



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



    function handleMouseMove(event) {
        if (selectedShape) {
            if (selectedShape.handle) {
                currentMousePosition = { x: event.offsetX, y: event.offsetY };
            } else {
                selectedShape.rectangle.x = event.offsetX - (selectedShape.rectangle.width / 2);
                selectedShape.rectangle.y = event.offsetY - (selectedShape.rectangle.height / 2);
            }
            drawRectangles();
        }
    }

    function roundRect(ctx, x, y, width, height, roundness, rectColor) {
        const radius = Math.min(roundness, Math.min(width / 2, height / 2));
        const r = x + width;
        const b = y + height;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, b - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fillStyle = rectColor;
        ctx.fill();
    }
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        console.log(lines);
    
        // Filter the lines array to keep only the lines that are not selected
        lines = lines.filter(line => !line.selected);
    
        // Redraw the remaining lines
        drawRectangles();
    });
    
    

    drawRectangles();
});





document.getElementById('circleHandle').addEventListener('click', function () {
    const leftMenuContainer = document.getElementById('leftDock');
    var circleHandle = document.getElementById('circleHandle');
    document.querySelector('.parent').style.gridTemplateColumns = '20px 1fr';


    const isHidden = leftMenuContainer.style.display === 'none';
    leftMenuContainer.style.display = isHidden ? 'block' : 'none';
    document.querySelector('.parent').style.gridTemplateColumns = isHidden ? '200px 1fr' : '20px 1fr';
    circleHandle.style.left = isHidden ? '180px' : '0px'; // Adjust the '200px' as necessary
});


  





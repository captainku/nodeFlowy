import { rectangles, lines  } from './shapes.js';
document.addEventListener('DOMContentLoaded', (event) => {
const canvas = document.getElementById('myCanvas');
let isMouseDown = false;
const canvasContainer  = document.getElementById('canvasDiv');
let startX, startY;
let selectedShape;
let lineID =0;
let currentMousePosition = { x: 0, y: 0 };
let lastMousePosition = { x: 0, y: 0 };
const snapThreshold = 50; // Adjust the threshold as needed

let powerSource = false;
let powered = false;
let lineColor = "#182F4F"



const context = canvas.getContext('2d');

//MOUSE MOVEMENT CODE-------------------------------------------------------------------------

// Mouse Down!---------------------
function handleMouseDown(event) {
    isMouseDown = true;
    // Update the lastMousePosition at the end of mouse move event
    lastMousePosition = { x: event.offsetX, y: event.offsetY };
    startX = event.clientX - canvasContainer.offsetLeft;
    startY = event.clientY - canvasContainer.offsetTop;
    let rect = rectangles.find(rect => isMouseInsideRectangle(rect, event.offsetX, event.offsetY));
    let handle = null;
    let clickedLine = null;
    if (rect) {
        addShapeData(rect);
        handle = rect.handles.find(hdl => isMouseInsideHandle(rect, hdl, event.offsetX, event.offsetY));
        selectedShape = {
            rectangle: rect,
            handle: handle
        };

        if(!handle){
            // set selected to true without changing the state of all other rectangles
            rect.selected = true;

            // If Ctrl key is not held down, clear other selections
            if (!event.ctrlKey) {
                rectangles.forEach(otherRect => {
                    if (otherRect != rect) {
                        otherRect.selected = false;
                    }
                });
            }
        }
    } else {
        // If click is not on a rectangle, clear all selected rectangles
        rectangles.forEach(rect => {
            rect.selected = false;
        });
    }

    // Check if a control point was clicked
    const clickedLineWithCP = lines.find(line => isMouseInsideControlPoint(line, event.offsetX, event.offsetY));
    if (clickedLineWithCP) {
        for (let i = 0; i < clickedLineWithCP.controlPointsCount; i++) {
            const controlPoint = clickedLineWithCP.controlPoint[i];
            const distanceToCursor = Math.sqrt(Math.pow(controlPoint.x - event.offsetX, 2) + Math.pow(controlPoint.y - event.offsetY, 2));
            if (distanceToCursor <= 20) { // Same threshold as in isMouseInsideControlPoint
                clickedLineWithCP.controlPointSelected = !clickedLineWithCP.controlPointSelected;
                const midPointX = controlPoint.x;
                const midPointY = controlPoint.y;
                const controlPointSize = 20; // size of control point
                context.beginPath();
                context.arc(midPointX, midPointY, controlPointSize, 0, 2 * Math.PI, false);
                context.fillStyle = lineColor; // color of control point
                context.fill();
                context.closePath();
                context.stroke();
                selectedShape = {
                    controlPoint: { x: event.offsetX, y: event.offsetY, index: i },
                    line: clickedLineWithCP
                };
                break;
            }
        }
    }

    // Ignore line selections if a rectangle handle is clicked
    if (!handle && !clickedLineWithCP && event.button === 0) {
        clickedLine = lines.find(line => isPointNearLine(line, event.offsetX, event.offsetY));
        if (clickedLine) {
            // Toggle the 'selected' property
            clickedLine.selected = !clickedLine.selected;
            selectedShape = {
                line: clickedLine
            };

            // Change the color based on the 'selected' state
            clickedLine.color = clickedLine.selected ? '#FF0000' : lineColor;
        }
    }

    // Update the currentMousePosition with the new coordinates
     currentMousePosition = { x: event.offsetX, y: event.offsetY };

    if (!handle && !clickedLineWithCP && !clickedLine && !rect && event.button === 0) {
        lines.forEach(line => {
            line.selected = false;
            line.color = lineColor;
        });
    }
    

    drawRectangles(selectedShape,currentMousePosition);
}



//Mouse Move!--------------------------------
function handleMouseMove(event) {
    event.preventDefault();
    if (selectedShape) {
        
            // Calculate the change in mouse position
    let deltaX = event.offsetX - lastMousePosition.x;
    let deltaY = event.offsetY - lastMousePosition.y;
        // Current mouse position for the handle
        if (selectedShape.handle) {
             currentMousePosition = { x: event.offsetX, y: event.offsetY };
        }

        // Change position of the selected rectangle
        else if (selectedShape.rectangle) {
            // Update the last mouse position
            lastMousePosition = { x: event.offsetX, y: event.offsetY };

            // If a rectangle is selected
            if (selectedShape.rectangle) {
                // Move all shapes relative to the mouse movement
                rectangles.forEach(rect => {
                    if(rect.selected){                    
                        rect.x += deltaX;
                        rect.y += deltaY;}

                });
            }

            lines.forEach(line => {
                if (line.start === selectedShape.rectangle) {
                    line.startHandleCenter.x = line.start.x + line.startHandle.x + line.startHandle.width / 2;
                    line.startHandleCenter.y = line.start.y + line.startHandle.y + line.startHandle.height / 2;
                }
                if (line.end === selectedShape.rectangle) {
                    line.endHandleCenter.x = line.end.x + line.endHandle.x + line.endHandle.width / 2;
                    line.endHandleCenter.y = line.end.y + line.endHandle.y + line.endHandle.height / 2;
                }
            });
        }

        else if (selectedShape.controlPoint) {
            selectedShape.controlPoint.x = event.offsetX;
            selectedShape.controlPoint.y = event.offsetY;
            selectedShape.line.controlPoint[selectedShape.controlPoint.index].x = event.offsetX;
            selectedShape.line.controlPoint[selectedShape.controlPoint.index].y = event.offsetY;
        }

        drawRectangles(selectedShape, currentMousePosition);
    }

}




    //Mouse UP!!!
    function handleMouseUp(event) {
        isMouseDown = false;
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
                let audio = new Audio('Assets/plug.mp3');
                audio.play();
                lineID ++;
              }
            });
            


          });
          
          if (endRect && endRect !== selectedShape.rectangle && endHandle) {
            const startHandleCenter = {
                x: selectedShape.rectangle.x + selectedShape.handle.x + selectedShape.handle.width / 2,
                y: selectedShape.rectangle.y + selectedShape.handle.y + selectedShape.handle.height / 2,
            };
            const endHandleCenter = {
                x: endRect.x + endHandle.x + endHandle.width / 2,
                y: endRect.y + endHandle.y + endHandle.height / 2,
            };

            if(selectedShape.rectangle.powered || endRect.powered == true){
                powered = true;
            }
            else{
                powered = false;
            }

            lines.push({
        
                start: selectedShape.rectangle,
                end: endRect,
                startHandle: selectedShape.handle,
                startHandleType: selectedShape.handleType,
                endHandle: endHandle,
                startHandleCenter: {x: selectedShape.rectangle.x + selectedShape.handle.x + selectedShape.handle.width / 2,
                y: selectedShape.rectangle.y + selectedShape.handle.y + selectedShape.handle.height / 2,},
                endHandleCenter: {
                    x: endRect.x + endHandle.x + endHandle.width / 2,
                    y: endRect.y + endHandle.y + endHandle.height / 2,},
                color: lineColor,
                selected: false,
                controlPoint: [],
                controlPointsCount: 0, // Add this property
                controlPointSelected: false,
                isInitialDraw: true,
                powered : powered,
                lineID : lineID
            });
          }
        }
        selectedShape = null;

        drawRectangles(selectedShape,currentMousePosition, lines);
      }

      canvas.addEventListener('dblclick', function(e) {
        // Get the mouse position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
      
        // Use your function to check if the click occurred within the rectangle's bounds
        if (isMouseInsideRectangle(rect, x, y)) {
            var myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.show();
        }
      });
      




window.handleMouseDown= handleMouseDown;
window.handleMouseMove=handleMouseMove;
window.handleMouseUp = handleMouseUp;

    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });



    
    function isPointNearLine(line, mouseX, mouseY) {
        const startHandleCenter = {
            x: line.start.x + line.startHandle.x + line.startHandle.width / 2,
            y: line.start.y + line.startHandle.y + line.startHandle.height / 2,
        };
        const endHandleCenter = {
            x: line.end.x + line.endHandle.x + line.endHandle.width / 2,
            y: line.end.y + line.endHandle.y + line.endHandle.height / 2,
        };
    
        const startHandleType = line.startHandle.handleType;
        const endHandleType = line.endHandle.handleType;
    
        const startHandleCenterOffset = {
            x: startHandleType == "leftside" ? startHandleCenter.x - 25 : startHandleType == "rightside" ? startHandleCenter.x + 25 : startHandleCenter.x,
            y: startHandleType == "top" ? startHandleCenter.y - 25 : startHandleType == "bottom" ? startHandleCenter.y + 25 : startHandleCenter.y,
        };
        const endHandleCenterOffset = {
            x: endHandleType == "leftside" ? endHandleCenter.x - 25 : endHandleType == "rightside" ? endHandleCenter.x + 25 : endHandleCenter.x,
            y: endHandleType == "top" ? endHandleCenter.y - 25 : endHandleType == "bottom" ? endHandleCenter.y + 25 : endHandleCenter.y,
        };
    
        const threshold = 10; // You can adjust this value to whatever suits your needs
    
        // Start with start handle and end handle, insert control points in between
        const linePoints = [startHandleCenter, startHandleCenterOffset, ...line.controlPoint, endHandleCenterOffset, endHandleCenter];
    
        // Check distance to line segments
        for (let t = 0; t <= 1; t += 0.01) {
            for (let i = 0; i < linePoints.length - 1; i++) {
                const pointOnLine = {
                    x: (1 - t) * linePoints[i].x + t * linePoints[i + 1].x,
                    y: (1 - t) * linePoints[i].y + t * linePoints[i + 1].y
                };
                const distanceToCursor = Math.sqrt(Math.pow(pointOnLine.x - mouseX, 2) + Math.pow(pointOnLine.y - mouseY, 2));
    
                if (distanceToCursor <= threshold) {
                    return true;
                }
            }
        }
    
        return false;
    }


});
import handleCanvasPanning from './canvasHandler.js';
import saveManager from './saveManager.js';
import { setShapeDataArray } from './dataHandler.js';
export let shapeID =0 ;
export let rectangles = [];
export let circles = [];
export let lines = [];
export function getShapeID() {
    return shapeID;
}
export function setShapeID(newShapeID) {
    shapeID = newShapeID;
}

document.addEventListener('DOMContentLoaded', (event) => {

//The Varriable Zone-----------------------------------------------------------------
    const canvasContainer  = document.getElementById('canvasDiv');
    const canvas = document.getElementById('myCanvas');
    canvas.width = 5000;
    canvas.height = 5000;
    const context = canvas.getContext('2d');
    const controlPointSize = 10; 
    let powerSource = false;
    let powered = false;
    let colorPowered = "#FFE01B";
    const shapeSelectedBordercolor = "#FFC23C";
    let shapSelectedBorder = 3;
    let lineColor = "#182F4F"
    let lineWidth = 3;

//End Variables -------------------------------------------------------------------------

//MAIN LOGIC FUNCTIONS ➕➖➗---------------------------------


//CREATING SHPAES 📦---------------------------------------

function drawShapes(selectedShape, currentMousePosition, lines) {
    context.clearRect(0, 0, canvas.width, canvas.height);  // clear the canvas
    // Draw all rectangles
     drawRectangles(selectedShape, currentMousePosition);
    // Draw lines between shapes
    drawLines(lines);
    // Draw all circles
    drawCircles();

    // Additional logic to handle selected shapes and interactions...
}

window.drawShapes=drawShapes;

function drawRectangles(selectedShape,currentMousePosition, lines) {
    const roundness = 10; // Adjust the roundness value here
    lines = lines;

   



    rectangles.forEach(rect => {
        power(rect);
        if (rect.powered) {
            context.fillStyle = rect.colorPowered;
            shapSelectedBorder = 0;
            roundRect(context, rect.x, rect.y, rect.width, rect.height, roundness, rect.colorPowered, shapeSelectedBordercolor, shapSelectedBorder);
        } else if (rect.selected) {
            context.fillStyle = rect.color;
            shapSelectedBorder = 3;
            roundRect(context, rect.x, rect.y, rect.width, rect.height, roundness, rect.colorSelected, shapeSelectedBordercolor, shapSelectedBorder);
        } else {
            context.fillStyle = rect.color;
            shapSelectedBorder = 0;
            roundRect(context, rect.x, rect.y, rect.width, rect.height, roundness, rect.color, shapeSelectedBordercolor, shapSelectedBorder);
        }

        // Draw handles
        rect.handles.forEach(handle => {
            context.fillStyle = handle.color;
            context.fillRect(rect.x + handle.x, rect.y + handle.y, handle.width, handle.height);

            // Draw handle borders
            context.strokeStyle = handle.borderColor;
            context.lineWidth = 1;
            context.strokeRect(rect.x + handle.x, rect.y + handle.y, handle.width, handle.height);
        });

        let text = nameHandle(rect.shapeID);

        // Add text to rectangle
        context.font = "14px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, rect.x + rect.width / 2, rect.y + rect.height / 2);
    });
    // Draw the temporary line (from the selected handle to the current mouse position) over everything else
    if (selectedShape && selectedShape.handle) {
        console.log(selectedShape);
        
        let handleCenter = {};

        if ('radius' in selectedShape.shape) { // If the shape is a circle
            handleCenter = {
                x: selectedShape.shape.x + Math.cos(selectedShape.handle.angle) * selectedShape.shape.radius,
                y: selectedShape.shape.y + Math.sin(selectedShape.handle.angle) * selectedShape.shape.radius,
            };
        } else { // If the shape is a rectangle
            handleCenter = {
                x: selectedShape.shape.x + selectedShape.handle.x + selectedShape.handle.width / 2,
                y: selectedShape.shape.y + selectedShape.handle.y + selectedShape.handle.height / 2,
            };
        }

        context.beginPath();
        context.moveTo(handleCenter.x, handleCenter.y);
        console.log(handleCenter.x);
        context.lineTo(currentMousePosition.x, currentMousePosition.y);
        context.strokeStyle = lineColor;
        context.lineWidth = lineWidth;
        context.stroke();

        // Reset the strokeStyle
        context.strokeStyle = lineColor;

    }
    
}

function addRectangle(x, y, color, powerSource) {
    if(powerSource ){powered = true};
    shapeID++;
    const rectWidth = 100;
    const rectHeight = 50;
    const handleWidth = 40;
    const handleHeight = 8;
    const sideHandleWidth = 8;
    const sideHandleHeight = 20;
    const handleColor = "#FFFFFF";
    const newRect = {
        x: x - rectWidth/2,
        y: y - rectHeight/2,
        width: rectWidth,
        height: rectHeight,
        color: color,
        colorPowered : colorPowered,
        shapeID: shapeID,
        shapeType : 'rectangle',
        linesConnected :[],
        powerSource : powerSource,
        powered : powered,
        handles: [
            {
                x: rectWidth / 2 - handleWidth / 2, 
                y: 0,
                width: handleWidth,
                height: handleHeight,
                color: color, // Set the handle's color to the rectangle's color
                borderColor: handleColor, // Set the handle's border color to the handleColor
                handleType: "top"
            },
            {
                x: rectWidth / 2 - handleWidth / 2,
                y: rectHeight - handleHeight,
                width: handleWidth,
                height: handleHeight,
                color: color,
                borderColor: handleColor,
                handleType: "bottom"
            },
            {
                x: 0 ,
                y: rectHeight / 2 - sideHandleHeight/ 2,
                width: sideHandleWidth,
                height: sideHandleHeight,
                color: color,
                borderColor: handleColor,
                handleType: "leftside"
            },
            {
                x: rectWidth  - sideHandleWidth ,
                y: rectHeight / 2 - sideHandleHeight/ 2,
                width: sideHandleWidth,
                height: sideHandleHeight,
                color: color,
                borderColor: handleColor,
                handleType: "rightside"
            }
        ]
    };
    addShapeData(newRect);
    rectangles.push(newRect);
    drawRectangles();
}

function roundRect(ctx, x, y, width, height, roundness, rectColor, borderColor, borderWidth) {
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



    if(borderWidth > 0) {
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}
window.drawRectangles = drawRectangles;

// Add a function to create a circle
function addCircle(x, y, color, powerSource) {
    if(powerSource ){powered = true};
    shapeID++;
    const circleRadius = 40; // set radius of circle
    const handleRadius = 7; // set radius of handle
    const handleColor = "#FFFFFF";
    const newCircle = {
        x: x,
        y: y,
        radius: circleRadius,
        color: color,
        colorPowered : colorPowered,
        shapeID: shapeID,
        linesConnected :[],
        powerSource : powerSource,
        powered : powered,
        shapeType : "circle",
        handles: [
            {
                angle: 0, 
                radius: handleRadius,
                color: color,
                borderColor: handleColor,
                handleType: "rightside"
            },
            {
                angle: Math.PI / 2, // right handle
                radius: handleRadius,
                color: color,
                borderColor: handleColor,
                handleType: "bottom"
            },
            {
                angle: Math.PI, // bottom handle
                radius: handleRadius,
                color: color,
                borderColor: handleColor,
                handleType: "leftside"
            },
            {
                angle: 3 * Math.PI / 2, // left handle
                radius: handleRadius,
                color: color,
                borderColor: handleColor,
                handleType: "top"
            }
        ]
    };

    newCircle.handles.forEach(handle => {
        handle.x = newCircle.x + Math.cos(handle.angle) * (circleRadius - handle.radius * 2);
        handle.y = newCircle.y + Math.sin(handle.angle) * (circleRadius - handle.radius * 2);
    });

    addShapeData(newCircle);
    circles.push(newCircle);
    drawCircles();
}


function drawCircles() {

    circles.forEach(circle => {
        power(circle);
        context.beginPath();
        context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = circle.powered ? circle.colorPowered : circle.color;
        context.fill();

        // Draw handles
        circle.handles.forEach(handle => {
            context.beginPath();
            handle.x = circle.x + Math.cos(handle.angle) * (circle.radius - handle.radius);
            handle.y = circle.y + Math.sin(handle.angle) * (circle.radius - handle.radius);
            context.arc(handle.x, handle.y, handle.radius, 0, Math.PI * 2);
            context.fillStyle = handle.color;
            context.fill();

            // Draw handle borders
            context.strokeStyle = handle.borderColor;
            context.lineWidth = 1;
            context.stroke();
        });

        let text = nameHandle(circle.shapeID);

        // Add text to circle
        context.font = "10px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, circle.x, circle.y);
    });
}



//DRAWING LINES ✏ -----------------------------------------
    function drawLines() {
        
        // Draw lines between rectangles
        lines.forEach(line => {
            let startHandleCenter = {};
            let endHandleCenter = {};
        
            if ('radius' in line.start) { // If the start shape is a circle
                startHandleCenter = {
                    x: line.start.x + Math.cos(line.startHandle.angle) * line.start.radius,
                    y: line.start.y + Math.sin(line.startHandle.angle) * line.start.radius,
                };
            } else { // If the start shape is a rectangle
                startHandleCenter = {
                    x: line.start.x + line.startHandle.x + line.startHandle.width / 2,
                    y: line.start.y + line.startHandle.y + line.startHandle.height / 2,
                };
            }
        
            if ('radius' in line.end) { // If the end shape is a circle
                endHandleCenter = {
                    x: line.end.x + Math.cos(line.endHandle.angle) * line.end.radius,
                    y: line.end.y + Math.sin(line.endHandle.angle) * line.end.radius,
                };
            } else { // If the end shape is a rectangle
                endHandleCenter = {
                    x: line.end.x + line.endHandle.x + line.endHandle.width / 2,
                    y: line.end.y + line.endHandle.y + line.endHandle.height / 2,
                };
            }


            const startHandleType = line.startHandle.handleType;
            const endHandleType = line.endHandle.handleType;

            const yDifference = endHandleCenter.y - startHandleCenter.y;
            // Save context state, this makes sure glow only applies to lines
            // Start line
            context.save();
            context.beginPath();
            context.strokeStyle = lineColor;
            context.lineWidth = lineWidth;

            context.moveTo(startHandleCenter.x, startHandleCenter.y);

            if (startHandleType == "top") {
                context.lineTo(startHandleCenter.x, startHandleCenter.y-25);
            } else if(startHandleType == "bottom"){
                context.lineTo(startHandleCenter.x, startHandleCenter.y+25);
            }
            else if(startHandleType == "leftside"){
                context.lineTo(startHandleCenter.x-25, startHandleCenter.y);
            }
            else if(startHandleType == "rightside"){
                context.lineTo(startHandleCenter.x+25, startHandleCenter.y);
            }

            // Draw a line to each control point in order
            for (let i = 0; i < line.controlPointsCount; i++) {
                context.lineTo(line.controlPoint[i].x, line.controlPoint[i].y);
            }

            // Draw a line to the end point
            if (endHandleType == "top") {
                context.lineTo(endHandleCenter.x, endHandleCenter.y - 25);
            }  else if(endHandleType == "bottom"){
                context.lineTo(endHandleCenter.x, endHandleCenter.y+25);
            }
            else if(endHandleType == "leftside"){
                context.lineTo(endHandleCenter.x-25, endHandleCenter.y);
            }
            else if(endHandleType == "rightside"){
                context.lineTo(endHandleCenter.x+25, endHandleCenter.y);
            }

            context.lineTo(endHandleCenter.x, endHandleCenter.y);

            context.strokeStyle = line.color; // Use the color of the line for the strokeStyle
            context.stroke();
            context.strokeStyle = lineColor; // Set strokeStyle back to white after each line
            context.restore();

            if (line.selected) {
                line.controlPoint.forEach(cp => {
                    // Draw control point in the middle of the line
                    const midPointX = cp.x;
                    const midPointY = cp.y;

    
                    context.beginPath();
                    context.arc(midPointX, midPointY, controlPointSize, 0, 2 * Math.PI, false);
    
                    if (line.controlPointSelected) {
                        context.fillStyle = lineColor;
                    } else {
                        context.fillStyle = 'yellow';
                    }
    
                    context.fill();
                });
            }
            if(line.isInitialDraw == true)
            {
                line.end.linesConnected.push(line);
                line.start.linesConnected.push(line);
                line.isInitialDraw = false;
            }
        });
    }
    
    function deleteLine() {
        lines.forEach(line => {
            if (line.selected) {
                rectangles.forEach(rect => {
                    let tempLinesConnected = [...rect.linesConnected]; // Create a temporary copy for iteration
                    tempLinesConnected.forEach(linesConnected => {
                        console.log(linesConnected);
                        if (linesConnected.lineID == line.lineID) {
                            let indexToRemove = rect.linesConnected.indexOf(linesConnected);
                            if (indexToRemove > -1) { // Make sure the element was found in the array
                                rect.linesConnected.splice(indexToRemove, 1);
                            }
                        }
                    });
                });
            }
        });
    
        
         //Check if we should delete rectangle if selected
        rectangles.forEach(rect => {
            if(rect.selected){

                rect.linesConnected.forEach(linecon => {//This block will find each line connected to a deleted rect and remove the lines.
                   lines.find(line => line.LineID === linecon.id).selected = true;
                   lines = lines.filter(line => !line.selected);
                });
            }
        });
        lines = lines.filter(line => !line.selected);
        rectangles = rectangles.filter(rect => !rect.selected);

        rectangles.forEach(rect => {
            power(rect);
        });
        
        // Redraw the remaining lines
        drawRectangles();
    }

//ADD CONTROL POINTS-----------------------------------------------------------------------

    function addControlPoint(x, y) {
        // Find the selected line
        const selectedLine = lines.find(line => line.selected);
    
        // If a line is selected
        if (selectedLine) {
            // Define lastPoint to be either the last control point or the start point
            const lastPoint = selectedLine.controlPointsCount > 0
                ? selectedLine.controlPoint[selectedLine.controlPoint.length - 1]
                : selectedLine.startHandleCenter;
    
            // Create a new control point at the clicked coordinates
            const newControlPoint = {
                x: x,
                y: y,
            };
    
            // Find the index where the new control point should be inserted
            const insertionIndex = selectedLine.controlPoint.findIndex(cp => cp.y > y || (cp.y === y && cp.x > x));
    
            // Insert the new control point at the correct position
            if (insertionIndex !== -1) {
                selectedLine.controlPoint.splice(insertionIndex, 0, newControlPoint);
            } else {
                selectedLine.controlPoint.push(newControlPoint);
            }
    
            selectedLine.controlPointsCount++;
        } else {
            console.log('No line is currently selected.');
        }
    
        drawShapes();
    }
    
//REMOVE CONTROL POINTS---------------------------------------------------------------------   
    function deleteControlPoint(x, y) {
        // Find the selected line
        const selectedLine = lines.find(line => line.selected);
    
        // If a line is selected
        if (selectedLine) {
            // Initialize control point index to indicate no point found
            let controlPointIndex = -1;
    
            // Iterate through all control points
            for (let i = 0; i < selectedLine.controlPointsCount; i++) {
                const controlPointX = selectedLine.controlPoint[i].x;
                const controlPointY = selectedLine.controlPoint[i].y;
                const distanceToCursor = Math.sqrt(Math.pow(controlPointX - x, 2) + Math.pow(controlPointY - y, 2));
                
                // If a control point is within the desired distance, save the index and break the loop
                if (distanceToCursor <= 20) {
                    controlPointIndex = i;
                    break;
                }
            }
    
            // If a control point was found, remove it
            if (controlPointIndex !== -1) {
                selectedLine.controlPoint.splice(controlPointIndex, 1);
                selectedLine.controlPointsCount--;
            } else {
                console.log('No control point found to delete.');
            }
        } else {
            console.log('No line is currently selected.');
        }
    
        drawRectangles();
    }
    
    

function lineInfo(){
            // Find the selected line
            const selectedLine = lines.find(line => line.selected);
            console.log('Selected line:', selectedLine);
}
    
//export functions
    window.addControlPoint=addControlPoint;
    window.deleteControlPoint=deleteControlPoint;
    window.lineInfo=lineInfo;
        
// Define an array of objects, each containing an element id and the data to be set
const draggableItems = [
    { id: 'greenBlock', color: 'Green' },
    { id: 'blueBlock', color: 'Blue' },
    { id: 'orangeBlock', color: 'Orange' },
    { id: 'redBlock', color: 'Red' },
    { id: 'offBlock', color: 'Grey' },
    { id: 'circle', color: 'BlueCircle' }
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


    
//Event Listeners-🎧🎧🎧-----------------------------------------------------------------------

    // Call the handleCanvasPanning function
    handleCanvasPanning(canvas, rectangles, lines);

    // Allow canvas to accept drops
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

document.getElementById('saveBtn').addEventListener('click', () => {
    saveManager.saveState(rectangles, lines);
});

document.getElementById('loadBtn').addEventListener('click', () => {
    const loadedState = saveManager.loadState();
    rectangles = loadedState.rectangles;
    lines = loadedState.lines;
    setShapeDataArray(loadedState.shapeDataArray); // Use the setter function to update shapeDataArray
    drawRectangles();
});

    
    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        
        const x = event.offsetX 
        const y = event.offsetY;
        let color = '#429053';

        const draggedId = event.dataTransfer.getData('text');
        if(draggedId== "Green"){
            color = '#429053';
            powerSource = true;
        }
        else{powerSource = false}
        if(draggedId== "Blue"){
            color = '#0678FF';
        }
        if(draggedId== "Orange"){color = '#F6993F'};
        if(draggedId== "Red"){color = '#DB4437'};
        if(draggedId== "Grey"){color = '#00060e'};
        if(draggedId== "BlueCircle")
        {
        color = 'blue';
        addCircle(x, y, color, powerSource);
        }
        else{addRectangle(x, y, color, powerSource)}
        

        
    });
    
    


    

    window.deleteLine = deleteLine;
    

    drawRectangles();

//Power folow code ⚡⚡⚡------------------------------------------------

function power(rect){


}





 

});













  





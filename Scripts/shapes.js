import handleCanvasPanning from './canvasHandler.js';

document.addEventListener('DOMContentLoaded', (event) => {
    const canvasContainer  = document.getElementById('canvasDiv');
    const canvas = document.getElementById('myCanvas');
    // set the width and height of the canvas to match the div
    canvas.width = 5000;
    canvas.height = 5000;
    const context = canvas.getContext('2d');


    let rectangles = [];
    let selectedShape = null;
    let currentMousePosition = { x: 0, y: 0 };
    let lines = [];
    let linesConnected = [];
    let isInitialDraw;
    const controlPointSize = 10; // Size of control point
    const snapThreshold = 50; // Adjust the threshold as needed
    let isMouseDown = false;
    let startX, startY;
    let shapeID =0 ;
    let lineID =0;
    let powerSource = false;
    let powered = false;
    let colorPowered = "#FFE01B";
    let colorSelected = "#FFC23C";
    const shapeSelectedBordercolor = "#FFC23C";
    let shapSelectedBorder = 3;

    let lineColor = "#182F4F"
    let lineWidth = 3;


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
    
        drawRectangles();
    }
    
    
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
    
    
       


window.addControlPoint=addControlPoint;
window.deleteControlPoint=deleteControlPoint;
window.lineInfo=lineInfo;
    


    // Call the handleCanvasPanning function
    handleCanvasPanning(canvas, rectangles, lines);

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
    { id: 'offBlock', color: 'Grey' }
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


function drawRectangles() {
    const roundness = 10; // Adjust the roundness value here

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between rectangles first
    drawLines();

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
        const handleCenter = {
            x: selectedShape.rectangle.x + selectedShape.handle.x + selectedShape.handle.width / 2,
            y: selectedShape.rectangle.y + selectedShape.handle.y + selectedShape.handle.height / 2,
        };

        context.beginPath();
        context.moveTo(handleCenter.x, handleCenter.y);
        context.lineTo(currentMousePosition.x, currentMousePosition.y);
        context.strokeStyle = lineColor;
        context.lineWidth = lineWidth;
        context.stroke();

        // Reset the strokeStyle
        context.strokeStyle = lineColor;
    }
}


    window.drawRectangles = drawRectangles;
    
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
            console.log(startHandleType);
            if (endHandleType == "top") {
                context.lineTo(endHandleCenter.x, endHandleCenter.y - 25);
            }  else if(endHandleType == "bottom"){
                context.lineTo(endHandleCenter.x, endHandleCenter.y+25);
            }
            else if(endHandleType == "leftside"){
                context.lineTo(endHandleCenter.x-25, endHandleCenter.y);
            }
            else if(endHandleType == "rightside"){
                console.log("Using Right offset");
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

        
        addRectangle(x, y, color, powerSource)
    });
    
    
    
    




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
    
    

//MOUSE MOVEMENT CODE-------------------------------------------------------------------------

// Mouse Down!---------------------
// Mouse Down!---------------------
function handleMouseDown(event) {
    isMouseDown = true;
    startX = event.clientX - canvasContainer.offsetLeft;
    startY = event.clientY - canvasContainer.offsetTop;
    const rect = rectangles.find(rect => isMouseInsideRectangle(rect, event.offsetX, event.offsetY));
    let handle = null;
    let clickedLine = null;
    if (rect ) {
        console.log(rect);
        addShapeData(rect);
        
        handle = rect.handles.find(hdl => isMouseInsideHandle(rect, hdl, event.offsetX, event.offsetY));
        selectedShape = {
            rectangle: rect,
            handle: handle
        };
        rectangles.forEach(rect => {
            rect.selected = false;
        });

        if(!handle){
            
            rect.selected = true;}
    }

    else{rectangles.forEach(rect => {
        rect.selected = false;
    });}

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
    

    drawRectangles();
}



//Mouse Move!--------------------------------
function handleMouseMove(event) {
    event.preventDefault();
    if (selectedShape) {

        // Current mouse position for the handle
        if (selectedShape.handle) {
            currentMousePosition = { x: event.offsetX, y: event.offsetY };
        }

        // Change position of the selected rectangle
        else if (selectedShape.rectangle) {
            selectedShape.rectangle.x = event.offsetX - (selectedShape.rectangle.width / 2);
            selectedShape.rectangle.y = event.offsetY - (selectedShape.rectangle.height / 2);
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

        drawRectangles();
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
            console.log(rect);
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

        drawRectangles();
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
      






      function deleteLine() {
        lines.forEach(line => {
            if (line.selected) {
                rectangles.forEach(rect => {

                    let tempLinesConnected = [...rect.linesConnected]; // Create a temporary copy for iteration
                    tempLinesConnected.forEach(linesConnected => {
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
    

    window.deleteLine = deleteLine;
    

    
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });

    
    

    drawRectangles();

//Power folow code ⚡⚡⚡------------------------------------------------

function power(rect){

    rect.linesConnected.forEach(lineConnected => 
     {

        if(lineConnected.powered == true){
            rect.powered = true;
        }
     }
    );

    if(rect.linesConnected.length === 0 && rect.powerSource == false) {
        rect.powered = false;
    }

}





    //Code to create rectangles--------------------------------------------------------------------------------------
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







  





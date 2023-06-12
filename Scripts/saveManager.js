// In saveManager.js
import { shapeDataArray } from './dataHandler.js'; // add this line
import { getShapeID, setShapeID } from './shapes.js';
import { getLineID, setLineID } from './mouseHandler.js';
class SaveManager {
    constructor(localStorageKey) {
        this.localStorageKey = localStorageKey;
    }
    saveState(rectangles, lines) {
        // Prepare data without circular references
        const preparedLines = lines.map(line => ({
            ...line,
            start: line.start.shapeID, // replace rectangle with its shapeID
            end: line.end.shapeID, // replace rectangle with its shapeID
        }));
    
        const preparedRectangles = rectangles.map(rectangle => ({
            ...rectangle,
            // Check if linesConnected is not null and does not contain null entries before mapping
            linesConnected: rectangle.linesConnected 
                ? rectangle.linesConnected.filter(line => line && line.lineID).map(connectedLine => connectedLine.lineID)
                : [] // If linesConnected is null, assign an empty array
        }));
    
        // Deep copy to avoid modifying the original objects
        const rectanglesCopy = JSON.parse(JSON.stringify(preparedRectangles));
        const linesCopy = JSON.parse(JSON.stringify(preparedLines));
        const shapeDataArrayCopy = JSON.parse(JSON.stringify(shapeDataArray));
    
        const state = {
            rectangles: rectanglesCopy,
            lines: linesCopy,
            shapeDataArray: shapeDataArrayCopy,
            shapeID: getShapeID(),  // Use getter function here
            lineID : getLineID() 
        };
    
        const serializedState = JSON.stringify(state);
        localStorage.setItem(this.localStorageKey, serializedState);
        console.log("Object Saved!");
    }
    

    loadState() {
        const serializedState = localStorage.getItem(this.localStorageKey);
        if(serializedState !== null) {
            // Parse the stored state
            const state = JSON.parse(serializedState);
    
            // Use setter function to update shapeID and lineID
            setShapeID(state.shapeID);  
            console.log(state.lineID);
            if(state.lineID !== null){  // Notice the lowercase 'l' in lineID
                setLineID(state.lineID);  
                console.log("LineID being sent: " + state.lineID);
            }
   
    
            // Convert line start and end shapeIDs back into actual rectangle objects
            state.lines.forEach(line => {
                line.start = state.rectangles.find(rectangle => rectangle.shapeID === line.start);
                line.end = state.rectangles.find(rectangle => rectangle.shapeID === line.end);
            });
    
            // Return the reconstructed state
            return state;
        }
    
        // If there's no stored state, return empty objects and shapeID as 0
        return {
            rectangles: [],
            lines: [],
            shapeDataArray: [],
        };
    }
    
}



export default new SaveManager();

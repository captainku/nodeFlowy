// Define variables 
let shapeDataArray = [];
let shapeID;
let title;

function addShapeData(rect){
    shapeID = rect.shapeID;
    title = rect.title;
    let index = shapeDataArray.findIndex(shapeData => shapeData.shapeID === shapeID);
    
    if (index !== -1) {
        title = shapeDataArray[index].title;
    }

    else  {

    // Create a new object to store the shape data
    let shapeData = {
        shapeID: shapeID,
        title: title, // add title property here
        // You can add more properties here as needed
    };

    // Add the new shape data to the array
    shapeDataArray.push(shapeData);

    }
    
    updateModal(shapeID, title);
}

function updateModal(shapeID, title){
    document.getElementById('titleInput').value = title;
    document.getElementById('shapeIDInput').value = shapeID;
}


document.getElementById('saveChangesButton').addEventListener('click', function() {
    console.log("Save Clicked");
    let title = document.getElementById('titleInput').value;
    let shapeID = Number(document.getElementById('shapeIDInput').value);

    // Find the index of the shape data with the matching shapeID
    let index = shapeDataArray.findIndex(shapeData => shapeData.shapeID === shapeID);
     console.log(shapeID)   
    console.log(index);
    // If found, update the title of the shape data
    if (index !== -1) {
        shapeDataArray[index].title = title;
        console.log("Updated array")
    }




// Hide the modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
    myModal.hide();

});




window.addShapeData = addShapeData;


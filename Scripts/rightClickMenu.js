

var canvas = document.getElementById('myCanvas');
var contextMenu = document.getElementById('contextMenu');
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX  + 'px';
    contextMenu.style.top = e.pageY  + 'px';

    document.getElementById('option1').onclick = function() {
        addControlPoint(x, y);
        contextMenu.style.display = 'none';
    };

    document.getElementById('option2').onclick = function() {
        deleteControlPoint(x, y);
        contextMenu.style.display = 'none';
    };

    document.getElementById('option3').onclick = function() {
        deleteLine();
        contextMenu.style.display = 'none';
    };
    document.getElementById('option4').onclick = function() {
        lineInfo();
        contextMenu.style.display = 'none';
    };
    document.getElementById('option5').onclick = function() {
        contextMenu.style.display = 'none';
        var myModal = new bootstrap.Modal(document.getElementById('myModal'));
        myModal.show();
    };


      

    window.onclick = function(e) {
        if (e.button !== 2) {
            contextMenu.style.display = 'none';
        }
    };
});


document.addEventListener('keydown', function(event) {
    var myModal = document.getElementById('myModal');
    var saveChangesButton = document.getElementById('saveChangesButton');
    var isModalShown = window.getComputedStyle(myModal).display !== 'none';

    if (isModalShown && event.key === 'Enter') {
        saveChangesButton.click();
    }
});




var canvas = document.getElementById('myCanvas');
var contextMenu = document.getElementById('contextMenu');

canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();

    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;

    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';

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

    window.onclick = function(e) {
        if (e.button !== 2) {
            contextMenu.style.display = 'none';
        }
    };
});

// Get elements
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const toolBtns = document.querySelectorAll('.tool');
const fillColor = document.getElementById('fill-color');
const sizeSlider = document.getElementById('size-slider');
const colorBtns = document.querySelectorAll('.colors .option');
const colorPicker = document.getElementById('color-picker');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

// Set initial values
let selectedTool = 'brush';
let brushWidth = 5;
let selectedColor = '#000';
let isDrawing = false;
let prevMouseX, prevMouseY;
let snapshot;
let undoStack = [];
let redoStack = [];
let zoomLevel = 1;

// Set canvas background
const setCanvasBackground = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

// Resize canvas on window load
window.addEventListener('load', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    canvas.style.cursor = 'crosshair';
    setCanvasBackground();
});

// Draw rectangle
const drawRect = (e) => {
    if (!fillColor.checked) {
        ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    } else {
        ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
};

// Draw circle
const drawCircle = (e) => {
    ctx.beginPath();
    const radius = Math.sqrt(Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Draw triangle
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Tool selection
toolBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelector('.options .active').classList.remove('active');
        btn.classList.add('active');
        selectedTool = btn.id;
    });
});

// Color selection
colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelector('.options .selected').classList.remove('selected');
        btn.classList.add('selected');
        selectedColor = window.getComputedStyle(btn).getPropertyValue('background-color');
    });
});

colorPicker.addEventListener('change', () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Start drawing
const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    redoStack = [];
};

// Drawing
const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === 'brush' || selectedTool === 'eraser') {
        canvas.style.cursor = 'crosshair';
        ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === 'rectangle') {
        drawRect(e);
    } else if (selectedTool === 'circle') {
        drawCircle(e);
    } else if (selectedTool === 'triangle') {
        drawTriangle(e);
    }
};

// Save snapshot
const saveSnapshot = () => {
    redoStack = [];
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
};

// Undo
undoBtn.addEventListener('click', () => {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const prevImageData = undoStack[undoStack.length - 1];
        ctx.putImageData(prevImageData, 0, 0);
    }
});

// Redo
redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        const prevImageData = undoStack[undoStack.length - 1];
        ctx.putImageData(prevImageData, 0, 0);
    }
});

// Handle mouse up
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    saveSnapshot();
});

// Brush size slider
sizeSlider.addEventListener('change', () => {
    brushWidth = sizeSlider.value;
});

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

// Save canvas as image
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

// Zoom in
zoomInBtn.addEventListener('click', () => {
    zoomLevel += 0.1;
    canvas.style.transform = `scale(${zoomLevel})`;
});

// Zoom out
zoomOutBtn.addEventListener('click', () => {
    zoomLevel -= 0.1;
    zoomLevel = Math.max(zoomLevel, 0.5); // Minimum zoom level of 0.5
    canvas.style.transform = `scale(${zoomLevel})`;
});

// Event listeners for drawing
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', () => (isDrawing = false));
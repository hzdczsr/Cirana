// =========================================
// SIMPLIFIED WIRE DRAWING - NEW VERSION
// =========================================

// Temporary variables for wire drawing
let wireDrawing = false;
let wirePoints = [];
let wireMousePos = null;

function handleElectricMouseDown(e) {
    const rect = electricState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = getSnappedWirePoint(x, y);
    
    console.log('[MouseDown] Tool:', electricState.activeTool, 'Pos:', snapped.x, snapped.y);
    
    if (electricState.activeTool === 'wire') {
        if (!wireDrawing) {
            // Start drawing
            wireDrawing = true;
            wirePoints = [{ x: snapped.x, y: snapped.y }];
            wireMousePos = { x: snapped.x, y: snapped.y };
            console.log('[Wire] STARTED at', snapped.x, snapped.y);
            showElectricToast('开始绘制导线，继续点击添加点', 'info');
        } else {
            // Add point
            const lastPoint = wirePoints[wirePoints.length - 1];
            if (Math.abs(snapped.x - lastPoint.x) > 5 || Math.abs(snapped.y - lastPoint.y) > 5) {
                wirePoints.push({ x: snapped.x, y: snapped.y });
                console.log('[Wire] ADDED point at', snapped.x, snapped.y);
            }
            
            // Check if clicked on terminal to finish
            if (snapped.terminal) {
                console.log('[Wire] FINISH at terminal');
                wirePoints.push({ x: snapped.terminal.x, y: snapped.terminal.y });
                finishNewWire(snapped.terminal);
                return;
            }
        }
        drawElectricCanvas();
        return;
    }
    
    // Original logic for other tools
    if (electricState.activeTool === 'select') {
        const target = electricState.components.find(c => {
            return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
        });
        
        if (target) {
            const terminal = findNearbyTerminal(x, y, 15);
            if (terminal) {
                // Start wire from terminal
                wireDrawing = true;
                wirePoints = [{ x: terminal.x, y: terminal.y }];
                wireMousePos = { x: terminal.x, y: terminal.y };
                console.log('[Wire] STARTED from terminal at', terminal.x, terminal.y);
                drawElectricCanvas();
                return;
            }
            
            electricState.selectedComponent = target;
            electricState.isDragging = true;
            electricState.dragTarget = target;
            electricState.dragOffset = { x: x - target.x, y: y - target.y };
            renderElectricSidebar();
        } else {
            electricState.selectedComponent = null;
            document.getElementById('electric-sidebar').style.display = 'none';
        }
    } else {
        addElectricComponent(electricState.activeTool, snapped.x, snapped.y);
    }
    drawElectricCanvas();
}

function handleElectricMouseMove(e) {
    const rect = electricState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = getSnappedWirePoint(x, y);
    
    if (wireDrawing) {
        wireMousePos = { x: snapped.x, y: snapped.y };
        drawElectricCanvas();
        return;
    }
    
    // Original logic
    if (electricState.isDragging && electricState.dragTarget) {
        electricState.dragTarget.x = Math.round((x - electricState.dragOffset.x) / electricState.gridSize) * electricState.gridSize;
        electricState.dragTarget.y = Math.round((y - electricState.dragOffset.y) / electricState.gridSize) * electricState.gridSize;
    } else {
        electricState.mousePos = { x: snapped.x, y: snapped.y };
        electricState.hoverTerminal = snapped.terminal;
    }
    drawElectricCanvas();
}

function handleElectricMouseUp() {
    electricState.isDragging = false;
    electricState.dragTarget = null;
}

function finishNewWire(endTerminal) {
    if (wirePoints.length >= 2) {
        const newWire = {
            id: Date.now(),
            points: [...wirePoints],
            resistance: 0
        };
        electricState.connections.push(newWire);
        console.log('[Wire] CONNECTED! Points:', wirePoints.length);
        simulateCircuit();
        showElectricToast('导线连接成功！', 'success');
    }
    
    // Reset state
    wireDrawing = false;
    wirePoints = [];
    wireMousePos = null;
    drawElectricCanvas();
}

// Override canvas to add right click for cancel
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && wireDrawing) {
        wireDrawing = false;
        wirePoints = [];
        wireMousePos = null;
        drawElectricCanvas();
        showElectricToast('已取消绘制', 'warning');
    }
});

console.log('[Wire System] Ready!');

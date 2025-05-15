// Wall configuration - Add this after your existing game variables
const WALL_CONFIG = {
    TOP: {
        image: 'wall-top.jpg',     // Replace with your actual image path
        position: 'top'
    },
    RIGHT: {
        image: 'wall-right.jpg',   // Replace with your actual image path
        position: 'right'
    },
    BOTTOM: {
        image: 'wall-bottom.jpg',  // Replace with your actual image path
        position: 'bottom'
    },
    LEFT: {
        image: 'wall-left.jpg',    // Replace with your actual image path
        position: 'left'
    }
};

// Wall thickness as percentage of screen size
const WALL_THICKNESS_PERCENT = 8;

// Wall container to hold all walls
let wallContainer = null;
let walls = {
    top: null,
    right: null,
    bottom: null,
    left: null
};

// Function to create and add walls to the canvas
function initializeWalls() {
    // Create a container for all walls
    wallContainer = new PIXI.Container();
    wallContainer.sortableChildren = true;
    wallContainer.zIndex = 5; // Set below game elements but above background
    app.stage.addChild(wallContainer);
    
    // Create each wall
    createWall(WALL_CONFIG.TOP);
    createWall(WALL_CONFIG.RIGHT);
    createWall(WALL_CONFIG.BOTTOM);
    createWall(WALL_CONFIG.LEFT);
    
    // Position walls correctly
    positionWalls();
}

// Function to create a single wall
function createWall(wallConfig) {
    const texture = PIXI.Texture.from(wallConfig.image);
    const wall = new PIXI.Sprite(texture);
    
    // Set initial properties
    wall.zIndex = 5;
    wall.position = wallConfig.position;
    
    // Add to container
    wallContainer.addChild(wall);
    walls[wallConfig.position] = wall;
    
    return wall;
}

// Function to position walls based on current screen dimensions
function positionWalls() {
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const wallThickness = Math.min(screenWidth, screenHeight) * (WALL_THICKNESS_PERCENT / 100);
    
    // Top wall
    if (walls.top) {
        walls.top.width = screenWidth;
        walls.top.height = wallThickness;
        walls.top.x = 0;
        walls.top.y = 0;
    }
    
    // Right wall
    if (walls.right) {
        walls.right.width = wallThickness;
        walls.right.height = screenHeight;
        walls.right.x = screenWidth - wallThickness;
        walls.right.y = 0;
    }
    
    // Bottom wall
    if (walls.bottom) {
        walls.bottom.width = screenWidth;
        walls.bottom.height = wallThickness;
        walls.bottom.x = 0;
        walls.bottom.y = screenHeight - wallThickness;
    }
    
    // Left wall
    if (walls.left) {
        walls.left.width = wallThickness;
        walls.left.height = screenHeight;
        walls.left.x = 0;
        walls.left.y = 0;
    }
}

// Modify the existing resizeBackground function to also update wall positions
const originalResizeBackground = resizeBackground;
resizeBackground = function() {
    // Call the original function first
    originalResizeBackground();
    
    // Then update wall positions if they exist
    if (wallContainer) {
        positionWalls();
    }
};

// 3D perspective walls (optional enhancement)
function create3DWalls() {
    // Create a container for all walls
    wallContainer = new PIXI.Container();
    wallContainer.sortableChildren = true;
    wallContainer.zIndex = 5;
    app.stage.addChild(wallContainer);
    
    // Create each wall with 3D perspective
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const wallThickness = Math.min(screenWidth, screenHeight) * (WALL_THICKNESS_PERCENT / 100);
    
    // Top wall (with perspective)
    const topTexture = PIXI.Texture.from(WALL_CONFIG.TOP.image);
    walls.top = new PIXI.Sprite(topTexture);
    walls.top.width = screenWidth;
    walls.top.height = wallThickness;
    walls.top.x = 0;
    walls.top.y = 0;
    walls.top.zIndex = 5;
    
    // Apply perspective transform to top wall
    const topMatrix = new PIXI.Matrix();
    topMatrix.a = 1;           // Scale X
    topMatrix.b = 0;           // Skew Y
    topMatrix.c = 0;           // Skew X
    topMatrix.d = 0.7;         // Scale Y (compressed for perspective)
    topMatrix.tx = 0;          // Translate X
    topMatrix.ty = 0;          // Translate Y
    walls.top.transform.setFromMatrix(topMatrix);
    
    // Right wall (with perspective)
    const rightTexture = PIXI.Texture.from(WALL_CONFIG.RIGHT.image);
    walls.right = new PIXI.Sprite(rightTexture);
    walls.right.width = wallThickness;
    walls.right.height = screenHeight;
    walls.right.x = screenWidth - wallThickness;
    walls.right.y = 0;
    walls.right.zIndex = 5;
    
    // Apply perspective transform to right wall
    const rightMatrix = new PIXI.Matrix();
    rightMatrix.a = 0.7;       // Scale X (compressed for perspective)
    rightMatrix.b = 0;         // Skew Y
    rightMatrix.c = 0.1;       // Skew X (for perspective)
    rightMatrix.d = 1;         // Scale Y
    rightMatrix.tx = screenWidth - wallThickness * 0.7;  // Adjust X position
    rightMatrix.ty = 0;        // Translate Y
    walls.right.transform.setFromMatrix(rightMatrix);
    
    // Bottom wall (with perspective)
    const bottomTexture = PIXI.Texture.from(WALL_CONFIG.BOTTOM.image);
    walls.bottom = new PIXI.Sprite(bottomTexture);
    walls.bottom.width = screenWidth;
    walls.bottom.height = wallThickness;
    walls.bottom.x = 0;
    walls.bottom.y = screenHeight - wallThickness;
    walls.bottom.zIndex = 5;
    
    // Apply perspective transform to bottom wall
    const bottomMatrix = new PIXI.Matrix();
    bottomMatrix.a = 1;        // Scale X
    bottomMatrix.b = 0;        // Skew Y
    bottomMatrix.c = 0;        // Skew X
    bottomMatrix.d = 0.7;      // Scale Y (compressed for perspective)
    bottomMatrix.tx = 0;       // Translate X
    bottomMatrix.ty = screenHeight - wallThickness * 0.7;  // Adjust Y position
    walls.bottom.transform.setFromMatrix(bottomMatrix);
    
    // Left wall (with perspective)
    const leftTexture = PIXI.Texture.from(WALL_CONFIG.LEFT.image);
    walls.left = new PIXI.Sprite(leftTexture);
    walls.left.width = wallThickness;
    walls.left.height = screenHeight;
    walls.left.x = 0;
    walls.left.y = 0;
    walls.left.zIndex = 5;
    
    // Apply perspective transform to left wall
    const leftMatrix = new PIXI.Matrix();
    leftMatrix.a = 0.7;        // Scale X (compressed for perspective)
    leftMatrix.b = 0;          // Skew Y
    leftMatrix.c = -0.1;       // Skew X (for perspective)
    leftMatrix.d = 1;          // Scale Y
    leftMatrix.tx = 0;         // Translate X
    leftMatrix.ty = 0;         // Translate Y
    walls.left.transform.setFromMatrix(leftMatrix);
    
    // Add all walls to container
    wallContainer.addChild(walls.top);
    wallContainer.addChild(walls.right);
    wallContainer.addChild(walls.bottom);
    wallContainer.addChild(walls.left);
}

// Add this line after createReels() is called in your initialization code
// initializeWalls(); // Use this for standard walls
// create3DWalls(); // Or use this for 3D perspective walls
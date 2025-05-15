document.addEventListener("DOMContentLoaded", function () {
    const gameContainer = document.querySelector('.game-canvas-container');
    const app = new PIXI.Application({
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
        transparent: true
    });
    gameContainer.appendChild(app.view);

    const backgroundTexture = PIXI.Texture.from('nbcg2.png');
    const backgroundSprite = new PIXI.Sprite(backgroundTexture);

    function resizeBackground() {
        backgroundSprite.width = app.screen.width;
        backgroundSprite.height = app.screen.height;
    }

    resizeBackground();
    app.stage.addChild(backgroundSprite);

    window.addEventListener('resize', () => {
        app.renderer.resize(gameContainer.clientWidth, gameContainer.clientHeight);
        resizeBackground();
    });

    createReels();
});

function createReels() {
    const numReels = 5;
    const numRows = 3;

    const { reelWidth, reelHeight } = calculateReelDimensions();

    for (let i = 0; i < numReels; i++) {
        const reel = new PIXI.Container();
        reel.x = (app.screen.width / numReels) * i + (app.screen.width / numReels - reelWidth) / 2;
        reel.y = (app.screen.height - reelHeight) / 2;

        const symbolContainer = new PIXI.Container();
        reel.addChild(symbolContainer);

        reels.push(reel);
        reelSymbols.push(symbolContainer);

        populateReel(i);

        app.stage.addChild(reel);
    }
}

function calculateReelDimensions() {
    const availableWidth = app.screen.width;
    const availableHeight = app.screen.height;
    const reelWidth = availableWidth / 5 * 0.99;
    const reelHeight = availableHeight * 0.99;
    return { reelWidth, reelHeight };
}

function populateReel(reelIndex) {
    const { reelWidth, reelHeight } = calculateReelDimensions();
    const symbolContainer = reelSymbols[reelIndex];

    symbolContainer.removeChildren();

    for (let j = 0; j < numRows; j++) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const texture = PIXI.Texture.from(symbol.image);
        const sprite = new PIXI.Sprite(texture);

        sprite.y = j * (reelHeight / numRows);
        sprite.x = reelWidth * 0.03;
        sprite.width = reelWidth * 0.99;
        sprite.height = (reelHeight / numRows) * 1;
        sprite.symbolName = symbol.name;

        symbolContainer.addChild(sprite);
    }
}
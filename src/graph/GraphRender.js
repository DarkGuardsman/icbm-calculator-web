import React, {useEffect, useMemo, useRef} from 'react';

const tileSet = {
    0: {
        id: 'minecraft:air',
        color: 'rgb(146,245,243)'
    },
    1: {
        id: 'minecraft:dirt',
        color: 'rgb(220,159,47)'
    },
    2: {
        id: 'minecraft:stone',
        color: 'rgb(168,172,172)'
    }
}

const chunkBounds = 16;

export default function GraphPaper({gridCount = chunkBounds * 5, gridRenderSize = 10}) {
    const canvasRef = useRef(null);

    const tiles = useMemo(() => {
        const tiles = [];

        // Fill with air
        for (let y = 0; y < gridCount; y++) {
            tiles.push([]);
            for (let x = 0; x < gridCount; x++) {
                tiles[y][x] = 0;
            }
        }

        // Center point
        const center = Math.floor(gridCount / 2);

        //random island
        const islandSize = 35;
        const islandCenter = Math.floor(islandSize/2)
        for (let y = 0; y < islandSize; y++) {
            for (let x = 0; x < islandSize; x++) {
                tiles[y + center - islandCenter][x + center - islandCenter] = Math.random() > 0.3 ? 1 : 2;
            }
        }

        return tiles;
    }, [gridCount]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        drawTiles(ctx, width, height, gridRenderSize, tiles);
        drawGrid(ctx, width, height, gridRenderSize);

    }, [gridRenderSize]);

    return <canvas ref={canvasRef} width={gridCount * gridRenderSize} height={gridCount * gridRenderSize}/>;
}

function drawTiles(ctx, width, height, gridRenderSize, tiles) {

    for (let y = 0; y < tiles.length; y++) {
        const row = tiles[y];
        for (let x = 0; x < row.length; x++) {
            const tile = tileSet[row[x]];
            ctx.fillStyle = tile.color;
            ctx.fillRect(
                x * gridRenderSize,
                y * gridRenderSize,
                 gridRenderSize,
                gridRenderSize
            );
        }
    }
}

function drawGrid(ctx, width, height, gridRenderSize) {

    let count = 0;
    for (let x = 0; x <= width; x += gridRenderSize) {
        ctx.strokeStyle = (count++ % chunkBounds !== 0) ? 'lightgrey' : 'black';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    count = 0;
    for (let y = 0; y <= height; y += gridRenderSize) {
        ctx.strokeStyle = y % (count++ % chunkBounds !== 0) === 0 ? 'lightgrey' : 'black';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
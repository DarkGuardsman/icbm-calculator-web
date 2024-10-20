import React, {useEffect, useMemo, useRef} from 'react';
import {fillTiles} from "../funcs/TileFuncs";

const AIR = 0;
const DIRT = 1;
const STONE = 2;
const GRASS = 3;

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
    },
    3: {
        id: 'minecraft:grass',
        color: 'rgb(56,193,56)'
    }
}

const chunkBounds = 16;

export default function GraphPaper({gridCount = chunkBounds * 5, gridRenderSize = 10}) {
    const canvasRef = useRef(null);

    const tiles = useMemo(() => {
        const tiles = [];

        // Fill with air
        fillTiles(tiles, 0, 0, gridCount, gridCount, () => AIR);

        // Center point
        const center = Math.floor(gridCount / 2);

        //random island
        const islandSize = 32;
        const islandCenter = Math.floor(islandSize/2);
        fillTiles(tiles, center - islandCenter, center - islandCenter, islandSize, islandSize, () => Math.random() > 0.8 ? DIRT : GRASS);

        const islandSize2 = 16;
        const islandCenter2 = Math.floor(islandSize2/2);
        fillTiles(tiles, center - islandCenter2, center - islandCenter2, islandSize2, islandSize2, () => STONE);


        return tiles;
    }, [gridCount]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        drawTiles(ctx, width, height, gridRenderSize, tiles);
        drawGrid(ctx, width, height, gridRenderSize);

    }, [gridRenderSize, tiles]);

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
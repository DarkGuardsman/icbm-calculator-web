import React, {useEffect, useRef} from 'react';
import {CHUNK_SIZE, TILE_SET} from "../Consts";

/**
 *
 * @param tiles {number[][]}
 * @param gridSizeX {number}
 * @param gridSizeY {number}
 * @param gridRenderSize {number}
 * @returns {Element}
 * @constructor
 */
export default function GraphPaper({tiles, gridSizeX, gridSizeY, gridRenderSize = 10}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        // TODO eventually draw deltas when we do change sets for faster render times

        drawTiles(ctx, width, height, gridRenderSize, tiles);
        drawGrid(ctx, width, height, gridRenderSize);

    }, [gridSizeX, gridSizeY, gridRenderSize, tiles]);

    return <canvas ref={canvasRef} width={gridSizeX * gridRenderSize} height={gridSizeY * gridRenderSize}/>;
}

function drawTiles(ctx, width, height, gridRenderSize, tiles) {

    for (let y = 0; y < tiles.length; y++) {
        const row = tiles[y];
        for (let x = 0; x < row.length; x++) {
            const tile = TILE_SET[row[x]];
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
        ctx.strokeStyle = (count++ % CHUNK_SIZE !== 0) ? 'lightgrey' : 'black'; //TODO make line space configurable in UI
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    count = 0;
    for (let y = 0; y <= height; y += gridRenderSize) {
        ctx.strokeStyle = y % (count++ % CHUNK_SIZE !== 0) === 0 ? 'lightgrey' : 'black';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
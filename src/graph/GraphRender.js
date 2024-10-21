import React, {useEffect, useRef} from 'react';
import {TILE_ID_TO_OBJ} from "../common/Tiles";
import {CHUNK_SIZE} from "../common/Consts";

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
        if(row !== null && row !== undefined) {
            for (let x = 0; x < row.length; x++) {
                drawTile(ctx, x, y, gridRenderSize, row[x]);
            }
        }
    }
}

function drawTile(ctx, x, y, gridRenderSize, tileId) {
    if(tileId === null || tileId === undefined) {
        return;
    }

    const tile = TILE_ID_TO_OBJ[tileId];
    if(tile === null || tile === undefined) {
        return;
    }

    ctx.fillStyle = tile.color;
    ctx.fillRect(
        x * gridRenderSize,
        y * gridRenderSize,
        gridRenderSize,
        gridRenderSize
    );
}

function drawGrid(ctx, width, height, gridRenderSize) {

    let count = 0;
    for (let x = 0; x <= width; x += gridRenderSize) {
        ctx.strokeStyle = (count++ % CHUNK_SIZE !== 0) ? 'rgb(27,27,27)' : 'grey'; //TODO make line space configurable in UI
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    count = 0;
    for (let y = 0; y <= height; y += gridRenderSize) {
        ctx.strokeStyle = y % (count++ % CHUNK_SIZE !== 0) === 0 ? 'rgb(27,27,27)' : 'grey';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
import React, {useEffect, useRef} from 'react';
import {TileData} from "../common/Tiles";
import {CHUNK_SIZE} from "../common/Consts";
import {useSelector} from "react-redux";
import {selectPaths, selectTiles} from "../data/map/tileMap";
import {TileMap2D} from "../api/Map2D";
import PathData2D from "../api/PathData2D";
import {getTile} from "../funcs/TileFuncs";

export interface GraphPaperProps {
    tiles: TileMap2D;
    heatMapHits: number[][];
    gridSizeX: number;
    gridSizeY: number;
    gridRenderSize: number;

    showTiles: boolean;
    showDebugLines: boolean;
    showHeatMap: boolean;
}

export default function GraphPaper({ heatMapHits,
                                       gridSizeX, gridSizeY, gridRenderSize = 10,
                                       showTiles, showDebugLines, showHeatMap
                                   }: GraphPaperProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const tiles = useSelector(selectTiles);
    const paths = useSelector(selectPaths);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas == null) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (ctx == null) {
            return;
        }

        const width = canvas.width;
        const height = canvas.height;

        // TODO eventually draw deltas when we do change sets for faster render times
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (showTiles) {
            drawTiles(ctx, width, height, gridRenderSize, tiles);
        }
        if (showHeatMap) {
            drawHeatMap(ctx, width, height, gridRenderSize, heatMapHits);
        }

        drawGrid(ctx, width, height, gridRenderSize);

        if (showDebugLines) {
            drawLines(ctx, width, height, gridRenderSize, paths);
        }

    }, [canvasRef, gridSizeX, gridSizeY, gridRenderSize, tiles, paths, heatMapHits, showTiles, showHeatMap, showDebugLines]);

    return <canvas ref={canvasRef} width={gridSizeX * gridRenderSize} height={gridSizeY * gridRenderSize}/>;
}

function drawTiles(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, tiles: TileMap2D) {

    for (let y = tiles.start.y; y <= tiles.end.y; y++) {
        for (let x = tiles.start.x; x <= tiles.end.x; x++) {
            drawTile(ctx, x, y, gridRenderSize, getTile(x, y, tiles));
        }
    }
}

function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, gridRenderSize: number, tile: TileData) {
    ctx.fillStyle = tile.color;
    ctx.fillRect(
        x * gridRenderSize,
        y * gridRenderSize,
        gridRenderSize,
        gridRenderSize
    );
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number) {

    ctx.lineWidth = 1;

    let count: number = 0;
    for (let x = 0; x <= width; x += gridRenderSize) {
        ctx.strokeStyle = (count++ % CHUNK_SIZE) !== 0 ? 'rgb(27,27,27)' : 'grey'; //TODO make line space configurable in UI
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    count = 0;
    for (let y = 0; y <= height; y += gridRenderSize) {
        ctx.strokeStyle = (count++ % CHUNK_SIZE) !== 0 ? 'rgb(27,27,27)' : 'grey';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawLines(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, lines: PathData2D[]) {

    const lineSize = 0.05; //TODO set via UI
    const dotSize = 0.1;

    // TODO add logic to recolor and resize lines based on energy
    //      Idea would be the line gets smaller the less energy exists
    //      Then the color would change to note cost of energy... for visual friendliness we might want 2 lines (outside for total energy, inside for energy cost?)
    //      Other option we could change the end cap size to note cost? Might have to toy with it but should be configurable in UI

    lines.forEach((line) => {

        // Line
        ctx.strokeStyle = 'black'; //TODO generate random color per source phase and store in state
        ctx.lineWidth = lineSize * gridRenderSize;
        ctx.beginPath();
        ctx.moveTo(line.start.x * gridRenderSize, line.start.y * gridRenderSize);
        ctx.lineTo(line.end.x * gridRenderSize, line.end.y * gridRenderSize);
        ctx.stroke();

        // End Cap TODO make arrow showing vector
        ctx.beginPath();
        ctx.arc(line.end.x * gridRenderSize, line.end.y * gridRenderSize, dotSize * gridRenderSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'black'; //TODO generate random color per source phase and store in state
        ctx.fill();
    });
}


function drawHeatMap(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, heatMapHits: number[][]) {

    for (let y = 0; y < heatMapHits.length; y++) {
        const row = heatMapHits[y];
        if (row !== null && row !== undefined) {
            for (let x = 0; x < row.length; x++) {
                drawHeatTile(ctx, x, y, gridRenderSize, row[x]);
            }
        }
    }
}

function drawHeatTile(ctx: CanvasRenderingContext2D, x: number, y: number, gridRenderSize: number, hits: number) {
    if (hits === null || hits === undefined) {
        return;
    }

    const val = Math.min(20, Math.max(0, hits)) * 5;
    const r = Math.floor((255 * val) / 100),
        g = Math.floor((255 * (100 - val)) / 100) - 150,
        b = 0;

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(
        x * gridRenderSize,
        y * gridRenderSize,
        gridRenderSize,
        gridRenderSize
    );
}
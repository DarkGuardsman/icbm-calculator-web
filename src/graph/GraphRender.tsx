import React, {useEffect, useRef} from 'react';
import {TILE_ID_TO_OBJ, TileData} from "../common/Tiles";
import {CHUNK_SIZE} from "../common/Consts";
import {useSelector} from "react-redux";
import {getTile, selectTiles} from "../data/map/tileMap";
import {TileMap2D} from "../api/Map2D";
import {isDefined} from "../funcs/Helpers";

export interface DebugLineData {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
    size: number;
}

export interface DebugDotData {
    x: number;
    y: number;
    size: number;
    color: string;
}

export interface GraphPaperProps {
    tiles: TileMap2D;
    heatMapHits: number[][];
    lines: DebugLineData[];
    dots: DebugDotData[];
    gridSizeX: number;
    gridSizeY: number;
    gridRenderSize: number;

    showTiles: boolean;
    showDebugLines: boolean;
    showHeatMap: boolean;
}

export default function GraphPaper({
                                       lines, dots, heatMapHits,
                                       gridSizeX, gridSizeY, gridRenderSize = 10,
                                       showTiles, showDebugLines, showHeatMap
                                   }: GraphPaperProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const tiles = useSelector(selectTiles);

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
        drawGrid(ctx, width, height, gridRenderSize);
        if (showHeatMap) {
            drawHeatMap(ctx, width, height, gridRenderSize, heatMapHits);
        }
        if (showDebugLines) {
            drawLines(ctx, width, height, gridRenderSize, lines);
            drawDots(ctx, width, height, gridRenderSize, dots);
        }

    }, [canvasRef, gridSizeX, gridSizeY, gridRenderSize, tiles, lines, dots, heatMapHits, showTiles, showHeatMap, showDebugLines]);

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

function drawLines(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, lines: DebugLineData[]) {
    lines.forEach((line) => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.size * gridRenderSize;
        ctx.beginPath();
        ctx.moveTo(line.startX * gridRenderSize, line.startY * gridRenderSize);
        ctx.lineTo(line.endX * gridRenderSize, line.endY * gridRenderSize);
        ctx.stroke();
    });
}

function drawDots(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, dots: DebugDotData[]) {
    dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x * gridRenderSize, dot.y * gridRenderSize, dot.size * gridRenderSize, 0, 2 * Math.PI);
        ctx.fillStyle = dot.color;
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
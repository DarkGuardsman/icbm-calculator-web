import React, {useEffect, useRef} from 'react';
import {TileData} from "../common/Tiles";
import {CHUNK_SIZE} from "../common/Consts";
import {useSelector} from "react-redux";
import {selectPathHeat, selectPaths, selectTiles} from "../data/map/tileMap";
import Map2D, {TileMap2D} from "../api/Map2D";
import PathData2D from "../api/PathData2D";
import {getTile, getTileData} from "../funcs/TileFuncs";
import {isDefined, sortNum} from "../funcs/Helpers";

export interface GraphPaperProps {

    gridSizeX: number;
    gridSizeY: number;

    gridRenderSize: number;

    showTiles: boolean;
    showDebugLines: boolean;
    showHeatMap: boolean;
}

export default function GraphPaper({
                                       gridSizeX, gridSizeY, gridRenderSize = 10,
                                       showTiles, showDebugLines, showHeatMap
                                   }: GraphPaperProps): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const tiles = useSelector(selectTiles); //TODO decouple so we can reuse the grid render
    const paths = useSelector(selectPaths);
    const pathHeat = useSelector(selectPathHeat);

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
            drawTiles(ctx, width, height, gridRenderSize, tiles); //TODO make these render layers that can be added and removed by parent by passing in as functions
        }
        if (showHeatMap) {
            drawHeatMap(ctx, width, height, gridRenderSize, pathHeat);
        }

        drawGrid(ctx, width, height, gridRenderSize);

        if (showDebugLines) {
            drawLines(ctx, width, height, gridRenderSize, paths);
        }

    }, [canvasRef, gridSizeX, gridSizeY, gridRenderSize, tiles, paths, pathHeat, showTiles, showHeatMap, showDebugLines]);

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

    const lineSize = 0.04; //TODO set via UI
    const dotSize = 0.05;

    // TODO add logic to recolor and resize lines based on energy
    //      Idea would be the line gets smaller the less energy exists
    //      Then the color would change to note cost of energy... for visual friendliness we might want 2 lines (outside for total energy, inside for energy cost?)
    //      Other option we could change the end cap size to note cost? Might have to toy with it but should be configurable in UI

    const sortedLines = [...lines].sort((a, b) => sortNum(a?.index, b?.index)).reverse();
    const energyEntries = lines.map(line => line.meta.energyLeft).filter(n => isDefined(n)).sort(sortNum);
    const largestEnergy = energyEntries.length > 0 ? energyEntries[energyEntries.length - 1] : undefined;
    sortedLines.forEach((line) => {

        let renderScale = gridRenderSize;
        if(isDefined(line.meta.energyLeft) && isDefined(largestEnergy)) {
            renderScale -= gridRenderSize * (1 - line.meta.energyLeft / largestEnergy) * 0.8
        }

        const arrowSize = renderScale * dotSize * 3;
        const arrowLineEndOffset =  arrowSize / 3;
        const lineWidth = lineSize * renderScale;

        const sx = line.start.x * gridRenderSize;
        const sy = line.start.y * gridRenderSize;
        const ex = line.end.x * gridRenderSize;
        const ey = line.end.y * gridRenderSize

        const angle = Math.atan2(ey - sy, ex - sx);

        // Start Cap
        ctx.beginPath();
        ctx.arc(sx, sy, lineWidth / 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex - arrowLineEndOffset * Math.cos(angle), ey - arrowLineEndOffset * Math.sin(angle));
        ctx.strokeStyle = 'black'; //TODO generate random color per source phase and store in state
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Arrow
        ctx.fillStyle = 'grey';
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - arrowSize * Math.cos(angle - Math.PI / 6), ey - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ex - arrowSize * Math.cos(angle + Math.PI / 6), ey - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // End Cap TODO add toggle (user and code[vector<arrow>,directionless<dot>]) to flip between different end caps
        //ctx.beginPath();
        //ctx.arc(line.end.x * gridRenderSize, line.end.y * gridRenderSize, dotSize * gridRenderSize, 0, 2 * Math.PI);
        //ctx.fillStyle = 'grey'; //TODO generate random color per source phase and store in state
        //ctx.fill();
    });
}


function drawHeatMap(ctx: CanvasRenderingContext2D, width: number, height: number, gridRenderSize: number, heatMap: Map2D<number>) {

    for (let y = heatMap.start.y; y <= heatMap.end.y; y++) {
        for (let x = heatMap.start.x; x <= heatMap.end.x; x++) {
            const data = getTileData(x, y, heatMap);
            if(isDefined(data)) {
                drawHeatTile(ctx, x, y, gridRenderSize, data);
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
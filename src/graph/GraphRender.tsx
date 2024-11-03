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
    showGridLines: boolean;
}

export default function GraphPaper({
                                       gridSizeX, gridSizeY, gridRenderSize = 10,
                                       showTiles, showDebugLines, showHeatMap, showGridLines
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

        if(showGridLines) {
            drawGrid(ctx, width, height, gridRenderSize);
        }

        if (showDebugLines) {
            drawLines(ctx, width, height, gridRenderSize, paths);
        }

    }, [canvasRef, gridSizeX, gridSizeY, gridRenderSize, tiles, paths, pathHeat, showTiles, showHeatMap, showDebugLines, showGridLines]);

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
        if (isDefined(line.meta.energyLeft) && isDefined(largestEnergy)) {
            const energyScale = 1 - Math.max(0, line.meta.energyLeft) / largestEnergy;
            renderScale -= gridRenderSize * energyScale * 0.8;
        }

        const arrowSize = renderScale * dotSize * 3;
        const arrowLineEndOffset = arrowSize / 3;
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

    const heatValues = Object.values(heatMap.data).flatMap(ySet => Object.values(ySet));
    const range = getNumberRangeExcludingOutliers(getUniqueNumbers(heatValues));
    for (let y = heatMap.start.y; y <= heatMap.end.y; y++) {
        for (let x = heatMap.start.x; x <= heatMap.end.x; x++) {
            const data = getTileData(x, y, heatMap);
            if (isDefined(data) && data > 0) {
                drawHeatTile(ctx, x, y, gridRenderSize, data, range.max);
            }
        }
    }
}

function drawHeatTile(ctx: CanvasRenderingContext2D, x: number, y: number, gridRenderSize: number, hits: number, maxValue: number) {

    ctx.fillStyle = getHeatColor(hits, 1, maxValue);
    ctx.fillRect(
        x * gridRenderSize,
        y * gridRenderSize,
        gridRenderSize,
        gridRenderSize
    );
}

function getHeatColor(value: number, min: number, max: number) {
    const normalizedValue = (value - min) / (max - min);
    const ratio = 1 - Math.min(1, normalizedValue);
    const overRatio = Math.min(1, normalizedValue - Math.min(1, normalizedValue));

    const hue = ratio * 1.2 / 3.60;
    const color = hslToRgb(hue, 1, .5 - (0.3 * overRatio));
    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

function hslToRgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        red: Math.floor(r * 255),
        green: Math.floor(g * 255),
        blue: Math.floor(b * 255)
    }
}

function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

function getUniqueNumbers(data: number[]) {
    const heatSet: Set<number> = new Set();
    data.forEach(v => heatSet.add(v));
    return Array.from(heatSet);
}

function getNumberRangeExcludingOutliers(data: number[]): {min: number, max: number} {
    if (data.length < 4) {
        return {
            min: Math.min(...data),
            max: Math.max(...data)
        };
    }

    // Sort the data in ascending order
    data.sort((a, b) => a - b);

    // Calculate the quartiles
    const q1 = data[Math.floor(data.length / 4)];
    const q3 = data[Math.floor(3 * data.length / 4)];
    const iqr = q3 - q1;

    // Calculate the lower and upper bounds
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Filter out outliers
    const filteredData = data.filter(value => value >= lowerBound && value <= upperBound);

    // Return the range of the filtered data
    return {
        min: Math.min(...filteredData),
        max: Math.max(...filteredData)
    };
}
import ToolPage from "../ToolPage";
import GraphRender, {DebugDotData, DebugLineData} from "../../graph/GraphRender";
import {createContext, useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";
import {TILE_AIR} from "../../common/Tiles";
import {fillTiles} from "../../funcs/TileFuncs";
import BoxModifier, {IBoxGenerator, ITileGenData} from "../modifiers/box/BoxModifier";
import {CHUNK_SIZE} from "../../common/Consts";
import SimulationSelector from "../selector/simulation/SimulationSelector";
import {useDispatch, useSelector} from "react-redux";
import {applyMapEdits, clearTiles, selectTiles} from "../../data/map/tileMap";
import IMapModifier from "../modifiers/types";
import {initEdits, MapEdits2D} from "../../api/Map2D";
import {isDefined} from "../../funcs/Helpers";

let simEditIndex = 0;
export function incrementSimEdit() :number {
    return simEditIndex++;
}

export default function MapToolPage() {

    const tiles = useSelector(selectTiles);
    const dispatch = useDispatch();

    const [sizeX, setSizeX] = useState(CHUNK_SIZE * 2);
    const [sizeY, setSizeY] = useState(CHUNK_SIZE * 2);
    const [renderSize, setRenderSize] = useState(20);

    const [lines, setLines] = useState<DebugLineData[]>([]);
    const [dots, setDots] = useState<DebugDotData[]>([]);

    //const [edits, setEdits] = useState([]); TODO store edits using a reducer
    const [heatMapHits, setHeatMapHits] = useState<number[][]>([]);

    const [hasRun, setHasRun] = useState(false);
    const [showTiles, setShowTiles] = useState(true);
    const [showHeatMap, setShowHeatMap] = useState(true);
    const [showDebugLines, setShowDebugLines] = useState(true);

    const [modifiers, setModifiers] = useState<IMapModifier[]>([]);


    const addDot = (dot: DebugDotData) => {
        setDots(prev => [...prev, dot]);
    };

    const addLine = (line: DebugLineData) => {
        setLines(prev => [...prev, line]);
    };

    const addHeatMapHit = (x: number, y: number, hits: number) => {
        setHeatMapHits(prev => {
            const newHeatMap = prev === undefined ? [] : [...prev];
            newHeatMap[y] = newHeatMap[y] === undefined ? [] : [...newHeatMap[y]];
            newHeatMap[y][x] = newHeatMap[y][x] === undefined ? hits: newHeatMap[y][x] + hits;
            return newHeatMap;
        });
    }

    const generateMap = () => {
        simEditIndex = 0;

        setHasRun(false);
        dispatch(clearTiles());
        setHeatMapHits([]);
        setDots([]);
        setLines([]);

        const edits: MapEdits2D = initEdits();

        // Fill map with air
        let editIndex = 0;
        fillTiles(edits, 0, 0, sizeX, sizeY, (x, y) => ({
            x, y,
            index: incrementSimEdit(),
            id: TILE_AIR.index,
            meta: {
                source: {
                    key: "init",
                    phase: "fill",
                    index: editIndex++
                }
            }
        }));

        // Apply modifiers
        modifiers.forEach((modifier, mIndex) => {
            if (modifier.tool === "generate-box") {
                const {args} = modifier as IBoxGenerator;
                const possibleTiles = args.tiles;

                editIndex = 0;
                fillTiles(edits, args.x, args.y, args.width, args.height, (x, y) => ({
                   x, y,
                    index: incrementSimEdit(),
                    id: getRandomTile(possibleTiles),
                    meta: {
                       source: {
                           key : `box-${mIndex}`,
                           phase: "fill",
                           index: editIndex++
                       }
                    }
                }))
            }
        });

        dispatch(applyMapEdits(edits));
    };

    const applyModifiers = (modifier: IMapModifier, index: number) => {
        setModifiers(modifiers.map((oldModifier, i) => {
            if (i === index) {
                return modifier;
            }
            return oldModifier;
        }));
    };

    const addModifier = () => {
        const newArray = [...modifiers];
        newArray.push({
            tool: "generate-box",
            args: {
                x: 0,
                y: 0,
                width: 5,
                height: 5,
                tiles: [
                    {
                        id: TILE_AIR.index
                    }
                ]
            }
        } as IBoxGenerator);
        setModifiers(newArray);
    };

    return (
        <ToolPage title={"Map Visualizer 2D"}>
            <div className={styles.content}>
                <div className={styles.contentTop}>
                    <div className={styles.center}>
                        <div className={styles.mapControls}>
                            <div className={styles.mapControlSection}>Render</div>
                            <div className={styles.mapControlEntry}>
                                <div className={styles.mapControlLabel}>Scale:</div>
                                <NumericIncrementer
                                    value={renderSize}
                                    setValue={setRenderSize}
                                    increments={[5, 10]}
                                />
                            </div>
                            <div className={styles.mapControlEntry}>
                                <div className={styles.mapControlLabel}>Tiles:</div>
                                <input type={"checkbox"} checked={showTiles}
                                       onChange={() => setShowTiles(!showTiles)}/>
                            </div>
                            <div className={styles.mapControlEntry}>
                                <div className={styles.mapControlLabel}>Heat:</div>
                                <input type={"checkbox"} checked={showHeatMap}
                                       onChange={() => setShowHeatMap(!showHeatMap)}/>
                            </div>
                            <div className={styles.mapControlEntry}>
                                <div className={styles.mapControlLabel}>Lines:</div>
                                <input type={"checkbox"} checked={showDebugLines}
                                       onChange={() => setShowDebugLines(!showDebugLines)}/>
                            </div>
                        </div>
                        <div className={styles.map}>
                            <GraphRender
                                showTiles={showTiles}
                                showDebugLines={showDebugLines}
                                showHeatMap={showHeatMap}
                                tiles={tiles}
                                dots={dots}
                                lines={lines}
                                gridSizeX={sizeX}
                                gridSizeY={sizeY}
                                gridRenderSize={renderSize}
                                heatMapHits={showHeatMap ? heatMapHits: []}
                            />
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={`${styles.toolSection} ${styles.actions}`}>
                            <button onClick={generateMap}>
                                {hasRun ? "RESET" : "GENERATE"}
                            </button>
                        </div>
                        <div className={styles.toolList}>
                            <div className={styles.toolSection}>
                                <div className={styles.toolTitle}>Map Properties</div>
                                <div>
                                    <div>Size X | chunk(s): {sizeX / CHUNK_SIZE}</div>
                                    <NumericIncrementer
                                        value={sizeX}
                                        setValue={setSizeX}
                                        increments={[1, CHUNK_SIZE]}
                                    />
                                </div>
                                <div>
                                    <div>Size Y | chunk(s): {sizeY / CHUNK_SIZE}</div>
                                    <NumericIncrementer
                                        value={sizeY}
                                        setValue={setSizeY}
                                        increments={[1, CHUNK_SIZE]}
                                    />
                                </div>
                            </div>
                            {
                                modifiers.map((modifier, index) => buildModifier(modifier, index, applyModifiers))
                            }
                            <div className={styles.addModifier}>
                                <button onClick={addModifier}>Add Modifier</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.contentBottom}>
                    <SimulationSelector
                        hasRun={hasRun}
                        onRun={() => setHasRun(true)}
                        addDot={addDot}
                        addLine={addLine}
                        addHeatMapHit={addHeatMapHit}
                        gridSizeX={sizeX}
                        gridSizeY={sizeY}
                    />
                </div>
            </div>
        </ToolPage>
    )
}

function buildModifier(modifier: IMapModifier, index: number, applyChanges: (modifier: IMapModifier, index: number) => void) {
    if (modifier.tool === "generate-box") {
        return <BoxModifier
            key={"modifier-" + index}
            modifier={modifier as IBoxGenerator}
            applyChanges={applyChanges}
            index={index}
        />
    }
    return (
        <div key={"modifier-" + index} className={styles.addModifier}>
            UNKNOWN TOOL '{modifier.tool}'
        </div>
    )
}

function getRandomTile(possibleTiles: ITileGenData[]) {
    if (possibleTiles.length > 1) {
        for (let i = 0; i < possibleTiles.length - 1; i++) {
            const entry = possibleTiles[i];
            if (isDefined(entry.rate) && Math.random() > entry.rate) {
                return possibleTiles[i].id;
            }
        }
    }
    return possibleTiles[possibleTiles.length - 1].id
}
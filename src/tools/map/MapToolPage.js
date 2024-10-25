import ToolPage from "../ToolPage";
import GraphRender from "../../graph/GraphRender";
import {createContext, useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";
import {TILE_AIR} from "../../common/Tiles";
import {fillTiles} from "../../funcs/TileFuncs";
import BoxModifier from "../modifiers/box/BoxModifier";
import {CHUNK_SIZE} from "../../common/Consts";
import SimulationSelector from "../selector/simulation/SimulationSelector";
import {useDispatch, useSelector} from "react-redux";
import {clearTiles, selectTiles} from "../../data/map/tileMap";

export const TileMapContext = createContext({

})


export default function MapToolPage() {

    const tiles = useSelector(selectTiles);
    const dispatch = useDispatch();

    const [sizeX, setSizeX] = useState(CHUNK_SIZE * 2);
    const [sizeY, setSizeY] = useState(CHUNK_SIZE * 2);
    const [renderSize, setRenderSize] = useState(20);

    const [lines, setLines] = useState([]);
    const [dots, setDots] = useState([]);

    //const [edits, setEdits] = useState([]); TODO store edits using a reducer
    const [heatMapHits, setHeatMapHits] = useState([]);

    const [hasRun, setHasRun] = useState(false);
    const [showTiles, setShowTiles] = useState(true);
    const [showHeatMap, setShowHeatMap] = useState(true);
    const [showDebugLines, setShowDebugLines] = useState(true);

    const [modifiers, setModifiers] = useState([]);


    const addDot = (dot) => {
        setDots(prev => [...prev, dot]);
    };

    const addLine = (line) => {
        setLines(prev => [...prev, line]);
    };

    const addHeatMapHit = (x, y, hits) => {
        setHeatMapHits(prev => {
            const newHeatMap = prev === undefined ? [] : [...prev];
            newHeatMap[y] = newHeatMap[y] === undefined ? [] : [...newHeatMap[y]];
            newHeatMap[y][x] = newHeatMap[y][x] === undefined ? hits: newHeatMap[y][x] + hits;
            return newHeatMap;
        });
    }

    const generateMap = () => {
        const tiles = [];
        setHasRun(false);
        fillTiles(tiles, 0, 0, sizeX, sizeY, () => TILE_AIR.index);
        modifiers.forEach((modifier) => {
            if (modifier.tool === "generate-box") {
                fillTiles(tiles, modifier.args.x, modifier.args.y, modifier.args.width, modifier.args.height, () => {
                    const possibleTiles = modifier.args.tiles;
                    if (possibleTiles.length > 1) {
                        for (let i = 0; i < possibleTiles.length - 1; i++) {
                            if (Math.random() > possibleTiles[i].rate) {
                                return possibleTiles[i].id;
                            }
                        }
                    }
                    return possibleTiles[modifier.args.tiles.length - 1].id
                })
            }
        });
        dispatch(clearTiles());
        setHeatMapHits([]);
        setDots([]);
        setLines([]);
        //setEdits([]);
    };

    const applyModifiers = (modifier, index) => {
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
        });
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
                                tiles={showTiles ? tiles : []}
                                dots={showDebugLines ? dots : []}
                                lines={showDebugLines ? lines : []}
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

function buildModifier(modifier, index, applyChanges) {
    if (modifier.tool === "generate-box") {
        return <BoxModifier
            key={"modifier-" + index}
            modifier={modifier}
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
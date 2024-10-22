import ToolPage from "../ToolPage";
import GraphRender from "../../graph/GraphRender";
import {useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";
import {TILE_AIR, TILE_SET} from "../../common/Tiles";
import {fillTiles} from "../../funcs/TileFuncs";
import BoxModifier from "../modifiers/box/BoxModifier";
import {CHUNK_SIZE} from "../../common/Consts";
import SimulationSelector from "../selector/simulation/SimulationSelector";


export default function MapToolPage() {
    const [sizeX, setSizeX] = useState(CHUNK_SIZE * 2);
    const [sizeY, setSizeY] = useState(CHUNK_SIZE * 2);
    const [renderSize, setRenderSize] = useState(20);

    const [tiles, setTiles] = useState([]);
    const [lines, setLines] = useState([]);
    const [dots, setDots] = useState([]);

    const [edits, setEdits] = useState([]);
    const [hasRun, setHasRun] = useState(false);

    const [modifiers, setModifiers] = useState([
        {
            tool: "generate-box",
            args: {
                x: 10,
                y: 15,
                width: 40,
                height: 30,
                tiles: [
                    {
                        id: TILE_SET.find(t => t.key.endsWith("dirt")).index,
                        rate: 0.25
                    },
                    {
                        id: TILE_SET.find(t => t.key.endsWith("grass")).index,
                    }
                ]
            }
        }
    ]);

    // TODO convert tile matrix into an object with a custom hook for easier management
    //          have object contain a setter/getter for each tile
    //          have object record changes
    //          have object contain a method to bookmark change sections as a page with start/end  map.start("expand-1") map.end("expand-1")
    //          as part of edits include cause by  map.setTile(x, y, tile, source)... could even have this auto page bookmarks by making source {id, page, step}
    const setTile = (x, y, tileId) => {

        // Async is a pain
        setTiles(prev => {
            // Duplicate array to trigger state change
            const newTileArray = prev === undefined ? [] : [...prev];
            newTileArray[y] = newTileArray[y] === undefined ? [] : [...newTileArray[y]];

            // Record edits
            const currentTile = newTileArray[y][x];
            setEdits((prev) => [...prev, {
                x,y,
                oldTile: currentTile,
                newTile: tileId,
                time: new Date()
            }]);

            // Store edit
            newTileArray[y][x] = tileId;

            return newTileArray;
        });
    };

    const addDot = (dot) => {
        setDots(prev => [...prev, dot]);
    };

    const addLine = (line) => {
        setLines(prev => [...prev, line]);
    };

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
        setTiles(tiles);
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
                        <div className={styles.map}>
                            <GraphRender
                                tiles={tiles}
                                dots={dots}
                                lines={lines}
                                gridSizeX={sizeX}
                                gridSizeY={sizeY}
                                gridRenderSize={renderSize}
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
                        tiles={tiles}
                        setTile={setTile}
                        hasRun={hasRun}
                        onRun={() => setHasRun(true)}
                        addDot={addDot}
                        addLine={addLine}
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
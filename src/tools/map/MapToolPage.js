import ToolPage from "../ToolPage";
import GraphRender from "../../graph/GraphRender";
import {useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";
import {TILE_AIR, TILE_SET} from "../../common/Tiles";
import {fillTiles} from "../../funcs/TileFuncs";
import BoxModifier from "../modifiers/box/BoxModifier";
import {CHUNK_SIZE} from "../../common/Consts";

export default function MapToolPage() {
    const [sizeX, setSizeX] = useState(CHUNK_SIZE * 5);
    const [sizeY, setSizeY] = useState(CHUNK_SIZE * 5);
    const [tiles, setTiles] = useState([]);
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
                                gridSizeX={sizeX}
                                gridSizeY={sizeY}
                            />

                        </div>
                    </div>
                    <div className={styles.right}>
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
                        <div className={styles.modifiers}>
                            {
                                modifiers.map((modifier, index) => buildModifier(modifier, index, applyModifiers))
                            }
                            <div className={styles.addModifier}>
                                <button onClick={addModifier}>Add Modifier</button>
                            </div>
                        </div>
                        <div className={`${styles.toolSection} ${styles.actions}`}>
                            <button onClick={generateMap}>
                                {hasRun ? "RESET" : "GENERATE"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.contentBottom}>
                    TODO test selector
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
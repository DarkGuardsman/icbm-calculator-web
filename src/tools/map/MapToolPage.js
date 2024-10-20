import ToolPage from "../ToolPage";
import GraphRender from "../../graph/GraphRender";
import {useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";
import {CHUNK_SIZE} from "../../Consts";

export default function MapToolPage() {
    const [sizeX, setSizeX] = useState(CHUNK_SIZE * 4);
    const [sizeY, setSizeY] = useState(CHUNK_SIZE * 4);
    const [tiles, setTiles] = useState([]);
    const [hasRun, setHasRun] = useState(false);

    const generateMap = () => {
        setTiles([]);
        setHasRun(false);
    };

    return (
        <ToolPage title={"2D Map"}>
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
                            <div className={styles.toolSection}>
                                TODO modifiers
                            </div>
                            <div className={styles.addModifier}>
                                <button>Add Modifier</button>
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
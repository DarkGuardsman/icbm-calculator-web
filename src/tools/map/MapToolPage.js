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


    return (
        <ToolPage title={"2D Map"}>
            <div className={styles.content}>
                <div className={styles.map}>
                    <GraphRender
                        tiles={tiles}
                        gridSizeX={sizeX}
                        gridSizeY={sizeY}
                    />
                </div>
                <div className={styles.tools}>
                    <div>
                        <div>Map Properties</div>
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
                </div>
            </div>
        </ToolPage>
    )
}
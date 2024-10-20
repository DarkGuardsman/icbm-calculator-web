import ToolPage from "../ToolPage";
import GraphRender from "../../graph/GraphRender";
import {useState} from "react";
import styles from "./MapToolPage.module.css";
import NumericIncrementer from "../../components/incrementer/NumericIncrementer";

export default function MapToolPage() {
    const [sizeX, setSizeX] = useState(16 * 5);
    const [sizeY, setSizeY] = useState(16 * 5);
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
                            <div>Size X | chunk(s): {sizeX / 16}</div>
                            <NumericIncrementer
                                value={sizeX}
                                setValue={setSizeX}
                                increments={[1, 16]}
                            />
                        </div>
                        <div>
                            <div>Size Y | chunk(s): {sizeY / 16}</div>
                            <NumericIncrementer
                                value={sizeY}
                                setValue={setSizeY}
                                increments={[1, 16]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ToolPage>
    )
}
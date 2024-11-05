import styles from './Timeline.module.css';
import {useDispatch, useSelector} from "react-redux";
import {currentEditIndex, selectEditIndex} from "../../../data/map/tileMap";
import NumericIncrementer from "../../../components/incrementer/NumericIncrementer";

export function Timeline() {
    const dispatch = useDispatch();

    const currentIndex = useSelector(currentEditIndex);

    return (
        <div className={styles.panel}>
            <div className={styles.title}>Timeline</div>
            <div className={styles.entries}>
                <NumericIncrementer
                    value={currentIndex}
                    setValue={(v) => dispatch(selectEditIndex(v))}
                    increments={[1]}
                />
            </div>
        </div>
    )
}
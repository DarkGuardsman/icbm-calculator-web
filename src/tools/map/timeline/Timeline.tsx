import React from 'react';
import styles from './Timeline.module.css';
import {useDispatch, useSelector} from "react-redux";
import {currentEditIndex, editBookmarks, selectEditIndex} from "../../../data/map/tileMap";
import NumericIncrementer from "../../../components/incrementer/NumericIncrementer";

export function Timeline() {
    const dispatch = useDispatch();

    const currentIndex = useSelector(currentEditIndex);
    const bookmarks = useSelector(editBookmarks);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.title}>Timeline</div>
                <div className={styles.control}>
                    <div className={styles.label}>Edit Index: </div>
                    <NumericIncrementer
                        value={currentIndex}
                        setValue={(v) => dispatch(selectEditIndex(v))}
                        increments={[1]}
                    />
                </div>
            </div>
            <div className={styles.entries}>
                {
                    bookmarks.map((source, si) =>
                        <div className={styles.bookmarkSet}  key={'source-' + si}>
                            {
                                source.entries.map((entry, ei) =>
                                    <JumpToButton
                                        key={'entry-' + si + "-" + ei}
                                        isSource={false}
                                        label={entry.label}
                                        isPlayed={entry.index <= currentIndex}
                                        onClick={() => dispatch(selectEditIndex(entry.index))}
                                    />
                                )
                            }
                            <JumpToButton
                                key={'tb-' + si}
                                isSource={true}
                                label={source.label}
                                isPlayed={source.index <= currentIndex}
                                onClick={() => dispatch(selectEditIndex(source.index))}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    )
}

function JumpToButton(props: {isSource: boolean, label: string, isPlayed: boolean, onClick: () => void}) {
    return (
        <button
            className={styles.bookmark + " " + (props.isSource ? styles.source : styles.phase) + " " + (props.isPlayed ? styles.played : "")}
            onClick={props.onClick}
        >
            {props.label}
        </button>
    )
}
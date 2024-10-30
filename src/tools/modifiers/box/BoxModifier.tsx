import IMapModifier from "../types";
import NumericIncrementer from "../../../components/incrementer/NumericIncrementer";
import React from "react";
import ModifierCard from "../card/ModifierCard";
import Select, {SingleValue} from "react-select";
import styles from "./BoxModifier.module.css"
import {CHUNK_SIZE} from "../../../common/Consts";
import {TILE_AIR, TILE_ID_TO_OBJ, TILE_SET, TileData} from "../../../common/Tiles";

export interface BoxModifierProps {
    index: number;
    modifier: IBoxGenerator
    applyChanges: (modifier: IBoxGenerator, index: number) => void
}

export interface IBoxGenerator extends IMapModifier {
    args: IBoxGeneratorArgs
}

export interface IBoxGeneratorArgs {
    x: number;
    y: number;
    width: number;
    height: number;
    tiles: ITileGenData[]
}

export interface ITileGenData {
    id: number;
    rate?: number;
}

export default function BoxModifier(props: BoxModifierProps): React.JSX.Element {
    const {index, modifier, applyChanges} = props;

    const setValue = (value: IBoxGeneratorArgs) => {
        applyChanges(({...modifier, args: value}), index)
    };

    const addTile = () => {
        const tiles = [...modifier.args.tiles];
        tiles.push({id: 0, rate: 0});

        setValue({...modifier.args, tiles});
    };

    const setTileId = (tile: SingleValue<TileData>, tileIndex: number) => {
        const tiles = [...modifier.args.tiles];
        tiles[tileIndex] = {
            ...tiles[tileIndex],
            id: tile?.index !== undefined ? tile.index : TILE_AIR.index,
        };
        setValue({...modifier.args, tiles});
    };

    const setTileRate = (rate: string, tileIndex: number) => {
        const tiles = [...modifier.args.tiles];
        tiles[tileIndex] = {
            ...tiles[tileIndex],
            rate: Math.max(0, Math.min(1, Number.parseFloat(rate)))
        };
        setValue({...modifier.args, tiles});
    }

    return (
        <ModifierCard
            title={"Generate: Box"}
        >
            <div>
                <div className={styles.label}>Position X</div>
                <NumericIncrementer
                    value={modifier.args.x}
                    setValue={(v) => setValue({...modifier.args, x: v})}
                    increments={[1, CHUNK_SIZE]}
                />
            </div>
            <div>
                <div className={styles.label}>Position Y</div>
                <NumericIncrementer
                    value={modifier.args.y}
                    setValue={(v) => setValue({...modifier.args, y: v})}
                    increments={[1, CHUNK_SIZE]}
                />
            </div>
            <div>
                <div className={styles.label}>Size X</div>
                <NumericIncrementer
                    value={modifier.args.width}
                    setValue={(v) => setValue({...modifier.args, width: v})}
                    increments={[1, CHUNK_SIZE]}
                />
            </div>
            <div>
                <div className={styles.label}>Size Y</div>
                <NumericIncrementer
                    value={modifier.args.height}
                    setValue={(v) => setValue({...modifier.args, height: v})}
                    increments={[1, CHUNK_SIZE]}
                />
            </div>
            <div className={styles.tileList}>
                {
                    modifier.args.tiles.map((tile, index) => (
                        <div key={"tile-" + index} className={styles.tileEntry}>
                            <div className={styles.tileSelect}>
                                <Select
                                    options={TILE_SET}
                                    getOptionLabel={(value: TileData) => `[${value.index}] ${value.key}`}
                                    getOptionValue={(tile: TileData) => tile.key}
                                    placeholder={"Select"}
                                    onChange={(newValue) => setTileId(newValue, index)}
                                    value={TILE_ID_TO_OBJ[tile.id]}
                                />
                            </div>
                            <div className={styles.tileRate}>
                                {
                                    index === modifier.args.tiles.length - 1
                                        ? <span>Default</span>
                                        : <input
                                            type={"number"}
                                            step={0.05}
                                            value={tile.rate !== undefined ? tile.rate : 0}
                                            onChange={(value) => setTileRate(value.target.value, index)}
                                        />
                                }
                            </div>
                        </div>
                    ))
                }
                <button onClick={addTile}>Add Tile</button>
            </div>
        </ModifierCard>
    )
}
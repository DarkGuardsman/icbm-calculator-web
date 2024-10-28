import {useMemo} from "react";
import {isDefined} from "../../funcs/Helpers";

export interface NumericIncrementerProps {
    value: number;
    whole?: boolean;
    setValue: (num: number) => void;
    increments: number[];
}

export default function NumericIncrementer({value, whole = true, setValue, increments = [1]}: NumericIncrementerProps) {

    const reversedIncrement = useMemo(() => increments.slice().reverse(), [increments]);
    const handleChangeX = (event: { target: { value: string; }; }) => {
        const value = Number.parseFloat(event.target.value);
        setValue(whole ? Math.floor(value) : value);
    }

    const renderValue = useMemo(() => isDefined(value) ? value : 0, [value])

    return (
        <div>
            {
                reversedIncrement.map(increment => (
                    <button
                        key={`increment-minus-${increment}`}
                        onClick={() => setValue(value - increment)}
                    >
                        -{increment}
                    </button>
                ))
            }
            <input
                type="number"
                step={increments[0]}
                value={renderValue}
                onChange={handleChangeX}
            />
            {
                increments.map(increment => (
                    <button
                        key={`increment-plus-${increment}`}
                        onClick={() => setValue(value + increment)}
                    >
                        +{increment}
                    </button>
                ))
            }
        </div>
    )
}
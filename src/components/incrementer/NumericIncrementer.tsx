import {useMemo} from "react";

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

    return (
        <div>
            {
                reversedIncrement.map(increment => (
                    <button
                        onClick={() => setValue(value - increment)}
                    >
                        -{increment}
                    </button>
                ))
            }
            <input
                type="number"
                step={increments[0]}
                value={value}
                onChange={handleChangeX}
            />
            {
                increments.map(increment => (
                    <button
                        onClick={() => setValue(value + increment)}
                    >
                        +{increment}
                    </button>
                ))
            }
        </div>
    )
}
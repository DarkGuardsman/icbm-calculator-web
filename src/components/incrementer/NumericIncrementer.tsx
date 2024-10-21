import {useMemo} from "react";

export interface NumericIncrementerProps {
    value: number;
    setValue: (num: number) => void;
    increments: number[];
}

export default function NumericIncrementer({value, setValue, increments = [1]}: NumericIncrementerProps) {

    const reversedIncrement = useMemo(() => increments.slice().reverse(), [increments]);
    const handleChangeX = (event: { target: { value: string; }; }) => {
        const value = Math.floor(Number.parseFloat(event.target.value));
        setValue(value);
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
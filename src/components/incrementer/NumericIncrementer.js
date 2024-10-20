import {useMemo} from "react";

/**
 * Input with increment/decrement arrows
 *
 * @param value {number}
 * @param setValue {function(number): void}
 * @param increments {number[]}
 * @returns {JSX.Element}
 * @constructor
 */
export default function NumericIncrementer({value, setValue, increments = [1]}) {

    const reversedIncrement = useMemo(() => increments.toReversed(), [increments]);
    const handleChangeX = (event) => {
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
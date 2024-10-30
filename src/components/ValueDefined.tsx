import React from "react";
import {isDefined} from "../funcs/Helpers";

export interface ValueDefinedProps {
    value: any;
    children: React.JSX.Element | React.JSX.Element[]
}

export default function ValueDefined({value, children}: ValueDefinedProps): React.JSX.Element {
    if(isDefined(value)) {
        return <React.Fragment>{children}</React.Fragment>
    }
    return <React.Fragment/>;
}
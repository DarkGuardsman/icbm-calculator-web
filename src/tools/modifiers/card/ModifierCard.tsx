import React from "react";
import styles from "./ModifierCard.module.css";

export interface ModifierCardProps {
    title: string;
    children: string | React.JSX.Element | React.JSX.Element[]
}

export default function ModifierCard({title, children}: ModifierCardProps): React.JSX.Element {

    return (
        <div className={styles.toolSection}>
            <div className={styles.toolTitle}>{title}</div>
            <div>
                {children}
            </div>
        </div>
    )
}
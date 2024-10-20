import styles from "./ToolPage.module.css"

export default function ToolPage({title, children}) {
    return (
        <div className={styles.page}>
            <div className={styles.title}>{title}</div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}
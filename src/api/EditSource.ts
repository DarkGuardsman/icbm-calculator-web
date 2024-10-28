export default interface EditSource {
    /** Unique id of the source, Ex: 'TNT-45' */
    key: string;
    /** Unique timeline key for the source, Ex: 'ray-1' */
    phase: string;
    /** nth edit of the source since it started simulation, should ignore phase. Used for timeline scrubbing and playback */
    index: number;
}
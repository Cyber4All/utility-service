export interface OutageReport {
    _id: string;
    name: string;
    accessGroups: string[];
    issues: string[];
    discovered: Date;
    links?: string[];
    resolved?: Date;
}
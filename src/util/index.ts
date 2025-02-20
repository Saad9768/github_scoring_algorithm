export class Utils {
    /**
     *
     * @param data
     * @param fKey
     * @returns
     */
    static sortByKeys<T>(data: T[], fKey: string, order: boolean) {
        return data.sort((x: T, y: T) => order ? x[fKey] - y[fKey] : y[fKey] - x[fKey]);
    }
}
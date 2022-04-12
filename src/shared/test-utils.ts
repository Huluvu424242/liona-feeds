export const getPropertyValue = <T>(instanz: any, propertyName: string): T => {
    return instanz[propertyName];
}

export const setPropertyValue = <T>(instanz: any, propertyName: string, propertyValue: T): void => {
    instanz[propertyName] = propertyValue;
}
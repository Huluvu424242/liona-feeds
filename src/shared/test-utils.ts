export const getPropertyValue = <T>(instanz: any, propertyName: string): T => {
    return instanz[propertyName];
}
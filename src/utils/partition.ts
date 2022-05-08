export default function partition<T>(array: Array<T>, isValid: (ele: T) => boolean) {
    return array.reduce<[Array<T>, Array<T>]>(
        ([pass, fail], elem) => {
            return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
        },
        [[], []],
    );
}

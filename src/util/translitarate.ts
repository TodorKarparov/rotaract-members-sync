const cyrillicToLatinLetterMap = new Map<string, string>([
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ж', 'zh'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'y'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ф', 'f'],
    ['х', 'h'],
    ['ц', 'c'],
    ['ч', 'ch'],
    ['ш', 'sh'],
    ['щ', 'sht'],
    ['ъ', 'a'],
    ['ь', 'y'],
    ['ю', 'yu'],
    ['я', 'ya'],
    ['А', 'A'],
    ['Б', 'B'],
    ['В', 'V'],
    ['Г', 'G'],
    ['Д', 'D'],
    ['Е', 'E'],
    ['Ж', 'Zh'],
    ['З', 'Z'],
    ['И', 'I'],
    ['Й', 'Y'],
    ['К', 'K'],
    ['Л', 'L'],
    ['М', 'M'],
    ['Н', 'N'],
    ['О', 'O'],
    ['П', 'P'],
    ['Р', 'R'],
    ['С', 'S'],
    ['Т', 'T'],
    ['У', 'U'],
    ['Ф', 'F'],
    ['Х', 'H'],
    ['Ц', 'C'],
    ['Ч', 'Ch'],
    ['Ш', 'Sh'],
    ['Щ', 'Sht'],
    ['Ъ', 'A'],
    ['Ь', 'Y'],
    ['Ю', 'Yu'],
    ['Я', 'Ya'],
]);

export function translitarate(str: string): string {
    return str
        .split('')
        .map((char) => cyrillicToLatinLetterMap.get(char) || char)
        .join('');
}

export function containsCyrillic(text: string): boolean {
  // Checks if there's at least one character in the Cyrillic block (U+0400–U+04FF)
  return /[\u0400-\u04FF]/.test(text);
}
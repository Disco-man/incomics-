export const brailleMap: Record<string, string> = {
  'а': '⠁', 'б': '⠃', 'в': '⠺', 'г': '⠛', 'д': '⠙', 'е': '⠡', 'ё': '⠡', 'ж': '⠚', 'з': '⠵', 'и': '⠊',
  'й': '⠯', 'к': '⠅', 'л': '⠇', 'м': '⠍', 'н': '⠝', 'о': '⠕', 'п': '⠏', 'р': '⠗', 'с': '⠎', 'т': '⠞',
  'у': '⠥', 'ф': '⠋', 'х': '⠓', 'ц': '⠉', 'ч': '⠟', 'ш': '⠱', 'щ': '⠭', 'ъ': '⠷', 'ы': '⠮', 'ь': '⠾',
  'э': '⠪', 'ю': '⠳', 'я': '⠫',
  // Kazakh specific chars (approximate representation for demonstration)
  'ә': '⠜', 'і': '⠔', 'ң': '⠬', 'ғ': '⠣', 'ү': '⠧', 'ұ': '⠤', 'қ': '⠨', 'ө': '⠪', 'һ': '⠓',
  // Punctuation and numbers
  '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚',
  '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', '-': '⠤', ':': '⠒', ';': '⠆', ' ': ' ', '\n': '\n'
};

export function translateToBraille(text: string): string {
  let result = '';
  // Number prefix in braille
  const NUMBER_SIGN = '⠼';
  let inNumber = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i].toLowerCase();
    
    // Check if it's a digit
    if (/[0-9]/.test(char)) {
      if (!inNumber) {
        result += NUMBER_SIGN;
        inNumber = true;
      }
    } else {
      inNumber = false;
    }

    if (brailleMap[char]) {
      result += brailleMap[char];
    } else {
      result += char; // Leave unknown chars as is (e.g. english letters if any)
    }
  }
  return result;
}

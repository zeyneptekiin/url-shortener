const BASE62_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function base62Encode(num: bigint): string {
  let encoded = '';
  const base62 = BigInt(BASE62_ALPHABET.length);

  while (num > 0) {
    const remainder = num % base62;
    encoded = BASE62_ALPHABET[Number(remainder)] + encoded;
    num = num / base62;
  }

  return encoded || '0';
}

export function bufferToBigInt(buffer: Buffer): bigint {
  let result = BigInt(0);
  for (const byte of buffer) {
    result = (result << BigInt(8)) + BigInt(byte);
  }
  return result;
}

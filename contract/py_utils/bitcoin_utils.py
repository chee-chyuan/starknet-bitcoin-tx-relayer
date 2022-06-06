def convert_hex_to_uint256(hex_val):
    words = [hex_val[i:i+32] for i in range(0, len(hex_val), 32)]
    words_uint256 = list(map(lambda val: int(val, 16), words))
    return [words_uint256[0], words_uint256[1]] # high, low
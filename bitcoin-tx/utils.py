from binascii import unhexlify
import sha3


def keccak_256(to_hash_bytes):
    k = sha3.keccak_256()
    k.update(to_hash_bytes)
    return k.hexdigest()


def create_merkle_root_with_path_keccak256(keccak_txs, index):
    merklePath = [keccak_txs[index]]

    while True:
        if len(keccak_txs) == 1:
            return [keccak_txs[0], merklePath]

        newHashList = []
        hashListLen = len(keccak_txs) - \
            1 if len(keccak_txs) % 2 != 0 else len(keccak_txs)

        for i in range(0, hashListLen, 2):
            if index == i:
                merklePath.append(keccak_txs[index + 1])
                index = int(index / 2)
            elif index == (i + 1):
                merklePath.append(keccak_txs[index - 1])
                index = int((index - 1) / 2)

            to_hash_val = keccak_txs[i] + keccak_txs[i + 1]
            newHashList.append(keccak_256(unhexlify(to_hash_val)))

        if hashListLen < len(keccak_txs):
            if index == len(keccak_txs) - 1:
                merklePath.append(keccak_txs[index])
                index = int(index/2)
            to_hash_val = keccak_txs[len(
                keccak_txs) - 1] + keccak_txs[len(keccak_txs) - 1]
            newHashList.append(keccak_256(unhexlify(to_hash_val)))

        keccak_txs = newHashList


def create_merkle_root_with_path_keccak256_from_hex(hex_txs, index):
    keccak_txs = list(map(lambda val: keccak_256(unhexlify(val)), hex_txs))

    return create_merkle_root_with_path_keccak256(keccak_txs, index)


def verify_merkle_root_keccak256(merkle_root, merkle_path, tx_index):
    currentHash = merkle_path.pop(0)

    while len(merkle_path) > 0:
        is_left = tx_index % 2 == 0
        to_hash_with = merkle_path.pop(0)

        if is_left:
            tx_index = tx_index / 2
            to_hash = currentHash + to_hash_with
            currentHash = keccak_256(unhexlify(to_hash))
        else:
            tx_index = (tx_index - 1) / 2
            to_hash = to_hash_with + currentHash
            currentHash = keccak_256(unhexlify(to_hash))

    return currentHash == merkle_root

# -*- encoding:utf-8 -*-

import base64

skill1 = "スタミナ急速回復"
skill1_level = 1
skill2 = "ジャンプ鉄人"
skill2_level = 2
slots = [3, 2, 1]

# スキル1をエンコード
array = []
encoded_skill1 = list(skill1.encode('utf-8'))
array += [0x0a, len(encoded_skill1) + 4, 0x0a, len(encoded_skill1)] 
array += encoded_skill1
array += [0x10, skill1_level]

# スキル2がある場合、スキル2をエンコード
if skill2 is not None:
    encoded_skill2 = list(skill2.encode('utf-8'))
    skill2_array = [0x0a, len(encoded_skill2) + 4, 0x0a, len(encoded_skill2)]
    skill2_array += encoded_skill2
    skill2_array += [0x10, skill2_level]
    array += skill2_array

# スロットをエンコード
slot_byte_length = len(slots) * 2
array += [0x1a, slot_byte_length]

# 1ループ目: header_value = 8, slot = 3
# 2ループ目: header_value = 16, slot = 2
# 3ループ目: header_value = 24, slot = 1
header_value = 8
for slot in slots:
    array += [header_value, slot]
    header_value += 8

# お守りの全体の長さを付与
array = [0x0a, len(array)] + array

# 元のバイト列を表示
print(array)

# base64エンコードされた文字列を表示
print(base64.b64encode(bytes(array)))

#! /usr/bin/env python3

nouns = []

with open("german.dic", "r") as f:
    for word in f.readlines():
        index = word.find("/N")
        if index > 0:
            word = word[0:index].upper()
            if len(word) == 5:
                nouns.append(word)

print(len(nouns))
print(nouns[0])

with open("nouns.dic", "w") as f:
    for noun in nouns:
        f.write(f'"{noun}",\n')
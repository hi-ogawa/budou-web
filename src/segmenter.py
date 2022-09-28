from typing import NamedTuple, Optional, List
import unicodedata

# The ideas is based on https://github.com/google/budou/blob/d45791a244e00d84f87da2a4678da2b63a9c232f/budou/mecabsegmenter.py#L95-L108

DEPENDENT_POS_FORWARD = ["接頭辞", "連体詞"]
DEPENDENT_POS_BACKWARD = ["助詞", "助動詞", "接尾辞"]
DEPENDENT_POS_PAIRS = [["名詞", "名詞"]]
DEPENDENT_LABEL_FORWARD = []
DEPENDENT_LABEL_BACKWARD = ["非自立"]

# https://en.wikipedia.org/wiki/Unicode_character_property
PUNCTUATION_OPEN = ["Ps", "Pi"]
PUNCTUATION_CLOSE = ["Pc", "Pd", "Pd", "Pe", "Pf", "Po"]


def is_punctuation_open(token: str) -> bool:
    return len(token) == 1 and unicodedata.category(token) in PUNCTUATION_OPEN


def is_punctuation_close(token: str) -> bool:
    return len(token) == 1 and unicodedata.category(token) in PUNCTUATION_CLOSE


class TagItem(NamedTuple):
    token: str
    pos: str
    label: Optional[str]

    def is_dependent_forward(self) -> bool:
        return (
            is_punctuation_open(self.token)
            or self.pos in DEPENDENT_POS_FORWARD
            or self.label in DEPENDENT_LABEL_FORWARD
        )

    def is_dependent_backward(self) -> bool:
        return (
            is_punctuation_close(self.token)
            or self.pos in DEPENDENT_POS_BACKWARD
            or self.label in DEPENDENT_LABEL_BACKWARD
        )


def is_dependent(prev: TagItem, curr: TagItem) -> bool:
    return (
        prev.is_dependent_forward()
        or curr.is_dependent_backward()
        or [prev.pos, curr.pos] in DEPENDENT_POS_PAIRS
    )


class Segmenter:
    def __init__(self):
        import MeCab

        self.tagger = MeCab.Tagger("")

    def run(self, source: str) -> List[str]:
        items = self.run_mecab(source)
        if len(items) == 0:
            return []
        results = [items[0].token]
        for prev, curr in zip(items[:-1], items[1:]):
            if is_dependent(prev, curr):
                results[-1] = results[-1] + curr.token
            else:
                results.append(curr.token)
        return results

    def run_mecab(self, source: str) -> List[TagItem]:
        items: List[TagItem] = []
        mecab_result = self.tagger.parse(source)
        assert isinstance(mecab_result, str)
        for mecab_item in mecab_result.split("\n")[:-2]:
            data = mecab_item.split("\t")
            token = data[0]
            labels = data[4].split("-")
            pos = labels[0]
            label = labels[1] if len(labels) >= 2 else None
            items.append(TagItem(token, pos, label))
        return items


def main():
    import sys
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action=argparse.BooleanOptionalAction)
    args = parser.parse_args()

    source = sys.stdin.read()
    segmenter = Segmenter()
    print(*segmenter.run(source), sep="\n")
    if args.verbose:
        print(*segmenter.run_mecab(source), sep="\n")


if __name__ == "__main__":
    main()

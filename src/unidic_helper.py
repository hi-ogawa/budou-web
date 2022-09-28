import tarfile
import os.path

# we bundle only compressed tar.gz (~50MB) since decompressed installation of unidic-lite (~250MB) won't pass vercel/lambda limit

SRC_PATH = "data/unidic-lite-1.0.8.tar.gz"
DST_PATH = "data/unidic-lite-1.0.8"


def prepare() -> None:
    get_mecab_args()


def get_mecab_args() -> str:
    if not os.path.exists(DST_PATH):
        with tarfile.open(SRC_PATH) as f:
            f.extractall(DST_PATH)
    return f"-r {DST_PATH}/unidic-lite-1.0.8/unidic_lite/dicdir/mecabrc -d {DST_PATH}/unidic-lite-1.0.8/unidic_lite/dicdir"


if __name__ == "__main__":
    print(get_mecab_args())

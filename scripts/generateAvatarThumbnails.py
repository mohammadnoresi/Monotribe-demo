from pathlib import Path

from PIL import Image, ImageOps


SOURCE_DIR = Path("src/assets/Avatar")
THUMB_DIR = SOURCE_DIR / "thumbs"
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
THUMBNAIL_SIZE = (128, 128)
JPEG_QUALITY = 72


def main() -> None:
    THUMB_DIR.mkdir(parents=True, exist_ok=True)

    source_files = sorted(
        path
        for path in SOURCE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )

    original_bytes = 0
    thumbnail_bytes = 0

    for source_path in source_files:
        original_bytes += source_path.stat().st_size
        thumbnail_path = THUMB_DIR / f"{source_path.stem}.jpg"

        with Image.open(source_path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            thumbnail = ImageOps.fit(image, THUMBNAIL_SIZE, method=Image.Resampling.LANCZOS)
            thumbnail.save(
                thumbnail_path,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )

        thumbnail_bytes += thumbnail_path.stat().st_size

    print(f"Generated thumbnails: {len(source_files)}")
    print(f"Original total: {format_bytes(original_bytes)}")
    print(f"Thumbnail total: {format_bytes(thumbnail_bytes)}")
    print(f"Output directory: {THUMB_DIR}")


def format_bytes(value: int) -> str:
    return f"{value / 1024 / 1024:.2f} MB"


if __name__ == "__main__":
    main()

import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen
import shutil


def repo_id_from_url(url: str) -> str:
    p = urlparse(url)
    parts = [x for x in p.path.split('/') if x]
    if 'datasets' in parts:
        i = parts.index('datasets')
        segs = parts[i + 1:]
        if segs:
            return '/'.join(segs[:2])
    raise ValueError('URL inválida')


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def download_with_hub(repo_id: str, output_dir: Path) -> Path:
    try:
        from huggingface_hub import snapshot_download
    except Exception:
        return None
    ensure_dir(output_dir)
    snapshot_download(repo_id=repo_id, repo_type='dataset', local_dir=str(output_dir), local_dir_use_symlinks=False)
    return output_dir


def download_with_api(repo_id: str, output_dir: Path) -> Path:
    ensure_dir(output_dir)
    api = f"https://huggingface.co/api/datasets/{repo_id}/tree/main?recursive=1"
    with urlopen(api) as r:
        data = json.loads(r.read().decode('utf-8'))
    for item in data:
        if item.get('type') != 'file':
            continue
        rel_path = item['path']
        dest = output_dir / rel_path
        ensure_dir(dest.parent)
        src = f"https://huggingface.co/datasets/{repo_id}/resolve/main/{rel_path}"
        with urlopen(src) as s, open(dest, 'wb') as f:
            shutil.copyfileobj(s, f)
    return output_dir


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', default='https://huggingface.co/datasets/datasetmaster/resumes?utm_source=chatgpt.com')
    parser.add_argument('--out', default=str(Path(__file__).parent / 'downloads' / 'datasetmaster-resumes'))
    args = parser.parse_args()
    repo_id = repo_id_from_url(args.url)
    out_dir = Path(args.out)
    res = download_with_hub(repo_id, out_dir)
    if res is None:
        res = download_with_api(repo_id, out_dir)
    print(str(res))


if __name__ == '__main__':
    main()
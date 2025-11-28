import argparse
import json
import os
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


def read_jsonl(path: Path) -> List[Dict[str, Any]]:
    rows = []
    with path.open('r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            rec = {
                'personal_information': obj.get('personal_info'),
                'experience': obj.get('experience'),
                'education': obj.get('education'),
                'skills': obj.get('skills'),
                'projects': obj.get('projects'),
            }
            rows.append(rec)
    return rows


def post_batch(base_url: str, api_key: str, table: str, batch: List[Dict[str, Any]]) -> Tuple[int, int]:
    url = base_url.rstrip('/') + '/rest/v1/' + table
    data = json.dumps(batch).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key,
        'Authorization': 'Bearer ' + api_key,
        'Prefer': 'return=representation',
    }
    req = Request(url, data=data, headers=headers, method='POST')
    try:
        with urlopen(req) as r:
            body = r.read()
            inserted = 0
            try:
                arr = json.loads(body.decode('utf-8'))
                if isinstance(arr, list):
                    inserted = len(arr)
            except Exception:
                inserted = 0
            return r.status, inserted
    except HTTPError as e:
        try:
            body = e.read().decode('utf-8')
            print('Detalle', body)
        except Exception:
            pass
        return e.code, 0
    except URLError:
        return 0, 0


def get_count(base_url: str, api_key: str, table: str, status: str = None) -> int:
    url = base_url.rstrip('/') + '/rest/v1/' + table + '?select=id'
    if status:
        url = base_url.rstrip('/') + f'/rest/v1/{table}?status=eq.{status}&select=id'
    headers = {
        'apikey': api_key,
        'Authorization': 'Bearer ' + api_key,
        'Prefer': 'count=exact',
    }
    req = Request(url, headers=headers, method='GET')
    try:
        with urlopen(req) as r:
            cr = r.getheader('Content-Range') or ''
            if '/' in cr:
                return int(cr.split('/')[-1])
            return 0
    except Exception:
        return 0


def load_env() -> None:
    root = Path(__file__).resolve().parent.parent
    candidates = [root / '.env', Path(__file__).resolve().parent / '.env']
    for p in candidates:
        if not p.exists():
            continue
        for line in p.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())


def main() -> None:
    load_env()
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', default=str(Path(__file__).parent / 'downloads' / 'datasetmaster-resumes' / 'master_resumes.jsonl'))
    parser.add_argument('--table', default='profile')
    parser.add_argument('--batch-size', type=int, default=100)
    parser.add_argument('--url', default=os.environ.get('NEXT_PUBLIC_SUPABASE_URL'))
    parser.add_argument('--key', default=os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
    parser.add_argument('--status', default='pending')
    parser.add_argument('--vacant-id', type=int)
    parser.add_argument('--sleep-ms', type=int, default=100)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    if not args.url or not args.key:
        print('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
        return
    file_path = Path(args.file)
    rows = read_jsonl(file_path)
    for r in rows:
        r['status'] = args.status
        if args.vacant_id is not None:
            r['vacant_id'] = args.vacant_id
    if args.dry_run:
        print('Registros', len(rows))
        return
    total = len(rows)
    ok = 0
    i = 0
    bs = max(1, args.batch_size)
    if args.verify:
        cnt_before = get_count(args.url, args.key, args.table, args.status)
        print('Conteo remoto antes', cnt_before)
    while i < total:
        batch = rows[i:i + bs]
        status, inserted = post_batch(args.url, args.key, args.table, batch)
        time.sleep(args.sleep_ms / 1000.0)
        if status in (200, 201, 204) and inserted == len(batch):
            ok += inserted
            i += len(batch)
        elif status in (200, 201, 204) and inserted > 0:
            ok += inserted
            start = i + inserted
            for j in range(start, i + len(batch)):
                s1, ins1 = post_batch(args.url, args.key, args.table, [rows[j]])
                time.sleep(args.sleep_ms / 1000.0)
                if s1 in (200, 201, 204) and ins1 == 1:
                    ok += 1
            i += len(batch)
        else:
            if bs > 1:
                bs = max(1, bs // 2)
            else:
                s1, ins1 = post_batch(args.url, args.key, args.table, [rows[i]])
                time.sleep(args.sleep_ms / 1000.0)
                if s1 in (200, 201, 204) and ins1 == 1:
                    ok += 1
                i += 1
    print('Insertados', ok, 'de', total)
    if args.verify:
        cnt_after = get_count(args.url, args.key, args.table, args.status)
        print('Conteo remoto después', cnt_after)


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
Descarga datos de Google Search Console para este sitio usando la cuenta de
servicio y los guarda como CSV/JSON para que el agente SEO los analice.

Uso:
    python seo/gsc_fetch.py --key /ruta/segura/agente-seo.json --days 28
    python seo/gsc_fetch.py --key ... --days 90 --out /tmp/data

La propiedad se lee de seo/site.json ("gsc_property"). La llave NUNCA debe
estar dentro del repositorio: en GitHub Actions llega como secreto
(GSC_SERVICE_ACCOUNT_JSON) y el workflow la escribe a un archivo temporal.
"""
import argparse
import csv
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.exit("Falta instalar: pip install google-api-python-client google-auth")

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
HERE = Path(__file__).resolve().parent

DIMENSION_SETS = {
    "queries": ["query"],
    "pages": ["page"],
    "query_page": ["query", "page"],
    "devices": ["device"],
    "countries": ["country"],
    "daily": ["date"],
}


def load_site():
    cfg = HERE / "site.json"
    if not cfg.exists():
        sys.exit("Falta seo/site.json")
    return json.loads(cfg.read_text(encoding="utf-8"))


def get_service(key_path: str):
    creds = service_account.Credentials.from_service_account_file(key_path, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)


def query(service, site, start, end, dimensions, row_limit=5000):
    rows, start_row = [], 0
    while True:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": dimensions,
            "rowLimit": row_limit,
            "startRow": start_row,
            "dataState": "final",
        }
        resp = service.searchanalytics().query(siteUrl=site, body=body).execute()
        batch = resp.get("rows", [])
        for r in batch:
            row = dict(zip(dimensions, r["keys"]))
            row.update({k: r[k] for k in ("clicks", "impressions", "ctr", "position")})
            rows.append(row)
        if len(batch) < row_limit:
            break
        start_row += row_limit
    return rows


def write_csv(path: Path, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        if rows:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=os.environ.get("GSC_KEY_PATH"))
    ap.add_argument("--days", type=int, default=28)
    ap.add_argument("--out", default=str(HERE / "data"))
    args = ap.parse_args()
    if not args.key or not Path(args.key).exists():
        sys.exit("Indica la llave con --key o la variable GSC_KEY_PATH")

    site_cfg = load_site()
    site = site_cfg["gsc_property"]
    service = get_service(args.key)

    accessible = {s["siteUrl"]: s["permissionLevel"] for s in service.sites().list().execute().get("siteEntry", [])}
    if site not in accessible:
        print("Propiedades visibles:", ", ".join(accessible) or "(ninguna)")
        sys.exit(f"La cuenta de servicio no tiene acceso a {site}. Agrégala como usuario en Search Console.")

    # Search Console entrega datos con ~2-3 días de retraso.
    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=args.days - 1)

    out_dir = Path(args.out) / f"{args.days}d" / f"{start}_{end}"
    latest = Path(args.out) / f"{args.days}d" / "latest"
    out_dir.mkdir(parents=True, exist_ok=True)
    latest.mkdir(parents=True, exist_ok=True)
    print(f"{site}: {start} → {end}  ->  {out_dir}")

    summary = {"site": site, "start": str(start), "end": str(end), "days": args.days, "rows": {}}
    for name, dims in DIMENSION_SETS.items():
        rows = query(service, site, start, end, dims)
        write_csv(out_dir / f"{name}.csv", rows)
        write_csv(latest / f"{name}.csv", rows)
        summary["rows"][name] = len(rows)
        print(f"  {name}: {len(rows)} filas")
    totals = query(service, site, start, end, [])
    if totals:
        summary["totals"] = {k: totals[0][k] for k in ("clicks", "impressions", "ctr", "position")}
        print("  totales:", summary["totals"])
    for p in (out_dir, latest):
        (p / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()

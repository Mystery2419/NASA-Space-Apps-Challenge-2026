"""
spherex_fetch_cli.py
=====================
Interactive command-line entry point that ties together:
    spherex_coords.py   (parse sexagesimal / decimal / object-name input)
    spherex_query.py     (search IRSA SIA2 across all SPHEREx releases)
    spherex_download.py  (download + split each MEF into 6 FITS files)

This is intentionally a thin script, not a library: other team members
building the actual web front end should import and call the three
modules above directly (e.g. from a Flask/FastAPI request handler),
rather than shelling out to this CLI. This file exists so the tool is
runnable and testable standalone during development.

Usage
-----
    python spherex_fetch_cli.py

Then follow the prompts:
    1. Enter a target (sexagesimal, decimal degrees, or object name).
    2. Enter a search radius in arcmin (or press Enter for the default).
    3. Optionally restrict to specific detector numbers (1-6).

Output
------
Files are written under ./spherex_output/<target_label>/, one subdirectory
per exposure, each containing IMAGE.fits, FLAGS.fits, VARIANCE.fits,
ZODI.fits, EPSF.fits, WCS-WAVE.fits (whichever extensions are present for
that exposure). A manifest.csv summarising all exposures is written
alongside them -- this is the handoff file for the data-cleaning teammate.
"""
from __future__ import annotations

from pathlib import Path

from astropy import units as u

from spherex_coords import parse_coordinate, CoordinateParseError
from spherex_query import search_spherex, DEFAULT_RADIUS, SpherexQueryError
from spherex_download import download_and_split

OUTPUT_ROOT = Path("./spherex_output")


def _prompt_detectors() -> list | None:
    raw = input(
        "Restrict to specific detector(s) 1-6 (comma-separated, "
        "or press Enter for all): "
    ).strip()
    if not raw:
        return None
    try:
        return [int(x) for x in raw.split(",") if x.strip()]
    except ValueError:
        print("Could not parse detector list; defaulting to all detectors.")
        return None


def main() -> None:
    raw_target = input(
        "Enter target (sexagesimal, decimal RA/Dec, or object name): "
    ).strip()
    try:
        resolved = parse_coordinate(raw_target)
    except CoordinateParseError as exc:
        print(f"Error: {exc}")
        return

    print(
        f"Resolved '{raw_target}' as {resolved.input_type} -> "
        f"{resolved.skycoord.to_string('hmsdms')}"
    )

    radius_raw = input(
        f"Search radius in arcmin (default {DEFAULT_RADIUS.to(u.arcmin).value:g}): "
    ).strip()
    radius = float(radius_raw) * u.arcmin if radius_raw else DEFAULT_RADIUS

    detectors = _prompt_detectors()

    print("Querying IRSA SIA2 across spherex_dr1 / spherex_qr3 (wide + deep)...")
    try:
        result = search_spherex(resolved.skycoord, radius=radius, detectors=detectors)
    except SpherexQueryError as exc:
        print(f"Query failed: {exc}")
        return

    print(f"Found {len(result)} exposure(s).")
    if len(result) == 0:
        print("Nothing to download.")
        return

    # Each exposure is a separate ~65 MB file, so warn before a huge batch
    # and let the user cap it for testing (default = fetch everything).
    max_exposures = None
    if len(result) > 10:
        cap_raw = input(
            f"This will download {len(result)} files (~{len(result) * 65} MB "
            f"at ~65 MB each). Enter a max number to fetch now for testing, "
            f"or press Enter to fetch all {len(result)}: "
        ).strip()
        if cap_raw:
            try:
                max_exposures = int(cap_raw)
            except ValueError:
                print("Could not parse number; fetching all exposures.")

    print(f"Downloading and splitting into {OUTPUT_ROOT / resolved.label} ...")
    exposures = download_and_split(
        result.table, OUTPUT_ROOT, resolved.label, max_exposures=max_exposures
    )
    n_skipped = sum(e.skipped for e in exposures)
    print(
        f"Done. {len(exposures) - n_skipped} downloaded, "
        f"{n_skipped} already present and skipped."
    )
    print(f"Manifest written to {OUTPUT_ROOT / resolved.label / 'manifest.csv'}")


if __name__ == "__main__":
    main()

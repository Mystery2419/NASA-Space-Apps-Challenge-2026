from spherex_coords import parse_coordinate
for name in ["Barnard's Star", "WISE 0855", "R Draconis", "RW Aurigae", "Epsilon Indi B"]:
    try:
        result = parse_coordinate(name)
        print(f"{name!r}: detected as {result.input_type}, resolved to {result.skycoord}")
    except Exception as exc:
        print(f"{name!r}: FAILED -> {exc}")

"""Quick inspector for a FITS binary table extension (e.g. EPSF, WCS-WAVE)."""
import sys
from astropy.table import Table

path = sys.argv[1] if len(sys.argv) > 1 else \
    "spherex_output/08h55m10.831s_-07d14m42.53s/2025W19_1B_0116_1_D3/EPSF.fits"

t = Table.read(path, hdu=1)
print("Columns:", t.colnames)
print(t[:5])
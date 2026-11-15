"""Quick inspector for a FITS image extension (e.g. IMAGE, FLAGS, VARIANCE, ZODI)."""
import sys
import numpy as np
from astropy.io import fits

path = sys.argv[1] if len(sys.argv) > 1 else \
    "spherex_output/08h55m10.831s_-07d14m42.53s/2025W19_1B_0116_1_D3/FLAGS.fits"

hdul = fits.open(path)
data = hdul[1].data
print("dtype:", data.dtype, "shape:", data.shape)

if np.issubdtype(data.dtype, np.floating):
    n_nan = np.isnan(data).sum()
    print(f"NaNs: {n_nan} / {data.size}")
    print("nanmin/nanmax/nanmean:", np.nanmin(data), np.nanmax(data), np.nanmean(data))
else:
    print("min/max:", data.min(), data.max())
    vals, counts = np.unique(data, return_counts=True)
    print("Value counts (top 10 by frequency):")
    order = np.argsort(-counts)[:10]
    for v, c in zip(vals[order], counts[order]):
        print(f"  value={v}: count={c}")

"""
Utility functions for Hotel Booking Cancellation Prediction project.
"""

from pathlib import Path
from typing import Optional, Union
import logging
import matplotlib.pyplot as plt
import pandas as pd

from src.config import FIGURES_DIR, TABLES_DIR

logger = logging.getLogger(__name__)


def setup_visualization_style() -> None:
    """Configure matplotlib and seaborn plotting parameters for publication-quality figures."""
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams["font.sans-serif"] = ["DejaVu Sans", "Arial", "Helvetica"]
    plt.rcParams["axes.edgecolor"] = "#cccccc"
    plt.rcParams["axes.linewidth"] = 0.8
    plt.rcParams["figure.dpi"] = 300
    plt.rcParams["savefig.dpi"] = 300
    plt.rcParams["savefig.bbox"] = "tight"


def save_figure(
    fig: plt.Figure,
    filename: str,
    output_dir: Optional[Union[str, Path]] = None,
    dpi: int = 300,
) -> Path:
    """
    Save matplotlib figure to specified directory.

    Args:
        fig: Matplotlib Figure instance.
        filename: Target image filename (e.g., 'cancellation_rate_by_hotel.png').
        output_dir: Directory to save figure (defaults to config.FIGURES_DIR).
        dpi: Resolution of saved figure.

    Returns:
        Path of the saved file.
    """
    target_dir = Path(output_dir) if output_dir else FIGURES_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    save_path = target_dir / filename

    fig.savefig(save_path, dpi=dpi, bbox_inches="tight")
    logger.info(f"Đã lưu biểu đồ: {save_path.resolve()}")
    return save_path


def save_table_csv(
    df: pd.DataFrame,
    filename: str,
    output_dir: Optional[Union[str, Path]] = None,
    index: bool = True,
) -> Path:
    """
    Save pandas DataFrame to CSV file in reports/tables.

    Args:
        df: Pandas DataFrame.
        filename: Target CSV filename (e.g., 'missing_values_summary.csv').
        output_dir: Directory to save CSV (defaults to config.TABLES_DIR).
        index: Whether to include index in CSV output.

    Returns:
        Path of the saved file.
    """
    target_dir = Path(output_dir) if output_dir else TABLES_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    save_path = target_dir / filename

    df.to_csv(save_path, index=index, encoding="utf-8-sig")
    logger.info(f"Đã lưu bảng thống kê: {save_path.resolve()}")
    return save_path

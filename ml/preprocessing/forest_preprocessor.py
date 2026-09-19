"""
FireGuard AI - Forest Preprocessing Pipeline
"""

from typing import List, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler

CORE_FOREST_FEATURES = [
    "temperature",
    "oxygen_level",
    "humidity",
    "wind_speed",
    "pressure",
    "rainfall",
]

OPTIONAL_FOREST_FEATURES = [
    "latitude",
    "longitude",
    "ffmc",
    "dmc",
    "dc",
    "isi",
    "bui",
    "fwi",
]

ALL_FOREST_FEATURES = CORE_FOREST_FEATURES + OPTIONAL_FOREST_FEATURES


class ForestPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self, feature_columns: Optional[List[str]] = None):
        self.feature_columns = feature_columns or ALL_FOREST_FEATURES
        self.scaler = StandardScaler()
        self.feature_means = {}

    def fit(self, X: pd.DataFrame, y=None):
        X_df = self._to_dataframe(X)
        self.feature_means = X_df[self.feature_columns].mean().to_dict()
        imputed = X_df[self.feature_columns].fillna(self.feature_means)
        self.scaler.fit(imputed)
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X_df = self._to_dataframe(X)
        # Ensure all columns exist, fill missing optional features with trained means
        for col in self.feature_columns:
            if col not in X_df.columns:
                X_df[col] = self.feature_means.get(col, 0.0)

        imputed = X_df[self.feature_columns].fillna(self.feature_means)
        scaled = self.scaler.transform(imputed)
        return pd.DataFrame(scaled, columns=self.feature_columns, index=X_df.index)

    def _to_dataframe(self, X) -> pd.DataFrame:
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X, columns=self.feature_columns)
        # Normalize column names to lowercase and underscores
        df.columns = [c.lower().replace(" ", "_") for c in df.columns]
        return df

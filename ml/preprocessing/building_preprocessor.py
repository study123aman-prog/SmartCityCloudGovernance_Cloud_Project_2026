"""
FireGuard AI - Building Preprocessing Pipeline
"""

from typing import List, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler

NUMERICAL_BUILDING_FEATURES = [
    "temperature",
    "humidity",
    "smoke_index",
    "electrical_load",
    "occupancy",
    "wind_speed",
    "flammability",
]

ZONE_TYPES = [
    "electrical",
    "server_room",
    "kitchen",
    "lab",
    "classroom",
    "corridor",
    "storage",
    "office",
    "exit",
]


class BuildingPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.numerical_features = NUMERICAL_BUILDING_FEATURES
        self.scaler = StandardScaler()
        self.feature_means = {}
        self.final_feature_names = []

    def fit(self, X: pd.DataFrame, y=None):
        X_df = self._to_dataframe(X)
        self.feature_means = X_df[self.numerical_features].mean().to_dict()
        imputed_num = X_df[self.numerical_features].fillna(self.feature_means)
        self.scaler.fit(imputed_num)

        # Build feature list (numerical + one-hot zone types)
        self.final_feature_names = list(self.numerical_features) + [f"zone_{zt}" for zt in ZONE_TYPES]
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        X_df = self._to_dataframe(X)
        for col in self.numerical_features:
            if col not in X_df.columns:
                X_df[col] = self.feature_means.get(col, 0.0)

        imputed_num = X_df[self.numerical_features].fillna(self.feature_means)
        scaled_num = self.scaler.transform(imputed_num)
        scaled_df = pd.DataFrame(scaled_num, columns=self.numerical_features, index=X_df.index)

        # One-hot encode zone_type
        for zt in ZONE_TYPES:
            col_name = f"zone_{zt}"
            if "zone_type" in X_df.columns:
                scaled_df[col_name] = (X_df["zone_type"] == zt).astype(float)
            else:
                scaled_df[col_name] = 0.0

        return scaled_df[self.final_feature_names]

    def _to_dataframe(self, X) -> pd.DataFrame:
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X)
        df.columns = [c.lower().replace(" ", "_") for c in df.columns]
        return df

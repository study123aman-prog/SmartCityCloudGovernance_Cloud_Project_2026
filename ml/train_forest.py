"""
FireGuard AI - Forest Fire Model Training Pipeline
"""

import os
import sys
import json
import argparse
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Ensure ml root is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.forest_preprocessor import ForestPreprocessor, ALL_FOREST_FEATURES

DATA_PATH = os.path.join(current_dir, "..", "data", "forest", "forest_fire_dataset.csv")
MODEL_DIR = os.path.join(current_dir, "models")
MODEL_OUTPUT = os.path.join(MODEL_DIR, "forest_model.joblib")
METRICS_OUTPUT = os.path.join(MODEL_DIR, "forest_metrics.json")


def train_forest(data_path: str = DATA_PATH, output_path: str = MODEL_OUTPUT):
    print(f"[Forest ML] Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    print(f"[Forest ML] Dataset size: {df.shape[0]} rows, {df.shape[1]} columns")

    # Features and Targets
    X = df[ALL_FOREST_FEATURES]
    y_class = df["fire_occurrence"]
    y_score = df["risk_score"]

    # Stratified split
    X_train, X_test, y_train, y_test, score_train, score_test = train_test_split(
        X, y_class, y_score, test_size=0.2, random_state=42, stratify=y_class
    )

    print(f"[Forest ML] Fitting preprocessor on {len(X_train)} training records...")
    preprocessor = ForestPreprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    print("[Forest ML] Training Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train_proc, y_train)

    print("[Forest ML] Training Random Forest Regressor for fine-grained risk score...")
    reg = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    reg.fit(X_train_proc, score_train)

    # Evaluate Classifier
    y_pred = clf.predict(X_test_proc)
    y_prob = clf.predict_proba(X_test_proc)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()

    metrics = {
        "model_type": "RandomForest",
        "dataset_samples": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": cm,
        "feature_names": ALL_FOREST_FEATURES,
        "feature_importances": {
            feat: round(float(imp), 4)
            for feat, imp in zip(ALL_FOREST_FEATURES, clf.feature_importances_)
        }
    }

    print("\n--- Forest Fire Model Evaluation Results ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"Confusion Matrix: {cm}")
    print("-------------------------------------------\n")

    os.makedirs(MODEL_DIR, exist_ok=True)

    package = {
        "preprocessor": preprocessor,
        "classifier": clf,
        "regressor": reg,
        "feature_names": ALL_FOREST_FEATURES,
        "metrics": metrics
    }

    joblib.dump(package, output_path)
    print(f"[Forest ML] Model artifact successfully saved to: {output_path}")

    with open(METRICS_OUTPUT, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[Forest ML] Metrics report saved to: {METRICS_OUTPUT}")

    return package, metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train FireGuard AI Forest Fire Model")
    parser.add_argument("--data", default=DATA_PATH, help="Path to forest dataset CSV")
    parser.add_argument("--output", default=MODEL_OUTPUT, help="Path to output model file")
    args = parser.parse_args()
    train_forest(args.data, args.output)

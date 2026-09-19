"""
FireGuard AI - Forest Fire Model Evaluation Script
"""

import os
import sys
import json
import argparse
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from preprocessing.forest_preprocessor import ALL_FOREST_FEATURES

DATA_PATH = os.path.join(current_dir, "..", "data", "forest", "forest_fire_dataset.csv")
MODEL_PATH = os.path.join(current_dir, "models", "forest_model.joblib")


def evaluate_forest(data_path: str = DATA_PATH, model_path: str = MODEL_PATH):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}. Run train_forest.py first.")

    print(f"[Evaluate Forest] Loading model from {model_path}...")
    pkg = joblib.load(model_path)
    preprocessor = pkg["preprocessor"]
    clf = pkg["classifier"]
    reg = pkg.get("regressor")

    print(f"[Evaluate Forest] Loading evaluation dataset from {data_path}...")
    df = pd.read_csv(data_path)
    X = df[ALL_FOREST_FEATURES]
    y_true = df["fire_occurrence"]

    X_proc = preprocessor.transform(X)
    y_pred = clf.predict(X_proc)
    y_prob = clf.predict_proba(X_proc)[:, 1]

    print("\n================ FOREST MODEL EVALUATION ================")
    print(classification_report(y_true, y_pred, target_names=["No Fire", "Fire Hazard"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_true, y_pred))
    auc = roc_auc_score(y_true, y_prob)
    print(f"ROC-AUC: {auc:.4f}")

    if "feature_importances" in pkg.get("metrics", {}):
        print("\nTop 5 Feature Importances:")
        sorted_fi = sorted(pkg["metrics"]["feature_importances"].items(), key=lambda x: x[1], reverse=True)
        for feat, score in sorted_fi[:5]:
            print(f"  - {feat:15s}: {score:.4f}")
    print("=========================================================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Forest Fire Model")
    parser.add_argument("--data", default=DATA_PATH)
    parser.add_argument("--model", default=MODEL_PATH)
    args = parser.parse_args()
    evaluate_forest(args.data, args.model)

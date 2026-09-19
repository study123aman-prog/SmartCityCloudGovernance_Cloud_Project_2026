"""
FireGuard AI - Feature Importance Analysis
"""

import os
import sys
import json
import joblib

current_dir = os.path.dirname(os.path.abspath(__file__))
FOREST_MODEL_PATH = os.path.join(current_dir, "models", "forest_model.joblib")
BUILDING_MODEL_PATH = os.path.join(current_dir, "models", "building_model.joblib")


def get_feature_importances():
    results = {}

    if os.path.exists(FOREST_MODEL_PATH):
        f_pkg = joblib.load(FOREST_MODEL_PATH)
        clf = f_pkg["classifier"]
        features = f_pkg.get("feature_names", [])
        importances = clf.feature_importances_
        sorted_forest = sorted(
            [{"feature": f, "importance": round(float(imp), 4)} for f, imp in zip(features, importances)],
            key=lambda x: x["importance"],
            reverse=True
        )
        results["forest"] = sorted_forest

    if os.path.exists(BUILDING_MODEL_PATH):
        b_pkg = joblib.load(BUILDING_MODEL_PATH)
        clf = b_pkg["classifier"]
        features = b_pkg.get("feature_names", [])
        importances = clf.feature_importances_
        sorted_building = sorted(
            [{"feature": f, "importance": round(float(imp), 4)} for f, imp in zip(features, importances)],
            key=lambda x: x["importance"],
            reverse=True
        )
        results["building"] = sorted_building

    return results


if __name__ == "__main__":
    fi = get_feature_importances()
    print(json.dumps(fi, indent=2))

import pickle
import numpy as np
import sys

def predict_level(time, runtime):
    print("Workingggg")
    with open('/home/karthik/adaptive-coding-app/server/internal/scripts/clustering_model.pkl', 'rb') as f:
        data = pickle.load(f)

    scaler = data['scaler']
    kmeans_model = data['kmeans_model']
    level_mapping = data['level_mapping']

    new_user_data = np.array([[time, runtime]])
    normalized_new_user_data = scaler.transform(new_user_data)
    composite_new_user_score = normalized_new_user_data.dot(np.array([3, 1]))
    composite_new_user_score = composite_new_user_score.reshape(-1, 1)

    new_user_cluster = kmeans_model.predict(composite_new_user_score)
    new_user_level = level_mapping[new_user_cluster[0]]
    
    return new_user_level

if __name__ == "__main__":
    time = float(sys.argv[1])
    runtime = float(sys.argv[2])
    level = predict_level(time, runtime)
    print(level)

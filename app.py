import streamlit as st
import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Use a backend suitable for Streamlit
import matplotlib.pyplot as plt
import seaborn as sns
import time
from sklearn.ensemble import RandomForestClassifier

# Load the trained model
model = pickle.load(open('model.pkl', 'rb'))

# Feature input function
def get_user_input():
    st.sidebar.subheader("🌡️ Enter Environmental Factors")
    temp = st.sidebar.number_input("🌡️ Temperature (°C)", min_value=-10, max_value=50, value=25)
    oxygen = st.sidebar.number_input("💨 Oxygen Level (%)", min_value=10, max_value=30, value=21)
    humidity = st.sidebar.number_input("💧 Humidity (%)", min_value=0, max_value=100, value=60)
    wind_speed = st.sidebar.number_input("🌬️ Wind Speed (km/h)", min_value=0, max_value=50, value=10)
    pressure = st.sidebar.number_input("⚖️ Pressure (hPa)", min_value=900, max_value=1050, value=1013)
    altitude = st.sidebar.number_input("🗻 Altitude (meters)", min_value=0, max_value=5000, value=200)
    return np.array([[temp, oxygen, humidity, wind_speed, pressure, altitude]])

# Prediction function
def predict_fire_risk(features):
    prediction = model.predict(features)
    confidence = round(model.predict_proba(features)[0][1] * 100, 2)
    return prediction, confidence

# Sample data for visualization
def get_sample_data():
    return pd.DataFrame({
        "Temperature": [25, 30, 35, 20, 22, 28, 40, 15],
        "Oxygen": [21, 19, 18, 22, 20, 21, 17, 23],
        "Humidity": [60, 65, 55, 70, 75, 80, 50, 85],
        "Wind Speed": [10, 12, 8, 6, 15, 14, 20, 5],
        "Fire Risk": [0, 1, 1, 0, 0, 1, 1, 0]
    })

# Data visualization
def show_visualizations():
    st.subheader("📊 Data Visualization")
    df = get_sample_data()
    
    # Correlation Heatmap
    fig, ax = plt.subplots(figsize=(8,6))
    sns.heatmap(df.corr(), annot=True, cmap='coolwarm', fmt='.2f', ax=ax)
    st.pyplot(fig)
    
    # Feature Distribution
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    sns.histplot(df['Temperature'], kde=True, ax=axes[0,0], color='blue').set(title="🌡️ Temperature Distribution")
    sns.histplot(df['Oxygen'], kde=True, ax=axes[0,1], color='green').set(title="💨 Oxygen Level Distribution")
    sns.histplot(df['Humidity'], kde=True, ax=axes[1,0], color='purple').set(title="💧 Humidity Distribution")
    sns.histplot(df['Wind Speed'], kde=True, ax=axes[1,1], color='orange').set(title="🌬️ Wind Speed Distribution")
    st.pyplot(fig)

# Streamlit UI
def main():
    st.title("🔥 Forest Fire Risk Prediction 🌲")
    st.write("**A beginner-friendly Machine Learning project for Forest Fire Prediction! 🚀**")
    st.write("🔹 Enter environmental factors and check the risk of a forest fire!")
    
    # Sidebar
    st.sidebar.title("🔍 Fire Prediction Tool")
    st.sidebar.markdown("Enter environmental parameters and analyze fire risk instantly! 🔥")
    features = get_user_input()
    
    if st.sidebar.button("🔮 Predict Fire Risk"):
        with st.spinner("Analyzing risk... 🔍"):
            time.sleep(2)  # Simulating processing time
            prediction, confidence = predict_fire_risk(features)
        
        confidence_color = "red" if prediction == 1 else "green"
        
        # Display Prediction
        st.sidebar.subheader("🔥 Prediction Result")
        if prediction == 1:
            st.sidebar.error("🔥 **Fire Risk:** The forest is at risk of fire!")
            st.sidebar.write("💡 **Prevention Tips:**")
            st.sidebar.write("- 💧 Increase water sources around the area.")
            st.sidebar.write("- 🔥 Clear dry leaves and brush that could easily catch fire.")
            st.sidebar.write("- 🚷 Avoid making open flames or fires in the area.")
            st.sidebar.write("- 🌲 Create firebreaks by clearing vegetation to prevent fire spread.")
        else:
            st.sidebar.success("✅ **Safe:** The forest is safe for now.")
        
        st.sidebar.metric(label="🔥 **Confidence Level**", value=f"{confidence}%", delta="High Risk" if prediction == 1 else "Safe")
        
        # Show Visualizations
        show_visualizations()
    
    # Footer
    st.markdown("""
    ---
    ### 🚀 Developed by [Atharva Soundankar](https://www.linkedin.com/in/atharva-soundankar/) &copy; 2025  
    🔥 **Stay Safe, Prevent Forest Fires!** 🌲
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()

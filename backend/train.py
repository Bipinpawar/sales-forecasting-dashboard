import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import numpy as np
import os

os.makedirs('model', exist_ok=True)

data = pd.read_csv('data/sales.csv')

# Convert date to number
data['date'] = pd.to_datetime(data['date'])
data['day'] = (data['date'] - data['date'].min()).dt.days

X = data[['day']]
y = data['sales']

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, 'model/model.pkl')
print("Sales model trained!")
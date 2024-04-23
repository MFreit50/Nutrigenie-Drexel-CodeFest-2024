import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
from food_dataset import search_food
import csv

# Define neural network model
class FoodRecommender(nn.Module):
    def __init__(self, input_size, hidden_size):
        super(FoodRecommender, self).__init__()
        self.input_layer = nn.Linear(input_size, hidden_size)
        self.activation_function = nn.ReLU()    # Rectified Linear Unit
        self.hidden_layer = nn.Linear(hidden_size, input_size)
    
    def forward(self, x):
        x = self.input_layer(x)
        x = self.activation_function(x)
        x = self.hidden_layer(x)
        return x
    
    '''                     Database Format
    column number:      0          1          2        3      4
    parameter:      food name   protein carbohydrates fat nutriscore
    '''

#Read from database to train AI
def read_csv(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)

        # Skip header
        next(reader)

        #Parameters
        food_names = []
        food_nutrition_facts = []
        nutri_scores = []
        for row in reader:
            food_names.append(row[0])
            food_nutrition_facts.append([float(val) for val in row[1:4] if val.strip()])
            nutri_scores.append(float(row[4]))

    return torch.tensor(food_nutrition_facts, dtype=torch.float32), food_names, torch.tensor(nutri_scores, dtype=torch.float32)

# Load food data from CSV file
file_path = 'project_database.csv'
food_nutrition_facts, food_names, nutri_scores = read_csv(file_path)

#Combine food nutrition facts and nutri score into one tensor
food_data = torch.cat((food_nutrition_facts, nutri_scores.unsqueeze(1)), dim=1)

#Split data into training and validation sets
X_train, X_val = train_test_split(food_data, test_size=0.2, random_state=42)

# Hyperparameters
input_size = X_train.shape[1]   # Number of features (P, F, C, Nutri-grade)
hidden_size = 11                # Number of neurons in hidden layer
model = FoodRecommender(input_size, hidden_size)
criterion = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.001)
epochs = 10000                  # Number of training iterations

for epoch in range(epochs):
    # Forward pass
    outputs = model(X_train)

    # Calculate loss: MSE between outputs and inputs
    loss = criterion(outputs, X_train)

    # Backward pass and optimization
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if (epoch+1) % 100 == 0:
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

# Model validation
with torch.no_grad():
    val_outputs = model(X_val)
    val_loss = criterion(val_outputs, X_val)
    print(f'Validation Loss: {val_loss.item():.4f}')

# Find the best match for a custom input food item
input_food = torch.tensor(search_food("Plain Yogurt"), dtype=torch.float32)  # Add nutri-grade value here

#Cosine similarity between the input food item and each food item in the dataset
similarity_scores = cosine_similarity(input_food.unsqueeze(0), food_data)

# Convert the cosine similarity array to a PyTorch tensor
similarity_scores_tensor = torch.tensor(similarity_scores)

# Apply nutri-score weights to cosine similarity scores
weighted_similarity_scores = similarity_scores_tensor * nutri_scores.unsqueeze(0)

top_matches_index = torch.topk(weighted_similarity_scores, k=10)
top_matches_indices = top_matches_index.indices[0].tolist()
best_matches_names = [food_names[i] for i in top_matches_indices]

print("Best matches index:", best_matches_names)
torch.save(model.state_dict(), 'food_recommender_model.pth')
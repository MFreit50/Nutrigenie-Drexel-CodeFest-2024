import torch
import torch.nn as nn
from src.AI.food_dataset import dataset, search_food, load_dataset
from sklearn.metrics.pairwise import cosine_similarity

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

food_nutrition_facts, food_names, nutri_scores = load_dataset(dataset)

#Combine food nutrition facts and nutri score into one tensor
food_data = torch.cat((food_nutrition_facts, nutri_scores.unsqueeze(1)), dim=1)

#Load the model
model = FoodRecommender(input_size=4, hidden_size=11)  # Assuming input_size and hidden_size are known
model.load_state_dict(torch.load('food_recommender_model.pth'))
model.eval()

def recommend_food(input_food_name, number_of_recommendations):
    #Find the best match for the input food item
    input_food = torch.tensor(search_food(input_food_name), dtype=torch.float32)  # Add nutri-grade value here
    #Cosine similarity between the input food item and each food item in the dataset with nutri-score weights
    weighted_similarity_scores = torch.tensor(cosine_similarity(input_food.unsqueeze(0), food_data)) * nutri_scores.unsqueeze(0)

    recommendation_indices = torch.topk(weighted_similarity_scores, number_of_recommendations+1).indices[0, 1:].tolist()
    recommendation_names = [food_names[i] for i in recommendation_indices]

    return recommendation_names
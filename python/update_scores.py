import pymongo
import requests

# MongoDB connection setup
client = pymongo.MongoClient("mongodb+srv://draftfantasy:draftfantasy123@uat.qhdnt.mongodb.net/UAT?retryWrites=true&w=majority")
print(client)
db = client["UAT"]
collection = db["match"]


# filter by : stage, round, league, 


# # API endpoint and headers
# api_url = "https://api.example.com/scores"
# headers = {
#     "Authorization": "Bearer YOUR_API_KEY"
# }

# # Fetch data from the API
# response = requests.get(api_url, headers=headers)
# if response.status_code == 200:
#     scores_data = response.json()
# else:
#     print("Failed to fetch data from API")
#     scores_data = []

# # Update MongoDB with the fetched data
# for score in scores_data:
#     query = {"player_id": score["player_id"]}
#     new_values = {"$set": {"score": score["score"]}}
#     collection.update_one(query, new_values, upsert=True)

# print("Scores updated successfully!")

# Imports
import pymongo
import requests

# Variables
connection_string = "mongodb+srv://draftfantasy:draftfantasy123@uat.qhdnt.mongodb.net/UAT?retryWrites=true&w=majority"
db = "UAT"
collection = "gameweeks"
seasonID = "23690"
api_url = "https://api.sportmonks.com/v3/football/rounds/seasons/"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": "r12ehV6MXGs916TGG0VGNrbH0IFi6VxACO0Z3UnOvGrhAI93jKrQs2Y4wIY3",
}

# MongoDB connection setup
client = pymongo.MongoClient(connection_string)
mongo_db = client[db]
mongo_collection = mongo_db[collection]


# Fetch data from the API
full_URL = api_url + seasonID
response = requests.get(full_URL, headers=headers, verify=False)
if response.status_code == 200:
    gameweek_data = response.json()
else:
    print("Failed to fetch data from API")
    gameweek_data = []
gameweek_array = gameweek_data["data"]


# Update MongoDB with the fetched data
for gameweek in gameweek_array:
    query = {
        "id": gameweek["id"],
        "seasonID": seasonID,
        "name": gameweek["name"],
        "finished": gameweek["finished"],
        "is_current": gameweek["is_current"],
        "starting_at": gameweek["starting_at"],
        "ending_at": gameweek["ending_at"],
        "games_in_current_week": gameweek["games_in_current_week"],
    }
    mongo_collection.insert_one(query)


print("gameweek updated successfully!")

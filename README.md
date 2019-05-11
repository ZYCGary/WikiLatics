# WikiLatic_2
## How to run this App?
1. Clone the repository to a local document (Github Desktop is recommended)
2. Open the file with **VS Code**
3. Input `npm install` in the plugged-in terminal
4. Open MongoDB port: `sudo mongod`
4. Open **bin**
5. Run **www**
6. Vist **http://localhost:3000** in chrome
## How to analyse data
**Before analysing data, you need to initialise data at first:**
### Initialise articles data
1. Go to directory *public/dataset/revisions*
2. Import all JSON files of articles into MongoDB  
(Note: each JSON file would be a collection in the Database with a same name as the JSON file)    

:bangbang: If an article file name is ended with "." (eg: "F.C."), it could not have a same when it is imported into collection, as it is not allowed to name a collection with a name ended with ".". In this case, you need to delete the "." at the tail and then import it. (Don't worry~ The code could perfectly map these "special" collections~)
### Initialise editors(admins & bots) data
1. Create a collection named **admins**, and import *Admin.txt* into it
2. Create a collection named **bots**, and import *Bot.txt* into it
### Now, you are ready for the initialisation
### Last step: Go to **http://localhost:3000/init**, the initialisation will automatically execute, and direct you back to the homepage (You can check the execution process in the console board)
### Now, you can use all the functionalities and analyse the data! :beers:

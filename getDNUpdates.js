"use strict";
// Modules
var http = require("http");
var fs = require("fs");
var DesignNote = require ("./designNotes.js");
// Variables
const pageUrl = "http://www.dragonfable.com/gamedesignnotes/"
const lastCheckLocation = "./lastCheck.json"
var codeString = "";
//DEBUG: this variable helps with debugging the code, forcing it to skip some updates
var delay = 1;

var response = http.get(pageUrl, function(response){
	// The page html code will be received as a text string
	response.setEncoding("utf8");
	response.on("error", console.error);
	// The data is stored in a global variable
	response.on("data", function(data){
		codeString += data;
	});
	// When the entire page code has been received, the info will be analyzed
	response.on("end", function(){
		// split code between DN posts
		var stringArray = codeString.split("<td align=\"center\" valign=\"top\">");
		var currentPosts = [];
		if(process.argv.length == 3)
			delay = process.argv[2];
		// Ignores the first code block, as it contains no relevant info for this
		//DEBUG: delay will always be 1, unless a command line argument is used for debugs
		for(var i = delay; i < stringArray.length; i++){
			// Create an array with all the posts contained in the html code
			currentPosts[i-delay] = new DesignNote(stringArray[i]);
		}
		
		// Loads the last saved design notes list from json file
		try{
			var fileArray = JSON.parse(fs.readFileSync(lastCheckLocation));
		}catch(error){
			// If the file does not exist, creates a file with an empty array and opens it
			if(error.code === "ENOENT"){
				console.log(lastCheckLocation + " was not found, creating the file with an empty array...");
				var emptyArray = [];
				fs.writeFileSync(lastCheckLocation, JSON.stringify(emptyArray));
				fileArray = JSON.parse(fs.readFileSync(lastCheckLocation));
			}else throw error;
		}
		// Creates an array of DesignNote class elements to store the file contents (should be unnecessary honestly)
		var lastCheckPosts = [];
		for(var i = 0; i < fileArray.length; i++){
			lastCheckPosts[i] = new DesignNote("");
			lastCheckPosts[i].Copy(fileArray[i]);
		}

		// Compares with current posts, and prints all new posts, ignoring duplicates
		for(var i = 0; i < currentPosts.length; i++){
			var newPost = true;
			for(var j = 0; j < lastCheckPosts.length && newPost; j++){
				if(lastCheckPosts[j].Equals(currentPosts[i]))
					newPost = false;
			}
			if(newPost){
				//TO DO
				//Format a discord embed and send it somewhere as a string
				//DEBUG: Write a notification when a new post is detected
				console.log("\n===========================================================================================\n\tNew design notes by " + currentPosts[i].author + " detected!\tDate: "+ currentPosts[i].date + "\n\tText:\n" + currentPosts[i].text + "\n\tAuthor Icon: " + currentPosts[i].authorImage + "\n\tLink to the post: " + currentPosts[i].link + "\n\tImages in this post:");
				for(var k = 0; (currentPosts[i].imageLinks != null) && (k < currentPosts[i].imageLinks.length); k++){
					console.log("\t\t" + currentPosts[i].imageLinks[k]);
				}
			}
		}
		
		// Saves current list to file
		fs.writeFileSync(lastCheckLocation, JSON.stringify(currentPosts));
	});
}).on("error", console.error);

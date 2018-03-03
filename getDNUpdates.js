"use strict";
// Modules
var http = require("http");
var fs = require("fs");
var DesignNote = require ("./designNotes.js");
var Discord = require("discord.js");
// Variables
const pageUrl = "http://www.dragonfable.com/gamedesignnotes/"
var codeString = "";
const lastCheckLocation = "./lastDNs.json";
module.exports.historyLocation = lastCheckLocation;
module.exports.timeout = 5 * 60 * 1000;
module.exports.numParagraphs = 2;
//DEBUG: these variables help with debugging the code, forcing it to skip some updates
var delay = 1;
var debug = 0;

function getDNs(channel){
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
			console.log("analising page...");
			// split code between DN posts
			var stringArray = codeString.split("<td align=\"center\" valign=\"top\">");
			var currentPosts = [];
			// Ignores the first code block, as it contains no relevant info for this
/*	
			//DEBUG: delay will always be 1, unless a command line argument is used for debugs
			if(process.argv.length == 3)
				delay = process.argv[2];
*/
			DesignNote.numParagraphs = module.exports.numParagraphs;
			for(var i = delay; i < stringArray.length; i++){
				// Create an array with all the posts contained in the html code
				currentPosts[i-delay] = new DesignNote(stringArray[i]);
			}

			// Loads the last saved design notes list from json file
			try{
				var fileArray = JSON.parse(fs.readFileSync(lastCheckLocation));
			}catch(error){
				// If the file does not exist, creates a file with the currentDNs array and
				// makes a check with the two equal strings, printing nothing
				if(error.code === "ENOENT"){
					console.log(lastCheckLocation + " was not found, creating the file with the currentPosts array...");
					fs.writeFileSync(lastCheckLocation, JSON.stringify(currentPosts));
					fileArray = JSON.parse(fs.readFileSync(lastCheckLocation));
				}else throw(error);
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
					//Format a discord embed and send it to the desired channel
					var embed = new Discord.RichEmbed();
					embed.setTitle(currentPosts[i].title);
					embed.setURL(currentPosts[i].link);
					embed.setDescription(currentPosts[i].summary);
					// If the string can be parsed and converted to ISO8601 format this should work, commented for now
					//embed.setTimestamp(currentPosts[i].date);
					if(currentPosts[i].imageLinks.length > 0)
						embed.setImage(currentPosts[i].imageLinks[0]);
					// Send the embed created
					channel.send({embed});
				}
			}
			// Saves current list to file
			fs.writeFileSync(lastCheckLocation, JSON.stringify(currentPosts));
			// Run the command again after timeout
			console.log("going again in " + module.exports.timeout + " miliseconds...")
			setTimeout(getDNs, module.exports.timeout, channel);
		});
	}).on("error", console.error);
}
module.exports.getdns = getDNs;

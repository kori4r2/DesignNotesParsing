// These variables should be set with the corresponding channel IDs (gotten through discord developer mode)
const errorChannelID = "ChannelID 1";
const logsChannelID = "ChannelID 2";
// This variable stores the roles allowed to change dn check configuration
const allowedRoles = ["Example1", "Example2"];
// This variables contains the character used to indicate the bot commands
const commChar = "+";

function hasPermission(member){
	boolean allowed = false;
	for(var i = 0; !allowed && i < allowedRoles.length; i++){
		allowed = member.roles.find("name", allowedRoles[i]);
	}
	return allowed;
}

module.exports.run = function(client, message, args){
	let errorLog = client.channels.get(errorChannelID);
	let commandLog = client.channels.get(logsChannelID);
	try {
		// Only allow this command for desired roles
		if (!(hasPermission(message.member))) {
			message.channel.send("You do not have permissions to use this command.");
			commandLog.send(message.author.username + " tried to alter DN check settings with option: " + args[0] + ".");
			return;
		}
		// If no arguments are passed when calling the command, list possible options
		if(args.length < 1){
			var string = "The valid uses for this command are:\n";
			string += "\t•`"+commChar+"dncheck status` shows current settings for dn check\n";
			// As stated below, delete is broken, but was useful for debugging, so it stays commented here
//			string += "\t•`"+commChar+"dncheck delete` deletes current saved history of DN posts checked (THIS WILL CAUSE SPAM!)\n";
			string += "\t•`"+commChar+"dncheck timeout X` where X is a number representing minutes, changes the timeout between checks (Ex.: `+dncheck timeout 5`)\n";
			string += "\t•`"+commChar+"dncheck numParagraphs X` where X is the number of paragraphs to be saved, counting from the start of the DN posts checked";
			message.channel.send(string);
			return;
		}
		var getnDNUpdates = require("../node_modules/getDNs/getDNUpdates.js");
		switch (args[0]) {
			case "status":
				// Send current settings to target channel
				message.channel.send("Getting first "+ getnDNUpdates.numParagraphs + " paragraphs of DNs every " + (getnDNUpdates.timeout)/1000/60 + " minutes.");
				break;
/*
			// Yeah, this thing is broken, was only useful for debugging the other options
			case "delete":
				message.channel.send("Deleting history of checked Design Note posts...");
				var emptyArray = [];
				var fs = require("fs");
				fs.writeFileSync(getnDNUpdates.historyLocation, JSON.stringify(emptyArray));
				break;
*/
			case "timeout":
				// Checks if the correct number of arguments was passed, sends instructions if wrong
				if(args.length < 2){
					message.channel.send("Not enough arguments, correct use is: `+dncheck timeout X` where X is number of minutes for timeout between checks.");
				}else{
					// Checks if the argument passed is a number, sends instructions if wrong
					var parsed = parseInt(args[1], 10);
					if(isNaN(parsed)){
						message.channel.send("Second argument must be a number, correct use is: `+dncheck timeout X` where X is number of minutes for timeout between checks.");
					}else{
						// Shows a warning if the number passed is invalid
						var warning = "";
						if(parsed <= 0){
							warning = "(minimum value is 1 minute)";
							parsed = 1;
						}
						getnDNUpdates.timeout = 1000*60*parsed;
						message.channel.send("Design notes will now be checked every " + args[1] + " minutes" + warning + ".");
						commandLog.send(message.author.username + " set design notes check timeout to " + args[1] + " minutes.");
					}
				}
				break;
			// I'm gonna allow a few typos for this one, its really easy to make a mistake here
			case "numparagraph":
			case "numParagraph":
			case "numparagraphs":
			case "numParagraphs":
				// Checks if the correct number of arguments was passed, sends instructions if wrong
				if(args.length < 2){
					message.channel.send("Not enough arguments, correct use is: `+dncheck numParagraphs X` where X is number of paragraphs to be taken from design notes.");
				}else{
					// Checks if the argument passed is a number, sends instructions if wrong
					var parsed = parseInt(args[1], 10);
					if(isNaN(parsed)){
						message.channel.send("Second argument must be a number, correct use is: `+dncheck numParagraphs X` where X is number of paragraphs to be taken from design notes.");
					}else{
						// Shows a warning if the number passed is invalid
						var warning = "";
						if(parsed <= 0){
							warning = "(minimum value is 1 paragraph)";
							parsed = 1;
						}
						getnDNUpdates.numParagraphs = parsed;
						message.channel.send("Design notes check will now get the first " + args[1] + " paragraphs" + warning + ".");
						commandLog.send(message.author.username + " set design notes check numParagraphs to " + args[1] + ".");
					}
				}
				break;
			default:
				message.channel.send("Invalid option, please try `+dncheck` without arguments to see valid options");
				break;
		}
	} catch(e) {
		errorLog.send(e);
	}
}

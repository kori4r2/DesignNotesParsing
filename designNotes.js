"use strict";

const prefix = "http://www.dragonfable.com";
var linkAux = "";
var paragraphsCounter = 0;
var parStarted = false;
var parEnded = false;
const summaryMaxChars = 500;
module.exports.numParagraphs = 2;

function processHTMLTag(tag){
	// Get the element described by this tag
	var element = tag.split(/[^A-Za-z]/).filter(Boolean)[0];
	var i, j, k;
	// Each case of this switch statement interprets one command
	switch(element){
		case "br":
			// Return line break character
			return "\n";
		case "p":
			paragraphsCounter++;
			// In case of paragraph definition, adds line break
			// and store if it's an end or a start of paragraph
			if(tag.indexOf("/") > -1){
				parEnded = true;
				return "\n";
			}else{
				parStarted = true;
				return "";
			}
		case "li":
			// In case of a list, adds the bulletpoint character and tab spacing or line break as needed
			if(tag.indexOf("/") > -1)
				return "";
			else
				return "\t• ";
			break;
/*
		// Didn't work out very well, removed
		case "ul":
			// When indicating beginning of list, add a line break
			if(tag.indexOf("/") > -1)
				return "";
			else
				return "\n";
*/
		case "a":
			// When ending link, add the address as per discord rich embed syntax
			if((tag.indexOf("/") > -1) && (tag.indexOf("/") < tag.indexOf("a"))){
				return "](" + linkAux + ")";
			// When beginning link, store the address and add the character required for discord rich embed
			}else{
				i = tag.indexOf("href");
				j = tag.indexOf("\"", i);
				k = tag.indexOf("\"", j+1);
				linkAux = tag.substring(j+1, k);
				return "[";
			}
		case "img":
			return "\b";
		case "hr":
			// In case of thematic break adds two line breaks,
			// I didn't have a better idea that looks good
			return "\n\n";
		case "strong":
			// For the strong tag, use discord's bold markdown
			return "**";
/* 
		// Just leaving this here to facilitate adding more elements
		case "":
			break;
*/
		default:
			return "";
	}
}

function cleanHTMLCode(string){
	var cleanString = "";
	var curPos = 0;
	var curParagraph = 0;
	var nextCommand = string.indexOf("<");
	var indexOfSummary = 0;
	var previousLength = 0;
	paragraphsCounter = 0;

	while(nextCommand > -1){
		// Append text to cleanString variable
		cleanString += string.substring(curPos, nextCommand);
		// Get the index of the html element end
		curPos = 1 + string.indexOf(">", nextCommand);
		var tag = string.substring(nextCommand+1, curPos-1);
		// If it's a link, check if it's the only content of a paragraph (curse those lovecraftian beings and their cryptic previews)
		if(tag.split(/[^A-Za-z]/).filter(Boolean)[0] == "a" && tag.indexOf("/") > tag.indexOf("a")){
			// If the link is the first thing inside the paragraph
			if(previousLength - cleanString.length <= 2){
				// Skips the <a> tag being analysed
				var i = string.indexOf("<", curPos);
				var j = string.indexOf(">", i);
				// Gets the next tag after the <a> tag (should be a </p> on the relevant cases)
				i = string.indexOf("<", j);
				// Gets the content between these two tags
				var paragraphContent = (i-1) - (j+1);
				j = string.indexOf(">", i);
				// Temporarily saves the next tag
				var tempTag = string.substring(i+1, j);
				// If the next tag is indeed a </p> tag and there are no other characters between then
				if(tempTag.split(/[^A-Za-z]/).filter(Boolean)[0] == "p" && tempTag.indexOf("/") > -1 && paragraphContent <= 2){
					// Updatee variables to skip this paragraph entirely, ignoring the link
					nextCommand = i;
					curPos = j + 1;
					tag = tempTag;
				}
			}
		}
		// Process the element
		cleanString += processHTMLTag(tag);
		// If an end or beginning of paragraph was detected
		if(paragraphsCounter <= module.exports.numParagraphs && paragraphsCounter > curParagraph){
			// In case of paragraph end
			if(parEnded){
				parEnded = false;
				// Checks if the paragraph has a valid size
				if((cleanString.length - previousLength) > 4){
					// Updates the counter
					curParagraph = paragraphsCounter;
					// Stores index of current position
					indexOfSummary = cleanString.length;
					// Makes sure the counter is not decremented
					paragraphsCounter++;
				}
				// If the paragraph is invalid, decrement counter
				paragraphsCounter--;
			}
			// In case of paragraph start
			if(parStarted){
				parStarted = false;
				// Updates length on beginning of paragraph to allow checking of size
				previousLength = cleanString.length;
				// Decrement counter
				paragraphsCounter--;
			}
		}
		// Look for next html element
		nextCommand = string.indexOf("<", curPos);
	}
	cleanString += string.substring(curPos);
	// If the entire DN is one big paragraph above the limit, save everything
	if(curParagraph  == 0){
		indexOfSummary = cleanString.length;
	}
	// Returns the clean string and the position where the summary should end
	return [cleanString, indexOfSummary];
}

function parseDNs(array, string){
	var i, j, k;
	// Get link to author's icon
	i = string.indexOf("img src=");
	j = string.indexOf("\"", i);
	k = string.indexOf("\"", j+1);
	array[1] = prefix + string.substring((j+1), k);
	// Get author name
	i = string.indexOf("a href=\"/gamedesignnotes/tag/", 3);
	j = string.indexOf(">", i);
	k = string.indexOf("<", j);
	array[0] = string.substring((j+1), k);
	// Get date of post
	i = string.indexOf("class=\"dateStyle\"", k);
	j = string.indexOf(">", i);
	k = string.indexOf("<", j);
	array[2] = string.substring((j+1), k);
	// Get link to the DNs
	i = string.indexOf("a href=\"/gamedesignnotes/", k);
	j = string.indexOf("\"", i);
	k = string.indexOf("\"", j+1);
	array[3] = prefix + string.substring((j+1), k);
	// Get DNs title
	j = string.indexOf(">", k);
	k = string.indexOf("</a>", j);
	array[4] = string.substring((j+1), k);
	// Get text string
	i = string.indexOf("<p>", k);
	j = string.indexOf(">", i);
	k = string.indexOf("<font color", j);
	array[5] = string.substring((j+1), k);
	// Creates placeholder for summary, to make sure its on the 7th position of the array
	array[6] = "placeholder";
	// Stores all the image links inside the DN text at the end of the array
	i = array[5].indexOf("<img");
	while(i > -1){
		j = array[5].indexOf("src", i);
		j = array[5].indexOf("\"", j);
		k = array[5].indexOf("\"", j+1);
		array.push(array[5].substring((j+1), k));
		i = array[5].indexOf("<img", k);
	}
	// Cleans html code from the DN text, replacing links with discord embed syntax
	var auxArr = [];
	auxArr = cleanHTMLCode(array[5]);
	// Applies \b characters inserted in place of images
	// (Images usually have line breaks before and after them, this avoids creating weird empty lines)
	i = auxArr[0].indexOf("\b");
	while(i > -1){
		auxArr[0] = auxArr[0].substring(0, i-1) + auxArr[0].substring(i+2);
		if(i < auxArr[1])
			auxArr[1] -= 3;
		i = auxArr[0].indexOf("\b");
	}
	// Saves text and summary to respective array positions
	array[5] = auxArr[0];
	i = auxArr[1];
	array[6] = array[5].substring(0, i);
}

module.exports = class DesignNote{
	constructor(string){
		if(string == "" || string == null){
			// Empty constructor
			this.author = "author";
			this.authorImage = "authorImage";
			this.date = "date";
			this.link = "link";
			this.title = "title";
			this.text = "text";
			this.summary = "summary";
			this.imageLinks = ["image", "links"];
		}else{
			// Parsing constructor
			var array = [];
			// Parse the string for all information
			parseDNs(array, string);
			// Save info to object
			this.author = array[0];
			this.authorImage = array[1];
			this.date = array[2];
			this.link = array[3];
			this.title = array[4];
			this.text = array[5];
			this.summary = array[6];
			this.imageLinks = array.slice(7);
		}
	}

	// Copy contents of an object (not necessarily of this class)
	Copy(other){
		// Checks if the other object has the fields for comparison
		if(other.hasOwnProperty("author") && other.hasOwnProperty("date") && other.hasOwnProperty("link") && other.hasOwnProperty("title") && other.hasOwnProperty("text") && other.hasOwnProperty("authorImage") && other.hasOwnProperty("imageLinks") && other.hasOwnProperty("summary")){
			// Copies all fields
			this.author = other.author;
			this.authorImage = other.authorImage;
			this.date = other.date;
			this.link = other.link;
			this.title = other.title;
			this.text = other.text;
			this.summary = other.summary;
			this.imageLinks = other.imageLinks;
		}else{
			console.error("Object passed for copying does not have the necessary properties");
		}
	}

	// Compares the fields of two objects
	Equals(other){
		// Checks if the other object has the fields for comparison
		if(other.hasOwnProperty("author") && other.hasOwnProperty("date") && other.hasOwnProperty("link") && other.hasOwnProperty("title") && other.hasOwnProperty("text") && other.hasOwnProperty("authorImage") && other.hasOwnProperty("imageLinks") && other.hasOwnProperty("summary")){
			// Compares relevant fields
			if((this.author != other.author))
				return false;
			if((this.date != other.date))
				return false;
			if((this.link != other.link))
				return false;
			if((this.title != other.title))
				return false;
			// Commenting these last comparisons because they seem unnecessary
			// (Also because I'd have to recreate the json file everytime after changing the text parsing method)
			/*
			if((this.text != other.text))
				return false;
			if((this.summary != other.summary))
				return false;
			*/
		}else{
			console.error("Object passed for comparison does not have the necessary properties");
		}
		return true;
	}
};

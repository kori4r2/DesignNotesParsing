"use strict";

var prefix = "www.dragonfable.com";
var linkAux = "";
var imageCounter = 0;

function processHTMLTag(tag){
	// Get the element described by this tag
	var element = tag.split(/[^A-Za-z]/).filter(Boolean)[0];
	var i, j, k;
	switch(element){
		case "br":
			// Return line break character
			return "\n";
		case "p":
			// In case o paragraph definition, adds line break
			if(tag.indexOf("/") > -1)
				return "\n";
			else
				return "";
		case "li":
			// In case of a list, adds the bulletpoint character and tab spacing or line break as needed
			if(tag.indexOf("/") > -1)
				return "";
			else
				return "\t• ";
			break;
		case "ul":
			// When indicating beginning of list, add a line break
			if(tag.indexOf("/") > -1)
				return "";
			else
				return "\n";
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
			// In case of image, try to get the title
			var title = "";
			i = tag.indexOf("title");
			if(i > -1){
				j = tag.indexOf("\"", i);
				k = tag.indexOf("\"", j+1);
				title = tag.substring(j+1, k);
			}
			// If there is no title, change title string to indicate so
			if(title == "")
				title = "No title"
			// Return a placeholder for the image
			imageCounter++;
			return"[Image " + imageCounter + " (\""+ title +"\")]";
		case "hr":
			// In case of thematic break
			return "\n\n";
		case "strong":
			// For the string tag, use discord's bold markdown
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
	var nextCommand = string.indexOf("<");
	while(nextCommand > -1){
		// Append text to cleanString variable
		cleanString += string.substring(curPos, nextCommand);
		// Get the index of the html element end
		curPos = 1 + string.indexOf(">", nextCommand);
		// Process the element
		cleanString += processHTMLTag(string.substring(nextCommand+1, curPos-1));
		// Look for next html element
		nextCommand = string.indexOf("<", curPos);
	}
	cleanString += string.substring(curPos);
	return cleanString;
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
	// Stores all the image links inside the DN text inside the array
	i = array[5].indexOf("<img");
	while(i > -1){
		j = array[5].indexOf("src", i);
		j = array[5].indexOf("\"", j);
		k = array[5].indexOf("\"", j+1);
		array.push(array[5].substring((j+1), k));
		i = array[5].indexOf("<img", k);
	}
	// Cleans html code from the DN text, replacing links with discord embed sytax
	imageCounter = 0;
	array[5] = cleanHTMLCode(array[5]);
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
			this.imageLinks = array.slice(6);
		}
	}

	// Copy contents of an object (not necessarily of this class)
	Copy(other){
		// Checks if the other object has the fields for comparison
		if(other.hasOwnProperty("author") && other.hasOwnProperty("date") && other.hasOwnProperty("link") && other.hasOwnProperty("title") && other.hasOwnProperty("text") && other.hasOwnProperty("authorImage") && other.hasOwnProperty("imageLinks")){
			// Copies all fields
			this.author = other.author;
			this.authorImage = other.authorImage;
			this.date = other.date;
			this.link = other.link;
			this.title = other.title;
			this.text = other.text;
			this.imageLinks = other.imageLinks;
		}else{
			console.log("Object passed for copying does not have the necessary properties");
		}
	}

	// Compares the fields of two objects
	Equals(other){
		// Checks if the other object has the fields for comparison
		if(other.hasOwnProperty("author") && other.hasOwnProperty("date") && other.hasOwnProperty("link") && other.hasOwnProperty("title") && other.hasOwnProperty("text") && other.hasOwnProperty("authorImage") && other.hasOwnProperty("imageLinks")){
			// Compares relevant fields
			if((this.author != other.author))
				return false;
			if((this.date != other.date))
				return false;
			if((this.link != other.link))
				return false;
			if((this.title != other.title))
				return false;
			// Commenting this last comparison because it seems unnecessary
			// (Also because I'd have to recreate the json file after changing the text parsing method)
			/*
			if((this.text != other.text))
				return false;
			*/
		}else{
			console.log("Object passed for comparison does not have the necessary properties");
		}
		return true;
	}
};

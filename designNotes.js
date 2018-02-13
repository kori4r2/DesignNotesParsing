"use strict";

var prefix = "www.dragonfable.com"

function cleanHTMLCode(string){
	//TO DO
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
	cleanHTMLCode(array[5]);
	// j indicates beginning of DNs text, lets have k store it instead
	k = j;
	// Stores all the image links inside the DN text inside the array
	i = string.indexOf("<img src", k);
	while(i > -1){
		j = string.indexOf("\"", i);
		k = string.indexOf("\"", j+1);
		array.push(string.substring((j+1), k));
		i = string.indexOf("<img src", k);
	}
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

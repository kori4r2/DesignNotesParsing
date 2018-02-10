"use strict";

var prefix = "www.dragonfable.com"

function parseDNs(string, object){
	var array = [];
	// Parse the string
	array[0] = "1";
	array[1] = "2";
	array[2] = "3";
	array[4] = string;
	array[5] = "5";
	// Save info to object
	object.author = array[0];
	object.authorImage = array[1];
	object.link = array[2];
	object.title = array[3];
	object.text = array[4];
	object.imageLinks = array.slice(5);
}

module.exports = class DesignNote{
	constructor(string){
		parseDNs(string, this);
	}
};

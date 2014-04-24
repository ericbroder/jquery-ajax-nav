# jQuery AJAX Navigation Menu Plugin

## Summary
The purpose of this plugin is to enable a navigation menu to function via AJAX
without requiring new page loads.

It requests new content in JSON format, puts that data into a Handlebars template, 
then updates the HTML. It also keeps track of the active menu item, updates the 
title tag, and maintains normal browser support for back, forward, reload, and 
bookmark behavior.

## Dependencies
* [jQuery](http://jquery.com/)
* [History.js](https://github.com/browserstate/history.js/)
* [Handlebars.js](http://handlebarsjs.com/)

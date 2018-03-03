# DesignNotesParsing

Special thanks to [Cedrei](https://github.com/cedrei) because his bot was very useful for debugging and tweaking the modules

How to use:
  - Put the designNotes.js and the getDNUpdates.js files inside a folder for modules of the discord bot;
  - Call the getDNs exported function of getDNUpdates.js passing as parameter the channel where the DNs will be posted (type must be [Channel](https://discord.js.org/#/docs/main/stable/class/Channel));
  - Alter the dncheck.js file according to the comments in the first lines of the file and add its exported run method as a command for your bot;
  - If you are unhappy with the parameters set and don't want to set them manually everytime the bot reboots, change the parameters in the beginning of the getDNUpdates.js file according to the comments there;
  
Be sure to respect the selected license and enjoy the module!

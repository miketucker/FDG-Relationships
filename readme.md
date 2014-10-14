# Force Directed Graph Relationships #

View online: [http://miketucker.github.io/FDG-Relationships]()

This was originally used to demonstrate relationships between platforms and concepts in previous projects.


### Requirements for editing source files

- **Coffeescript**: for the source files


### Requirements for running editor

- **PHP**: for the editor to save data to JSON format, if you're using this locally, try installing MAMP

Note: the PHP part could easily be swapped out with a variety of options, it's only used to write the JSON to a file.


### To compile source:

`
coffee -j scripts/main.js -wc src/*.coffee
`
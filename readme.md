
# Zwanzigeins Skala ablesen

Ein kleines Applet, welches die Vorzüge der stellenwertgerechten Zahlensprechweise (Zwanzigeins statt Einundzwanzig) illustriert am Beispiel eines Gliedermaßstabs.

## How to install

* Install node.js from <https://nodejs.org>
* In the directory of the `package.json` file, run command window / terminal
* Run the command `npm i`. This will create the folder `./node_modules` and copy all required tools for building the app.

## How to build

* Run the command `npm run build`. This will create the folder `./out` and copy all transpiled output files there.

## How to develop

* Any text editor will do, but [VSCode](https://code.visualstudio.com) is strongly recommended.
* Important command for debugging is `npm run build:scripts:dev`, see `package.json`. This transpiles the TypeScript file with sourcemaps without uglifying, so the JavaScript code is readable.
	* One way to do this is running `npm run build:dev` which will generate all output files including the sourcemaps. This is recommended if you don't change the html and less files.
	* Each time you change files other than TypeScript, run `npm run build:html` for copying `.html` files and/or run `build:styles` for transpiling the less files to css.
	* You may want to use a separate command window for running `build:scripts:dev`, because this task will never finish. Instead, it watches for any changes in TypeScript files and builds them immediately.
* When all output files are generated, open `.out/index.html` in any browser. Chrome detects the sourceMaps and allows for breakpoints in `.src/*.ts`.

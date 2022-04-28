# Dynamite TS

## Instructions:
1. See the [Dynamite website](https://dynamite.softwire.com/) for the instructions.
2. Fork this repo and clone the new repo.
3. Edit the `src/index.ts` file to create your bot,
   - make sure your bot is a class with `module.exports = new MyClassName();` at the end of the file (you can replace `MyClassName` with the name of your class),
   - make sure you keep all the code you write in the `src/index.ts` file.
4. You can use the `start` run config (or the command `npm start`) to build your JS code and run your bot against `rockBot`.
5. You can use the command `npm run build-and-play-against -- <path-to-opponent-bot-JS-file>` to build your JS code and run your bot against another bot.
6. If you want to export your bot, run `npm run clean-build`: your bot will be compiled into the `dist/index.js` file which you can share with other people (or keep a copy of to use as a test opponent). 
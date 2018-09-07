const TotalENV = require('./totalenv')
const commands = ['toTotal', 'fillEnv']

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " path/to/directory <command>");
    console.log("commands: toTotal, fillEnv, default toTotal");

    process.exit(-1);
}

var path = process.argv[2];
var command = process.argv[3] ;
if (commands.indexOf(command) <0){
    command = commands[0]
}
console.log("run command ", command)
var totalENV = new TotalENV({
    path : path
});


totalENV[command]()



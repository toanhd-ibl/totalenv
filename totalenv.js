const fs = require('fs');
const readline = require('readline');
const DotENV = require('dotenv');

class TotalENV {
    constructor (options) {
        console.log("TotalENV::constructor")

        this.path = options.path;
        this.envFiles = [];
        this.totalFile = this.path + '/totalenv.txt';
        this.isHasTotal = false;
        this.configMapENVS = {};
        this.configMapTotal = {};

        this.checkFiles();
        this.readConfigMap();
    }

    checkFiles () {
        console.log("TotalENV::checkFiles")
        
        let items = fs.readdirSync(this.path) 
        for (var i=0; i<items.length; i++) {
            let item = items[i]
            if (/^\.env.*/.test(item)){
                this.envFiles.push(this.path + '/' + item)
            }
            if (this.totalFile == item){
                console.log(">>> already has totalenv.txt")
                this.isHasTotal = true;
            }
        }
    }

    readConfigMap () {
        console.log("TotalENV::getConfigMap")

        for (var i in this.envFiles){
            let envFile = this.envFiles[i];
            let configs = DotENV.config({path: envFile}).parsed
            Object.assign(this.configMapENVS, configs)
        }
        let configs = DotENV.config({path: this.totalFile}).parsed
        Object.assign(this.configMapTotal, configs)
    }

    getEnvs(){
        console.log("TotalENV::getEnvs")
        return this.envFiles
    }

    getLine(key, value) {
        return key + '=' + value + "\n";
    }

    envToTotal(){
        console.log("TotalENV::envToTotal")
        let lines = []
        for (var key in this.configMapENVS){
            let value = this.configMapENVS[key];
            lines.push( this.getLine(key, value))
        }
        lines.sort();

        for (var i in lines){
            let line = lines[i];
            fs.writeFileSync(this.totalFile, line,{flag: "a+"} )
        }
        
    }


    fillOneEnv(envFile) {
        console.log("TotalENV::fillOneEnv")
        let configMap = DotENV.config({path: envFile}).parsed
        let lines = fs.readFileSync(envFile, 'utf-8')
            .split('\n')
            .filter(Boolean);
        
        let newLines = []
        for (let i in lines){
            let line = lines[i]
            let newLine = null;
            console.log("line", line, typeof line)
            let tokens = line.split('=')
            let key = tokens[0];
            if (key && this.configMapTotal[key]){
                let value = this.configMapTotal[key]
                newLine = this.getLine(key, value)
            } else {
                newLine = line + "\n"
            }
            newLines.push(newLines)
        }

        console.log("newLines", newLines)

        fs.unlinkSync(envFile);

        for (var i in newLines){
            let line = newLines[i];
            fs.writeFileSync(envFile, line, {flag: "a+"} )
        }
    }

    fillEnv() {
        console.log("TotalENV::fillEnv")
        for (var i in this.envFiles){
            let envFile = this.envFiles[i];
            this.fillOneEnv(envFile)
        }
    }

    toTotal(){
        console.log("TotalENV::toTotal")
        if (this.isHasTotal){

        } else {
            this.envToTotal();
        }
    }


}

module.exports = TotalENV
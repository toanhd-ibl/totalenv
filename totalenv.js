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
        this.keyTotalNotUsed = {};
        this.checkFiles();
        this.readConfigMap();
        
        this.configMapENVSCopy = Object.assign({}, this.configMapENVS);
        this.configMapTotalCopy = Object.assign({}, this.configMapTotal);

        this.inTotalNotEnv = {}
        this.inEnvNotTotal = {}
        
    }



    checkFiles () {
        console.log("TotalENV::checkFiles")
        
        let items = fs.readdirSync(this.path) 
        for (var i=0; i<items.length; i++) {
            let item = items[i]
            if (/^\.env.*/.test(item)){
                this.envFiles.push(this.path + '/' + item)
            }
            if ('totalenv.txt' == item){
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

        for (let i in this.configMapTotal){
            if (!this.configMapENVS[i]){
                console.log("warning :: key total ", i , " not exits in envs")
            }
        }
        for (let i in this.configMapENVS){
            if (!this.configMapTotal[i]){
                console.log("warning :: key envs ", i , " not exits in total")
            }
        }

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

    addTotalKey(){
        console.log("TotalENV::addTotalKey")
        let configMap = DotENV.config({path: this.totalFile}).parsed
        let lines = fs.readFileSync(this.totalFile, 'utf-8')
            .split('\n')
            .filter(Boolean);
        
        let newLines = []
        for (let i in lines){
            let line = lines[i]
            let newLine = null;
            let tokens = line.split('=')
            let key = tokens[0];
            if (key && this.configMapENVS[key]){
                delete this.configMapENVSCopy[key];
                // let value = this.configMapENVS[key]
                // newLine = this.getLine(key, value)
                newLine = line + "\n"
            } else {
                newLine = line + "\n"
            }
            
            newLines.push(newLine)
        }

        fs.unlinkSync(this.totalFile);

        for (var i in newLines){
            let line = newLines[i];
            fs.writeFileSync(this.totalFile, line, {flag: "a+"} )
        }

        if (Object.keys(this.configMapENVSCopy).length > 0){
            console.log("new keys", this.configMapENVSCopy)
            let linesAppend = []

            for (var key in this.configMapENVSCopy){
                let value = this.configMapENVSCopy[key];
                linesAppend.push( this.getLine(key, value))
            }
            linesAppend.sort();

            for (var i in linesAppend){
                let line = linesAppend[i];
                fs.writeFileSync(this.totalFile, line,{flag: "a+"} )
            }
        }
        
    }

    

    fillOneEnv(envFile) {
        console.log("TotalENV::fillOneEnv", envFile)
        let configMap = DotENV.config({path: envFile}).parsed
        let lines = fs.readFileSync(envFile, 'utf-8')
            .split('\n')
            .filter(Boolean);
        
        let newLines = []
        for (let i in lines){
            let line = lines[i]
            let newLine = null;
            let tokens = line.split('=')
            let key = tokens[0];
            if (key && this.configMapTotal[key]){
                delete this.configMapTotalCopy[key];
                let value = this.configMapTotal[key]
                newLine = this.getLine(key, value)
            } else {
                newLine = line + "\n"
            }
            
            newLines.push(newLine)
        }

        fs.unlinkSync(envFile);

        for (var i in newLines){
            let line = newLines[i];
            fs.writeFileSync(envFile, line, {flag: "a+"} )
        }
    }

    fillEnv() {
        console.log("TotalENV::fillEnv")
        if (!this.isHasTotal) {
            console.log("Total file not found")
            return;
        }
        for (var i in this.envFiles){
            let envFile = this.envFiles[i];
            this.fillOneEnv(envFile)
        }

    }

    toTotal(){
        console.log("TotalENV::toTotal")
        if (this.isHasTotal){
            this.addTotalKey();
        } else {
            this.envToTotal();
        }
    }


}

module.exports = TotalENV
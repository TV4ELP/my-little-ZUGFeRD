const xml2js = require('xml2js');
const fs = require('fs');


let filePathList = process.argv.slice(2);
filePathList = ["invoice.xml"];
for(let i = 0; i < filePathList.length; i++){
    let data = readFile(filePathList[i]);
    console.log(data);

    let parser = new xml2js.Parser();
    parser.parseString(data, (err, res) => {
        let json = stripJson(res);
        saveFile(json);
    });
}


function readFile(filePath){
    console.log(filePath);
    let exists = fs.existsSync(filePath);
    if(exists){
        let data = fs.readFileSync(filePath);
        return data;
    }
    return null;
}

function stripJson(json){
    let newJSON = {"header": {},
                    "body" : {}
                };
    let doc = json['rsm:CrossIndustryInvoice'];
    let header = doc['rsm:ExchangedDocument'];

    //header should have one Object as Entry
    if(header.length != 1){
        return null
    }
    header = header[0];

    if('ram:ID' in header){
        newJSON.header.docNumber = header['ram:ID'][0];
    }

    if('ram:TypeCode' in header){
        newJSON.header.TypeCode = header['ram:TypeCode'][0];
    }

    if(header['ram:IssueDateTime'].length > 0){
        newJSON.header.issueDateTime = giveDateStr(header['ram:IssueDateTime']);
    }

    for(let i = 0; header['ram:IncludedNote'].length > i; i++){
        let includedObj = header['ram:IncludedNote'][i];
        if(includedObj['ram:SubjectCode'] != null){
            newJSON.header.SubjectCode = includedObj['ram:SubjectCode'][0];
        }
        let key = "content" + i;5
        newJSON.header[key] = includedObj['ram:Content'][0];
    }
}

function saveFile(json){

}

function giveDateStr(json){
    let timeObj = json[0];
    if(timeObj != null){
        let innerTimeObj = timeObj['udt:DateTimeString'];
        if(innerTimeObj.length > 0){
            return innerTimeObj[0]['_']
        }
    }
}
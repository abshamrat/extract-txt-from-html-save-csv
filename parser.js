const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const HTMLParser = require('node-html-parser');
const fs = require('fs');

const srcDir = './htmls/';
const outDir = './outputs/';
const header = [
    {id: 'q', title: 'question'},
    {id: 'ans', title: 'answer'},
    {id: 'op1', title: 'option1'},
    {id: 'op2', title: 'option2'},
    {id: 'op3', title: 'option3'},
    {id: 'ansOp', title: 'ansOption'}
];
const options = {
    path: null,
    header: header
};

function readFiles(dirname, onFileContent, onSuccess, onError) {
	try {
		const filenames = fs.readdirSync(dirname);
		for (let i = 0; i < filenames.length; i += 1) {
			const content = fs.readFileSync(dirname + filenames[i], 'utf-8');
			onFileContent(filenames[i], content);
		}
	} catch (error) {
		onError(error);
	}
	onSuccess();
}

readFiles(
    srcDir,
    async function(file, content) {
        options.path = `${outDir}${file.split('.html')[0]}.csv`;
        const csvWriter = createCsvWriter(options);
        let records = [];

        const html = HTMLParser.parse(content);
        const allQ = html.querySelectorAll('p');
    
        allQ.forEach(q => {
            const qs = q.text.split('\n');
            let ansTxt = null;
            let ansOp = '';
            try{
                ansTxt = html.querySelector(`#wrightwrongholder${ qs[0].trim().match(/(\d+)/g)[0]}`).text.replace(/(সঠিক উত্তর:|উত্তর:|\(\W\)|\W\.)/g, '').trim();
            }catch(ex) {}
    
            try{
    
                qs[0] = qs[0].trim().replace(/(\d+)\./g, '');
                qs[1] = qs[1].trim().replace(/(\(\W\)|\W\.|\r)/g, '');
                qs[2] = qs[2].trim().replace(/(\(\W\)|\W\.|\r)/g, '');
                qs[3] = qs[3].trim().replace(/(\(\W\)|\W\.|\r)/g, '');
                qs[4] = qs[4].trim().replace(/(\(\W\)|\W\.|\r)/g, '');
    
                if (ansTxt) {
                    if(qs[1].indexOf(ansTxt) > -1) {
                        ansOp = 'op1';
                    } else if(qs[2].indexOf(ansTxt) > -1) {
                        ansOp = 'op2';
                    } else if(qs[3].indexOf(ansTxt) > -1) {
                        ansOp = 'op3';
                    } else if(qs[4].indexOf(ansTxt) > -1) {
                        ansOp = 'op4';
                    }
                }
                records.push({
                    q: qs[0],
                    op1: qs[1],
                    op2: qs[2],
                    op3: qs[3],
                    ansOp: ansOp,
                    ans: ansTxt
                });
            }catch(ex) {}
           
        });
        await csvWriter.writeRecords(records);
    },
    function(){
        console.log('\n--- Done ---\n');
    },
    function(err){
        console.error(err);
    } );

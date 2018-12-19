const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const HTMLParser = require('node-html-parser');
const fs = require('fs');

const srcDir = './htmls/';
const outDir = './outputs/';
const header = [
    {id: 'q', title: 'Question'},
    {id: 'op1', title: 'op1'},
    {id: 'op2', title: 'op2'},
    {id: 'op3', title: 'op3'},
    {id: 'op4', title: 'op4'},
    {id: 'ans', title: 'ans'}
];

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
        let records = [];
        const csvWriter = createCsvWriter({
            path: `${outDir}${file.split('.html')[0]}.csv`,
            header: header
        });

        const html = HTMLParser.parse(content);
        const allQ = html.querySelectorAll('p');
    
        allQ.forEach(q => {
            const qs = q.text.split('\n');
            let ansTxt = null;
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
                        ansTxt = 'op1';
                    } else if(qs[2].indexOf(ansTxt) > -1) {
                        ansTxt = 'op2';
                    } else if(qs[3].indexOf(ansTxt) > -1) {
                        ansTxt = 'op3';
                    } else if(qs[4].indexOf(ansTxt) > -1) {
                        ansTxt = 'op4';
                    }
                }
                records.push({
                    q: qs[0],
                    op1: qs[1],
                    op2: qs[2],
                    op3: qs[3],
                    op4: qs[4],
                    ans: ansTxt
                });
            }catch(ex) {}
           
        });
        await csvWriter.writeRecords(records);
    },
    function(){
        console.log('--- Done ---');
    },
    function(err){
        console.error(err);
    } );

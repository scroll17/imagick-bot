const config = require('./Recognizer.config');

const { createWorker } = require('tesseract.js');

const axios = require('axios');
const fs = require('fs')

module.exports = class Recognizer {
   constructor(worker, langs){
        this._worker = worker;
        this._langs = langs;
        this._nowWorks = false;
        this._nextTickStop = false;

        // this._detected -> lang in img
        // this._outputText -> text in img
    }

    static async asyncInit(options){
        const logger = console.log.bind(console); //options.logger || console.log.bind(console);
        const langs = ['eng'].join('+'); //(options.langs || ['eng']).join('+');

        // const worker = createWorker({ 
        //     ...config
        //  });

        const worker = createWorker(config)

        await worker.load();
        await worker.loadLanguage(langs);
        await worker.initialize(langs);

        return new this(worker, langs.split('+'), logger)
    }

    value(){
        return this._outputText;
    }

    async terminate(){
        if(this._nowWorks){
            return false
        } else {
            await this._worker.terminate()
            return true;
        }
    }

    async recognize(image){
        this._nowWorks = true;

        let out;
        if(this._detected){
            this._langs.push(this._detected);

            await worker.loadLanguage(this._detected);
            await worker.initialize(this._detected);

            out = await this._worker.recognize(image);
        }

        out = await this._worker.recognize(image);
        this._outputText = out.data.text;

        this._nowWorks = false; 
        return this;
    }

    async detect(image){
        this._nowWorks = true;

        const { data } = await this._worker.detect(image)
        this._detected = data.script;

        this._nowWorks = false;
        return this;
    }

    async saveAndRecognize(url, path){
       this._nowWorks = true;

       const imgPath = await axios.get(url, { responseType: 'stream' })
            .then(({data}) => {
                return new Promise((resolve, reject) => {
                    data.pipe(fs.createWriteStream(path))
                        .on('finish', () => resolve(path))
                        .on('error', e => reject(e))
                })
            })
            
        const { data: { text } } = await this._worker.recognize(imgPath)
        this._outputText = text;
        
        this._nowWorks = false;
        return this;
    }
}
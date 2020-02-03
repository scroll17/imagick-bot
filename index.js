require('./index.config');
const Recognizer = require('./ Recognizer');
const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN)

let recognizer;

bot.on('photo', async (ctx) => {
    if(!recognizer){
        recognizer = await Recognizer.asyncInit()
    }

    let maxPhotoSizeID = ctx.message.photo.length - 1;
    let fileId = ctx.message.photo[maxPhotoSizeID].file_id;
    let link = await ctx.telegram.getFileLink(fileId)

    //let responseText = await recognizer.saveAndRecognize(link,`images/${userId}:${fileId}.jpeg`);
    let responseText = await recognizer.recognize(link);
    return ctx.reply(responseText.value())
})

bot.launch()
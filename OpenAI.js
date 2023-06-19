const {Configuration, OpenAIApi} = require('openai')


let OpenAI = {
    telegram: null,
    apiKey: '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',
    openai: null,

    async askOpenAi (msg, chatId, message_id) {
        this.config();

        const completion = await this.openai.createCompletion({
            model: 'text-davinci-003',
            prompt: `${msg} \n`,
            temperature: 0.8,
            max_tokens: 2048
        })

        const promtOutput = completion.data.choices.pop();
        if (!promtOutput || !promtOutput.text) {
            this.telegram.sendMessage(chatId, "Loi")
            return;
        }

        this.telegram.sendMessage(chatId, promtOutput.text)

    },

    config() {
        const config = new Configuration({
            apiKey: OpenAI.apiKey
        })

        this.openai = new OpenAIApi(config);
    }


};


module.exports = OpenAI;
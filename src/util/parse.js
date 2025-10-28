const xmlParser = require('fast-xml-parser');

const parse = (xml) => {
    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(xml);

    if (result.error) {
        throw new Error(result.error.message);
    }
    return result;
}

const generateTrainDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString("en-GB", { month: 'short' });
    const year = now.getFullYear();

    return `${day} ${month} ${year}`;
}

module.exports = { parse, generateTrainDate };
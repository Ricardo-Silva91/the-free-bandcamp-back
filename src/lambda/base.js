exports.handler = async (event) => {
    const page = event.queryStringParameters.page || 0;
    let fail = false;
    let result = {};

    try {
        result = require(`../../data/documents_${page}.json`);
    } catch (error) {
        console.log('document doesn\'t exist!!', { error });
        fail = true;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };
}
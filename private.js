var _ = require('lodash'),
    fs = require('fs'),
    promise = require('bluebird'),
    rp = require('request-promise');

var url = process.env.GITLAB_URL;

if (!url) {
    console.error('GITLAB_URL environment variable not set');
    process.exit();
}

var token = process.env.GITLAB_TOKEN;

if (!token) {
    console.error('GITLAB_TOKEN environment variable not set');
    process.exit();
}

if (!fs.existsSync(`${__dirname}/snippets`)) {
    fs.mkdirSync(`${__dirname}/snippets`);
}

var dir = `${__dirname}/snippets/private`;
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

rp({
    method: 'GET',
    uri: `${url}/api/v4/snippets`,
    headers: {
        'PRIVATE-TOKEN': token
    },
    json: true
}).then((snippets) => {
    fs.writeFileSync(`${dir}/snippets.json`, JSON.stringify(snippets));
    return promise.mapSeries(snippets, (snippet) => {
        var filename = `${snippet.id}-${snippet.title}`;
        return rp({
            method: 'GET',
            uri: `${url}/snippets/${snippet.id}/raw`,
            headers: {
                'PRIVATE-TOKEN': token
            }
        }).then((raw) => {
            fs.writeFileSync(`${dir}/${filename}`, raw);
        });
    });
}).catch((err) => {
    console.error(err);
});
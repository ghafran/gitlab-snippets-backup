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

console.log(`snippets will be saved to ${dir}`);

rp({
    method: 'GET',
    uri: `${url}/api/v4/snippets?per_page=200&page=1`,
    headers: {
        'PRIVATE-TOKEN': token
    },
    json: true
}).then((snippets) => {
    fs.writeFileSync(`${dir}/snippets.json`, JSON.stringify(snippets));
    return promise.mapSeries(snippets, (snippet) => {
        var filename = `${snippet.id}-${snippet.title}`;
        filename = filename.replace(/\//g, "-");
        return rp({
            method: 'GET',
            uri: `${url}/snippets/${snippet.id}/raw`,
            headers: {
                'PRIVATE-TOKEN': token
            }
        }).then((raw) => {
            console.log(`saving snippet ${snippet.id}...`);
            fs.writeFileSync(`${dir}/${filename}`, raw);
        });
    });
}).then(() => {
    console.log(`done.`);
}).catch((err) => {
    console.error(err);
});

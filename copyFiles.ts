import * as fs from 'fs-extra';

fs.copy('templates', 'dist/templates', err => {
    if (err) return console.error(err);
    console.log('Templates copied!!!');
});
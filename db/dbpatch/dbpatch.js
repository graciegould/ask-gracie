import path from 'path';
const method = process.argv[2];
const filePath =  './db/dbpatch/' + process.argv[3] + '.js';

await import(path.resolve(filePath)).then(module => {
    const Patch = module.default;
    let patch = new Patch();
    if(method === 'apply') {
        patch.apply();
        console.log("Patch applied successfully");
    } else if(method == 'revert') {
        patch.revert();
    }
}).catch(err => {
    console.error(`Failed to load module: ${err.message}`);
});
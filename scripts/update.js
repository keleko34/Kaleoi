var base = process.cwd().replace(/\\/g,'/'),
    { exec } = require('child_process'),
    { readdir, writeFile } = require('fs'),
    { devDependencies } = require(base + '/package.json');

function execCommand(cmd, opts)
{
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if(err) return reject(err);
      resolve(stdout || stderr);
    }, (opts || {}));
  });
}

function getLatestVersions()
{
  return new Promise((resolve, reject) => {

    console.log('Getting newest version numbers...')
    return Promise.all(Object.keys(devDependencies).map(key => execCommand(`npm info ${key} version`)))
      .then((values) => {
        const dependencies = Object.keys(devDependencies)
          .reduce((o, v, i) => { o[v] = values[i].replace('\n', ''); return o; }, {})
        console.log('Newest Versions:\r\n');
        Object.keys(dependencies)
          .forEach(dependency => console.log(`${dependency} Old:${devDependencies[dependency]}; New:${dependencies[dependency]};`));
        console.log('\r\n');
        resolve(dependencies);
      })
      .catch(reject);
    });
}

function getSubmodules()
{
  return new Promise((resolve, reject) => {
    readdir(`${base}/submodules`, (err, files) => {
      if(err) return reject(err);
      resolve(files.map(file => `${base}/submodules/${file}/package.json`));
    });
  });
}

function updatePackageVersions(path, dependencies)
{
  return new Promise((resolve, reject) => {
    console.log(`Updating ${path} Dependencies....`);

    const pkg = require(path);

    pkg.devDependencies = dependencies;
    writeFile(path, JSON.stringify(pkg, null, 2), (err) => {
      if(err) return reject(err);
      resolve();
    });
  });
}

function updatePackages(dependencies)
{
  return getSubmodules()
    .then((paths) => {
      paths.unshift(`${base}/package.json`);
      return Promise.all(paths.map(path => updatePackageVersions(path, dependencies)));
    });
}

function installPackages()
{
  return new Promise((resolve, reject) => {
    const mainInstall = 'npm i',
          subModuleInstall = 'git submodule foreach "npm i"';
  
    console.log('Installing Packages (This may take awhile)....');
    exec(`${mainInstall} && ${subModuleInstall}`, (err, stdout, stderr) => {
      if(err) return reject(err);
      resolve();
    });
  });
}

function commitChanges()
{
  return new Promise((resolve, reject) => {
    const mainCommit = 'git add -A && git commit -m "Update dev package dependencies"',
          submoduleCommit = 'git submodule foreach "git add -A && git commit -m \\"Update dev package dependencies\\""';

    console.log('Commiting Changes to Git');
    exec(`${mainCommit} && ${submoduleCommit}`, (err, stdout, stderr) => {
      if(err) return reject(err);
      resolve();
    });
  });
}

/* TODO: Automate tests to check if all works and then publish to npm and githun the updates */

getLatestVersions()
.then(updatePackages)
.then(installPackages)
.then(commitChanges)
.then(() => {
  console.log(`Successfully Updated Dev Packages!`);
})
.catch(console.error);

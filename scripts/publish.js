var base = process.cwd().replace(/\\/g,'/'),
    exec = require('child_process').exec,
    pkg = require(base + '/package.json'),
    modules = ['czosnek', 'frytki', 'peprze', 'pikantny', 'solone'],
    ver = getVersion();

function getVersion()
{
  var args = process.argv.slice(2, process.argv.length);

  if(args.indexOf('--version') !== -1) return args[(args.indexOf('--version') + 1)];

  var sp = pkg.version.split('.').map((v) => parseInt(v, 10));

  if(sp[2] === 99)
  {
    if(sp[1] === 99)
    {
      sp[1] = sp[2] = 0;
      sp[0]++;
    }
    else
    {
      sp[1]++;
      sp[2] = 0;
    }
  }
  else
  {
    sp[2]++;
  }
  return sp.join('.');
}

function checkForUnfinishedCommits()
{
  return new Promise((resolve, reject) => {

    console.log('Checking for unfinished commits...');
    exec('git status', (err, stdout, stderr) => {
      if(stdout.indexOf('modified') !== -1 || err || stderr) reject('\033[31mERR!\033[37m You have uncommitted changes');
      resolve();
    })
  })
}

function updateVersions()
{
  return new Promise((resolve, reject) => {
    var updateMain = `npm version ${ver}`,
        updateModules = `git submodule foreach "npm version ${ver}"`;

    console.log(`Updating versions to ${ver}...`);
    exec(`${updateMain} && ${updateModules}`, (err, stdout, stderr) => {
      if(err || stderr) reject('\033[31mERR!\033[37m Failed to update version' + (err || stderr));
      resolve();
    })
  })
}

function pushUpdateToGit()
{
  return new Promise((resolve, reject) => {
    var updateMain = `git push -u origin master && git push -u origin v${ver}`,
        updateModules = `git submodule foreach "git push -u origin master && git push -u origin v${ver}"`;

    console.log(`Pushing changes to git...`);
    exec(`${updateMain} && ${updateModules}`, (err, stdout, stderr) => {
      if(err || stderr) reject('\033[31mERR!\033[37m Failed to push to github' + (err || stderr));
      resolve();
    })
  })
}

function publishToNPM()
{
  return new Promise((resolve, reject) => {
    var updateMain = `npm publish`,
        updateModules = `git submodule foreach "npm publish"`;

    console.log(`Publishing to NPM...`);
    exec(`${updateMain} && ${updateModules}`, (err, stdout, stderr) => {
      if(err || stderr) reject('\033[31mERR!\033[37m Failed to publish to NPM' + (err || stderr));
      resolve();
    })
  })
}

checkForUnfinishedCommits()
.then(updateVersions)
.then(pushUpdateToGit)
.then(publishToNPM)
.then(() => {
  console.log('Successfully published a new version!!')
})
.catch((err) => console.error(err));
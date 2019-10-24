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
      if(stdout.indexOf('modified') !== -1 || err) reject('\033[31mERR!\033[37m You have uncommitted changes');
      resolve();
    })
  })
}

function buildLibraries()
{
  return new Promise((resolve, reject) => {
    var updateMain = `npm run build && git add -A && git commit -m "Build"`,
        updateModules = `git submodule foreach "npm run build && git add -A && git commit --allow-empty -m \\"Build\\""`;

    console.log(`Building libraries...`);
    exec(`${updateModules} && ${updateMain}`, (err, stdout, stderr) => {
      if(err) reject('\033[31mERR!\033[37m Failed to build the libraries' + err);
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
      if(err) reject('\033[31mERR!\033[37m Failed to update version' + err);
      resolve();
    })
  })
}

function squashCommits()
{
  return new Promise((resolve, reject) => {
    var updateMain = `git add -A && git commit -m "Update submodule versions"`,
        squashMain = `git reset --hard HEAD~2 && git merge --squash HEAD@{1} && git commit -m "Update to ${ver}"` 
        squashModules = `git submodule foreach "git reset --hard HEAD~1 && git merge --squash HEAD@{1} && git commit -m \\"Update to ${ver}\\""`;

    console.log(`Squashing commits from publish script...`);
    exec(`${updateMain} && ${squashMain} && ${squashModules}`, (err, stdout, stderr) => {
      if(err) reject('\033[31mERR!\033[37m Failed to squash commits' + err);
      resolve();
    })
  })
}

function pushUpdateToGit()
{
  return new Promise((resolve, reject) => {
    var updateMain = `git push origin master && git push -u origin v${ver}`,
        updateModules = `git submodule foreach "git push -u origin master && git push -u origin v${ver}"`;

    console.log(`Pushing changes to git...`);
    exec(`${updateMain} && ${updateModules}`, (err, stdout, stderr) => {
      if(err) reject('\033[31mERR!\033[37m Failed to push to github' + err);
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
      if(err) reject('\033[31mERR!\033[37m Failed to publish to NPM' + err);
      resolve();
    })
  })
}

checkForUnfinishedCommits()
.then(buildLibraries)
.then(updateVersions)
.then(squashCommits)
.then(pushUpdateToGit)
.then(publishToNPM)
.then(() => {
  console.log(`Successfully published ${ver}`)
})
.catch((err) => console.error(err));
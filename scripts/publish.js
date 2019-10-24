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
    exec('git status', (err, stdout, stderr) => {
      if(stdout.indexOf('modified') !== -1 || err || stderr) reject('You have uncommitted changes');
      resolve();
    })
  })
}

function updateVersions()
{
  return new Promise((resolve, reject) => {
    var fin = 0;
    exec(`npm version ${ver}`, (err, stdout, stderr) => {
      if(err || stderr) reject('Failed to update version' + (err || stderr));
      fin += 1;
      if(fin === 2) resolve();
    })
    exec(`git submodule foreach 'npm version ${ver}'`, (err, stdout, stderr) => {
      if(err || stderr) reject('Failed to update version' + (err || stderr));
      fin += 1;
      if(fin === 2) resolve();
    })
  })
}

function pushUpdateToGit()
{
  return new Promise((resolve, reject) => {
    var fin = 0;
    exec(`git push origin master && git push origin v${ver}`, (err, stdout, stderr) => {
      if(err || stderr) reject('Failed to push to github' + (err || stderr));
      fin += 1;
      if(fin === 2) resolve();
    })
    exec(`git submodule foreach 'git push origin master && git push origin v${ver}'`, (err, stdout, stderr) => {
      if(err || stderr) reject('Failed to push to github' + (err || stderr));
      fin += 1;
      if(fin === 2) resolve();
    })
  })
}

function publishToNPM()
{

}

checkForUnfinishedCommits()
.then(updateVersions)
.then(pushUpdateToGit)
.then(() => {
  console.log('Success!')
})
.catch((err) => console.error(err));
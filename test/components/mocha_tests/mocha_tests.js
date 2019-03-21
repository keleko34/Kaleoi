function mocha_tests()
{
  this.onfinish = function()
  {
    mocha.setup('bdd');
    BuildUnitTests();
    mocha.run();
  }
}
function style()
{
  this.set('insertStyle', {
    background: 'rgb(255, 255, 255)'
  });
  
  this.set('style', {
    fontFamily: 'sans serif'
  });
  
  this.computeStyle = function()
  {
    return {
      fontSize: '24px'
    }
  }
  
  this.paddingRight = 'paddingRight';
  this.pR = '20px';
  
  this.marginRight = 'marginRight';
  
  this.marginTop = '30px';
  
  this.set('paddingTop', ['paddingTop', '50px']);
}
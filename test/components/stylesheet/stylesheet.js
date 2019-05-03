function stylesheet()
{
  this.color = '#000';
  
  this.fontSize = function()
  {
    return 16;
  }
  
  this.fontWeight = { 'font-weight': '600' };
  this.decoration = function()
  {
    return { 'text-decoration': 'underline' };
  }
  
  this.marginTop = 'margin-top';
  this.marginBottom = ['margin-bottom'];
  this.marginRight = { 'margin-right': '' };
  this.marginLeft = 'margin-left';
  
  this.mB = '20px';
  this.mR = function(){
    return '24px';
  };
  this.mL = function(){
    return 18;
  }
  
  this.computePaddingTop = function()
  {
    return ['padding-top'];
  }
  
  this.computePaddingBottom = function(value)
  {
    return ['padding-bottom', value]
  }
  
  this.computePaddingRight = function(value)
  {
    return { 'padding-right': value };
  }
  
  this.computePaddingLeft = function()
  {
    return 'padding-left';
  }
  
  this.style = {
    border: '1px solid #FFFFFF'
  }
  
  this.inline = 'inline';
  
  this.filters.checkStyles = function(v){
    return v;
  }
}
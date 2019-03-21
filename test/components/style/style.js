function style()
{
  this.insertStyle = {
    background: '#FFFFFF'
  }
  
  this.style = {
    font: 'sans serif'
  }
  
  this.computeStyle = function(v)
  {
    return {
      fontSize: (v || '24px')
    }
  }
}
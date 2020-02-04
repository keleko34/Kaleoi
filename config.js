module.exports = {
  
  /* Used to determin the prefixed path of where to search for the components */
  prefix: '',
  
  /* Default filters that are available to use in components */
  filters: {
    
  },
  
  /* Whether a backend component files router is being used */
  backendRouting: false,
  
  /* The default environment to use */
  env: 'dev',
  
  /* if any other environments are used this allows to get the non compiled versions of code */
  debug: false,
  
  /* build environments, by default dev and prod are required */
  environments: [
    'dev',
    'prod'
  ],
  
  /* Allows setting a function to parse URIs and return the parsed version (Helpful for non standard decoders) */
  uriDecoder: undefined,

  designPatterns: ['atoms', 'molecules', 'organisms', 'templates', 'pages'],

  /* Design patterns such as `atoms, molecules` etc are on by default. if you would like a flat hierchy of just components, this can be turned off */
  useDesignPatterns: true
}
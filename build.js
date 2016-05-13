var path = require('path'),
    metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    permalinks = require('metalsmith-permalinks'),
    sass = require('metalsmith-sass'),
    concat = require('metalsmith-concat'),
    uglify = require('metalsmith-uglify'),
    sitemap = require('metalsmith-sitemap'),
    filenames = require('metalsmith-filenames'),
    inPlace = require('metalsmith-in-place'),
    redirect = require('metalsmith-redirect'),
    browserSync = require('metalsmith-browser-sync');

var site = metalsmith(__dirname)

  // Metadata
  .metadata({
    site: {
      url: 'http://alloy.jdsimcoe.com',
      year: new Date().getFullYear()
    }
  })

  // Metalsmith
  .source('./src')
  .destination('./build')

  // CSS Processing
  .use(sass())

  // JS
  .use(uglify())
  .use(concat({
    files: [
      'js/jquery.min.js',
      'js/index.min.js',
    ],
    output: 'js/bundle.js'
  }))


  // Templates
  .use(filenames())
  .use(branch('**/*.html')
    .use(inPlace({
      engine: 'swig',
      basedir: './templates/',
      partials: 'partials'
    }))
  )
  .use(branch(['!index.html', '!404.html']).use(permalinks({
    relative: false
  })))

  // Redirects
  .use(redirect({
    '/download/': 'https://github.com/getalloy/alloy'
  }))

  // Sitemap
  .use(sitemap({
    output: 'sitemap.xml',
    urlProperty: 'path',
    hostname: 'http://alloy.jdsimcoe.com',
    pattern: '**/*.html',
    defaults: {
      priority: 0.5,
      changefreq: 'daily'
    }
  }))

  // BrowserSync it up!
  if (process.env.NODE_ENV !== 'production') {
    site = site
      .use(browserSync({
        server : 'build',
        files  : [
          'src/css/*.css',
          'src/js/*.js',
          'src/**/*.html',
          'templates/**/*.html'
        ]
      }))
  }

  // Errors
  site.build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  }
);

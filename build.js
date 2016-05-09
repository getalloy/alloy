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
    serve = require('metalsmith-serve'),
    watch = require('metalsmith-watch');

var siteBuild = metalsmith(__dirname)

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
  .use(branch('**/index.js')
    .use(uglify())
  )
  .use(branch('**/jquery.js')
    .use(uglify())
  )
  .use(concat({
    files: [
      'js/jquery.min.js',
      'js/index.min.js'
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

  // Watch + LiveReload
  if (process.env.NODE_ENV !== 'production') {
    siteBuild = siteBuild
      .use(serve({
        port: 3000,
        verbose: true
      }))
      .use(watch({
        paths: {
          'src/css/**/*' : '**/*.scss',
          'src/js/**/*' : '**/*.js',
          'src/**/*': '**/*.html',
          'templates/**/*': '**/*.html',
        },
        livereload: true
      }))
  }

  // Errors
  siteBuild.build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  }
);

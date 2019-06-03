'use strict';

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const gulp         = require('gulp'),
      plumber      = require('gulp-plumber'),
      sourcemaps   = require('gulp-sourcemaps'),
      rename       = require('gulp-rename'),
      pug          = require('gulp-pug'),
      sass         = require('gulp-sass'),
      htmlPrettify = require('gulp-html-prettify'),
      concat       = require('gulp-concat'),
      babel        = require('gulp-babel'),
      uglify       = require('gulp-uglify'),
      browserSync  = require('browser-sync').create(),
      debug        = require('gulp-debug'),
      csso         = require('gulp-csso'),
      postcss      = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      mqpacker     = require('css-mqpacker'),
      pxtorem      = require('postcss-pxtorem'),
      gulpIf       = require('gulp-if'),
      del          = require('del'),
      newer        = require('gulp-newer'),
      notify       = require('gulp-notify');

let cssvariables = require('postcss-css-variables');
let nested = require('postcss-nested');


const paths = {
  js:     './src/js/',
  libs:   './node_modules/',
  images: './src/assets/img/',
  svg:    './src/svg/',
  fonts:  './src/assets/fonts/',
  sass:   './src/styles/',
  pug:    './src/pug/',
  dest:   {
    root: './build/'
  }
};

const sources = {
  jsSrc:       [
    paths.js + 'main.js',
  ],
  libsJsSrc:   [
    paths.libs + 'tabed/src/tabed.js',
  ],
  imgSrc:      paths.images + '**/*.{png,jpg,jpeg,gif,svg,ico}',
  fontsSrc:    paths.fonts + '**/*.{woff,woff2,ttf, eot}',
  sassSrc:     paths.sass + 'style.scss',
  libsSassSrc: [
    paths.libs + 'tabed/src/tabed.scss',
    paths.libs + 'normalize.css/normalize.css'
  ],
  pugSrc:      [paths.pug + 'pages/*.pug', '!' + paths.pug + '_*.pug']
};

gulp.task('pug', function() {

  return gulp.src(sources.pugSrc)
             .pipe(plumber())
             .pipe(pug({pretty: true}))
             .pipe(htmlPrettify({indent_char: ' ', indent_size: 2}))
             .pipe(plumber.stop())
             .pipe(gulp.dest(paths.dest.root));

});

gulp.task('sass', function() {
  const AUTOPREFIXER_BROWSERS = [
    'last 2 versions',
    'ie >= 11'
  ];

  const POSTCSS_PLUGINS = [
    pxtorem({
              rootValue:         10,
              mediaQuery:        false,
              minPixelValue:     0,
              selectorBlackList: []
            }),
    nested,
    cssvariables({
      preserve: true
    }),
    mqpacker({sort: true}),
    autoprefixer({browsers: AUTOPREFIXER_BROWSERS})
  ];

  return gulp.src(sources.sassSrc)
             .pipe(debug())
             .pipe(plumber(notify.onError(function(err) {
               return {
                 title:   'SCSS',
                 message: err.message
               };
             })))
             .pipe(gulpIf(isDevelopment, sourcemaps.init()))
             .pipe(sass({}))
             .pipe(debug({title: 'sass'}))
             .pipe(postcss(POSTCSS_PLUGINS))
             .pipe(debug({title: 'postcss'}))
             .pipe(rename({suffix: '.min'}))
             .pipe(gulpIf(!isDevelopment, csso()))
             .pipe(debug({title: 'csso'}))
             .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
             .pipe(plumber.stop())
             //.on('error', console.log)
             .pipe(debug())
             .pipe(gulp.dest(paths.dest.root + 'css'));
});

gulp.task('libsCss', function() {

  return gulp.src(sources.libsSassSrc)
             .pipe(plumber())
             .pipe(sass({}))
             .pipe(concat('libs.css'))
             .pipe(csso())
             .pipe(plumber.stop())
             .pipe(gulp.dest(paths.dest.root + 'css'));
});

gulp.task('js', function() {
  return gulp.src(sources.jsSrc)
             .pipe(plumber())
             .pipe(gulpIf(isDevelopment, sourcemaps.init()))
             .pipe(babel({presets: ['@babel/env']}))
             .pipe(concat('scripts.js', {newLine: '\n\r'}))
             .pipe(gulpIf(isDevelopment, uglify()))
             .pipe(gulpIf(isDevelopment, sourcemaps.write('.')))
             .pipe(plumber.stop())
             //.on('error', console.log)
             .pipe(gulp.dest(paths.dest.root + 'js'));
});

gulp.task('libsJs', function() {
  return gulp.src(sources.libsJsSrc)
             .pipe(plumber())
             .pipe(concat('libs.js'))
             .pipe(plumber.stop())
             .pipe(gulp.dest(paths.dest.root + 'js/'));
});

gulp.task('img', function() {
  return gulp.src(sources.imgSrc)
             .pipe(gulp.dest(paths.dest.root + 'img'));
});

gulp.task('fonts', function() {
  return gulp.src(sources.fontsSrc)
             .pipe(gulp.dest(paths.dest.root + 'fonts'));
});

//clean build folder
gulp.task('clean', function() {
  return del(paths.dest.root);
});

gulp.task('copy', function() {
  return gulp.src('./src/**/*.*')
             .pipe(gulp.dest(paths.dest.root));
});

gulp.task('assets', function() {
  return gulp.src(paths.fonts + '**/*.*', {since: gulp.lastRun('assets')})
             .pipe(newer(paths.dest.root))
             .pipe(debug({title: 'assets'}))
             .pipe(gulp.dest(paths.dest.root));
});

gulp.task('watch', function() {
  gulp.watch(paths.pug + '**/*.pug', gulp.series('pug'));
  gulp.watch(paths.sass + '**/*.scss', gulp.series('sass'));
  gulp.watch(paths.js + '**/*.js', gulp.series('js'));
});

gulp.task('serve', function() {
  browserSync.init({
                     server: {
                       baseDir: paths.dest.root
                     },
                     port:   3000,
                     open:   true,
                     notify: false,
                     ui:     false
                     //,
                     //ui    : {port: 8001}
                   });

  browserSync.watch(paths.dest.root + '**/*.*').on('change', browserSync.reload);
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('pug', 'sass', 'js', 'img', 'fonts', 'libsCss', 'libsJs')
));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));

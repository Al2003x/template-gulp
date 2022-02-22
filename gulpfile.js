import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import browser from 'browser-sync';
import posthtml from 'gulp-posthtml';

// Styles

export const styles = () => {
  return gulp.src('src/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('src/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin())
    .pipe(gulp.dest('build'))
}

// Scripts

const scripts = () => {
  return gulp.src('src/js/script.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// Images

const optimizeImages = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
}

//Sprite

const sprite = () => {
  return src("src/img/icons/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(dest("build/img"));
};

// WebP

const createWebp = () => {
  return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'))
}

const svg = () =>
  gulp.src('src/img/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));


// Copy

const copy = (done) => {
  gulp.src([
    'src/fonts/*.{woff2,woff}',
    // 'src/*.ico',
    'src/favicon.ico'
  ], {
    base: 'src'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('src/sass/**/*.scss', gulp.series(styles));
  gulp.watch('src/*.html', gulp.series(html, reload));
  gulp.watch('src/js/script.js', gulp.series(scripts));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    svg,
    sprite,
    scripts,
    createWebp
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    svg,
    scripts,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));

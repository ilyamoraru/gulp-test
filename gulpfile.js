//npm i загружает все пакеты из package.json

var gulp        = require("gulp")
    sass        = require("gulp-sass")
    browserSync = require("browser-sync")
    concat      = require("gulp-concat")
    uglify      = require("gulp-uglifyjs")
    cssnano     = require("gulp-cssnano")
    rename      = require("gulp-rename")
    del         = require("del")
    imageMin    = require("gulp-imagemin")
    pngQuant    = require("imagemin-pngquant"),
    cache       = require("gulp-cache")
    autopefixer = require("gulp-autoprefixer");


//подлкючение sass(npm i gulp-sass --save-dev)
gulp.task("sass", function() {
    return gulp.src("app/sass/*.scss")
        .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
        .pipe(autopefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {cascade: true}))
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.reload({stream: true}))
});


//локальный сервер(npm i browser-sync --save-dev)

gulp.task("browser-sync", function() {
    browserSync({
        server: {
            baseDir: "app"
        },
        notify: false,
    });
});

//сжатие js (npm i gulp-concat gulp-uglifyjs --save-dev)

gulp.task("scripts", function() {
   return gulp.src([
       "app/libs/jQuery-3.3.1.js",
   ])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("app/js"));
});

//сжатие css (npm i gulp-cssnano gulp-rename --save-dev)

gulp.task("css-libs", ["sass"], function() {
   return gulp.src([
       "app/libs/*css",
       "app/css/*.css"
       ]) 
    .pipe(cssnano())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("app/css"));
});

//чистка папки dist

gulp.task("clean", function() {
    return del.sync("dist");
});

//чистка кэша

gulp.task("clear", function() {
    return cache.clearAll();
});

//оптимизация картинок(npm i gulp-imagemin imagemin-quant --save-dev)

gulp.task("img", function() {
    return gulp.src("app/img/**/*") // Берем все изображения из app
        .pipe(cache(imageMin({ // Сжимаем их с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngQuant()]
        })))
        .pipe(gulp.dest("dist/img")); // Выгружаем на продакшен
});

//обновление файлов в папке

gulp.task("watch", ["browser-sync", "css-libs", "scripts"], function() {
    gulp.watch("app/sass/*.scss", ["sass"]);//следим за sass 
    gulp.watch("app/*.html", browserSync.reload);//за html
    gulp.watch("app/js/*.js", browserSync.reload);//за js
});

//для продакшена

gulp.task("build", ["clean", "img", "sass", "scripts"], function() {
    var buildCss = gulp.src([
        "app/css/*.min.css",
        "app/css/libs.min.css"
    ])
    .pipe(gulp.dest("dist/css"));
    
    var buildFonts = gulp.src("app/fonts/*")
    .pipe(gulp.dest("dist/fonts"));
    
    var buildJs = gulp.src("app/js/*")
    .pipe(gulp.dest("dist/js"));
    
    var buildHtml = gulp.src("app/*.html")
    .pipe(gulp.dest("dist"));
});
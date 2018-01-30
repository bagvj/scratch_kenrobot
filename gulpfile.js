/**
 * 引入 gulp及组件
 * npm i --save-dev 7zip-bin asar babel-core babel-preset-es2015 browserify del electron@1.7.10 electon-builder@19.55.2 fs-extra globby gulp gulp-autoprefixer gulp-babel gulp-clean-css gulp-if gulp-minify-html gulp-requirejs-optimize gulp-ruby-sass gulp-sftp gulp-uglify hasha isutf8 minimist nconf q run-sequence vinyl-buffer vinyl-source-stream
 * npm install --save electron-debug electron-is electron-log fs-extra minimist q glob 7zip-bin sudo-prompt hasha iconv-lite node-fetch express jszip
 * npm install --global  gulp node-gyp electron-rebuild electron@1.7.10
 */

const gulp = require('gulp') //基础库
const gulpif = require('gulp-if') //条件执行
const sass = require('gulp-ruby-sass') //css预编译
const cleanCSS = require('gulp-clean-css') //css压缩
const autoprefixer = require('gulp-autoprefixer') //自动前缀
const requirejsOptimize = require('gulp-requirejs-optimize') //requirejs打包
const minifyHtml = require("gulp-minify-html") //html压缩
const sftp = require('gulp-sftp') //
const Q = require('q')
const fs = require('fs-extra')
const globby = require('globby')
const isutf8 = require('isutf8')
const nconf = require('nconf')
const del = require('del')
const babel = require('gulp-babel')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')

const minimist = require('minimist') //命令行参数解析
const runSequence = require('run-sequence') //顺序执行
const hasha = require('hasha') //
const asar = require('asar')
const path7za = require('7zip-bin').path7za

const builder = require('electron-builder') //electron打包

const path = require('path') //路径
const child_process = require('child_process') //子进程
const os = require('os') //操作系统相关

var args = minimist(process.argv.slice(2)) //命令行参数

const SRC = './src/'
const DIST = './dist/'
const TEMP = '.temp/'

const APP = './app/'

const ASSETS_SRC = SRC + 'renderer/assets/'
const ASSETS_DIST = APP + 'renderer/assets/'

gulp.task('clean-assets-js', () => {
	return del(ASSETS_DIST + 'js')
})

gulp.task('clean-assets-css', () => {
	return del(ASSETS_DIST + 'css')
})

gulp.task('clean-assets-image', () => {
	return del(ASSETS_DIST + 'image')
})

gulp.task('clean-assets-font', () => {
	return del(ASSETS_DIST + 'font')
})

gulp.task('clean-main', () => {
	return del(APP + 'main')
})

gulp.task('clean-renderer-js', () => {
	return del(APP + 'renderer/index.js')
})

gulp.task('clean-renderer', () => {
	return del(APP + 'renderer')
})

gulp.task('clean-scratch2', _ => {
	return del(APP + 'renderer/scratch2')
})

gulp.task('clean-scratch3', _ => {
	return del(APP + 'renderer/scratch3')
})

gulp.task('clean-other', () => {
	return del([
		APP + 'renderer/**/*',
		'!' + APP + "renderer/index.js",
		'!' + APP + "renderer/assets/**/*",
		'!' + APP + "renderer/scratch2/**/*",
		'!' + APP + "renderer/scratch3/**/*",
	])
})

gulp.task('clean-dist', () => {
	return del(DIST)
})

gulp.task('clean-assets-temp-js', () => {
	return del(TEMP + 'js')
})

gulp.task('transform-assets-js', ['clean-assets-temp-js'], callback => {
	if (!args.force && !args.release) {
		callback()
		return
	}

	return gulp.src([ASSETS_SRC + 'js/**/*.js', '!' + ASSETS_SRC + 'js/require.js', '!' + ASSETS_SRC + 'js/vendor/**/*'])
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest(TEMP + 'js'))
})

gulp.task('copy-assets-vendor-js', ['clean-assets-temp-js'], callback => {
	if (!args.force && !args.release) {
		callback()
		return
	}

	return gulp.src([ASSETS_SRC + 'js/vendor/**/*'])
		.pipe(gulp.dest(TEMP + 'js/vendor/'))
})

gulp.task('pack-assets-js', ['clean-assets-js', 'transform-assets-js', 'copy-assets-vendor-js'], () => {
	if (args.release) {
		gulp.src([ASSETS_SRC + 'js/require.js'])
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))

		return gulp.src(TEMP + 'js/*.js')
			.pipe(requirejsOptimize({
				useStrict: true,
				optimize: "uglify",
			}))
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))
	} else {
		return gulp.src(ASSETS_SRC + 'js/**/*.js')
			.pipe(gulp.dest(ASSETS_DIST + 'js/'))
	}
})

gulp.task('pack-assets-css', ['clean-assets-css'], () => {
	return sass(ASSETS_SRC + 'css/*.scss', {
			style: "expanded"
		})
		.pipe(autoprefixer())
		.pipe(gulpif(args.release, cleanCSS()))
		.pipe(gulp.dest(ASSETS_DIST + 'css/'))
})

gulp.task('pack-assets-image', ['clean-assets-image'], () => {
	return gulp.src(ASSETS_SRC + 'image/**/*')
		// .pipe(gulpif(args.release, imagemin()))
		.pipe(gulp.dest(ASSETS_DIST + 'image/'))
})

gulp.task('pack-assets-font', ['clean-assets-font'], () => {
	return gulp.src(ASSETS_SRC + 'font/**/*')
		.pipe(gulp.dest(ASSETS_DIST + 'font/'))
})

gulp.task('pack-assets', ['pack-assets-image', 'pack-assets-font', 'pack-assets-css', 'pack-assets-js'])

gulp.task('pack-scratch2', ['clean-scratch2'], callback => {
	gulp.src([SRC + 'renderer/scratch2/**/*'])
		.pipe(gulp.dest(APP + 'renderer/scratch2/'))
		.on('end', _ => {
			var indexPath = path.join(APP, 'renderer', 'scratch2', 'index.html')
			var content = fs.readFileSync(indexPath, "utf8")
			var tag = "</head>"
			var contents = content.split(tag)
			contents.splice(1, 0, tag, '<script type="text/javascript" src="../assets/js/require.js" data-main="../assets/js/scratch2"></script>')
			fs.writeFileSync(indexPath, contents.join(""))
			callback()
		})
		.on('error', err => {
			callback(err)
		})
})

gulp.task('pack-scratch3', ['clean-scratch3'], callback => {
	gulp.src([SRC + 'renderer/scratch3/**/*', "!" + SRC + "renderer/scratch3/**/*.js.map"])
		.pipe(gulp.dest(APP + 'renderer/scratch3/'))
		.on('end', _ => {
			var indexPath = path.join(APP, 'renderer', 'scratch3', 'index.html')
			var content = fs.readFileSync(indexPath, "utf8")
			var tag = "</head>"
			var contents = content.split(tag)
			contents.splice(1, 0, tag, '<script type="text/javascript" src="../assets/js/require.js" data-main="../assets/js/scratch3"></script>')
			fs.writeFileSync(indexPath, contents.join(""))
			callback()
		})
		.on('error', err => {
			callback(err)
		})
})

gulp.task('pack-other', ['clean-other'], () => {
	return gulp.src([
		SRC + 'renderer/**/*',
		'!' + SRC + "renderer/index.js",
		'!' + SRC + "renderer/assets/**/*",
		'!' + SRC + "renderer/scratch2/**/*",
		'!' + SRC + "renderer/scratch3/**/*",
	]).pipe(gulp.dest(APP + 'renderer/'))
})

gulp.task('pack-main', ['clean-main'], () => {
	if (args.release) {
		return browserify(SRC + 'main/index.js', {
				ignoreMissing: true,
				commondir: false,
				bundleExternal: false,
				builtins: false,
				browserField: false,
				noParse: ["../package"],
				detectGlobals: false,
			})
			.bundle()
			.pipe(source('index.js'))
			.pipe(buffer())
			.pipe(babel({
				presets: ['es2015']
			}))
			.pipe(uglify())
			.pipe(gulp.dest(APP + 'main/'))
	} else {
		return gulp.src(SRC + 'main/**/*.js')
			.pipe(gulp.dest(APP + 'main/'))
	}
})

gulp.task('pack-renderer-js', ['clean-renderer-js'], () => {
	if (args.release) {
		return gulp.src(SRC + 'renderer/index.js')
			.pipe(babel({
				presets: ['es2015']
			}))
			.pipe(uglify())
			.pipe(gulp.dest(APP + 'renderer/'))
	} else {
		return gulp.src(SRC + 'renderer/index.js')
			.pipe(gulp.dest(APP + 'renderer/'))
	}
})

gulp.task('pack-renderer', ['clean-renderer'], callback => {
	runSequence(['pack-renderer-js', 'pack-assets', 'pack-scratch2', 'pack-scratch3', 'pack-other'], callback)
})

gulp.task('pack', ['pack-main', 'pack-renderer'])

/**
 * 用法: gulp build-pack --release --standalone --compress --platform=PLATFORM --arch=ARCH --target=TARGET --branch=BRANCH --feature=FEATURE
 * 示例: gulp build-pack --release --branch=beta
 *       gulp build-pack --release --standalone --platform=arm --compress
 *       gulp build-pack --release --platform=win --arch=x64 --target=nsis --branch=beta
 *       gulp build-pack --release --platform=win --arch=x64 --target=nsis --branch=beta --feature=with-101
 */
gulp.task('build', ['clean-dist'], callback => {
	var platform = args.platform || "win"
	var branch = args.branch || "beta"
	var feature = args.feature || ""
	var arch
	var target
	var ext
	var packageConfig = require('./app/package')

	var targets
	if (platform == "linux") {
		arch = args.arch || "ia32"
		target = args.target || "AppImage"
		ext = target
		targets = builder.Platform.LINUX.createTarget(target, builder.archFromString(arch))
	} else if (platform == "arm") {
		arch = args.arch || "armv7l"
		target = args.target || "dir"
		ext = target
		targets = builder.Platform.LINUX.createTarget(target, builder.archFromString(arch))
	} else if (platform == "mac") {
		target = args.target || "dmg"
		ext = target
		targets = builder.Platform.MAC.createTarget(target)
	} else {
		arch = args.arch || "ia32"
		target = args.target || "nsis"
		ext = "exe"
		targets = builder.Platform.WINDOWS.createTarget(target, builder.archFromString(arch))
	}

	nconf.file('./app/package.json')
	nconf.set('buildInfo', {
		branch: branch,
		feature: feature,
		ext: ext,
		appBit: arch == "ia32" ? 32 : 64,
		date: parseInt(new Date().getTime() / 1000),
	})
	nconf.save()

	if(args.standalone) {
		var extraFiles = [
			`./plugins/FlashPlayer/${platform}/**/*`,
			`!./plugins/FlashPlayer/${platform}/**/*${arch == "ia32" ? "64" : "32"}.dll`,
		]

		var dist = path.join(DIST, `${platform}-${arch}-dir`)
		var taskA = () => {
			var defer = Q.defer()
			gulp.src(extraFiles, {
					base: "."
				})
				.pipe(gulp.dest(dist))
				.on('end', () => {
					defer.resolve()
				})
				.on('error', err => {
					defer.reject(err)
				})

			return defer.promise
		}

		var distApp = path.join(dist, 'resources', 'app')

		var taskB = () => {
			var defer = Q.defer()

			gulp.src([
					APP + '**/*',
					"!" + APP + "node_modules/serialport/build/Release/obj",
					"!" + APP + "node_modules/serialport/build/Release/obj/**/*",
					"!" + APP + "node_modules/**/test",
					"!" + APP + "node_modules/**/test/**/*",
					"!" + APP + "node_modules/**/tests",
					"!" + APP + "node_modules/**/tests/**/*",
					"!" + APP + "node_modules/**/example",
					"!" + APP + "node_modules/**/example/**/*",
					"!" + APP + "node_modules/**/examples",
					"!" + APP + "node_modules/**/examples/**/*",
					"!" + APP + "node_modules/**/docs",
					"!" + APP + "node_modules/**/docs/**/*",
					"!" + APP + "node_modules/**/doc",
					"!" + APP + "node_modules/**/doc/**/*",
					"!" + APP + "node_modules/**/*.md",
					"!" + APP + "node_modules/**/*.d.ts",
					"!" + APP + "node_modules/**/*appveyor.yml*",
					"!" + APP + "node_modules/**/.*",
				]).pipe(gulp.dest(distApp))
				.on('end', () => {
					defer.resolve()
				})
				.on('error', err => {
					defer.reject(err)
				})

			return defer.promise
		}

		var taskC = () => {
			var defer = Q.defer()

			nconf.clear('buildInfo')
			nconf.save()

			asar.createPackageWithOptions(distApp, path.join(path.dirname(distApp), "app.asar"), {
				unpackDir: `node_modules/7zip-bin-${platform}`,
			}, () => {
				fs.removeSync(distApp)
				defer.resolve()
			})

			return defer.promise
		}

		var taskD = () => {
			var defer = Q.defer()

			if (!args.compress) {
				setTimeout(() => {
					defer.resolve()
				}, 10)

				return defer.promise
			}

			var name = `${packageConfig.productName}-${packageConfig.version}-${branch}${feature ? ("-" + feature) : ""}${arch ? ("-" + arch) : ""}-${platform}-standalone`
			var command = `cd "${path.resolve(path.dirname(dist))}" && "${path7za}" a ${name}.7z ${path.basename(dist)}/*`
			child_process.exec(command, (err, stdout, stderr) => {
				if (err) {
					console.log(err)
					defer.reject(err)
					return
				}

				console.log(stdout)
				defer.resolve()
			})

			return defer.promise
		}

		taskA().then(taskB).then(taskC).then(taskD).catch(err => {
			console.log(err)
			callback(err)
		}).done(() => {
			console.log("done")
			callback()
		})
	} else {
		var extraFiles = [
			`plugins/FlashPlayer/${platform}`,
			`!plugins/FlashPlayer/${platform}/**/*${arch == "ia32" ? "64" : "32"}.dll`,
		]

		builder.build({
			targets: targets,
			config: {
				extraFiles: extraFiles,
				win: args.sign ? {
					certificateSubjectName: "911101083484411499",
					certificateSha1: "CF853B3F7C8B5FFE9C40D48025EB348BBE360914",
				}: undefined
			},
			appInfo: {
				buildNumber: packageConfig.buildNumber,
				companyName: packageConfig.companyName,
			}
		}).then(result => {
			var output = result[result.length - 1]
			var name = `${packageConfig.productName}-${packageConfig.version}-${branch}${feature ? ("-" + feature) : ""}${arch ? ("-" + arch) : ""}${path.extname(output)}`
			var file = path.join(path.dirname(output), name)

			fs.move(output, file, err => {
				nconf.clear('buildInfo')
				nconf.save()

				console.log(file)
				if (!args.upload) {
					callback()
					return
				}

				var options = args.remotePath ? {
					remotePath: args.remotePath
				} : {}
				upload(file, options).then(() => {
					callback()
				}, err1 => {
					console.error(err1)
					callback(err1)
				})
			})
		}, err => {
			console.error(err)
			callback(err)
		})
	}
})

gulp.task('build-pack', callback => {
	runSequence('pack', 'build', callback)
})

// 默认任务
gulp.task('default', ['pack'])

//检查文件编码是否为utf8
gulp.task('check', callback => {
	globby(["./src/**/*.js", "./src/**/*.json", "./src/**/*.html", "./src/**/*.scss"]).then(files => {
		var result = []
		files.forEach(file => {
			if (!isutf8(fs.readFileSync(file))) {
				result.push(file)
			}
		})
		if (result.length > 0) {
			console.log('these files not encoding by utf8')
			console.log(result.join("\n"))
		} else {
			console.log('all files encoding by utf8')
		}
		callback()
	}, err => {
		callback(err)
	})
})

gulp.task('upload', () => {
	if (!args.file) {
		console.log('please spec file use "--file"')
		return
	}

	var files = args.file.split(',')
	var options = args.remotePath ? {remotePath: args.remotePath} : {}

	return upload(files, options)
})

function upload(files, options) {
	var defer = Q.defer()

	var defaultOptions = require('./build/upload')
	options = Object.assign(defaultOptions, options)

	gulp.src(files)
		.pipe(sftp(options))
		.on('end', defer.resolve)
		.on('error', defer.reject)

	return defer.promise
}

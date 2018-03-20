const {app, BrowserWindow, dialog, ipcMain, shell, clipboard} = require('electron')

const path = require('path')
const querystring = require('querystring')

const is = require('electron-is')
const debug = require('electron-debug')
const log = require('electron-log')
const Q = require('q')
const fs = require('fs-extra')
const commandLineArgs = require('command-line-args') //命令行参数解析
const hasha = require('hasha') //计算hash
const _ = require('lodash')
const terminate = require('terminate')

const util = require('./util/util')
const Url = require('./config/url')

const Token = require('./model/token')
const Project = require('./model/project') //同步
const User = require('./model/user')
const Cache = require('./util/cache')
const express = require('express')

const httpPort = 8776
const baseUrl = `http://localhost:${httpPort}`

const CONFIG_KEY = "config"

const listenMessage = util.listenMessage

const optionDefinitions = [
	{ name: 'debug-brk', type: Number, defaultValue: false },
	{ name: 'dev', alias: 'd', type: Boolean, defaultValue: false },
	{ name: 'devTool', alias: 't', type: Boolean, defaultValue: false },
	{ name: 'fullscreen', alias: 'f', type: Boolean, defaultValue: false},
	{ name: 'maximize', alias: 'm', type: Boolean, defaultValue: false},
	{ name: 'project', alias: 'p', type: Project.check, defaultOption: true}
]

var args = commandLineArgs(optionDefinitions, {argv: process.argv.slice(1), partial: true}) //命令行参数

const DEBUG = is.dev() && args.dev
// const DEBUG = true
const DEV = is.dev()

var cache
var config

var mainWindow
var firstRun
var projectToLoad
var isLoadReady

var downloadTasks = {}
var forceQuit

init()

/**
 * 初始化
 */
function init() {
	process.on('uncaughtException', err => {
		var stack = err.stack || (err.name + ': ' + err.message)
		log.info(stack)
		app.quit()
	})

	initLog()
	initFlashPlugin()
	initServer()

	cache = new Cache(CONFIG_KEY)
	config = cache.getItem(CONFIG_KEY, {})
	util.removeFile(path.join(util.getAppPath("appData"), "config.json"), true)

	if(app.makeSingleInstance((argv, workingDirectory) => {
		if(mainWindow) {
			mainWindow.isMinimized() && mainWindow.restore()
			mainWindow.focus()

			var secondArgs = commandLineArgs(optionDefinitions, {argv: argv.slice(1), partial: true})
			secondArgs.project && (projectToLoad = secondArgs.project)
			log.debug("app second run")
			// log.debug(secondArgs)

			loadOpenProject().then(result => {
				util.postMessage("app:onLoadProject", result)
			}, err => {
				err && log.info(err)
			})
		}
	})) {
		app.quit()
	}

	listenEvents()
	listenMessages()

	log.debug(`app ${app.getName()} start, version ${util.getVersion()}`)
	// log.debug(args)
	// log.debug(process.argv.join(" "))
}

function initLog() {
	if(DEBUG) {
		log.transports.console.level = "debug"
		log.transports.file.level = "debug"
	} else {
		//非debug模式，禁用控制台输出
		log.transports.console = false
		log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}'
		log.transports.file.level = 'info'
	}
}

function initFlashPlugin() {
	var appInfo = util.getAppInfo()
	var version = '26.0.0.131'
	var plugin = is.windows() ? `pepflashplayer${appInfo.appBit}.dll` : (is.macOS() ? "PepperFlashPlayer.plugin" : "libpepflashplayer.so")
	plugin = path.join(util.getAppPath("plugins"), "FlashPlayer", appInfo.platform, plugin)

	log.info(`initFlashPlugin: ${plugin} version: ${version}`)

	app.commandLine.appendSwitch('ppapi-flash-path', plugin)
	app.commandLine.appendSwitch('ppapi-flash-version', version)
}

function initServer() {
	var httpRoot = path.join(__dirname, "..")
	var http = express()
	http.use('/', express.static(path.join(httpRoot, "renderer")))
	http.listen(httpPort)
}

/**
 * 监听事件
 */
function listenEvents() {
	app.on('ready', onAppReady)
	.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
	.on('activate', () => mainWindow === null && createWindow())
	.on('before-quit', onAppBeforeQuit)
	.on('will-quit', onAppWillQuit)
	.on('quit', () => log.debug('app quit'))

	is.macOS() && app.on('open-file', onAppOpenFile)
}

/**
 * 监听消息
 */
function listenMessages() {
	listenMessage("getAppInfo", () => util.resolvePromise(util.getAppInfo()))
	listenMessage("getBaseUrl", _ => util.resolvePromise(baseUrl))

	listenMessage("execFile", exePath => util.execFile(exePath))
	listenMessage("execCommand", (command, options) => util.execCommand(command, options))
	listenMessage("spawnCommand", (command, args, options) => util.spawnCommand(command, args, options))
	listenMessage("readFile", (filePath, options) => util.readFile(filePath, options))
	listenMessage("writeFile", (filePath, data) => util.writeFile(filePath, data))
	listenMessage("saveFile", (filePath, data, options) => util.saveFile(filePath, data, options))
	listenMessage("moveFile", (src, dst, options) => util.moveFile(src, dst, options))
	listenMessage("removeFile", filePath => util.removeFile(filePath))
	listenMessage("searchFiles", pattern => util.searchFiles(pattern))
	listenMessage("readJson", (filePath, options) => util.readJson(filePath, options))
	listenMessage("writeJson", (filePath, data, options, sync) => util.writeJson(filePath, data, options, sync))
	listenMessage("showOpenDialog", options => util.showOpenDialog(options))
	listenMessage("showSaveDialog", options => util.showSaveDialog(options))
	listenMessage("request", (url, options, json) => util.request(url, options, json))
	listenMessage("showItemInFolder", filePath => util.resolvePromise(shell.showItemInFolder(path.normalize(filePath))))
	listenMessage("openUrl", url => util.resolvePromise(url && shell.openExternal(url)))

	listenMessage("buildProject", (projectPath, options) => buildProject(projectPath, options))
	listenMessage("uploadFirmware", (targetPath, options, comName) => uploadFirmware(targetPath, options, comName))

	listenMessage("download", (url, options) => download(url, options))
	listenMessage("cancelDownload", taskId => cancelDownload(taskId))

	listenMessage("checkUpdate", () => checkUpdate())
	listenMessage("removeOldVersions", newVersion => removeOldVersions(newVersion))
	listenMessage("reportToServer", (data, type) => reportToServer(data, type))

	listenMessage("loadToken", () => User.loadToken())
	listenMessage("login", (username, password) => User.login(username, password))
	listenMessage("logout", () => User.logout())
	listenMessage("weixinLogin", key => User.weixinLogin(key))
	listenMessage("weixinQrcode", () => User.weixinQrcode())
	listenMessage("register", fields => User.register(fields))
	listenMessage("resetPassword", email => User.resetPassword(email))

	listenMessage("setCache", (key, value) => key !== CONFIG_KEY ? cache.setItem(key, value) : util.rejectPromise())
	listenMessage("getCache", (key, defaultValue) => key !== CONFIG_KEY ? util.resolvePromise(cache.getItem(key, defaultValue)) : util.rejectPromise())

	listenMessage("loadOpenOrRecentProject", () => loadOpenOrRecentProject())

	listenMessage("projectRead", projectPath => Project.read(projectPath))
	listenMessage("projectOpen", (type, name) => Project.open(type, name))
	listenMessage("projectSave", (name, data, type, savePath) => Project.save(name, data, type, savePath))
	listenMessage("projectSaveAs", (name, data, type) => Project.saveAs(name, data, type))

	listenMessage("projectSync", type => Project.sync(type))
	listenMessage("projectList", type => Project.list(type))

	if(DEV) {
		listenMessage("projectCreate", name => Project.create(name))
		listenMessage("projectUpload", (name, hash) => Project.upload(name, hash))
		listenMessage("projectDelete", (name, hash) => Project.remove(name, hash))
		listenMessage("projectDownload", (name, hash) => Project.download(name, hash))
	}

	listenMessage("log", (text, level) => (log[level] || log.debug).bind(log).call(text))
	listenMessage("copy", (text, type) => clipboard.writeText(text, type))
	listenMessage("quit", () => app.quit())
	listenMessage("exit", () => (forceQuit = true) && onAppWillQuit() && terminate(process.pid))
	listenMessage("reload", () => mainWindow.reload())
	listenMessage("relaunch", () => onAppRelaunch())
	listenMessage("fullscreen", () => mainWindow.setFullScreen(!mainWindow.isFullScreen()))
	listenMessage("min", () => mainWindow.minimize())
	listenMessage("max", () => onAppToggleMax())
	listenMessage("errorReport", (message, type) => onAppErrorReport(message, type))
}

function onAppReady() {
	log.debug('app ready')

	DEBUG && debug({enabled: true, showDevTools: true})
	args.project && (projectToLoad = args.project)

	createWindow()
	checkIfFirstRun()
	doReports()
}

/**
 * 创建窗口
 */
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 720,
		minWidth: 1200,
		minHeight: 720,
		frame: false,
		show: false,
		webPreferences: {
			plugins: true,
			webSecurity: false,
		}
	})

	if(args.fullscreen) {
		mainWindow.setFullScreen(true)
	} else if(args.maximize) {
		mainWindow.maximize()
	}

	mainWindow.on('closed', () => (mainWindow = null))
		.once('ready-to-show', () => mainWindow.show())
		.on('enter-full-screen', () => util.postMessage("app:onFullscreenChange", true))
		.on('leave-full-screen', () => util.postMessage("app:onFullscreenChange", false))

	mainWindow.webContents.on('will-navigate', e => e.preventDefault())

	mainWindow.webContents.session.on('will-download', onDownload)

	mainWindow.loadURL(baseUrl)
	mainWindow.focus()
}

function onAppOpenFile(e, filePath) {
	e.preventDefault()

	projectToLoad = Project.check(filePath)
	if(isLoadReady){
		loadOpenProject().then(result => {
			util.postMessage("app:onLoadProject", result)
		}, err => {
			err && log.info(err)
		})
	}
}

function onAppBeforeQuit(e) {
	if(!forceQuit) {
		e.preventDefault()
		util.postMessage("app:onBeforeQuit")
	}
}

function onAppWillQuit(e) {
	util.removeFile(path.join(util.getAppPath("appData"), "temp"), true)

	return true
}

function onAppToggleMax() {
	if(mainWindow.isFullScreen()) {
		mainWindow.setFullScreen(false)
	} else {
		mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
	}
}

function onAppRelaunch() {
	app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])})
	app.exit(0)
}

function onAppErrorReport(message, type) {
	log.info(`${type}: ${message}`)
}

function checkIfFirstRun() {
	if(DEV || config.version == util.getVersion()) {
		return
	}

	config.version = util.getVersion()
	config.reportInstall = false
	firstRun = true
	cache.setItem(CONFIG_KEY, config)
}

function doReports() {
	if(!DEV && !config.reportInstall) {
		//安装report
		reportToServer(null, "installations").then(() => {
			config.reportInstall = true
			cache.setItem(CONFIG_KEY, config)
		})
	}

	//打开report
	reportToServer(null, "open")
}

function reportToServer(data, type) {
	var deferred = Q.defer()

	var appInfo = util.getAppInfo()
	var baseInfo = {
		version: appInfo.version,
		platform: appInfo.platform,
		bit: appInfo.appBit,
		ext: appInfo.ext,
		branch: appInfo.branch,
		feature: appInfo.feature,
	}

	data = _.merge({}, data, baseInfo)
	type = type || 'log'

	util.request(Url.REPORT, {
		method: "post",
		data: {
			data: JSON.stringify(data),
			type: type,
		}
	}).then(() => {
		deferred.resolve()
	}, err => {
		log.info(`report error: type: ${type}, ${JSON.stringify(data)}`)
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

/**
 * 检查更新
 * @param {*} checkUrl
 */
function checkUpdate() {
	var deferred = Q.defer()

	var info = util.getAppInfo()
	var features = info.feature ? `${info.feature},${info.arch}` : info.arch
	var url = `${Url.CHECK_UPDATE}?appname=${info.name}&release_version=${info.branch}&version=${info.version}&platform=${info.platform}&ext=${info.ext}&features=${features}`
	log.debug(`checkUpdate: ${url}`)

	util.request(url).then(result => {
		deferred.resolve(result)
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

/**
 * 删除旧版本
 */
function removeOldVersions(newVersion) {
	var deferred = Q.defer()

	var info = util.getAppInfo()
	var downloadPath = path.join(util.getAppPath("appData"), "download")
	util.searchFiles(`${downloadPath}/${info.name}-*.${info.ext}`).then(files => {
		var versionReg = /\d+\.\d+\.\d+/
		files.map(f => path.basename(f)).filter(name => {
			var match = name.match(versionReg)
			if(!match) {
				return false
			}

			return util.versionCompare(match[0], newVersion) < 0
		}).forEach(name => {
			util.removeFile(path.join(downloadPath, name), true)
		})
		deferred.resolve()
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function onDownload(e, item, webContent) {
	var taskId = util.uuid(6)
	downloadTasks[taskId] = item

	var url = item.getURL()
	var pos = url.lastIndexOf("#")
	var query = querystring.parse(url.substring(pos + 1))
	url = url.substring(0, pos)

	var deferId = query.deferId
	var savePath = path.join(util.getAppPath("appData"), 'download', item.getFilename())
	if(query.checksum && fs.existsSync(savePath)) {
		pos = query.checksum.indexOf(":")
		var algorithm = query.checksum.substring(0, pos).replace("-", "").toLowerCase()
		var hash = query.checksum.substring(pos + 1)
		if(hash == hasha.fromFileSync(savePath, {algorithm: algorithm})) {
			item.cancel()
			log.debug(`download cancel, ${url} has cache`)
			util.callDefer(deferId, true, {
				path: savePath,
			})
			return
		}
	}

	item.setSavePath(savePath)

	var totalSize = item.getTotalBytes()
	item.on('updated', (evt, state) => {
		if(state == "interrupted") {
			downloadTasks[taskId] && delete downloadTasks[taskId]

			log.debug(`download interrupted: ${url}`)
			util.callDefer(deferId, false, {
				path: savePath,
			})
		} else if(state === 'progressing') {
			if(item.isPaused()) {
				downloadTasks[taskId] && delete downloadTasks[taskId]

				log.debug(`download paused: ${url}`)
				util.callDefer(deferId, false, {
					path: savePath,
				})
			} else {
				util.callDefer(deferId, "notify", {
					taskId: taskId,
					path: savePath,
					totalSize: totalSize,
					size: item.getReceivedBytes(),
				})
			}
		}
	})

	item.once('done', (evt, state) => {
		downloadTasks[taskId] && delete downloadTasks[taskId]

		if(state == "completed") {
			log.debug(`download success: ${url}, at ${savePath}`)
			util.callDefer(deferId, true, {
				path: savePath,
			})
		} else {
			log.debug(`download fail: ${url}`)
			util.callDefer(deferId, false, {
				path: savePath,
			})
		}
	})
}

function download(url, options) {
	var deferred = Q.defer()

	var {deferId, promise} = util.getDefer()
	options.deferId = deferId

	var query = querystring.stringify(options)
	log.debug(`download ${url}, options: ${query}`)

	promise.then(result => {
		deferred.resolve(result)
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	}, progress => {
		deferred.notify(progress)
	})

	mainWindow.webContents.downloadURL(`${url}#${query}`)

	return deferred.promise
}

function cancelDownload(taskId) {
	var downloadItem = downloadTasks[taskId]
	downloadItem && downloadItem.cancel()
}

function loadOpenProject() {
	isLoadReady = true

	if(projectToLoad) {
		log.debug(`loadOpenProject: ${projectToLoad}`)
		var projectPath = projectToLoad
		projectToLoad = null

		return Project.read(projectPath)
	}

	return util.rejectPromise()
}

function loadOpenOrRecentProject() {
	var deferred = Q.defer()

	loadOpenProject().then(result => {
		deferred.resolve(result)
	}, () => {
		var projectPath = cache.getItem("recentProject")
		if(!projectPath) {
			util.rejectPromise(null, deferred)
			return
		}
		Project.read(projectPath).then(result => {
			deferred.resolve(result)
		}, err => {
			deferred.reject(err)
		})
	})

	return deferred.promise
}

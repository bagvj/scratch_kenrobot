const {app, BrowserWindow, ipcMain, shell, clipboard, webContents} = require('electron')

const path = require('path')
const os = require('os')
const querystring = require('querystring')
const crypto = require('crypto')

const util = require('./util')
const token = require('./token')

const project = require('./project') //同步

const is = require('electron-is')
const debug = require('electron-debug')
const log = require('electron-log')

const Q = require('q')
const fs = require('fs-extra')
const minimist = require('minimist') //命令行参数解析
const hasha = require('hasha') //计算hash
const express = require('express')

const httpPort = 8776
const baseUrl = `http://localhost:${httpPort}`

var args = minimist(process.argv.slice(1)) //命令行参数

var arduinoOptions = {
	"default": {
		upload: {
			target_type: "hex",
			mcu: "atmega328p",
			baudrate: "115200",
			programer: "arduino",
			command: '"ARDUINO_PATH/hardware/tools/avr/bin/avrdude" -C "ARDUINO_PATH/hardware/tools/avr/etc/avrdude.conf" -v -p ARDUINO_MCU -c ARDUINO_PROGRAMMER -b ARDUINO_BURNRATE -P ARDUINO_COMPORT -D -U "flash:w:TARGET_PATH:i"'
		},
	}
}

var config

var mainWindow
var firstRun

init()

/**
 * 初始化
 */
function init() {
	process.on('uncaughtException', err => {
		var stack = err.stack || (err.name + ': ' + err.message)
		log.error(stack)
		app.quit()
	})

	initLog()
	initFlashPlugin()
	initServer()

	if(app.makeSingleInstance((commandLine, workingDirectory) => {
		if(mainWindow) {
			mainWindow.isMinimized() && mainWindow.restore()
			mainWindow.focus()
		}
	})) {
		app.quit()
	}

	listenEvents()
	listenMessages()

	log.debug(`app start, version ${util.getVersion()}`)
}

function initLog() {
	log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}'
	if(is.dev() && args.dev) {
		//非debug模式，禁用控制台输出
		log.transports.file.level = 'debug'
	} else {
		log.transports.console = false
		log.transports.file.level = 'error'
	}
}

function initFlashPlugin() {
	var version = '26.0.0.131'
	var plugin = is.windows() ? `pepflashplayer${util.isAppX64() ? "64" : "32"}.dll` : (is.macOS() ? "PepperFlashPlayer.plugin" : "libpepflashplayer.so")
	plugin = path.join(getPluginPath("FlashPlayer"), plugin)

	log.error(`initFlashPlugin: ${plugin} version: ${version}`)

	// app.commandLine.appendSwitch("--disable-web-security")
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
	.on('window-all-closed', _ => process.platform !== 'darwin' && app.quit())
	.on('activate', _ => mainWindow === null && createWindow())
	.on('will-quit', onAppWillQuit)
	.on('quit', _ => log.debug('app quit'))
}

/**
 * 监听消息
 */
function listenMessages() {
	listenMessage("getAppInfo", _ => util.resolvePromise(util.getAppInfo()))
	listenMessage("getBaseUrl", _ => util.resolvePromise(baseUrl))

	listenMessage("loadSetting", _ => loadSetting())
	listenMessage("saveSetting", setting => saveSetting(setting))

	listenMessage("execFile", exePath => util.execFile(exePath))
	listenMessage("execCommand", (command, options) => util.execCommand(command, options))
	listenMessage("spawnCommand", (command, args, options) => util.spawnCommand(command, args, options))
	listenMessage("readFile", (filePath, options) => util.readFile(filePath, options))
	listenMessage("writeFile", (filePath, data) => util.writeFile(filePath, data))
	listenMessage("moveFile", (src, dst, options) => util.moveFile(src, dst, options))
	listenMessage("removeFile", filePath => util.removeFile(filePath))
	listenMessage("showOpenDialog", options => util.showOpenDialog(options))
	listenMessage("showSaveDialog", options => util.showSaveDialog(options))
	listenMessage("request", (url, options, json) => util.request(url, options, json))
	listenMessage("showItemInFolder", filePath => util.resolvePromise(shell.showItemInFolder(path.normalize(filePath))))
	listenMessage("openUrl", url => util.resolvePromise(url && shell.openExternal(url)))

	listenMessage("download", (url, options) => download(url, options))
	listenMessage("installDriver", driverPath => installDriver(driverPath))

	listenMessage("checkUpdate", checkUrl => checkUpdate(checkUrl))
	listenMessage("removeOldVersions", newVersion => removeOldVersions(newVersion))

	listenMessage("setToken", value => token.set(value))
	listenMessage("saveToken", value => token.save(value))
	listenMessage("loadToken", key => token.load(key))
	listenMessage("removeToken", _ => token.remove())

	listenMessage("projectSave", (projectPath, projectInfo, isTemp) => project.save(projectPath, projectInfo, isTemp))
	listenMessage("projectOpen", (projectPath, type) => project.open(projectPath, type))

	listenMessage("projectNewSave", (name, type, data, savePath) => project.newSave(name, type, data, savePath))
	listenMessage("projectNewSaveAs", (name, type, data) => project.newSaveAs(name, type, data))
	listenMessage("projectNewOpen", (type, name) => project.newOpen(type, name))

	listenMessage("projectSyncUrl", url => project.setSyncUrl(url))
	listenMessage("projectSync", _ => project.sync())
	listenMessage("projectList", type => project.list(type))
	listenMessage("projectUpload", (name, type) => project.upload(name, type))
	listenMessage("projectDelete", (name, type) => project.remove(name, type))
	listenMessage("projectDownload", (name, type) => project.download(name, type))

	listenMessage("log", (text, level) => (log[level] || log.debug).bind(log).call(text))
	listenMessage("copy", (text, type) => clipboard.writeText(text, type))
	listenMessage("quit", _ => app.quit())
	listenMessage("reload", _ => mainWindow.reload())
	listenMessage("fullscreen", _ => mainWindow.setFullScreen(!mainWindow.isFullScreen()))
	listenMessage("min", _ => mainWindow.minimize())
	listenMessage("max", _ => {
		if(mainWindow.isFullScreen()) {
			mainWindow.setFullScreen(false)
		} else {
			mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
		}
	})
	listenMessage("errorReport", err => {
		log.error(`------ error message ------`)
		log.error(`${err.message}(${err.src} at line ${err.line}:${err.col})`)
		log.error(`${err.stack}`)
	})
}

function listenMessage(name, callback) {
	var eventName = `app:${name}`
	ipcMain.on(eventName, (e, deferId, ...args) => {
		var promise = callback.apply(this, args) || util.resolvePromise()
		promise.then(result => {
			e.sender.send(eventName, deferId, true, result)
		}, err => {
			e.sender.send(eventName, deferId, false, err)
		}, progress => {
			e.sender.send(eventName, deferId, "notify", progress)
		})
	})
}

function onAppReady() {
	log.debug('app ready')

	is.dev() && args.devTool && debug({showDevTools: true})

	loadConfig().then(data => {
		config = data

		createWindow()
		checkIfFirstRun()
		installReport()
	})
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

	mainWindow.on('closed', _ => (mainWindow = null))
		.once('ready-to-show', _ => mainWindow.show())
		.on('enter-full-screen', _ => util.postMessage("app:onFullscreenChange", true))
		.on('leave-full-screen', _ => util.postMessage("app:onFullscreenChange", false))

	mainWindow.webContents.session.on('will-download', onDownload)

	mainWindow.loadURL(baseUrl)
	mainWindow.focus()
}

function onAppWillQuit() {
	util.removeFile(path.join(util.getAppDataPath(), "temp"), true)
}

function checkIfFirstRun() {
	if(is.dev() || config.version == util.getVersion()) {
		return
	}

	config.version = util.getVersion()
	config.reportInstall = false
	firstRun = true
	writeConfig(true)
}

function installReport() {
	if(is.dev() || config.reportInstall) {
		return
	}

	var appInfo = util.getAppInfo()
	var installInfo = {
		version: appInfo.version,
		platform: appInfo.platform,
		bit: appInfo.bit,
		ext: appInfo.ext,
		branch: appInfo.branch,
		feature: appInfo.feature,
		installTime: util.stamp(),
	}
	var url = "http://userver.kenrobot.com/statistics/installations"
	util.request(url, {
		method: "post",
		data: {
			data: JSON.stringify(installInfo)
		}
	}).then(_ => {
		config.reportInstall = true
		writeConfig()
	}, err => {
		err && log.error(err)
	})
}

/**
 * 检查更新
 * @param {*} checkUrl
 */
function checkUpdate(checkUrl) {
	var deferred = Q.defer()

	var info = util.getAppInfo()
	var url = `${checkUrl}&appname=${info.name}&release_version=${info.branch}&version=${info.version}&platform=${info.platform}&arch=${info.arch}&ext=${info.ext}&features=${info.feature}`
	log.debug(`checkUpdate: ${url}`)

	util.request(url).then(result => {
		deferred.resolve(result)
	}, err => {
		err && log.error(err)
		deferred.reject(err)
	})

	return deferred.promise
}

/**
 * 删除旧版本
 */
function removeOldVersions(newVersion) {
	var deferred = Q.defer()

	if(is.dev()) {
		setTimeout(_ => {
			deferred.resolve()
		}, 10)
		return deferred.promise
	}

	var info = util.getAppInfo()
	var downloadPath = path.join(util.getAppDataPath(), "download")
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
		err && log.error(err)
		deferred.reject(err)
	})

	return deferred.promise
}

/**
 * 载入配置
 */
function loadConfig() {
	var deferred = Q.defer()

	log.debug("loadConfig")
	var configPath = path.join(util.getAppDataPath(), "config.json")
	if(!fs.existsSync(configPath)) {
		setTimeout(_ => {
			deferred.resolve({})
		}, 10)
		return deferred.promise
	}

	util.readJson(configPath).then(data => {
		deferred.resolve(data)
	}, err => {
		deferred.resolve({})
	})

	return deferred.promise
}

/**
 * 载入配置
 */
function writeConfig(sync) {
	var configPath = path.join(util.getAppDataPath(), "config.json")
	return util.writeJson(configPath, config, null, sync)
}

function loadSetting() {
	return util.resolvePromise(config.setting || {})
}

function saveSetting(setting) {
	config.setting = setting
	return writeConfig()
}

function onDownload(e, item, webContent) {
	var url = item.getURL()
	var pos = url.lastIndexOf("#")
	var query = querystring.parse(url.substring(pos + 1))
	url = url.substring(0, pos)

	var deferId = query.deferId
	var savePath = path.join(util.getAppDataPath(), 'download', item.getFilename())
	if(query.checksum && fs.existsSync(savePath)) {
		pos = query.checksum.indexOf(":")
		var algorithm = query.checksum.substring(0, pos)
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
			log.debug(`download interrupted: ${url}`)
			util.callDefer(deferId, false, {
				path: savePath,
			})
		} else if(state === 'progressing') {
			if(item.isPaused()) {
				log.debug(`download paused: ${url}`)
				util.callDefer(deferId, false, {
					path: savePath,
				})
			} else {
				util.callDefer(deferId, "notify", {
					path: savePath,
					totalSize: totalSize,
					size: item.getReceivedBytes(),
				})
			}
		}
	})

	item.once('done', (evt, state) => {
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
		err && log.error(err)
		deferred.reject(err)
	}, progress => {
		deferred.notify(progress)
	})

	mainWindow.webContents.downloadURL(`${url}#${query}`)

	return deferred.promise
}

/**
 * 安装驱动
 * @param {*} driverPath
 */
function installDriver(driverPath) {
	var deferred = Q.defer()

	log.debug(`installDriver: ${driverPath}`)
	var dir = path.join(util.getAppDataPath(), "temp")
	util.unzip(driverPath, dir).then(_ => {
		var exePath = path.join(dir, path.basename(driverPath, path.extname(driverPath)), "setup.exe")
		util.execFile(exePath).then(_ => {
			deferred.resolve()
		})
	}, err => {
		err && log.error(err)
		deferred.reject(err)
	})

	return deferred.promise
}

/**
 * 获取插件目录
 */
function getPluginPath(name) {
	return path.join(util.getAppResourcePath(), "plugins", name, util.getPlatform())
}


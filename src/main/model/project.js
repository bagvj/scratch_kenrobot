const path = require('path')
const fs = require('fs-extra')
const Q = require('q')
const hasha = require('hasha')
const log = require('electron-log')

const util = require('../util/util')
const Token = require('./token')
const Url = require('../config/url')

const PROJECT_EXT = ".kbl"
const SCRATCH_2 = "scratch2"
const SCRATCH_3 = "scratch3"

var throttleSync = util.throttle(sync, 2000)

function check(projectPath) {
	if(!projectPath || path.extname(projectPath) != PROJECT_EXT || !fs.existsSync(projectPath)) {
		return null
	}

	return projectPath
}

function read(projectPath) {
	var deferred = Q.defer()

	var ext = path.extname(projectPath)
	if(ext === ".sb2") {
		util.readFile(projectPath, "base64").then(result => {
			deferred.resolve({
				type: SCRATCH_2,
				project_name: path.basename(projectPath, path.extname(projectPath)),
				path: projectPath,
				data: result
			})
		}, err => {
			err && log.error(err)
			deferred.reject(err)
		})
	} else {
		util.readJson(projectPath).then(result => {
			if(ext === PROJECT_EXT) {
				result.path = projectPath
				deferred.resolve(result)
			} else {
				deferred.resolve({
					type: SCRATCH_3,
					project_name: path.basename(projectPath, path.extname(projectPath)),
					path: projectPath,
					data: result
				})
			}
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}

	return deferred.promise
}

function open(type, name) {
	var deferred = Q.defer()

	var doOpen = projectPath => {
		read(projectPath).then(result => {
			deferred.resolve(result)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}

	if(name) {
		if(!Token.getUser()) {
			return util.rejectPromise(null, deferred)
		}

		var projectPath = resolveProjectPath(type, name)
		if(!projectPath) {
			return util.rejectPromise(null, deferred)
		}
		doOpen(projectPath)

		return deferred.promise
	} else {
		var options = {
			defaultPath: Token.getUser() ? getProjectsDir() : util.getAppPath("documents"),
			properties: ["openFile"],
			filters: getFilters(type),
		}

		util.showOpenDialog(options).then(openPath => {
			doOpen(openPath)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})

		return deferred.promise
	}
}

function save(name, data, type, savePath) {
	var deferred = Q.defer()

	if(!Token.getUser()) {
		var prefix = path.join(util.getAppPath("appDocuments"), "projects")
		if(savePath && savePath.startsWith(prefix)) {
			savePath = null
		}
		return saveAs(name, data, type, savePath)
	}

	savePath = path.join(getProjectsDir(), name + PROJECT_EXT)
	doSave(savePath, name, data, type, "cloud").then(result => {
		util.removeFile(resolveProjectPath(type, name, true), true)
		updateLocalItem(type, name).then(() => {
			throttleSync()
			deferred.resolve(result)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function saveAs(name, data, type, savePath) {
	var deferred = Q.defer()

	var _doSave = (_savePath, _name) => {
		doSave(_savePath, _name, data, type, "local").then(result => {
			deferred.resolve(result)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}

	if(savePath) {
		_doSave(savePath, name)
	} else {
		util.showSaveDialog({
			filters: getFilters(type),
		}).then(savePath => {
			_doSave(savePath, path.basename(savePath, path.extname(savePath)))
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}

	return deferred.promise
}

function sync(type) {
	var deferred = Q.defer()

	log.debug(`project sync`)

	Q.all([
		list(type),
		loadLocalList()
	]).then(result => {
		var [remoteList, localList] = result
		doSync(remoteList, localList).then(() => {
			log.debug(`project sync success`)
			deferred.resolve()
		}, err => {
			log.debug(`project sync fail`)
			err && log.info(err)
			deferred.reject(err)
		}, progress => {
			deferred.notify(progress)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function list(type) {
	var types = (type || `${SCRATCH_2},${SCRATCH_3}`).split(",")
	var deferred = Q.defer()

	log.debug(`project list: ${types.join(" ")}`)

	Token.request(Url.PROJECT_SYNC_LIST, {
		method: "post",
		data: {
			type: types.join(","),
		},
	}).then(result => {
		if(result.status != 0) {
			deferred.reject(result.message)
			return
		}
		deferred.resolve(result.data.filter(p => types.indexOf(p.type) >= 0))
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function create(type, name) {
	var deferred = Q.defer()

	log.debug(`project create: ${name}:${type}`)

	Token.request(Url.PROJECT_SYNC_CREATE, {
		method: 'post',
		data: {
			name: name,
			type: type
		}
	}).then(result => {
		if(result.status != 0) {
			deferred.reject(result.message)
			return
		}

		var item = result.data
		updateLocalItem(type, item.name, item.modify_time, item.hash).then(() => {
			log.debug(`project create success: ${name} ${item.hash}`)
			deferred.resolve(item)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function remove(type, name, hash) {
	var deferred = Q.defer()

	log.debug(`project remove: ${hash}`)

	Token.request(Url.PROJECT_SYNC_DELETE, {
		method: "post",
		data: {
			hash: hash
		}
	}).then(result => {
		if(result.status != 0) {
			deferred.reject(result.message)
			return
		}

		Q.all([
			util.removeFile(resolveProjectPath(type, name)),
			util.removeFile(resolveProjectPath(type, name, true)),
			removeLocalItem(hash),
		]).then(() => {
			log.debug(`project remove success: ${name}`)
			deferred.resolve()
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function upload(type, name, hash) {
	var deferred = Q.defer()

	log.debug(`project upload: ${name}: ${hash}`)

	var projectPath = resolveProjectPath(type, name)
	if(!projectPath) {
		return util.rejectPromise(null, deferred)
	}
	compress(projectPath).then(outputPath => {
		var url = `${Url.PROJECT_SYNC_UPLOAD}/${hash}`
		Token.request(url, {
			method: "post",
			body: fs.createReadStream(outputPath)
		}).then(result => {
			if(result.status != 0) {
				deferred.reject(result.message)
				return
			}

			var item = result.data
			updateLocalItem(item.type, name, item.modify_time, hash).then(() => {
				log.debug(`project upload success: ${name}`)
				deferred.resolve(item)
			}, err => {
				err && log.info(err)
				deferred.reject(err)
			})
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function download(name, hash, type) {
	var deferred = Q.defer()

	log.debug(`project download: ${name} ${hash}`)

	var url = `${Url.PROJECT_SYNC_DOWNLOAD}/${hash}`
	Token.request(url, {method: "post"}, false).then(res => {
		var savePath = path.join(util.getAppPath("appData"), 'temp', `${util.uuid(6)}.7z`)
		fs.ensureDirSync(path.dirname(savePath))

		var stream = fs.createWriteStream(savePath)
		res.body.pipe(stream)
		res.body.on("end", () => {
			util.uncompress(savePath, getProjectsDir()).then(() => {
				updateLocalItem(type, name, null, hash).then(() => {
					log.debug(`project download success: ${name}`)
					deferred.resolve()
				}, err => {
					err && log.info(err)
					// deferred.reject(err)
					deferred.resolve()
				})
			}, err => {
				err && log.info(err)
				// deferred.reject(err)
				deferred.resolve()
			})
		}).on("error", err => {
			err && log.info(err)
			// deferred.reject(err)
			deferred.resolve()
		})
	}, err => {
		err && log.info(err)
		// deferred.reject(err)
		deferred.resolve()
	})

	return deferred.promise
}

function compress(projectPath) {
	var deferred = Q.defer()

	var outputPath = path.join(util.getAppPath("appData"), 'temp', `${util.uuid(6)}.7z`)
	util.compress(path.dirname(projectPath), path.basename(projectPath), outputPath).then(() => {
		deferred.resolve(outputPath)
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function doSave(savePath, name, data, type, projectType) {
	var deferred = Q.defer()

	var projectInfo = {
		type: type,
		project_name: name,
		project_type: projectType || "local",
		updated_at: util.stamp(),
		data: data,
	}

	log.debug(`project save: ${savePath}`)

	var ext = path.extname(savePath)
	if(ext === ".sb2") {
		util.writeFile(savePath, new Buffer(data, "base64")).then(() => {
			projectInfo.path = savePath
			deferred.resolve(projectInfo)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	} else {
		util.writeJson(savePath, path.extname(savePath) === PROJECT_EXT ? projectInfo : data).then(() => {
			projectInfo.path = savePath
			deferred.resolve(projectInfo)
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}

	return deferred.promise
}

function doSync(remoteList, localList) {
	var deferred = Q.defer()

	var [createList, downloadList, uploadList] = findSyncList(remoteList, localList)
	log.debug(`doSync: createList:${createList.length}, downloadList:${downloadList.length}, uploadList:${uploadList.length}`)
	var total = createList.length + downloadList.length + uploadList.length
	var count = 0

	var notify = (name, action) => {
		count++
		deferred.notify({
			total: total,
			count: count,
			name: name,
			action: action,
		})
	}

	downloadSync(downloadList, notify).then(() => {
		createSync(createList, notify).then(() => {
			uploadSync(uploadList, notify).then(() => {
				deferred.resolve()
			}, err => {
				err && log.info(err)
				deferred.reject(err)
			})
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function findSyncList(remoteList, localList) {
	var remoteDic = {}
	var localDic = {}
	remoteList.forEach(item => {
		remoteDic[`${item.name}`] = item
	})
	localList.forEach(item => {
		localDic[`${item.name}`] = item
	})
	var downloadList = []
	var uploadList = []
	var createList = []

	remoteList.forEach(item => {
		var localItem = localDic[item.name]
		if(!localItem || !localItem.modify_time || localItem.modify_time < item.modify_time) {
			downloadList.push(item)
		} else if(!resolveProjectPath(item.type, item.name)) {
			downloadList.push(item)
		}
	})
	localList.forEach(item => {
		var remoteItem = remoteDic[item.name]
		if(!remoteItem) {
			!item.type && (item.type = resolveProjectType(item.type))
			createList.push(item)
			uploadList.push(item)
		} else if(remoteItem.modify_time < item.modify_time) {
			!item.type && (item.type = remoteItem.type)
			uploadList.push(item)
		}
	})

	return [createList, downloadList, uploadList]
}

function createSync(createList, notify) {
	var deferred = Q.defer()

	var worker
	worker = () => {
		if(createList.length == 0) {
			return util.resolvePromise(true, deferred)
		}

		var item = createList.shift()
		create(item.type, item.name).then(it => {
			item.hash = it.hash
			notify(item.name, "create")
			if(createList.length == 0) {
				deferred.resolve()
			} else {
				setTimeout(() => worker(), 100)
			}
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}
	worker()

	return deferred.promise
}

function uploadSync(uploadList, notify) {
	var deferred = Q.defer()

	var worker
	worker = () => {
		if(uploadList.length == 0) {
			return util.resolvePromise(true, deferred)
		}

		var item = uploadList.shift()
		upload(item.type, item.name, item.hash).then(() => {
			notify(item.name, "upload")
			if(uploadList.length == 0) {
				deferred.resolve()
			} else {
				setTimeout(() => worker(), 100)
			}
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}
	worker()

	return deferred.promise
}

function downloadSync(downloadList, notify) {
	var deferred = Q.defer()

	var worker
	worker = () => {
		if(downloadList.length == 0) {
			return util.resolvePromise(true, deferred)
		}

		var item = downloadList.shift()
		download(item.name, item.hash, item.type).then(() => {
			notify(item.name, "download")
			if(downloadList.length == 0) {
				deferred.resolve()
			} else {
				setTimeout(() => worker(), 100)
			}
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}
	worker()

	return deferred.promise
}

function loadLocalList() {
	var deferred = Q.defer()

	if(!Token.getUser()) {
		return util.rejectPromise(null, deferred)
	}

	var listPath = getLocalListPath()
	if(!fs.existsSync(listPath)) {
		return util.resolvePromise([], deferred)
	}

	return util.readJson(listPath)
}

function saveLocalList(localList) {
	if(!Token.getUser()) {
		return util.rejectPromise()
	}

	return util.writeJson(getLocalListPath(), localList)
}

function updateLocalItem(type, name, modify_time, hash) {
	var deferred = Q.defer()
	modify_time = modify_time || util.stamp()

	loadLocalList().then(localList => {
		var localItem = localList.find(it => (!it.type || type == it.type) && ((hash && it.hash == hash) || it.name == name))
		if(!localItem) {
			localList.push({
				type: type,
				name: name,
				hash: hash,
				modify_time: modify_time,
			})
		} else {
			type && (localItem.type = type)
			name && (localItem.name = name)
			hash && (localItem.hash = hash)
			localItem.modify_time = modify_time
		}

		saveLocalList(localList).then(() => {
			deferred.resolve()
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function removeLocalItem(hash) {
	var deferred = Q.defer()

	loadLocalList().then(localList => {
		var index = localList.findIndex(it => it.hash == hash)
		if(index < 0) {
			deferred.resolve()
			return
		}
		localList.splice(index, 1)

		saveLocalList(localList).then(() => {
			deferred.resolve()
		}, err => {
			err && log.info(err)
			deferred.reject(err)
		})
	}, err => {
		err && log.info(err)
		deferred.reject(err)
	})

	return deferred.promise
}

function getLocalListPath() {
	var userId = Token.getUserId()
	if(!userId) {
		return null
	}

	return path.join(util.getAppPath("appData"), "projects", getUserSpec(userId, 1), "list.json")
}

function resolveProjectPath(type, name, old) {
	var dir = getProjectsDir()
	if(old) {
		return path.join(dir, type, `${name}${resolveOldExt(type)}`)
	}

	var projectPath = path.join(dir, name + PROJECT_EXT)
	if(!fs.existsSync(projectPath)) {
		projectPath = path.join(dir, type, `${name}${resolveOldExt(type)}`)
		if(!fs.existsSync(projectPath)) {
			return null
		}
	}

	return projectPath
}

function resolveOldExt(type) {
	return type === SCRATCH_2 ? ".sb2" : ".json"
}

function resolveProjectType(name) {
	var dir = getProjectsDir()
	var projectPath = path.join(dir, name + PROJECT_EXT)
	if(fs.existsSync(projectPath)) {
		var project = util.readJson(projectPath, {}, true)
		return project.project_type
	} else {
		if(fs.existsSync(path.join(dir, SCRATCH_3, `${name}.json`))) {
			return SCRATCH_3
		}
		if(fs.existsSync(path.join(dir, SCRATCH_2, `${name}.sb2`))) {
			return SCRATCH_2
		}
	}

	return SCRATCH_3
}

function getProjectsDir() {
	var userId = Token.getUserId()
	if(!userId) {
		return null
	}

	return path.join(util.getAppPath("appDocuments"), "projects", getUserSpec(userId))
}

function getUserSpec(id, index) {
	index = index || 0
	return hasha(`${id}`, {algorithm: "md5"}).substring(index * 8, (index + 1) * 8)
}

function getFilters(type) {
	return [
		{name: 'KBlock(*.kbl)', extensions: ['kbl']},
		type === SCRATCH_2 ? {name: 'Scratch 2(*.sb2)', extensions: ['sb2']} : {name: 'Scratch 3(*.json)', extensions: ['json']}
	]
}

module.exports.check = check
module.exports.read = read
module.exports.open = open
module.exports.save = save
module.exports.saveAs = saveAs

module.exports.sync = sync
module.exports.list = list
module.exports.create = create
module.exports.remove = remove
module.exports.upload = upload
module.exports.download = download

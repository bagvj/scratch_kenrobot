"use strict";var _slicedToArray=function(e,r){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,r){var t=[],n=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(n=(a=s.next()).done)&&(t.push(a.value),!r||t.length!==r);n=!0);}catch(e){o=!0,i=e}finally{try{!n&&s.return&&s.return()}finally{if(o)throw i}}return t}(e,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")};!function e(r,t,n){function o(a,s){if(!t[a]){if(!r[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(i)return i(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var f=t[a]={exports:{}};r[a][0].call(f.exports,function(e){var t=r[a][1][e];return o(t||e)},f,f.exports,e,r,t,n)}return t[a].exports}for(var i="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({1:[function(e,r,t){var n,o,i=e("electron"),a=i.app,s=i.BrowserWindow,c=i.ipcMain,u=i.shell,f=i.clipboard,p=(i.webContents,e("path")),d=(e("os"),e("querystring")),l=(e("crypto"),e("./util")),v=e("./token"),m=e("./project"),h=e("electron-is"),g=e("electron-debug"),j=e("electron-log"),y=e("q"),x=e("fs-extra"),b=e("minimist"),w=e("hasha"),S=e("express"),P=8776,A="http://localhost:"+P,F=b(process.argv.slice(1));function D(e,r){var t=this,n="app:"+e;c.on(n,function(e,o){for(var i=arguments.length,a=Array(i>2?i-2:0),s=2;s<i;s++)a[s-2]=arguments[s];(r.apply(t,a)||l.resolvePromise()).then(function(r){e.sender.send(n,o,!0,r)},function(r){e.sender.send(n,o,!1,r)},function(r){e.sender.send(n,o,"notify",r)})})}function I(){j.debug("app ready"),h.dev()&&F.devTool&&g({showDevTools:!0}),function(){var e=y.defer();j.debug("loadConfig");var r=p.join(l.getAppDataPath(),"config.json");if(!x.existsSync(r))return setTimeout(function(r){e.resolve({})},10),e.promise;return l.readJson(r).then(function(r){e.resolve(r)},function(r){e.resolve({})}),e.promise}().then(function(e){n=e,_(),function(){if(h.dev()||n.version==l.getVersion())return;n.version=l.getVersion(),n.reportInstall=!1,!0,T(!0)}(),function(){if(h.dev()||n.reportInstall)return;var e=l.getAppInfo(),r={version:e.version,platform:e.platform,bit:e.bit,ext:e.ext,branch:e.branch,feature:e.feature,installTime:l.stamp()};l.request("http://userver.kenrobot.com/statistics/installations",{method:"post",data:{data:JSON.stringify(r)}}).then(function(e){n.reportInstall=!0,T()},function(e){e&&j.error(e)})}()})}function _(){o=new s({width:1200,height:720,minWidth:1200,minHeight:720,frame:!1,show:!1,webPreferences:{plugins:!0,webSecurity:!1}}),F.fullscreen?o.setFullScreen(!0):F.maximize&&o.maximize(),o.on("closed",function(e){return o=null}).once("ready-to-show",function(e){return o.show()}).on("enter-full-screen",function(e){return l.postMessage("app:onFullscreenChange",!0)}).on("leave-full-screen",function(e){return l.postMessage("app:onFullscreenChange",!1)}),o.webContents.session.on("will-download",q),o.loadURL(A),o.focus()}function k(){l.removeFile(p.join(l.getAppDataPath(),"temp"),!0)}function T(e){var r=p.join(l.getAppDataPath(),"config.json");return l.writeJson(r,n,null,e)}function q(e,r,t){var n=r.getURL(),o=n.lastIndexOf("#"),i=d.parse(n.substring(o+1));n=n.substring(0,o);var a=i.deferId,s=p.join(l.getAppDataPath(),"download",r.getFilename());if(i.checksum&&x.existsSync(s)){o=i.checksum.indexOf(":");var c=i.checksum.substring(0,o);if(i.checksum.substring(o+1)==w.fromFileSync(s,{algorithm:c}))return r.cancel(),j.debug("download cancel, "+n+" has cache"),void l.callDefer(a,!0,{path:s})}r.setSavePath(s);var u=r.getTotalBytes();r.on("updated",function(e,t){"interrupted"==t?(j.debug("download interrupted: "+n),l.callDefer(a,!1,{path:s})):"progressing"===t&&(r.isPaused()?(j.debug("download paused: "+n),l.callDefer(a,!1,{path:s})):l.callDefer(a,"notify",{path:s,totalSize:u,size:r.getReceivedBytes()}))}),r.once("done",function(e,r){"completed"==r?(j.debug("download success: "+n+", at "+s),l.callDefer(a,!0,{path:s})):(j.debug("download fail: "+n),l.callDefer(a,!1,{path:s}))})}!function(){process.on("uncaughtException",function(e){var r=e.stack||e.name+": "+e.message;j.error(r),a.quit()}),j.transports.file.format="[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}",h.dev()&&F.dev?j.transports.file.level="debug":(j.transports.console=!1,j.transports.file.level="error"),i="26.0.0.131",s=h.windows()?"pepflashplayer"+(l.isAppX64()?"64":"32")+".dll":h.macOS()?"PepperFlashPlayer.plugin":"libpepflashplayer.so",s=p.join((t="FlashPlayer",p.join(l.getAppResourcePath(),"plugins",t,l.getPlatform())),s),j.error("initFlashPlugin: "+s+" version: "+i),a.commandLine.appendSwitch("ppapi-flash-path",s),a.commandLine.appendSwitch("ppapi-flash-version",i),e=p.join(__dirname,".."),r=S(),r.use("/",S.static(p.join(e,"renderer"))),r.listen(P),a.makeSingleInstance(function(e,r){o&&(o.isMinimized()&&o.restore(),o.focus())})&&a.quit();var e,r;var t,i,s;"arm"===l.getPlatform()&&a.commandLine.appendSwitch("ignore-gpu-blacklist"),a.on("ready",I).on("window-all-closed",function(e){return"darwin"!==process.platform&&a.quit()}).on("activate",function(e){return null===o&&_()}).on("will-quit",k).on("quit",function(e){return j.debug("app quit")}),D("getAppInfo",function(e){return l.resolvePromise(l.getAppInfo())}),D("getBaseUrl",function(e){return l.resolvePromise(A)}),D("loadSetting",function(e){return l.resolvePromise(n.setting||{})}),D("saveSetting",function(e){return r=e,n.setting=r,T();var r}),D("execFile",function(e){return l.execFile(e)}),D("execCommand",function(e,r){return l.execCommand(e,r)}),D("spawnCommand",function(e,r,t){return l.spawnCommand(e,r,t)}),D("readFile",function(e,r){return l.readFile(e,r)}),D("writeFile",function(e,r){return l.writeFile(e,r)}),D("moveFile",function(e,r,t){return l.moveFile(e,r,t)}),D("removeFile",function(e){return l.removeFile(e)}),D("showOpenDialog",function(e){return l.showOpenDialog(e)}),D("showSaveDialog",function(e){return l.showSaveDialog(e)}),D("request",function(e,r,t){return l.request(e,r,t)}),D("showItemInFolder",function(e){return l.resolvePromise(u.showItemInFolder(p.normalize(e)))}),D("openUrl",function(e){return l.resolvePromise(e&&u.openExternal(e))}),D("download",function(e,r){return function(e,r){var t=y.defer(),n=l.getDefer(),i=n.deferId,a=n.promise;r.deferId=i;var s=d.stringify(r);return j.debug("download "+e+", options: "+s),a.then(function(e){t.resolve(e)},function(e){e&&j.error(e),t.reject(e)},function(e){t.notify(e)}),o.webContents.downloadURL(e+"#"+s),t.promise}(e,r)}),D("installDriver",function(e){return function(e){var r=y.defer();j.debug("installDriver: "+e);var t=p.join(l.getAppDataPath(),"temp");return l.unzip(e,t).then(function(n){var o=p.join(t,p.basename(e,p.extname(e)),"setup.exe");l.execFile(o).then(function(e){r.resolve()})},function(e){e&&j.error(e),r.reject(e)}),r.promise}(e)}),D("checkUpdate",function(e){return r=e,t=y.defer(),n=l.getAppInfo(),o=r+"&appname="+n.name+"&release_version="+n.branch+"&version="+n.version+"&platform="+n.platform+"&arch="+n.arch+"&ext="+n.ext+"&features="+n.feature,j.debug("checkUpdate: "+o),l.request(o).then(function(e){t.resolve(e)},function(e){e&&j.error(e),t.reject(e)}),t.promise;var r,t,n,o}),D("removeOldVersions",function(e){return function(e){var r=y.defer();if(h.dev())return setTimeout(function(e){r.resolve()},10),r.promise;var t=l.getAppInfo(),n=p.join(l.getAppDataPath(),"download");return l.searchFiles(n+"/"+t.name+"-*."+t.ext).then(function(t){var o=/\d+\.\d+\.\d+/;t.map(function(e){return p.basename(e)}).filter(function(r){var t=r.match(o);return!!t&&l.versionCompare(t[0],e)<0}).forEach(function(e){l.removeFile(p.join(n,e),!0)}),r.resolve()},function(e){e&&j.error(e),r.reject(e)}),r.promise}(e)}),D("setToken",function(e){return v.set(e)}),D("saveToken",function(e){return v.save(e)}),D("loadToken",function(e){return v.load(e)}),D("removeToken",function(e){return v.remove()}),D("projectSave",function(e,r,t){return m.save(e,r,t)}),D("projectOpen",function(e,r){return m.open(e,r)}),D("projectNewSave",function(e,r,t,n){return m.newSave(e,r,t,n)}),D("projectNewSaveAs",function(e,r,t){return m.newSaveAs(e,r,t)}),D("projectNewOpen",function(e,r){return m.newOpen(e,r)}),D("projectSyncUrl",function(e){return m.setSyncUrl(e)}),D("projectSync",function(e){return m.sync()}),D("projectList",function(e){return m.list(e)}),D("projectUpload",function(e,r){return m.upload(e,r)}),D("projectDelete",function(e,r){return m.remove(e,r)}),D("projectDownload",function(e,r){return m.download(e,r)}),D("log",function(e,r){return(j[r]||j.debug).bind(j).call(e)}),D("copy",function(e,r){return f.writeText(e,r)}),D("quit",function(e){return a.quit()}),D("reload",function(e){return o.reload()}),D("fullscreen",function(e){return o.setFullScreen(!o.isFullScreen())}),D("min",function(e){return o.minimize()}),D("max",function(e){o.isFullScreen()?o.setFullScreen(!1):o.isMaximized()?o.unmaximize():o.maximize()}),D("errorReport",function(e){j.error("------ error message ------"),j.error(e.message+"("+e.src+" at line "+e.line+":"+e.col+")"),j.error(""+e.stack)}),j.debug("app start, version "+l.getVersion())}()},{"./project":2,"./token":3,"./util":4,crypto:void 0,electron:void 0,"electron-debug":void 0,"electron-is":void 0,"electron-log":void 0,express:void 0,"fs-extra":void 0,hasha:void 0,minimist:void 0,os:void 0,path:void 0,q:void 0,querystring:void 0}],2:[function(e,r,t){var n,o=e("path"),i=e("fs-extra"),a=e("q"),s=e("hasha"),c=e("electron-log"),u=e("jszip"),f=e("./util"),p=e("./token"),d=f.throttle(h,3e3);function l(e){var r=a.defer();e=e||"all",c.debug("project list: "+e);var t=p.get();if(!t||!n)return f.rejectPromise(null,r);var o=t.user_id,i=f.stamp(),s=f.rsa_encrypt("Kenrobot-"+o+"-"+i),u=n+"/list";return f.request(u,{method:"post",data:{id:o,stamp:i,sign:s,type:e}}).then(function(e){0==e.status?r.resolve(e.data):r.reject(e.message)},function(e){e&&c.error(e),r.reject(e)}),r.promise}function v(e,r){var t=a.defer();c.debug("project upload: "+e+" "+r);var s=p.get();if(!s||!n)return f.rejectPromise(null,t);var d=s.user_id,l=f.stamp(),v=f.rsa_encrypt("Kenrobot-"+d+"-"+l);return function(e,r,t){var n=a.defer(),s=new u,p=w(r,t);switch(t){case"edu":case"ide":s.file(p+"/"+r+".ino",i.createReadStream(o.join(e,p+"/"+r+".ino"))),s.file(p+"/project.json",i.createReadStream(o.join(e,p+"/project.json")));break;case"scratch2":case"scratch3":s.file(p,i.createReadStream(o.join(e,p)))}var d=o.join(f.getAppDataPath(),"temp",f.uuid(6)+".zip");return i.ensureDirSync(o.dirname(d)),s.generateNodeStream({streamFiles:!0,type:"nodebuffer"}).pipe(i.createWriteStream(d)).on("finish",function(e){n.resolve(d)}).on("error",function(e){e&&c.error(e),n.reject(e)}),n.promise}(b(d,r),e,r).then(function(o){var a=n+"/upload";f.request(a,{method:"post",headers:{id:d,stamp:l,sign:v,name:encodeURI(e),type:r},body:i.createReadStream(o)}).then(function(n){if(0==n.status){var o=n.data;g(o.name,o.type,o.modify_time).then(function(n){c.debug("project upload success: "+e+" "+r),t.resolve(o)},function(e){e&&c.error(e),t.reject(e)})}else t.reject(n.message)},function(e){e&&c.error(e),t.reject(e)})},function(e){e&&c.error(e),t.reject(e)}),t.promise}function m(e,r){var t=a.defer();c.debug("project download: "+e+" "+r);var s=p.get();if(!s||!n)return f.rejectPromise(null,t);var u=s.user_id,d=f.stamp(),l=f.rsa_encrypt("Kenrobot-"+u+"-"+d),v={id:u,stamp:d,sign:l,name:e,type:r},m=n+"/download";return f.request(m,{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify(v)},!1).then(function(n){var s=parseInt(n.headers.get("modify_time")),p=o.join(f.getAppDataPath(),"temp",f.uuid(6)+".zip");i.ensureDirSync(o.dirname(p));var d=i.createWriteStream(p);n.body.pipe(d),n.body.on("end",function(n){var o,i,d,l,v;(o=p,i=b(u,r),d=e,l=r,v=a.defer(),f.unzip(o,i).then(function(e){c.error("unzip success: "+d+" "+l),v.resolve()},function(e){e&&c.error(e),v.reject(e)}),v.promise).then(function(n){g(e,r,s).then(function(n){c.debug("project download success: "+e+" "+r),t.resolve()},function(e){e&&c.error(e),t.reject(e)})},function(e){e&&c.error(e),t.reject(e)})}).on("error",function(e){e&&c.error(e),t.reject(e)})},function(e){e&&c.error(e),t.reject(e)}),t.promise}function h(){var e=a.defer();return c.debug("project sync"),a.all([l(),j()]).then(function(r){var t=_slicedToArray(r,2);(function(e,r){var t=a.defer(),n=function(e,r){var t={},n={};e.forEach(function(e){t[e.name+"-"+e.type]=e}),r.forEach(function(e){n[e.name+"-"+e.type]=e});var a=[],s=[];return e.forEach(function(e){var r=e.name+"-"+e.type,t=n[r];!t||!t.modify_time||t.modify_time<e.modify_time?a.push(e):function(e,r){var t=p.get();if(!t)return!1;var n=b(t.user_id,r),a=o.join(n,w(e,r));return i.existsSync(a)}(e.name,e.type)||a.push(e)}),r.forEach(function(e){var r=e.name+"-"+e.type,n=t[r];(!n||n.modify_time<e.modify_time)&&s.push(e)}),[a,s]}(e,r),s=_slicedToArray(n,2),u=s[0],d=s[1];c.debug("doSync: downloadList:"+u.length+", uploadList:"+d.length);var l=u.length+d.length,h=0,g=function(e,r,n){h++,t.notify({total:l,count:h,name:e,type:r,action:n})};return(P=u,A=g,D=a.defer(),(F=function(e){if(0==P.length)return f.resolvePromise(!0,D);var r=P.shift();m(r.name,r.type).then(function(e){A(r.name,r.type,"download"),0==P.length?D.resolve():setTimeout(function(e){return F()},100)},function(e){e&&c.error(e),D.reject(e)})})(),D.promise).then((j=d,y=g,S=a.defer(),(x=function(e){if(0==j.length)return f.resolvePromise(!0,S);var r=j.shift();v(r.name,r.type).then(function(e){y(r.name,r.type,"upload"),0==j.length?S.resolve():setTimeout(function(e){return x()},100)},function(e){e&&c.error(e),S.reject(e)})})(),S.promise)).then(function(e){t.resolve()}).catch(function(e){e&&c.error(e),t.reject(e)}),t.promise;var j,y,x,S;var P,A,F,D})(t[0],t[1]).then(function(r){c.debug("project sync success"),e.resolve()},function(r){c.debug("project sync fail"),r&&c.error(r),e.reject(r)},function(r){e.notify(r)})},function(r){r&&c.error(r),e.reject(r)}),e.promise}function g(e,r,t){var n=a.defer();return j().then(function(o){var i=o.find(function(r){return r.name==e});i?i.modify_time=t:o.push({name:e,type:r,modify_time:t}),y(o).then(function(e){n.resolve()},function(e){e&&c.error(e),n.reject(e)})},function(e){e&&c.error(e),n.reject(e)}),n.promise}function j(){var e=a.defer(),r=p.get();if(!r)return f.rejectPromise(null,e);var t=x(r.user_id);return i.existsSync(t)?f.readJson(t):f.resolvePromise([],e)}function y(e){var r=p.get();return r?f.writeJson(x(r.user_id),e):f.rejectPromise()}function x(e){return o.join(f.getAppDataPath(),"projects",S(e,1),"list.json")}function b(e,r){return o.join(f.getAppDocumentPath(),"projects",S(e),r)}function w(e,r){var t;switch(r){case"edu":case"ide":t=e;break;case"scratch2":t=e+".sb2";break;case"scratch3":t=e+".json"}return t}function S(e,r){return r=r||0,s(""+e,{algorithm:"md5"}).substring(8*r,8*(r+1))}function P(e,r,t,n){var i=a.defer(),s=function(n){A(e,r,t,n).then(function(t){i.resolve({name:e,type:r,path:n,tag:"local"})},function(e){e&&c.error(e),i.reject(e)})};if(n)s(n);else{var u={};u.defaultPath=o.join(f.getAppPath("documents"),w(e,r)),"scratch2"==r?u.filters=[{name:"sb2",extensions:["sb2"]}]:"scratch3"==r&&(u.filters=[{name:"json",extensions:["json"]}]),f.showSaveDialog(u).then(function(e){s(e)},function(e){e&&c.error(e),i.reject(e)})}return i.promise}function A(e,r,t,n){return c.debug("project save: "+e+" "+r+" -> "+n),"edu"==r?a.all([f.writeFile(o.join(n,e+".ino"),t.project_data.code),f.writeJson(o.join(n,"project.json"),t)]):"ide"==r?a.all([f.writeFile(o.join(n,e+".ino"),t.project_data.code),f.writeJson(o.join(n,"project.json"),t)]):"scratch2"==r?f.writeFile(n,new Buffer(t,"base64")):"scratch3"==r?f.writeFile(n,t):f.rejectPromise()}r.exports.setSyncUrl=function(e){c.debug("project setSyncUrl: "+e),n=e},r.exports.sync=h,r.exports.list=l,r.exports.upload=v,r.exports.remove=function(e,r){var t=a.defer();c.debug("project remove: "+e+" "+r);var i=p.get();if(!i||!n)return f.rejectPromise(null,t);var s=i.user_id,u=f.stamp(),d=f.rsa_encrypt("Kenrobot-"+s+"-"+u),l=n+"/delete";return f.request(l,{method:"post",data:{id:s,stamp:u,sign:d,name:e,type:r}}).then(function(n){var i,u;0==n.status?a.all([f.removeFile(o.join(b(s,r),w(e,r))),(i=e,u=a.defer(),j().then(function(e){var r=e.findIndex(function(e){return e.name==i});r<0?u.resolve():(e.splice(r,1),y(e).then(function(e){u.resolve()},function(e){e&&c.error(e),u.reject(e)}))},function(e){e&&c.error(e),u.reject(e)}),u.promise)]).then(function(n){c.debug("project remove success: "+e+" "+r),t.resolve()},function(e){e&&c.error(e),t.reject(e)}):t.reject(n.message)},function(e){e&&c.error(e),t.reject(e)}),t.promise},r.exports.download=m,r.exports.newSave=function(e,r,t,n){var i=a.defer(),s=p.get();if(!s){var u=o.join(f.getAppDocumentPath(),"projects");return n&&n.startsWith(u)&&(n=null),P(e,r,t,n)}var l=b(s.user_id,r);return n=o.join(l,w(e,r)),A(e,r,t,n).then(function(t){g(e,r,f.stamp()).then(function(t){d(),i.resolve({name:e,type:r,path:n,tag:"network"})},function(e){e&&c.error(e),i.reject(e)})},function(e){e&&c.error(e),i.reject(e)}),i.promise},r.exports.newSaveAs=P,r.exports.newOpen=function(e,r){var t=a.defer();c.debug("project open: "+e);var n=function(r){(function(e,r){var t=a.defer();if(c.debug("project open: "+r+" -> "+e),"edu"==r)f.readJson(o.join(e,"project.json")).then(function(n){t.resolve({extra:{name:o.basename(e),type:r,path:e},data:n})},function(e){e&&c.error(e),t.reject(e)});else if("ide"==r){var n=o.dirname(e),i=o.basename(e,o.extname(e));if(o.basename(n)!=i)return f.rejectPromise({path:e,newPath:o.join(n,i,i+".ino"),status:"DIR_INVALID"},t);f.readFile(e).then(function(e){t.resolve({extra:{name:i,type:r,path:n},data:e})},function(e){e&&c.error(e),t.reject(e)})}else"scratch2"==r?f.readFile(e,"base64").then(function(n){t.resolve({extra:{name:o.basename(e,o.extname(e)),type:r,path:e},data:n})},function(e){e&&c.error(e),t.reject(e)}):"scratch3"==r?f.readFile(e).then(function(n){t.resolve({extra:{name:o.basename(e,o.extname(e)),type:r,path:e},data:n})},function(e){e&&c.error(e),t.reject(e)}):f.rejectPromise(null,t);return t.promise})(r,e).then(function(e){t.resolve(e)},function(e){e&&c.error(e),t.reject(e)})},i=p.get();if(r){if(!i)return f.rejectPromise(null,t);var s=o.join(b(i.user_id,e),w(r,e));return n(s),t.promise}var u={};return u.defaultPath=i?b(i.user_id,e):f.getAppPath("documents"),"edu"==e?u.properties=["openDirectory"]:"ide"==e?(u.properties=["openFile"],u.filters=[{name:"ino",extensions:["ino"]}]):"scratch2"==e?(u.properties=["openFile"],u.filters=[{name:"sb2",extensions:["sb2"]}]):"scratch3"==e&&(u.properties=["openFile"],u.filters=[{name:"json",extensions:["json"]}]),f.showOpenDialog(u).then(function(e){n(e)},function(e){e&&c.error(e),t.reject(e)}),t.promise}},{"./token":3,"./util":4,"electron-log":void 0,"fs-extra":void 0,hasha:void 0,jszip:void 0,path:void 0,q:void 0}],3:[function(e,r,t){var n,o=e("path"),i=e("crypto"),a=e("q"),s=e("fs-extra"),c=e("./util"),u=e("electron-log");function f(){return o.join(c.getAppDataPath(),"token")}r.exports.get=function(){return n},r.exports.set=function(e){n=e},r.exports.remove=function(){n=null,c.removeFile(f(),!0)},r.exports.save=function(e){var r=a.defer(),t=i.randomBytes(128);return c.writeFile(f(),c.encrypt(JSON.stringify(e),t)).then(function(e){r.resolve(t.toString("hex"))},function(e){e&&u.error(e),r.reject(e)}),r.promise},r.exports.load=function(e){var r=a.defer(),t=f();return s.existsSync(t)?(c.readFile(t,"utf8").then(function(t){try{var n=c.decrypt(t,Buffer.from(e,"hex"));r.resolve(JSON.parse(n))}catch(e){r.reject()}},function(e){e&&u.error(e),r.reject(e)}),r.promise):(setTimeout(function(e){r.reject()},10),r.promise)}},{"./util":4,crypto:void 0,"electron-log":void 0,"fs-extra":void 0,path:void 0,q:void 0}],4:[function(e,r,t){var n=e("os"),o=e("child_process"),i=e("path"),a=e("crypto"),s=e("electron"),c=s.app,u=s.dialog,f=s.BrowserWindow,p=e("electron-log"),d=e("electron-is"),l=e("q"),v=e("fs-extra"),m=e("glob"),h=e("sudo-prompt"),g=e("iconv-lite"),j=e("7zip-bin").path7za.replace("app.asar","app.asar.unpacked"),y=e("node-fetch"),x=e("../package"),b="-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7Jat1/19NDxOObrFpW8USTia6\nuHt34Sac1Arm6F2QUzsdUEUmvGyLIOIGcdb+F6pTdx4ftY+wZi7Aomp4k3vNqXmX\nT0mE0vpQlCmsPUcMHXuUi93XTGPxLXIv9NXxCJZXSYI0JeyuhT9/ithrYlbMlyNc\nwKB/BwSpp+Py2MTT2wIDAQAB\n-----END PUBLIC KEY-----\n";d.dev()&&c.setName(x.name);var w={},S=0;function P(){return"x64"===process.arch||process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432")}function A(){return d.windows()?"win":d.macOS()?"mac":n.arch().indexOf("arm")>=0?"arm":"linux"}function F(){return d.dev()?x.version:c.getVersion()}function D(){return parseInt((new Date).getTime()/1e3)}function I(e,r,t){var n=l.defer();return r=r||{},t=t||!1,p.debug("execCommand:"+e+", options: "+JSON.stringify(r)+", useSudo: "+t),t?h.exec(e,{name:"kenrobot"},function(e,r,t){if(r=d.windows()?g.decode(r||"","gbk"):r,t=d.windows()?g.decode(t||"","gbk"):t,e)return p.error(e),r&&p.error(r),t&&p.error(t),void n.reject(t||r||e);d.dev()&&p.debug(r),n.resolve(r)}):o.exec(e,r,function(e,r,t){if(r=d.windows()?g.decode(r||"","gbk"):r,t=d.windows()?g.decode(t||"","gbk"):t,e)return p.error(e),r&&p.error(r),t&&p.error(t),void n.reject(t||r||e);d.dev()&&p.debug(r),n.resolve(r)}),n.promise}function _(e,r,t){var n=l.defer(),i=o.spawn(e,r,t),a="",s="";return i.stdout.on("data",function(e){var r=d.windows()?g.decode(e,"gbk"):e.toString();d.dev()&&p.debug(r),a+=r,n.notify({type:"stdout",data:r})}),i.stderr.on("data",function(e){var r=d.windows()?g.decode(e,"gbk"):e.toString();d.dev()&&p.debug(r),s+=r,n.notify({type:"stderr",data:r})}),i.on("close",function(e){0==e?n.resolve(a):n.reject(s)}),n.promise}r.exports.isX64=P,r.exports.isAppX64=function(){return d.dev()?P():64===x.buildInfo.appBit},r.exports.getPlatform=A,r.exports.getVersion=F,r.exports.getAppInfo=function(){var e={bit:P()?64:32,arch:process.arch,platform:A(),version:F(),name:c.getName()};return d.dev()?(e.ext=i.extname(c.getPath("exe")).replace(".",""),e.branch="beta",e.feature="",e.date=D()):(e.ext=x.buildInfo.ext,e.branch=x.buildInfo.branch,e.feature=x.buildInfo.feature,e.date=x.buildInfo.date),e},r.exports.getAppDataPath=function(){return i.join(c.getPath("appData"),c.getName())},r.exports.getAppResourcePath=function(){return d.windows()||d.dev()?i.resolve("."):i.resolve(c.getAppPath(),"..","..")},r.exports.getAppDocumentPath=function(){return i.join(c.getPath("documents"),c.getName())},r.exports.getAppPath=function(e){return c.getPath(e)},r.exports.versionCompare=function(e,r){for(var t=/(\d+)\.(\d+)\.(\d+)/,n=t.exec(e),o=t.exec(r),i=[parseInt(n[1]),parseInt(n[2]),parseInt(n[3])],a=[parseInt(o[1]),parseInt(o[2]),parseInt(o[3])],s=0;s<=2;s++)if(i[s]!=a[s])return i[s]>a[s]?1:-1;return 0},r.exports.postMessage=function(e){for(var r=arguments.length,t=Array(r>1?r-1:0),n=1;n<r;n++)t[n-1]=arguments[n];p.debug("postMessage: "+e+", "+t.join(", "));var o=f.getAllWindows();o&&o.length&&o[0].webContents.send(e,t)},r.exports.getDefer=function(){var e=l.defer(),r=S++;return w[r]=e,{deferId:r,promise:e.promise}},r.exports.callDefer=function(e,r){var t=w[e];if(t){var n;"notify"==r?n=t.notify:(delete w[e],n=r?t.resolve:t.reject);for(var o=arguments.length,i=Array(o>2?o-2:0),a=2;a<o;a++)i[a-2]=arguments[a];n.apply(this,i)}},r.exports.handleQuotes=function(e){return d.windows()?e:e.replace(/"/g,"")},r.exports.uuid=function(e,r){var t,n,o="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),i=[];if(r=r||o.length,e)for(t=0;t<e;t++)i[t]=o[0|Math.random()*r];else for(i[8]=i[13]=i[18]=i[23]="-",i[14]="4",t=0;t<36;t++)i[t]||(n=0|16*Math.random(),i[t]=o[19==t?3&n|8:n]);return i.join("")},r.exports.stamp=D,r.exports.throttle=function(e,r){var t;return function(n){t&&clearTimeout(t),t=setTimeout(function(r){e(),clearTimeout(t),t=null},r)}},r.exports.encrypt=function(e,r,t){t=t||"aes-128-cbc";var n=a.createCipher(t,r),o=n.update(e,"utf8","binary");return o+=n.final("binary"),o=new Buffer(o,"binary").toString("base64")},r.exports.decrypt=function(e,r,t){t=t||"aes-128-cbc",e=new Buffer(e,"base64").toString("binary");var n=a.createDecipher(t,r),o=n.update(e,"binary","utf8");return o+=n.final("utf8")},r.exports.rsa_encrypt=function(e,r){r=r||b;var t=new Buffer(e);return a.publicEncrypt({key:r,padding:a.constants.RSA_PKCS1_PADDING},t).toString("base64")},r.exports.rsa_decrypt=function(e,r){var t=new Buffer(e,"base64");return a.privateDecrypt({key:r,padding:a.constants.RSA_PKCS1_PADDING},t).toString("utf8")},r.exports.resolvePromise=function(e,r){return r=r||l.defer(),setTimeout(function(t){r.resolve(e)},10),r.promise},r.exports.rejectPromise=function(e,r){return r=r||l.defer(),setTimeout(function(t){r.reject(e)},10),r.promise},r.exports.execFile=function(e){var r=l.defer();return p.debug("execFile: "+e),I(d.windows()?"start /WAIT "+e:""+e,null,!0).fin(function(e){r.resolve()}),r.promise},r.exports.execCommand=I,r.exports.spawnCommand=_,r.exports.readFile=function(e,r,t){if(t)return v.readFileSync(e,r);var n=l.defer();return r=r||"utf8",v.readFile(e,r,function(e,r){if(e)return p.error(e),void n.reject(e);n.resolve(r)}),n.promise},r.exports.writeFile=function(e,r,t,n){if(!n){var o=l.defer();return v.outputFile(e,r,t,function(e){if(e)return p.error(e),void o.reject(e);o.resolve()}),o.promise}v.outputFileSync(e,r,t)},r.exports.moveFile=function(e,r,t){var n=l.defer();return t=t||{overwrite:!0},v.move(e,r,t,function(e){if(e)return p.error(e),void n.reject(e);n.resolve()}),n.promise},r.exports.removeFile=function(e,r){if(!r){var t=l.defer();return v.remove(e,function(e){if(e)return p.error(e),void t.reject(e);t.resolve()}),t.promise}v.removeSync(e)},r.exports.readJson=function(e,r){var t=l.defer();return r=r||{},v.readJson(e,r,function(e,r){if(e)return p.error(e),void t.reject(e);t.resolve(r)}),t.promise},r.exports.writeJson=function(e,r,t,n){if(!n){var o=l.defer();return t=t||{},v.outputJson(e,r,t,function(e){if(e)return p.error(e),void o.reject(e);o.resolve()}),o.promise}v.outputJsonSync(e,r,t)},r.exports.searchFiles=function(e){var r=l.defer();return p.debug("searchFiles: "+e),m(e,{},function(e,t){return e?(p.error(e),void r.reject(e)):r.resolve(t)}),r.promise},r.exports.unzip=function(e,r,t){var n=l.defer(),o=/([\d]+)% \d+ - .*\r?/g;return p.debug("unzip: "+e+" => "+r),t?_('"'+j+'"',["x",'"'+e+'"',"-bsp1","-y",'-o"'+r+'"'],{shell:!0}).then(function(e){n.resolve(e)},function(e){e&&p.error(e),n.reject(e)},function(e){if(o.lastIndex=0,o.test(e.data)){for(var r,t=o.exec(e.data);r=t,t=o.exec(e.data););n.notify(parseInt(r[1]))}}):I('"'+j+'" x "'+e+'" -y -o"'+r+'"').then(function(e){n.resolve()},function(e){e&&p.error(e),n.reject(e)}),n.promise},r.exports.zip=function(e,r,t,n){var o=l.defer();return r=r instanceof Array?r:[r],I('cd "'+e+'" && "'+j+'" a -t'+(n=n||"7z")+" -r "+t+" "+r.join(" ")).then(function(e){o.resolve()},function(e){e&&p.error(e),o.reject(e)}),o.promise},r.exports.showOpenDialog=function(e,r){var t=l.defer();return(e=e||{}).title="打开",e.defaultPath=e.defaultPath||c.getPath("documents"),e.buttonLabel="打开",r=r||f.getAllWindows()[0],u.showOpenDialog(r,e,function(e){e?t.resolve(e[0]):t.reject()}),t.promise},r.exports.showSaveDialog=function(e,r){var t=l.defer();return(e=e||{}).title="保存",e.defaultPath=e.defaultPath||c.getPath("documents"),e.buttonLabel="保存",r=r||f.getAllWindows()[0],u.showSaveDialog(r,e,function(e){e?t.resolve(e):t.reject()}),t.promise},r.exports.request=function(e,r,t){var n=l.defer();if(t=!1!==t,(r=r||{}).method=r.method||"GET",t&&r.data){r.body=JSON.stringify(r.data);var o=r.headers||(r.headers={});o["Content-Type"]="application/json",o.Accept="application/json",delete r.data}return y(e,r).then(function(e){if(e.ok)return t?e.json():e;var r=new Error(e.statusText);throw r.status=e.status,r}).then(function(e){n.resolve(e)}).catch(function(e){e&&p.error(e),n.reject(e)}),n.promise}},{"../package":void 0,"7zip-bin":void 0,child_process:void 0,crypto:void 0,electron:void 0,"electron-is":void 0,"electron-log":void 0,"fs-extra":void 0,glob:void 0,"iconv-lite":void 0,"node-fetch":void 0,os:void 0,path:void 0,q:void 0,"sudo-prompt":void 0}]},{},[1]);
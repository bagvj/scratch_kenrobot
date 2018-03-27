"use strict";var _slicedToArray=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var n=[],r=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e}finally{try{!r&&s.return&&s.return()}finally{if(o)throw i}}return n}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")};!function i(a,s,u){function c(n,e){if(!s[n]){if(!a[n]){var t="function"==typeof require&&require;if(!e&&t)return t(n,!0);if(f)return f(n,!0);var r=new Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[n]={exports:{}};a[n][0].call(o.exports,function(e){var t=a[n][1][e];return c(t||e)},o,o.exports,i,a,s,u)}return s[n].exports}for(var f="function"==typeof require&&require,e=0;e<u.length;e++)c(u[e]);return c}({1:[function(e,t,n){t.exports={SUCCESS:0,INVALID_PARAM:1,SYSTEM_ERROR:100,LOGIN_REQUIRED:200,PERMISSION_DENIED:201,INVALID_USER_TOKEN_SIGN:202,USER_TOKEN_EXPIRED:203,USER_NOT_EXITS:204,API_ERROR:300,INVALID_SSO_TICKET:301,INVALID_SSO_SESSION:302,INVALID_SSO_BROKER:303,INVLAID_SSO_SIGN:304}},{}],2:[function(e,t,n){t.exports={CHECK_UPDATE:"http://www.kenrobot.com/downloads/checkupdate",REPORT:"http://server.kenrobot.com/statistics/report",REGISTER:"http://server.kenrobot.com/register",FIND_PASSWORD:"http://server.kenrobot.com/password/email",LOGIN:"http://server.kenrobot.com/api/auth/login",LOGOUT:"http://server.kenrobot.com/api/auth/logout",WEIXIN_QRCODE:"http://server.kenrobot.com/api/auth/weixin/token",WEIXIN_LOGIN:"http://server.kenrobot.com/api/auth/weixin/login",VERIFY:"http://server.kenrobot.com/api/auth/verify",PACKAGE:"http://www.kenrobot.com/packages/packages.json",PROJECT_SYNC_LIST:"http://server.kenrobot.com/api/project/sync/list",PROJECT_SYNC_CREATE:"http://server.kenrobot.com/api/project/sync/create",PROJECT_SYNC_DELETE:"http://server.kenrobot.com/api/project/sync/delete",PROJECT_SYNC_UPLOAD:"http://server.kenrobot.com/api/project/sync/upload",PROJECT_SYNC_DOWNLOAD:"http://server.kenrobot.com/api/project/sync/download",PROJECT_SYNC_ITEM:"http://server.kenrobot.com/api/project/sync/item"}},{}],3:[function(e,t,n){var r,o,s,i,a,u,c=e("electron"),f=c.app,p=c.BrowserWindow,l=(c.dialog,c.ipcMain,c.shell),d=c.clipboard,v=e("path"),m=e("querystring"),h=e("electron-is"),g=e("electron-debug"),j=e("electron-log"),x=e("q"),y=e("fs-extra"),b=e("command-line-args"),w=e("hasha"),S=e("lodash"),I=e("terminate"),P=e("./util/util"),E=e("./config/url"),_=(e("./model/token"),e("./model/project")),D=e("./model/user"),A=e("./util/cache"),O=e("express"),T=8776,C="http://localhost:"+T,R="config",N=P.listenMessage,k=[{name:"debug-brk",type:Number,defaultValue:!1},{name:"dev",alias:"d",type:Boolean,defaultValue:!1},{name:"devTool",alias:"t",type:Boolean,defaultValue:!1},{name:"fullscreen",alias:"f",type:Boolean,defaultValue:!1},{name:"maximize",alias:"m",type:Boolean,defaultValue:!1},{name:"project",alias:"p",type:_.check,defaultOption:!0}],F=b(k,{argv:process.argv.slice(1),partial:!0}),q=h.dev()&&F.dev,L=h.dev(),U={};function B(){j.debug("app ready"),q&&g({enabled:!0,showDevTools:!0}),F.project&&(i=F.project),J(),function(){if(L||o.version==P.getVersion())return;o.version=P.getVersion(),o.reportInstall=!1,!0,r.setItem(R,o)}(),function(){L||o.reportInstall||V(null,"installations").then(function(){o.reportInstall=!0,r.setItem(R,o)});V(null,"open")}()}function J(){s=new p({width:1200,height:720,minWidth:1200,minHeight:720,frame:!1,show:!1,webPreferences:{plugins:!0,webSecurity:!1}}),F.fullscreen?s.setFullScreen(!0):F.maximize&&s.maximize(),s.on("closed",function(){return s=null}).once("ready-to-show",function(){return s.show()}).on("enter-full-screen",function(){return P.postMessage("app:onFullscreenChange",!0)}).on("leave-full-screen",function(){return P.postMessage("app:onFullscreenChange",!1)}),s.webContents.on("will-navigate",function(e){return e.preventDefault()}),s.webContents.session.on("will-download",Y),s.loadURL(C),s.focus()}function M(e,t){e.preventDefault(),i=_.check(t),a&&W().then(function(e){P.postMessage("app:onLoadProject",e)},function(e){e&&j.info(e)})}function z(e){u||(e.preventDefault(),P.postMessage("app:onBeforeQuit"))}function G(e){return P.removeFile(v.join(P.getAppPath("appData"),"temp"),!0),!0}function V(t,n){var r=x.defer(),e=P.getAppInfo(),o={version:e.version,platform:e.platform,bit:e.appBit,ext:e.ext,branch:e.branch,feature:e.feature};return t=S.merge({},t,o),n=n||"log",P.request(E.REPORT,{method:"post",data:{data:JSON.stringify(t),type:n}}).then(function(){r.resolve()},function(e){j.info("report error: type: "+n+", "+JSON.stringify(t)),e&&j.info(e),r.reject(e)}),r.promise}function Y(e,n,t){var r=P.uuid(6),o=(U[r]=n).getURL(),i=o.lastIndexOf("#"),a=m.parse(o.substring(i+1));o=o.substring(0,i);var s=a.deferId,u=v.join(P.getAppPath("appData"),"download",n.getFilename());if(a.checksum&&y.existsSync(u)){i=a.checksum.indexOf(":");var c=a.checksum.substring(0,i).replace("-","").toLowerCase();if(a.checksum.substring(i+1)==w.fromFileSync(u,{algorithm:c}))return n.cancel(),j.debug("download cancel, "+o+" has cache"),void P.callDefer(s,!0,{path:u})}n.setSavePath(u);var f=n.getTotalBytes();n.on("updated",function(e,t){"interrupted"==t?(U[r]&&delete U[r],j.debug("download interrupted: "+o),P.callDefer(s,!1,{path:u})):"progressing"===t&&(n.isPaused()?(U[r]&&delete U[r],j.debug("download paused: "+o),P.callDefer(s,!1,{path:u})):P.callDefer(s,"notify",{taskId:r,path:u,totalSize:f,size:n.getReceivedBytes()}))}),n.once("done",function(e,t){U[r]&&delete U[r],"completed"==t?(j.debug("download success: "+o+", at "+u),P.callDefer(s,!0,{path:u})):(j.debug("download fail: "+o),P.callDefer(s,!1,{path:u}))})}function W(){if(a=!0,i){j.debug("loadOpenProject: "+i);var e=i;return i=null,_.read(e)}return P.rejectPromise()}!function(){process.on("uncaughtException",function(e){var t=e.stack||e.name+": "+e.message;j.info(t),f.quit()}),q?(j.transports.console.level="debug",j.transports.file.level="debug"):(j.transports.console=!1,j.transports.file.format="[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}",j.transports.file.level="info"),function(){P.getAppInfo();var e="26.0.0.131",t=P.getAppPath("plugins","FlashPlayer");j.debug("initFlashPlugin: "+t+" version: "+e),f.commandLine.appendSwitch("ppapi-flash-path",t),f.commandLine.appendSwitch("ppapi-flash-version",e)}(),e=v.join(__dirname,".."),t=O(),t.use("/",O.static(v.join(e,"renderer"))),t.listen(T),r=new A(R),o=r.getItem(R,{}),P.removeFile(v.join(P.getAppPath("appData"),"config.json"),!0),f.makeSingleInstance(function(e,t){if(s){s.isMinimized()&&s.restore(),s.focus();var n=b(k,{argv:e.slice(1),partial:!0});n.project&&(i=n.project),j.debug("app second run"),W().then(function(e){P.postMessage("app:onLoadProject",e)},function(e){e&&j.info(e)})}})&&f.quit();var e,t;f.on("ready",B).on("window-all-closed",function(){return"darwin"!==process.platform&&f.quit()}).on("activate",function(){return null===s&&J()}).on("before-quit",z).on("will-quit",G).on("quit",function(){return j.debug("app quit")}),h.macOS()&&f.on("open-file",M),function(){N("getAppInfo",function(){return P.resolvePromise(P.getAppInfo())}),N("getBaseUrl",function(e){return P.resolvePromise(C)}),N("execFile",function(e){return P.execFile(e)}),N("execCommand",function(e,t){return P.execCommand(e,t)}),N("spawnCommand",function(e,t,n){return P.spawnCommand(e,t,n)}),N("readFile",function(e,t){return P.readFile(e,t)}),N("writeFile",function(e,t){return P.writeFile(e,t)}),N("saveFile",function(e,t,n){return P.saveFile(e,t,n)}),N("moveFile",function(e,t,n){return P.moveFile(e,t,n)}),N("removeFile",function(e){return P.removeFile(e)}),N("searchFiles",function(e){return P.searchFiles(e)}),N("readJson",function(e,t){return P.readJson(e,t)}),N("writeJson",function(e,t,n,r){return P.writeJson(e,t,n,r)}),N("showOpenDialog",function(e){return P.showOpenDialog(e)}),N("showSaveDialog",function(e){return P.showSaveDialog(e)}),N("request",function(e,t,n){return P.request(e,t,n)}),N("showItemInFolder",function(e){return P.resolvePromise(l.showItemInFolder(v.normalize(e)))}),N("openUrl",function(e){return P.resolvePromise(e&&l.openExternal(e))}),N("buildProject",function(e,t){return buildProject(e,t)}),N("uploadFirmware",function(e,t,n){return uploadFirmware(e,t,n)}),N("download",function(e,t){return function(e,t){var n=x.defer(),r=P.getDefer(),o=r.deferId,i=r.promise;t.deferId=o;var a=m.stringify(t);return j.debug("download "+e+", options: "+a),i.then(function(e){n.resolve(e)},function(e){e&&j.info(e),n.reject(e)},function(e){n.notify(e)}),s.webContents.downloadURL(e+"#"+a),n.promise}(e,t)}),N("cancelDownload",function(e){var t;(t=U[e])&&t.cancel()}),N("checkUpdate",function(){return t=x.defer(),e=P.getAppInfo(),n=e.feature?e.feature+","+e.arch:e.arch,r=E.CHECK_UPDATE+"?appname="+e.name+"&release_version="+e.branch+"&version="+e.version+"&platform="+e.platform+"&ext="+e.ext+"&features="+n,j.debug("checkUpdate: "+r),P.request(r).then(function(e){t.resolve(e)},function(e){e&&j.info(e),t.reject(e)}),t.promise;var t,e,n,r}),N("removeOldVersions",function(e){return r=e,t=x.defer(),n=P.getAppInfo(),o=v.join(P.getAppPath("appData"),"download"),P.searchFiles(o+"/"+n.name+"-*."+n.ext).then(function(e){var n=/\d+\.\d+\.\d+/;e.map(function(e){return v.basename(e)}).filter(function(e){var t=e.match(n);return!!t&&P.versionCompare(t[0],r)<0}).forEach(function(e){P.removeFile(v.join(o,e),!0)}),t.resolve()},function(e){e&&j.info(e),t.reject(e)}),t.promise;var r,t,n,o}),N("reportToServer",function(e,t){return V(e,t)}),N("loadToken",function(){return D.loadToken()}),N("login",function(e,t){return D.login(e,t)}),N("logout",function(){return D.logout()}),N("weixinLogin",function(e){return D.weixinLogin(e)}),N("weixinQrcode",function(){return D.weixinQrcode()}),N("register",function(e){return D.register(e)}),N("resetPassword",function(e){return D.resetPassword(e)}),N("setCache",function(e,t){return e!==R?r.setItem(e,t):P.rejectPromise()}),N("getCache",function(e,t){return e!==R?P.resolvePromise(r.getItem(e,t)):P.rejectPromise()}),N("loadOpenOrRecentProject",function(){return t=x.defer(),W().then(function(e){t.resolve(e)},function(){var e=r.getItem("recentProject");e?_.read(e).then(function(e){t.resolve(e)},function(e){t.reject(e)}):P.rejectPromise(null,t)}),t.promise;var t}),N("projectRead",function(e){return _.read(e)}),N("projectOpen",function(e,t){return _.open(e,t)}),N("projectSave",function(e,t,n,r){return _.save(e,t,n,r)}),N("projectSaveAs",function(e,t,n){return _.saveAs(e,t,n)}),N("projectSync",function(e){return _.sync(e)}),N("projectList",function(e){return _.list(e)}),L&&(N("projectCreate",function(e){return _.create(e)}),N("projectUpload",function(e,t){return _.upload(e,t)}),N("projectDelete",function(e,t){return _.remove(e,t)}),N("projectDownload",function(e,t){return _.download(e,t)}));N("log",function(e,t){return(j[t]||j.debug).bind(j).call(e)}),N("copy",function(e,t){return d.writeText(e,t)}),N("quit",function(){return f.quit()}),N("exit",function(){return(u=!0)&&G()&&I(process.pid)}),N("reload",function(){return s.reload()}),N("relaunch",function(){return f.relaunch({args:process.argv.slice(1).concat(["--relaunch"])}),void f.exit(0)}),N("fullscreen",function(){return s.setFullScreen(!s.isFullScreen())}),N("min",function(){return s.minimize()}),N("max",function(){s.isFullScreen()?s.setFullScreen(!1):s.isMaximized()?s.unmaximize():s.maximize()}),N("errorReport",function(e,t){return n=e,r=t,void j.info(r+": "+n);var n,r})}(),j.debug("app "+f.getName()+" start, version "+P.getVersion())}()},{"./config/url":2,"./model/project":4,"./model/token":5,"./model/user":6,"./util/cache":7,"./util/util":8,"command-line-args":void 0,electron:void 0,"electron-debug":void 0,"electron-is":void 0,"electron-log":void 0,express:void 0,"fs-extra":void 0,hasha:void 0,lodash:void 0,path:void 0,q:void 0,querystring:void 0,terminate:void 0}],4:[function(e,t,n){var m=e("path"),u=e("fs-extra"),h=e("q"),r=e("hasha"),g=e("electron-log"),j=e("../util/util"),c=e("./token"),f=e("../config/url"),x=".kbl",a=j.throttle(o,2e3);function y(e){return e&&m.extname(e)==x&&u.existsSync(e)?e:null}function s(t){var n=h.defer(),r=m.extname(t);return".sb2"===r?j.readFile(t,"base64").then(function(e){n.resolve({type:"scratch2",project_name:m.basename(t,m.extname(t)),path:t,data:e})},function(e){e&&g.error(e),n.reject(e)}):j.readJson(t).then(function(e){r===x?(e.path=t,n.resolve(e)):n.resolve({type:"scratch3",project_name:m.basename(t,m.extname(t)),path:t,data:e})},function(e){e&&g.info(e),n.reject(e)}),n.promise}function p(e,n,r,t){var o=h.defer(),i=function(e,t){l(e,t,n,r,"local").then(function(e){o.resolve(e)},function(e){e&&g.info(e),o.reject(e)})};return t?i(t,e):j.showSaveDialog({filters:D(r)}).then(function(e){i(e,m.basename(e,m.extname(e)))},function(e){e&&g.info(e),o.reject(e)}),o.promise}function o(e){var n=h.defer();return g.debug("project sync"),h.all([i(e),d()]).then(function(e){var t=_slicedToArray(e,2);(function(e,t){var a=h.defer(),n=function(e,t){var n={},r={};e.forEach(function(e){n[""+e.name]=e}),t.forEach(function(e){r[""+e.name]=e});var o=[],i=[],a=[];return e.forEach(function(e){var t=r[e.name];!t||!t.modify_time||t.modify_time<e.modify_time?o.push(e):y(m.join(E(),e.name+x))||o.push(e)}),t.forEach(function(e){var t=n[e.name];t?t.modify_time<e.modify_time&&i.push(e):(a.push(e),i.push(e))}),[a,o,i]}(e,t),r=_slicedToArray(n,3),s=r[0],o=r[1],u=r[2];g.debug("doSync: createList:"+s.length+", downloadList:"+o.length+", uploadList:"+u.length);var i=s.length+o.length+u.length,c=0,f=function(e,t){c++,a.notify({total:i,count:c,name:e,action:t})};return(p=o,l=f,v=h.defer(),(d=function(){if(0==p.length)return j.resolvePromise(!0,v);var e=p.shift();S(e.name,e.hash,e.type).then(function(){l(e.name,"download"),0==p.length?v.resolve():setTimeout(function(){return d()},100)},function(e){e&&g.info(e),v.reject(e)})})(),v.promise).then(function(){var n,r,o,i;(n=s,r=f,i=h.defer(),(o=function(){if(0==n.length)return j.resolvePromise(!0,i);var t=n.shift();b(t.type,t.name).then(function(e){t.hash=e.hash,r(t.name,"create"),0==n.length?i.resolve():setTimeout(function(){return o()},100)},function(e){e&&g.info(e),i.reject(e)})})(),i.promise).then(function(){var t,n,r,o;(t=u,n=f,o=h.defer(),(r=function(){if(0==t.length)return j.resolvePromise(!0,o);var e=t.shift();w(e.name,e.hash).then(function(){n(e.name,"upload"),0==t.length?o.resolve():setTimeout(function(){return r()},100)},function(e){e&&g.info(e),o.reject(e)})})(),o.promise).then(function(){a.resolve()},function(e){e&&g.info(e),a.reject(e)})},function(e){e&&g.info(e),a.reject(e)})},function(e){e&&g.info(e),a.reject(e)}),a.promise;var p,l,d,v})(t[0],t[1]).then(function(){g.debug("project sync success"),n.resolve()},function(e){g.debug("project sync fail"),e&&g.info(e),n.reject(e)},function(e){n.notify(e)})},function(e){e&&g.info(e),n.reject(e)}),n.promise}function i(e){var t=(e||"scratch2,scratch3").split(","),n=h.defer();return g.debug("project list: "+t.join(" ")),c.request(f.PROJECT_SYNC_LIST,{method:"post",data:{type:t.join(",")}}).then(function(e){0==e.status?n.resolve(e.data.filter(function(e){return 0<=t.indexOf(e.type)})):n.reject(e.message)},function(e){e&&g.info(e),n.reject(e)}),n.promise}function b(n,r){var o=h.defer();return g.debug("project create: "+r+":"+n),c.request(f.PROJECT_SYNC_CREATE,{method:"post",data:{name:r,type:n}}).then(function(e){if(0==e.status){var t=e.data;I(n,t.name,t.modify_time,t.hash).then(function(){g.debug("project create success: "+r+" "+t.hash),o.resolve(t)},function(e){e&&g.info(e),o.reject(e)})}else o.reject(e.message)},function(e){e&&g.info(e),o.reject(e)}),o.promise}function w(n,r){var e,t,o,i,a,s=h.defer();return g.debug("project upload: "+n+": "+r),(e=E(),t=n,o=h.defer(),i=m.join(j.getAppPath("appData"),"temp",j.uuid(6)+".7z"),a=[""+t+x],j.compress(e,a,i).then(function(){o.resolve(i)},function(e){e&&g.info(e),o.reject(e)}),o.promise).then(function(e){var t=f.PROJECT_SYNC_UPLOAD+"/"+r;c.request(t,{method:"post",body:u.createReadStream(e)}).then(function(e){if(0==e.status){var t=e.data;I(t.type,n,t.modify_time,r).then(function(){g.debug("project upload success: "+n),s.resolve(t)},function(e){e&&g.info(e),s.reject(e)})}else s.reject(e.message)},function(e){e&&g.info(e),s.reject(e)})},function(e){e&&g.info(e),s.reject(e)}),s.promise}function S(r,o,i){var a=h.defer();g.debug("project download: "+r+" "+o);var e=f.PROJECT_SYNC_DOWNLOAD+"/"+o;return c.request(e,{method:"post"},!1).then(function(e){var t=m.join(j.getAppPath("appData"),"temp",j.uuid(6)+".7z");u.ensureDirSync(m.dirname(t));var n=u.createWriteStream(t);e.body.pipe(n),e.body.on("end",function(){j.uncompress(t,E()).then(function(){I(i,r,null,o).then(function(){g.debug("project download success: "+r),a.resolve()},function(e){e&&g.info(e),a.resolve()})},function(e){e&&g.info(e),a.resolve()})}).on("error",function(e){e&&g.info(e),a.resolve()})},function(e){e&&g.info(e),a.resolve()}),a.promise}function l(e,t,n,r,o){var i=h.defer(),a={type:r,project_name:t,project_type:o||"local",updated_at:j.stamp(),data:n};return g.debug("project save: "+e),".sb2"===m.extname(e)?j.writeFile(e,new Buffer(n,"base64")).then(function(){a.path=e,i.resolve(a)},function(e){e&&g.info(e),i.reject(e)}):j.writeJson(e,m.extname(e)===x?a:n).then(function(){a.path=e,i.resolve(a)},function(e){e&&g.info(e),i.reject(e)}),i.promise}function d(){var e=h.defer();if(!c.getUser())return j.rejectPromise(null,e);var t=P();return u.existsSync(t)?j.readJson(t):j.resolvePromise([],e)}function v(e){return c.getUser()?j.writeJson(P(),e):j.rejectPromise()}function I(n,r,o,i){var a=h.defer();return o=o||j.stamp(),d().then(function(e){var t=e.find(function(e){return(!e.type||n==e.type)&&(i&&e.hash==i||e.name==r)});t?(n&&(t.type=n),r&&(t.name=r),i&&(t.hash=i),t.modify_time=o):e.push({type:n,name:r,hash:i,modify_time:o}),v(e).then(function(){a.resolve()},function(e){e&&g.info(e),a.reject(e)})},function(e){e&&g.info(e),a.reject(e)}),a.promise}function P(){var e=c.getUserId();return e?m.join(j.getAppPath("appData"),"projects",_(e,1),"list.json"):null}function E(){var e=c.getUserId();return e?m.join(j.getAppPath("appDocuments"),"projects",_(e)):null}function _(e,t){return t=t||0,r(""+e,{algorithm:"md5"}).substring(8*t,8*(t+1))}function D(e){return[{name:"KBlock(*.kbl)",extensions:["kbl"]},"scratch2"===e?{name:"Scratch 2(*.sb2)",extensions:["sb2"]}:{name:"Scratch 3(*.json)",extensions:["json"]}]}t.exports.check=y,t.exports.read=s,t.exports.open=function(e,t){var n=h.defer(),r=function(e){s(e).then(function(e){n.resolve(e)},function(e){e&&g.info(e),n.reject(e)})};if(t){if(!c.getUser())return j.rejectPromise(null,n);var o=m.join(E(),t+x);return u.existsSync(o)||(o=m.join(E(),e,t+"."+("scratch3"===e?"json":"sb2")),u.existsSync(o))?(r(o),n.promise):j.rejectPromise(null,n)}var i={defaultPath:c.getUser()?E():j.getAppPath("documents"),properties:["openFile"],filters:D(e)};return j.showOpenDialog(i).then(function(e){r(e)},function(e){e&&g.info(e),n.reject(e)}),n.promise},t.exports.save=function(t,e,n,r){var o=h.defer();if(!c.getUser()){var i=m.join(j.getAppPath("appDocuments"),"projects");return r&&r.startsWith(i)&&(r=null),p(t,e,n,r)}return l(r=m.join(E(),t+x),t,e,n,"cloud").then(function(e){I(n,t).then(function(){a(),o.resolve(e)},function(e){e&&g.info(e),o.reject(e)})},function(e){e&&g.info(e),o.reject(e)}),o.promise},t.exports.saveAs=p,t.exports.sync=o,t.exports.list=i,t.exports.create=b,t.exports.remove=function(t,o){var i=h.defer();return g.debug("project remove: "+o),c.request(f.PROJECT_SYNC_DELETE,{method:"post",data:{hash:o}}).then(function(e){var n,r;0==e.status?h.all([j.removeFile(m.join(E(),t)),(n=o,r=h.defer(),d().then(function(e){var t=e.findIndex(function(e){return e.hash==n});t<0?r.resolve():(e.splice(t,1),v(e).then(function(){r.resolve()},function(e){e&&g.info(e),r.reject(e)}))},function(e){e&&g.info(e),r.reject(e)}),r.promise)]).then(function(){g.debug("project remove success: "+t),i.resolve()},function(e){e&&g.info(e),i.reject(e)}):i.reject(e.message)},function(e){e&&g.info(e),i.reject(e)}),i.promise},t.exports.upload=w,t.exports.download=S},{"../config/url":2,"../util/util":8,"./token":5,"electron-log":void 0,"fs-extra":void 0,hasha:void 0,path:void 0,q:void 0}],5:[function(e,t,n){e("path");var r,i,o=e("crypto"),a=e("q"),s=(e("fs-extra"),e("electron-log")),u=e("is-online"),c=e("../util/util"),f=e("../config/url"),p=e("../config/status"),l=e("../util/cache");function d(){i=null,m().removeItem("key",!1),m().removeItem("value",!1),m().save()}function v(e,t,n){if(!i)return c.rejectPromise();var r=c.getAppInfo(),o=t.headers||{};return o.Authorization="Bearer "+i.api_token,o["X-Ken-App-Version"]=r.name+"-"+r.version+"-"+r.branch+"-"+r.platform+"-"+r.appBit,t.headers=o,c.request(e,t,n)}function m(){return r||(r=new l("token")),r}t.exports.getUser=function(){return i&&i.user?i.user:null},t.exports.getUserId=function(){return i&&i.user?i.user.id:0},t.exports.load=function(){var t,n=a.defer(),e=m().getItem("key"),r=m().getItem("value");if(!e||!r)return c.rejectPromise(null,n);try{var o=c.decrypt(r,Buffer.from(e,"hex"));i=JSON.parse(o),(t=a.defer(),v(f.VERIFY,{method:"post"}).then(function(e){e.status==p.SUCCESS?t.resolve():t.reject(e.message)},function(e){e&&s.info(e),t.reject(e)}),t.promise).then(function(){n.resolve(i)},function(e){u().then(function(){return d()}).fin(function(){e&&s.info(e),n.reject(e)})})}catch(e){n.reject()}return n.promise},t.exports.save=function(e){try{var t=o.randomBytes(128);return m().setItem("key",t.toString("hex"),!1),m().setItem("value",c.encrypt(JSON.stringify(e),t),!1),m().save(),i=e,c.resolvePromise()}catch(e){return c.rejectPromise(e)}},t.exports.remove=d,t.exports.request=v},{"../config/status":1,"../config/url":2,"../util/cache":7,"../util/util":8,crypto:void 0,"electron-log":void 0,"fs-extra":void 0,"is-online":void 0,path:void 0,q:void 0}],6:[function(e,t,n){var i=e("q"),a=e("electron-log"),s=e("../util/util"),u=e("./token"),c=e("../config/url"),f=(e("../config/status"),/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/);t.exports.loadToken=function(){var t=i.defer();return u.load().then(function(e){t.resolve(e.user)},function(e){e&&a.info(er),t.reject(e)}),t.promise},t.exports.login=function(e,t,n){var r=i.defer(),o={};return f.test(e)?o.email=e:o.username=e,o.password=t,s.request(c.LOGIN,{method:"POST",data:o}).then(function(e){0==e.status?u.save(e.data).fin(function(){r.resolve(e)}):r.resolve(e)},function(e){e&&a.info(er),r.reject(e)}),r.promise},t.exports.logout=function(){var t=i.defer();return u.remove(),s.request(c.LOGOUT).then(function(){t.resolve()},function(e){e&&a.info(e),t.reject(e)}),t.promise},t.exports.weixinLogin=function(e){var t=i.defer();return s.request(c.WEIXIN_LOGIN,{method:"POST",data:{auth_key:e}}).then(function(e){0==e.status||1==e.status?u.save(e.data).fin(function(){t.resolve(e)}):t.resolve(e)},function(e){e&&a.info(e),t.reject(e)}),t.promise},t.exports.weixinQrcode=function(){var t=i.defer();return s.request(c.WEIXIN_QRCODE).then(function(e){t.resolve(e)},function(e){e&&a.info(e),t.reject(e)}),t.promise},t.exports.register=function(e){var t=i.defer();return s.request(c.REGISTER,{method:"POST",data:{email:e.email,username:e.username,password:e.password,login:!0}}).then(function(e){t.resolve(e)},function(e){e&&a.info(e),t.reject(e)}),t.promise},t.exports.resetPassword=function(e){var t=i.defer();return s.request(c.FIND_PASSWORD,{method:"POST",data:{email:e}}).then(function(e){t.resolve(e)},function(e){e&&a.info(e),t.reject(e)}),t.promise}},{"../config/status":1,"../config/url":2,"../util/util":8,"./token":5,"electron-log":void 0,q:void 0}],7:[function(e,t,n){e("path"),e("crypto"),e("q"),e("fs-extra"),e("electron-log");var r=e("flat-cache"),o=e("./util"),i={};function a(e){if(i[e])return i[e];this.name=e,this._cache=r.load(e,o.getAppPath("appData")),i[e]=this}a.prototype.getItem=function(e,t){var n=this._cache.getKey(e);return void 0!==n?n:t},a.prototype.setItem=function(e,t,n){n=!1!==n,this._cache.setKey(e,t),n&&this._cache.save(!0)},a.prototype.removeItem=function(e,t){t=!1!==t,this._cache.removeKey(e),t&&this._cache.save(!0)},a.prototype.save=function(){this._cache.save(!0)},t.exports=a},{"./util":8,crypto:void 0,"electron-log":void 0,"flat-cache":void 0,"fs-extra":void 0,path:void 0,q:void 0}],8:[function(e,t,n){var r=e("os"),s=e("child_process"),u=e("path"),i=e("crypto"),o=e("electron"),c=o.app,f=o.ipcMain,a=o.dialog,p=o.BrowserWindow,l=e("electron-log"),d=e("electron-is"),v=e("q"),m=e("fs-extra"),h=e("globby"),g=e("sudo-prompt"),j=e("iconv-lite"),x=(e("lodash"),e("7zip-bin").path7za.replace("app.asar","app.asar.unpacked")),y=e("node-fetch"),b=e(d.dev()?u.resolve("app","package.json"):u.resolve(__dirname,"..","package.json")),w="-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7Jat1/19NDxOObrFpW8USTia6\nuHt34Sac1Arm6F2QUzsdUEUmvGyLIOIGcdb+F6pTdx4ftY+wZi7Aomp4k3vNqXmX\nT0mE0vpQlCmsPUcMHXuUi93XTGPxLXIv9NXxCJZXSYI0JeyuhT9/ithrYlbMlyNc\nwKB/BwSpp+Py2MTT2wIDAQAB\n-----END PUBLIC KEY-----\n";d.dev()&&c.setName(b.productName);var S={},I=0;function P(){return d.windows()?"win":d.macOS()?"mac":0<=r.arch().indexOf("arm")?"arm":"linux"}function E(){return d.dev()?b.version:c.getVersion()}function _(){var e={bit:"x64"===process.arch||process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432")?64:32,arch:process.arch,platform:P(),version:E(),name:c.getName(),buildNumber:b.buildNumber,dev:d.dev()};return d.dev()?(e.ext=u.extname(D("exe")).replace(".",""),e.branch="beta",e.feature="",e.date=O(),e.appBit=e.bit):(e.ext=b.buildInfo.ext,e.branch=b.buildInfo.branch,e.feature=b.buildInfo.feature,e.date=b.buildInfo.date,e.appBit=b.buildInfo.appBit),e}function D(e,t){switch(e){case"appData":return u.join(c.getPath("appData"),c.getName());case"appResource":return d.dev()?u.resolve("data"):u.resolve(c.getAppPath(),"..","..","data");case"appDocuments":return u.join(c.getPath("documents"),c.getName());case"script":return u.join(D("appResource"),"scripts",t+"."+(d.windows()?"bat":"sh"));case"driver":return u.join(D("appResource"),"driver");case"plugins":var n=u.join(D("appResource"),"plugins"),r=t;if("FlashPlayer"===r){var o=_(),i=d.windows()?"pepflashplayer"+o.appBit+".dll":d.macOS()?"PepperFlashPlayer.plugin":"libpepflashplayer.so";if(!d.dev())return u.join(n,r,i);var a="arm"!==o.platform?"":o.appArch;return u.join(n,r,o.platform,a,i)}return n;case"command":return u.join(D("appData"),"temp",""+A(6));case"libraries":return u.join(D("appDocuments"),"libraries");case"packages":return u.join(D("appDocuments"),"packages");case"arduino":return u.join(D("appResource"),"arduino-"+P());default:return c.getPath(e)}}function A(e,t){var n,r,o="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),i=[];if(t=t||o.length,e)for(n=0;n<e;n++)i[n]=o[0|Math.random()*t];else for(i[8]=i[13]=i[18]=i[23]="-",i[14]="4",n=0;n<36;n++)i[n]||(r=0|16*Math.random(),i[n]=o[19==n?3&r|8:r]);return i.join("")}function O(){return parseInt(Date.now()/1e3)}function T(e,t){return t=t||v.defer(),setTimeout(function(){return t.resolve(e)},10),t.promise}function C(e,t,n){var r=v.defer();return t=t||{},n=n||!1,l.debug("execCommand:"+e+", options: "+JSON.stringify(t)+", useSudo: "+n),n?g.exec(e,{name:"kenrobot"},function(e,t,n){if(t=t||"",n=n||"",t=d.windows()?j.decode(Buffer.from(t),"win1252"):t,n=d.windows()?j.decode(Buffer.from(n),"win1252"):n,e)return l.info(e),t&&l.info(t),n&&l.info(n),void r.reject(e||n||t);d.dev()&&t&&l.debug(t),r.resolve(t)}):s.exec(e,t,function(e,t,n){if(t=t||"",n=n||"",t=d.windows()?j.decode(Buffer.from(t),"win1252"):t,n=d.windows()?j.decode(Buffer.from(n),"win1252"):n,e)return l.info(e),t&&l.info(t),n&&l.info(n),void r.reject(e||n||t);d.dev()&&t&&l.debug(t),r.resolve(t)}),r.promise}function R(e,t,n){var r=v.defer(),o=s.spawn(e,t,n),i="",a="";return o.stdout.on("data",function(e){var t=d.windows()?j.decode(e,"win1252"):e.toString();d.dev()&&t&&l.debug(t),i+=t,r.notify({type:"stdout",data:t})}),o.stderr.on("data",function(e){var t=d.windows()?j.decode(e,"win1252"):e.toString();d.dev()&&t&&l.debug(t),a+=t,r.notify({type:"stderr",data:t})}),o.on("close",function(e){0==e?r.resolve(i):r.reject(a)}),r.promise}function N(e,t,n,r){if(!r){var o=v.defer();return m.outputFile(e,t,n,function(e){if(e)return l.info(e),void o.reject(e);o.resolve()}),o.promise}m.outputFileSync(e,t,n)}function k(e,t){var n=v.defer();return(e=e||{}).title="保存",e.defaultPath=e.defaultPath&&u.isAbsolute(e.defaultPath)?e.defaultPath:u.join(D("documents"),e.defaultPath||"untitled"),e.buttonLabel="保存",t=t||p.getAllWindows()[0],a.showSaveDialog(t,e,function(e){e?n.resolve(e):n.reject()}),n.promise}t.exports.getPlatform=P,t.exports.getVersion=E,t.exports.getAppInfo=_,t.exports.getAppPath=D,t.exports.getExpire=function(){return!d.dev()&&b.buildInfo.expire},t.exports.formatDate=function(e,t){"number"==typeof e?e=new Date(e):e||(e=new Date);var n={"M+":e.getMonth()+1,"d+":e.getDate(),"h+":e.getHours()%12==0?12:e.getHours()%12,"H+":e.getHours(),"m+":e.getMinutes(),"s+":e.getSeconds(),"q+":Math.floor((e.getMonth()+3)/3),S:e.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(e.getFullYear()+"").substr(4-RegExp.$1.length))),/(E+)/.test(t)&&(t=t.replace(RegExp.$1,(1<RegExp.$1.length?2<RegExp.$1.length?"星期":"周":"")+["日","一","二","三","四","五","六"][e.getDay()]));for(var r in n)new RegExp("("+r+")").test(t)&&(t=t.replace(RegExp.$1,1===RegExp.$1.length?n[r]:("00"+n[r]).substr((""+n[r]).length)));return t},t.exports.versionCompare=function(e,t){for(var n=/(\d+)\.(\d+)\.(\d+)/,r=n.exec(e),o=n.exec(t),i=[parseInt(r[1]),parseInt(r[2]),parseInt(r[3])],a=[parseInt(o[1]),parseInt(o[2]),parseInt(o[3])],s=0;s<=2;s++)if(i[s]!=a[s])return a[s]<i[s]?1:-1;return 0},t.exports.postMessage=function(e){for(var t=arguments.length,n=Array(1<t?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];l.debug("postMessage: "+e+", "+n.join(", "));var o=p.getAllWindows();o&&o.length&&o[0].webContents.send(e,n)},t.exports.listenMessage=function(e,i){var a=this,s="app:"+e;f.on(s,function(t,n){for(var e=arguments.length,r=Array(2<e?e-2:0),o=2;o<e;o++)r[o-2]=arguments[o];(i.apply(a,r)||T()).then(function(e){t.sender.send(s,n,!0,e)},function(e){t.sender.send(s,n,!1,e)},function(e){t.sender.send(s,n,"notify",e)})})},t.exports.getDefer=function(){var e=v.defer(),t=I++;return{deferId:t,promise:(S[t]=e).promise}},t.exports.callDefer=function(e,t){var n=S[e];if(n){var r;"notify"===t?r=n.notify:(delete S[e],r=t?n.resolve:n.reject);for(var o=arguments.length,i=Array(2<o?o-2:0),a=2;a<o;a++)i[a-2]=arguments[a];r.apply(this,i)}},t.exports.handleQuotes=function(e){return d.windows()?e:e.replace(/"/g,"")},t.exports.uuid=A,t.exports.stamp=O,t.exports.throttle=function(e,t){var n;return function(){n&&clearTimeout(n),n=setTimeout(function(){e(),clearTimeout(n),n=null},t)}},t.exports.encrypt=function(e,t,n){n=n||"aes-128-cbc";var r=i.createCipher(n,t),o=r.update(e,"utf8","binary");return o+=r.final("binary"),o=new Buffer(o,"binary").toString("base64")},t.exports.decrypt=function(e,t,n){n=n||"aes-128-cbc",e=new Buffer(e,"base64").toString("binary");var r=i.createDecipher(n,t),o=r.update(e,"binary","utf8");return o+=r.final("utf8")},t.exports.rsa_encrypt=function(e,t){t=t||w;var n=new Buffer(e);return i.publicEncrypt({key:t,padding:i.constants.RSA_PKCS1_PADDING},n).toString("base64")},t.exports.rsa_decrypt=function(e,t){var n=new Buffer(e,"base64");return i.privateDecrypt({key:t,padding:i.constants.RSA_PKCS1_PADDING},n).toString("utf8")},t.exports.resolvePromise=T,t.exports.rejectPromise=function(e,t){return t=t||v.defer(),setTimeout(function(){return t.reject(e)},10),t.promise},t.exports.execFile=function(e,t){return l.debug("execFile: "+e),C(d.windows()?"start /WAIT "+e:""+e,null,t)},t.exports.execCommand=C,t.exports.spawnCommand=R,t.exports.readFile=function(e,t,n){if(n)return m.readFileSync(e,t);var r=v.defer();return t=t||"utf8",m.readFile(e,t,function(e,t){if(e)return l.info(e),void r.reject(e);r.resolve(t)}),r.promise},t.exports.writeFile=N,t.exports.saveFile=function(e,t,n){var r=v.defer();return n=n||{},e&&(n.defaultPath=e),k(n).then(function(e){N(e,t,n).then(function(){r.resolve()},function(e){e&&l.info(e),r.reject(e)})},function(e){e&&l.info(e),r.reject(e)}),r.promise},t.exports.moveFile=function(e,t,n){var r=v.defer();return n=n||{overwrite:!0},m.move(e,t,n,function(e){if(e)return l.info(e),void r.reject(e);r.resolve()}),r.promise},t.exports.removeFile=function(e,t){if(!t){var n=v.defer();return m.remove(e,function(e){if(e)return l.info(e),void n.reject(e);n.resolve()}),n.promise}m.removeSync(e)},t.exports.readJson=function(e,t){var n=v.defer();return t=t||{},m.readJson(e,t,function(e,t){if(e)return l.info(e),void n.reject(e);n.resolve(t)}),n.promise},t.exports.writeJson=function(e,t,n,r){if(!r){var o=v.defer();return n=n||{},m.outputJson(e,t,n,function(e){if(e)return l.info(e),void o.reject(e);o.resolve()}),o.promise}m.outputJsonSync(e,t,n)},t.exports.searchFiles=function(e){var t=v.defer();return l.debug("searchFiles: "+e),h(e).then(function(e){t.resolve(e)},function(e){e&&l.info(e),t.reject(e)}),t.promise},t.exports.compress=function(e,t,n,r){var o=v.defer();return t=t||[t],r=r||"7z",l.debug("compress: "+e+": "+t.length+" => "+n+": "+r),C("cd "+(d.windows()?"/d ":"")+e+' && "'+x+'" a -t'+r+' -r "'+n+'" '+t.join(" ")).then(function(){o.resolve()},function(e){e&&l.info(e),o.reject(e)}),o.promise},t.exports.uncompress=function(e,t,n){var r=v.defer(),o=/([\d]+)% \d+ - .*\r?/g;return l.debug("uncompress: "+e+" => "+t),n?R('"'+x+'"',["x",'"'+e+'"',"-bsp1","-y",'-o"'+t+'"'],{shell:!0}).then(function(e){r.resolve(e)},function(e){e&&l.info(e),r.reject(e)},function(e){if(o.lastIndex=0,o.test(e.data)){for(var t,n=o.exec(e.data);t=n,n=o.exec(e.data););r.notify(parseInt(t[1]))}}):C('"'+x+'" x "'+e+'" -y -o"'+t+'"').then(function(){r.resolve()},function(e){e&&l.info(e),r.reject(e)}),r.promise},t.exports.showOpenDialog=function(e,t){var n=v.defer();return(e=e||{}).title="打开",e.defaultPath=e.defaultPath||D("documents"),e.buttonLabel="打开",t=t||p.getAllWindows()[0],a.showOpenDialog(t,e,function(e){e?n.resolve(e[0]):n.reject()}),n.promise},t.exports.showSaveDialog=k,t.exports.request=function(e,t,n){var r=v.defer();if(n=!1!==n,(t=t||{}).method=t.method||"GET",n&&t.data){t.body=JSON.stringify(t.data);var o=t.headers||(t.headers={});o["Content-Type"]="application/json",o.Accept="application/json",delete t.data}return y(e,t).then(function(e){if(e.ok)return n?e.json():e;var t=new Error(e.statusText);throw t.status=e.status,t}).then(function(e){r.resolve(e)}).catch(function(e){e&&l.info(e),r.reject(e)}),r.promise}},{"7zip-bin":void 0,child_process:void 0,crypto:void 0,electron:void 0,"electron-is":void 0,"electron-log":void 0,"fs-extra":void 0,globby:void 0,"iconv-lite":void 0,lodash:void 0,"node-fetch":void 0,os:void 0,path:void 0,q:void 0,"sudo-prompt":void 0}]},{},[3]);
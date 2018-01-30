"use strict";define("app/common/util/emitor",[],function(){function t(t,e){return t+"_"+e}function e(e,o,r,n){n=n||0;var c=t(e,o),a=i[c];return a||(a=[],i[c]=a),a.push({callback:r,priority:n}),this}function o(e,o,r){var n=t(e,o),c=i[n];if(!c)return this;for(var a=0;a<c.length;a++){if(c[a].callback==r){c.splice(a,1);break}}return this}function r(e,o){var r=t(e,o),n=i[r];if(!n)return this;n=n.concat().sort(function(t,e){return e.priority-t.priority});for(var c=Array.from(arguments).slice(2),a=0;a<n.length;a++){n[a].callback.apply(this,c)}return this}function n(e,o,n){var i=Array.from(arguments).splice(1),a=this,p=t(o,n),s=c[p];return s&&clearTimeout(s),s=setTimeout(function(){delete c[p],r.apply(a,i)},e),c[p]=s,this}var i={},c={};return{on:e,off:o,trigger:r,delayTrigger:n}}),define("app/common/util/report",[],function(){function t(t){o=t,window.onerror=e}function e(t,e,r,n,i){o&&i&&console.error(i.stack);var c={message:t,src:e,line:r,col:n,stack:i.stack||""};return kenrobot.postMessage("app:errorReport",c),!0}var o;return{init:t}}),define("app/common/config/config",[],function(){var t={base:{url:{kenrobot:"http://www.kenrobot.com",arduino:"http://www.arduino.cn",arduinoDriver:"http://ide.kenrobot.com/download/arduino-driver-x{BIT}.7z",support:"http://www.arduino.cn/forum-101-1.html",about:"http://www.kenrobot.com/index.php?app=square&mod=Index&act=help",checkUpdate:"http://www.kenrobot.com/?app=api&mod=Download&act=checkupdate",packages:"http://www.kenrobot.com/packages/packages.json",login:"http://userver.kenrobot.com/sso/login",logout:"http://userver.kenrobot.com/sso/logout",loginQrcode:"http://userver.kenrobot.com/api/wechat/scanlogin/token",register:"http://userver.kenrobot.com/api/user/register",findPassword:"http://userver.kenrobot.com/password/email",projectSync:"http://userver.kenrobot.com/api/project/sync"},arduinoDriver:{checksum:{64:"sha256:bc5847718612e8c9bd2d75a5b4dedebe2684293d89bdfb864c7bd7c3b74b505d",86:"sha256:aa3e6a11c8f27a72f0d2ab6cca5a4b1ed68151ef18d971f49c2f71875d3bf78f"}}},debug:{debug:!0}};return Object.assign({},t.base,t.debug.debug?t.debug:{})}),define("app/scratch3/config/menu",[],function(){return[{id:"file",placeholder:"文件",menu:[{text:"新建项目",action:"new-project",shortcut:{key:["ctrl+n","command+n"],text:"Ctrl+N"}},"_",{text:"打开项目",action:"open-project",shortcut:{key:["ctrl+o","command+o"],text:"Ctrl+O"}},{text:"保存项目",action:"save-project",shortcut:{key:["ctrl+s","command+s"],text:"Ctrl+S"}},{text:"另存为",action:"save-as-project",shortcut:{key:["ctrl+shift+s","command+shift+s"],text:"Ctrl+Shift+S"}}]},{id:"edit",placeholder:"编辑"},{id:"example",placeholder:"案例"},{id:"options",placeholder:"选项",menu:[{id:"fullscreen",text:"全屏",action:"fullscreen"},{text:"语言",action:"language"},{text:"主题",action:"theme"},"_",{text:"设置",action:"setting"}]},{id:"help",placeholder:"帮助",menu:[{text:"Arduino驱动下载",action:"download-arduino-driver"},"_",{text:"检查更新",action:"check-update"},{text:"啃萝卜官网",action:"visit-kenrobot"},{text:"Arduino论坛",action:"visit-arduino"},"_",{text:"建议反馈",action:"suggestion"},{text:"关于啃萝卜",action:"about-kenrobot"}]},{id:"version",placeholder:"版本",menu:[{text:"scratch 2",action:"switch",cls:"check",extra:{type:"scratch2"}},{text:"scratch 3",action:"switch",cls:"check",extra:{type:"scratch3"}}]}]}),define("app/scratch3/controller/mainController",["app/common/util/emitor","../config/menu"],function(t,e){function o(){t.on("app","start",r),kenrobot.on("app-menu","do-action",n)}function r(){kenrobot.trigger("app-menu","load",e,"scratch3"),kenrobot.postMessage("app:loadSetting").then(function(e){var o=e[kenrobot.viewType];for(var r in o)t.trigger("setting","change",r,o[r])})}function n(t){kenrobot.trigger("app","command",t)}return{init:o}}),define("app/scratch3/controller/index",["./mainController"],function(t){function e(){t.init()}return{init:e}}),define("app/scratch3/index",["app/common/util/emitor","app/common/util/report","app/common/config/config","./controller/index"],function(t,e,o,r){function n(){window.kenrobot=window.kenrobot||top.kenrobot,e.init(o.debug),r.init(),t.trigger("app","start")}return{init:n}}),require.config({baseUrl:"../assets/js"}),require(["./app/scratch3/index"],function(t){t.init()}),define("scratch3",function(){});
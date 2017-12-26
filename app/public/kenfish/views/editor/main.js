WinformPythonContent = "NULL";
// Overrides console to show on the on-screen console but keeping reference to original console.log function.
let _console = console.log;
console.log = function(somethingToLog) {
    let resultTextArea = document.getElementById("executionresult");
    resultTextArea.value = resultTextArea.value + somethingToLog + "\n";
    _console(somethingToLog);
}

function clearConsole() {
    let resultTextArea = document.getElementById("executionresult");
    resultTextArea.value = "";
}

function executeCode() {

    clearConsole();
    printExecutionHeaderOnConsole();

    // Checking if editor is loaded properly already.
    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Editor library (Ace) is not loaded yet. Please try again in a few seconds.");
        return;
    }

    let codeToEval = editor.getValue();

    let selectedLanguage = getSelectedLanguage();

    try {
        result = null;
        switch (selectedLanguage) {
            case "javascript":
                result = executeJavaScriptCode(codeToEval);
                break;
            case "python":
                result = executePythonCode(codeToEval);
                break;
            case "ruby":
                result = executeRubyCode(codeToEval);
                break;
            default:
                console.log("\nERROR:\nLanguage not supported: " + selectedLanguage);
        }

        if (result != null) {
            console.log(result);
        }

        console.log("Execution finished successfully.");

    } catch (e) {
        console.log("\nERROR:\n" + e.message + "\n");
    }
}

function executeRubyCode(codeToEval) {

    // Testing if Opal is loaded. If not, just shows a warning message and do not try to run the code.
    if (typeof Opal == 'undefined') {
        console.log("\nERROR:\nThe Ruby library (Opal) is not loaded yet. Please try again in a few seconds.")
        return;
    }

    let transpiledCodeFromRubyToJS = Opal.compile(codeToEval)

    let result = eval(transpiledCodeFromRubyToJS);

    // TODO: For some reason it is adding a blank link (or in some cases object) in the end of the result.

    return result;
}

function executePythonCode(codeToEval) {

    // Testing if Brython is loaded. If not, just shows a warning message and do not try to run the code.
    if (typeof brython == 'undefined') {
        console.log("\nERROR:\nThe Python library (Brython) is not loaded yet. Please try again in a few seconds.")
        return;
    }

    let result = brython.$eval(codeToEval);

    // TODO: For some reason it is adding a blank link (or in some cases object) in the end of the result.

    return result;
}

function printExecutionHeaderOnConsole() {
    let time = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });

    console.log("Starting execution (" + time + ")...");
}

function executeJavaScriptCode(codeToEval) {
    let result = eval(codeToEval);

    return result;
}

function autoCompleteChanged(el) {

    // Do not let the user change this if the Ace editor is not loaded yet.
    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Editor library (Ace) is not loaded yet. Please try again in a few seconds.");
        el.checked = false;
        return;
    }

    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Ruby library (Opal) is not loaded yet. Please try again in a few seconds.")
        return;
    }

    if (el.checked) {
        editor.setOptions({
            enableBasicAutocompletion: true
        });
    } else {
        editor.setOptions({
            enableBasicAutocompletion: false
        });
    }

}

function autoPairingChanged(el) {

    // Do not let the user change this if the Ace editor is not loaded yet.
    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Editor library (Ace) is not loaded yet. Please try again in a few seconds.");
        el.checked = false;
        return;
    }

    if (el.checked) {
        editor.setBehavioursEnabled(true);
    } else {
        editor.setBehavioursEnabled(false);
    }

}

function languageSelectChanged(el) {

    // Do not let the user change this if the Ace editor is not loaded yet.
    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Editor library (Ace) is not loaded yet. Please try again in a few seconds.");
        el.options.selectedIndex = 0;
        return;
    }

    let selectedLanguage = el.value;

    switch (selectedLanguage) {
        case "javascript":
            editor.getSession().setMode("ace/mode/javascript");
            disableAceEditorMissingSemiColonWarningMessage();
            break;
        case "ruby":
            editor.getSession().setMode("ace/mode/ruby");
            break;
        case "python":
            editor.getSession().setMode("ace/mode/python");
            break;
        default:
            console.log("\nERROR:\nLanguage not supported: " + selectedLanguage);
    }
}

function themeSelectChanged(el) {

    // Do not let the user change this if the Ace editor is not loaded yet.
    if (typeof editor == 'undefined') {
        console.log("\nERROR:\nThe Editor library (Ace) is not loaded yet. Please try again in a few seconds.");
        el.options.selectedIndex = 0;
        return;
    }

    let selectedTheme = el.value;

    switch (selectedTheme) {
        case "bright":
            editor.setTheme("ace/theme/tomorrow");
            break;
        case "dark":
            editor.setTheme("ace/theme/twilight");
            break;
        default:
            console.log("\nERROR:\nTheme not supported: " + selectedTheme);
    }
}

function getSelectedLanguage() {
    return "python" //document.getElementById("selectLanguage").value;
}

function disableAceEditorMissingSemiColonWarningMessage() {
    editor.session.$worker.call("changeOptions", [{
        asi: true
    }]);
}

WinformLoadPythonContent = function() {
    //alert(WinformPythonContent);
    editor.setValue(WinformPythonContent);
};


//打开项目
openPrj = function() {
    winform.openPythonPrj();
}

//保存项目
savePrj = function() {
    winform.savePythonPrj(editor.getValue());
}

trashPrj = function() {
    if (window.confirm("删除所有代码？"))
        editor.setValue("");
}

PythonHeadContent = "#!/usr/bin/python3 \nimport ctypes \nimport time \nll = ctypes.cdll.LoadLibrary \nLmst = ll(\"./libpycall.so\") \n\n";
runJsState = 0;
runJS = function() {
    //var c = Blockly.JavaScript.workspaceToCode(Code.workspace);
    var c = editor.getValue();
    if (runJsState == 0) {
        document.getElementById('runButtonImg').src = "./media/stop2.jpg";
        runJsState = 1;
        winform.uploadToFish(c);
    } else {
        document.getElementById('runButtonImg').src = "./media/run.png";
        runJsState = 0;
        winform.uploadToFish(PythonHeadContent + 'Lmst.StopTheFish()');

    }

};

function bindClick(el, func) {
    if (typeof el == 'string') {
        el = document.getElementById(el);
    }
    el.addEventListener('click', func, true);
    el.addEventListener('touchend', func, true);
};

window.onload = function() {
    disableAceEditorMissingSemiColonWarningMessage();

    // By default, do not auto-close parenthesis, brackets, etc.
    editor.setBehavioursEnabled(false);
    editor.setTheme("ace/theme/tomorrow");
    //editor.setTheme("ace/theme/twilight");
    editor.getSession().setMode("ace/mode/python");
    bindClick('openButton', openPrj);
    bindClick('saveButton', savePrj);
    bindClick('trashButton', trashPrj);
    bindClick('runButton', runJS);
    //editor.setValue("print\n");
}

// Adding keyboard shortcut for "Run" button.
document.onkeydown = function(e) {

    // For IEs window event-object.
    var e = e || window.event;

    // The "R" key is the 82 code, so let's Run the code when the user presses ALT + R.
    if (e.altKey && e.which == 82) {
        executeCode();
    }

}

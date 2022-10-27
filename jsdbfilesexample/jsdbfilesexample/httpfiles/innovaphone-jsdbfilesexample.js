
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var innovaphone = innovaphone || {};
innovaphone.jsdbfilesexample = innovaphone.jsdbfilesexample || function (start, args) {
    this.createNode("body");
    var that = this;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(innovaphone.jsdbfilesexampleTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;


    var input = this.add(new innovaphone.ui1.Node("input", "", "", ""));
    input.setAttribute("id", "fileinput").setAttribute("type", "file");
    input.setAttribute("accept", "application/pdf");

    const fileInput = document.getElementById('fileinput');
    fileInput.addEventListener('change', onSelectFile, false);

    var folder = null;

    function onSelectFile() {
        console.log(input);
        post_file(fileInput.files[0]);
    }

    function post_file(file) {
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&name=' + encodeURI(file.name) + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {
                    //
                },
                body: file
            }).then(
                function (response) {
                    succes = response.ok;
                    list_folder(folder);
                }
            ).then(
                success => console.log(success)
            ).catch(
                error => console.log(error)
            );
    }

    function app_connected(domain, user, dn, appdomain) {
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" } }, folder_added);
    }

    function folder_added(msg) {
        console.log(msg);
        folder = msg.id;

        addLine("Folder Id: " + msg.id);

        list_folder(folder);
    }

    function list_folder(id) {
        console.log("List folder id: " + id);
        app.sendSrc({ mt: "DbFilesList", name: "myfiles", folder: id }, list_folder_result);
    }

    function list_folder_result(msg) {
        if ("files" in msg && msg.files.length > 0) {
            msg.files.forEach(file => addLine(file.id + ": [" + file.name + "], [" + file.url + "]" ));
        }
    }

    function addLine(text) {
        that.add(new innovaphone.ui1.Div("", "", "")).addText(text);
    }

    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "UserMessageResult") {
            //
        }
    }
};

innovaphone.jsdbfilesexample.prototype = innovaphone.ui1.nodePrototype;

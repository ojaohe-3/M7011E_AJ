$(document).ready(function () {
    $("#submit").click(function () {

        const saltedSha256 = require('salted-sha256');

        // Defines the input values
        let username = $("#username").val();
        let password = $("#password").val();

        // Checks the inputs aren't empty
        if (username && password) {
            let userInfos = {"username": username, "password": saltedSha256(password)};
            // now we can use userInfos to check the identity and allow access to the next interface
        }
    })
});
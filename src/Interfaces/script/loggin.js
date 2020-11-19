import Vue from 'vue';
const saltedSha256 = require('salted-sha256');

const loggin = new Vue ({
    el: '#loggin',
    data: {
        username: '',
        password: '',
        myJson: ''
    },
    methods: {
        valuesIntoJson: function(username, password){
            tghis.myJson = {
                "username": username,
                "password": saltedSha256(password)
            }
        }
    }
})
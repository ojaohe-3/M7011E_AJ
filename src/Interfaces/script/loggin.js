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
        valuesIntoJson: function(){
            this.myJson = {
                "username": username,
                "password": sha256(password)
            }
        }
    }
})
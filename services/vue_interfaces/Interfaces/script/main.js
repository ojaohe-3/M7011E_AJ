import Vue from 'vue';
import loggin from './loggin.vue';


new Vue ({
    render: h => h(loggin),
}).$mount('#loggin');




// const saltedSha256 = require('salted-sha256');

// data: {
//     username: '',
//     password: '',
//     myJson: ''
// },
// methods: {
//     valuesIntoJson: function(username, password){
//         this.myJson = {
//             "username": username,
//             "password": saltedSha256(password)
//         }
//     }
// }
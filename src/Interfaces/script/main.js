import Vue from 'vue';
import App from './app';

// const saltedSha256 = require('salted-sha256');

new Vue ({
    render: h => h(App),
}).$mount("#root");








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
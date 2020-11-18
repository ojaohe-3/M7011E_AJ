var loggin = new Vue ({
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
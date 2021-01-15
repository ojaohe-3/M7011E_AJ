// Okta Developer forum

const OktaAuth = require('@okta/okta-auth-js').OktaAuth
const authClient = new OktaAuth({
    url: 'https://dev-2451190.okta.com/',
    issuer: 'https://dev-2451190.okta.com',
    clientId: '0oa3i9gjxQEeizaxa5d6',
    redirectUri: window.location.origin + '/login/callback',
    tokenManager: {
      storage: "sessionStorage"
    }
})

export default {
    login(email, pass, cb) {
        cb = arguments[arguments.length - 1]
        if (localStorage.token) {
            if (cb) 
                cb(true)
            
            this.onChange(true)
            return
        }
        return authClient.signIn({username: email, password: pass}).then(transaction => {
            if (transaction.status === 'SUCCESS') {
                return authClient.token.getWithoutPrompt({
                    clientId: '0oa3i9gjxQEeizaxa5d6',
                    responseType: [
                        'id_token', 'token'
                    ],
                    scopes: [
                        'openid', 'profile'
                    ],
                    sessionToken: transaction.sessionToken,
                    redirectUri: window.location.origin + '/login/callback'
                }).then(response => {
                    localStorage.token = response.tokens.accessToken
                    localStorage.idToken = response.tokens.idToken
                    console.log('response')
                    if (cb) 
                        cb(true)
                    
                    this.onChange(true)
                })
            }
        }).catch(err => {
          console.log('error')

            console.error(err)
            if (cb) 
                cb(false)
            
            this.onChange(false)
        })
    },

    getToken() {
        return localStorage.token
    },

    logout(cb) {
        delete localStorage.token
        delete localStorage.idToken
        if (cb) 
            cb()
        
        this.onChange(false)
        return authClient.signOut()
    },

    loggedIn() {
        return !!localStorage.token
    },

    onChange() {}
}

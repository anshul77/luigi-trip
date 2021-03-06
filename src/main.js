import '@luigi-project/core/luigi'
import oAuth2ImplicitGrant from '@luigi-project/plugin-auth-oauth2';
import "./scss/main.scss"
import {nodes} from 'config'


function createContext() {
  return {
    idToken: window.localStorage.getItem('luigi.auth') ?
      JSON.parse(window.localStorage.getItem('luigi.auth')).idToken : null
  }
}

nodes.forEach(rootNode => {
  rootNode.children.forEach(node => {
    node.context = createContext()
  })
})

const config = {
  settings: {
    responsiveNavigation: 'semiCollapsible',
    header: {
      logo: "/assets/logo.svg",
      title: "Trip"
    }
  },
  routing: {
    // uses hash based navigation if set to true
    useHashRouting: true,
    nodeParamPrefix: "~"
  },
  // navigation structure and settings
  navigation: {
    nodes: nodes,
    contextSwitcher: false
  },
  auth: {
    use: 'authConfig',
    authConfig: {
      idpProvider: oAuth2ImplicitGrant,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      oAuthData: {
        client_id: '720905686784-vds0igf53jlbkilm8cq0t3fg3m3u5kka.apps.googleusercontent.com',
        scope: 'openid https://www.googleapis.com/auth/userinfo.email profile',
        redirect_uri: '/callback.html',
        response_type: 'id_token token',
      },
      logoutFn: async (settings, authData, logoutCallback) => {
        await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${authData.accessToken}`)
        window.sessionStorage.setItem('signed-out', true)
        logoutCallback(window.location.origin)
      }
    },
    disableAutoLogin: (() => {
      if(JSON.parse(window.sessionStorage.getItem('signed-out'))){
        window.sessionStorage.setItem('signed-out', false)
        return true
      }
      return !JSON.parse(window.localStorage.getItem('auto-login'))
    })()
  }
};
window.Luigi.setConfig(config);

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerPlugins } from './plugins'
import store from './store/store'
import '@fontsource/nunito'
import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import { Replay } from '@sentry/replay'

const app = createApp(App)

Sentry.init({
  app,
  dsn: 'https://sentry.io/account/settings/wizard/via9wathzeidxpzcsinnwhbcpyirjo6zyezkcfou9zhgot793s6ljiiae5ozp1x3/',
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracePropagationTargets: [
        'http://192.168.0.11:3000',
        'http://192.168.0.200:3000',
        'localhost',
        /^https:\/\/yourserver\.io\/api/,
      ],
      trackComponents: true,
    }),
    new Replay(),
  ],
  tracesSampleRate: 1.0, // Захват 100% транзакций
  replaysSessionSampleRate: 1.0, // Захват 100% сессий для записи
  replaysOnErrorSampleRate: 1.0, // Захват 100% сессий, где происходят ошибки
})

registerPlugins(app)
app.use(router)
app.use(store)
app.mount('#app')

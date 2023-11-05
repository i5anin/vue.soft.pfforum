// plugins/vuetify.js

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import ru from 'vuetify/lib/locale/ru' // Добавьте эту строку

const savedTheme = localStorage.getItem('theme')
const isDark =
  savedTheme === 'dark' ||
  (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)

const vuetify = createVuetify({
  lang: {
    locales: {
      ru: {
        ...ru,
        VDataTableServer: {
          itemsPerPageText: 'Строк на странице:',
        },
      },
    },
    current: 'ru',
  },
  theme: {
    defaultTheme: savedTheme || (isDark ? 'dark' : 'light'),
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
      dark: {
        dark: true,
        variables: {},
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})

export default vuetify;

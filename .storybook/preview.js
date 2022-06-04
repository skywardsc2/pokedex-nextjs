import { ThemeProvider } from '@mui/material/styles'
// import { ThemeProvider as Emotion10ThemeProvider } from 'emotion-theming';
import theme from '../src/themes/theme'

const withThemeProvider = (Story) => {
  return (
    // <Emotion10ThemeProvider theme={theme}>
    <ThemeProvider theme={theme}>
      <Story />
    </ThemeProvider>
    // </Emotion10ThemeProvider>
  )
}

export const decorators = [withThemeProvider]

const BREAKPOINTS_INT = {
  xs: 375,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
}

const customViewports = Object.fromEntries(
  Object.entries(BREAKPOINTS_INT).map(([key, val], idx) => {
    console.log(val)
    return [
      key,
      {
        name: key,
        styles: {
          width: `${val}px`,
          height: `${(idx + 5) * 10}vh`
        }
      }
    ]
  })
)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  viewports: { viewports: customViewports }
}

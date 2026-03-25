import * as palette from './palette';

export const badge = {
  info: {
  bg: { value: {
  _light: palette.blue_alpha_2000,
  _dark: palette.blue_alpha_2200,
} },
  text: { value: {
  _light: palette.blue_500,
  _dark: palette.blue_600,
} },
},
  success: {
  bg: { value: {
  _light: palette.green_alpha_1000,
  _dark: palette.green_alpha_900,
} },
  text: { value: {
  _light: palette.green_600,
  _dark: palette.green_300,
} },
},
  attention: {
  bg: { value: {
  _light: palette.purple_alpha_500,
  _dark: palette.purple_alpha_600,
} },
  text: { value: {
  _light: palette.purple_100,
  _dark: palette.purple_200,
} },
},
  error: {
  bg: { value: {
  _light: palette.purple_alpha_800,
  _dark: palette.purple_alpha_700,
} },
  text: { value: {
  _light: palette.purple_400,
  _dark: palette.purple_300,
} },
},
  warning: {
  bg: { value: {
  _light: palette.orange_alpha_300,
  _dark: palette.orange_alpha_400,
} },
  text: { value: {
  _light: palette.orange_100,
  _dark: palette.orange_200,
} },
},
  default: {
  bg: { value: {
  _light: palette.grey_alpha_3700,
  _dark: palette.blue_alpha_1500,
} },
  text: { value: {
  _light: palette.grey_2500,
  _dark: palette.grey_1300,
} },
},
};

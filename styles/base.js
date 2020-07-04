import {  Dimensions, StatusBar } from 'react-native';
export const dimensions = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
  statusBarHeight: StatusBar.statusBarHeight || 24,
}
  
export const colors  = {
  primary: '#6EC417',
  secondary: '#005A50',
  tertiary: '#727272',
  fourthiary: '#000000',
  error: '#F04048',
  separator: '#E0E0E0',
  // button: '#B6E18B',
  border: '#CCCCCC',
  white: '#FFFFFF',
}

export const padding = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 20
}

export const fonts = {
  sm: 13,
  md: 14,
  lg: 16,
  primary: 'Sarabun-Light',
  primaryBold: 'Sarabun-SemiBold',

}
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
  error: '#f04048',
  separator: '#e0e0e0',
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
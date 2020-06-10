//This is an example of React Native Tab
import React from 'react';
import {Platform, StyleSheet} from 'react-native';
//import react in our code.

//Import React Navigation
import {createAppContainer} from 'react-navigation';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import {createStackNavigator} from 'react-navigation-stack';
import { Button } from 'react-native-elements';

//Import External Files
import {colors, fonts, padding, dimensions} from './styles/base.js'
import ProductListPage from './pages/ProductListPage';
import SecondPage from './pages/SecondPage';
import ProductDetailPage from './pages/ProductDetailPage.js';
import SettingsPage from './pages/SettingsPage.js';
import MainMenuPage from './pages/MainMenuPage.js';
import ProductAddPage from './pages/ProductAddPage.js';

//Making TabNavigator which will be called in App StackNavigator
//we can directly export the TabNavigator also but header will not be visible
//as header comes only when we put anything into StackNavigator and then export

const TabScreen = createMaterialTopTabNavigator(
  {
    All: { screen: ProductListPage },
    Outofstock: { screen: SecondPage },
  },
  {
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      activeTintColor: '#FFFFFF',
      inactiveTintColor: '#F8F8F8',
      style: {
        backgroundColor: '#6EC417',
        height:44,
      },
      labelStyle: {
        textAlign: 'center',
        paddingTop:0,
      },
      indicatorStyle: {
        borderBottomColor: '#87B56A',
        borderBottomWidth: 2,
      },
    },
  }
);
const styles = StyleSheet.create({
  headerRightButton: {backgroundColor: "transparent",},
  })
//making a StackNavigator to export as default
const App = createStackNavigator({
  MainMenu: 
  {
    screen: MainMenuPage,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#6EC417',
      },
      headerTintColor: '#FFFFFF',
      title: 'Rala Music',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      } 
    },
  },
  TabScreen: {
    screen: TabScreen,
    navigationOptions: {
      // headerShown:false,
      headerStyle: {
        backgroundColor: '#6EC417',
      },
      headerTintColor: '#FFFFFF',
      title: 'PRODUCT', 

    },
  },
  ProductDetail: 
  {
    screen: ProductDetailPage,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#6EC417',
      },
      headerTintColor: '#FFFFFF',
      title: 'รายละเอียดสินค้า',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      } 
    },
  },
  Settings: 
  {
    screen: SettingsPage,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#6EC417',
      },
      headerTintColor: '#FFFFFF',
      title: 'ตั้งค่า',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      } 
    },
  },
  ProductAdd: 
  {
    screen: ProductAddPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: '#6EC417',
      },
      headerTintColor: '#FFFFFF',
      title: 'เพิ่มสินค้า',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },
      headerRight: <Button buttonStyle={styles.headerRightButton}
          titleStyle={{fontFamily: fonts.primaryBold}}
          title={"Save"}
          onPress={navigation.state.params.handleSave} /> 
    }),
  },  
});
export default createAppContainer(App);
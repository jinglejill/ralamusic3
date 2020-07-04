//This is an example of React Native Tab
import React from 'react';
import {Platform, StyleSheet, Image, TouchableHighlight, HeaderBarButton, View, ActivityIndicator, Text} from 'react-native';
//import react in our code.

//Import React Navigation
import {createAppContainer} from 'react-navigation';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import {createStackNavigator, HeaderBackButton} from 'react-navigation-stack';
import { Button } from 'react-native-elements';

//Import External Files
import {colors, fonts, padding, dimensions} from './styles/base.js'
import ProductListPage from './pages/ProductListPage';
import SettingsPage from './pages/SettingsPage.js';
import MainMenuPage from './pages/MainMenuPage.js';
import ProductAddPage from './pages/ProductAddPage.js';
import PrintProductQRPage from './pages/PrintProductQRPage.js';
import PrinterSettingPage from './pages/PrinterSettingPage.js';
import ChooseModelPage from './pages/ChooseModelPage.js';
import ChoosePaperSizePage from './pages/ChoosePaperSizePage.js';
import ChoosePrinterPage from './pages/ChoosePrinterPage.js';
import ChooseOrientationPage from './pages/ChooseOrientationPage.js';
import ChooseAutoCutPage from './pages/ChooseAutoCutPage.js';
import ChooseCutAtEndPage from './pages/ChooseCutAtEndPage.js';
import ScanInPage from './pages/ScanInPage.js';
import ScanOutPage from './pages/ScanOutPage.js';

//Making TabNavigator which will be called in App StackNavigator
//we can directly export the TabNavigator also but header will not be visible
//as header comes only when we put anything into StackNavigator and then export


const TabScreen = createMaterialTopTabNavigator(
  {
    All: 
    {
      screen: ProductListPage,
      params:{outOfStock:false},     
             
    },
    Outofstock: 
    {
      screen: ProductListPage, 
      params:{outOfStock:true},  
               
    },
  },
  {  
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      activeTintColor: colors.primary,
      inactiveTintColor: '#F8F8F8',
      style: {
        backgroundColor: colors.fourthiary,
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
        backgroundColor: colors.fourthiary,
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
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'PRODUCT',  
    },
  },  
  Settings: 
  {
    screen: SettingsPage,
    navigationOptions: {
      headerStyle: {
        backgroundColor: colors.fourthiary,
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
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: navigation.state.params.edit?'รายละเอียดสินค้า':'เพิ่มสินค้า',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {
            navigation.state.params.savedOrSynced?navigation.state.params.refresh():null;
            navigation.goBack(null);}} />,
      headerRight: ()=> <View style={{display:'flex',flexDirection:'row',alignItem:'center',justifyContent:'center',width:110,}}>
                          <View style={{width:55}}>
                          {
                            navigation.state.params.edit?null:
                            (<Button buttonStyle={styles.headerRightButton}
                              titleStyle={{fontFamily: fonts.primaryBold}}
                              title={"New"}
                              onPress={navigation.state.params.handleNew} 
                            />)
                          }                            
                          </View>
                          <View style={{width:55,alignItem:'center',justifyContent:'center' }}>
                          {
                            navigation.state.params.animating?
                            <ActivityIndicator animating size='small' style={{marginRight:padding.sm}}/>:                            
                            <Button buttonStyle={styles.headerRightButton}
                              titleStyle={{fontFamily: fonts.primaryBold}}
                              title={"Save"}
                              onPress={navigation.state.params.handleSave} 
                            />
                          }
                          </View>
                        </View>
    }),
  }, 
  PrintProductQR: 
  {
    screen: PrintProductQRPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'พิมพ์ QR',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
      headerRight: () => <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={navigation.state.params.handleSetupPrinter}>         
                          <Image
                            source={require('./assets/images/printerSetting.png')}
                            style={{
                              width: 40,
                              height: 40,
                              marginRight: padding.md
                            }}
                          />
                        </TouchableHighlight>
    }),
  }, 
  PrinterSetting: 
  {
    screen: PrinterSettingPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'ตั้งค่าเครื่องพิมพ์',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },   
      headerLeft: <HeaderBackButton tintColor="#FFFFFF" onPress={navigation.state.params.handleGoBack} />,   
    }),
  }, 
  ChooseModel: 
  {
    screen: ChooseModelPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกรุ่นเครื่องพิมพ์',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  }, 
  ChoosePaperSize: 
  {
    screen: ChoosePaperSizePage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกขนาดกระดาษ',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  }, 
  ChoosePrinter: 
  {
    screen: ChoosePrinterPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกเครื่องพิมพ์',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  ChooseOrientation: 
  {
    screen: ChooseOrientationPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกแนวการพิมพ์',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  ChooseAutoCut: 
  {
    screen: ChooseAutoCutPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกการตัดอัตโนมัติ',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  ChooseCutAtEnd: 
  {
    screen: ChooseCutAtEndPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'เลือกการตัดที่ปลาย',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  ScanIn: 
  {
    screen: ScanInPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Scan สินค้าเข้า',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  ScanOut: 
  {
    screen: ScanOutPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Scan สินค้าออก',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
});
export default createAppContainer(App);





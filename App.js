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
import LoginPage from './pages/LoginPage.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import EmailTemplatePage from './pages/EmailTemplatePage.js';
import ResetPasswordPage from './pages/ResetPasswordPage.js';
import ResetPasswordExpiredPage from './pages/ResetPasswordExpiredPage.js';
import UserManagementPage from './pages/UserManagementPage.js';
import UserAddPage from './pages/UserAddPage.js';
import MyProfilePage from './pages/MyProfilePage.js';
import StockSharingListPage from './pages/StockSharingListPage.js';
import OrderGroupListPage from './pages/OrderGroupListPage.js';
import OrderNoScanPage from './pages/OrderNoScanPage.js';
import OrderDetailPage from './pages/OrderDetailPage.js';
import LargeImagePage from './pages/LargeImagePage.js';
import OrderDetailListPage from './pages/OrderDetailListPage.js';
import ProductReturnListPage from './pages/ProductReturnListPage.js';
import OrderNoScan2Page from './pages/OrderNoScan2Page.js';
import OrderDetail2Page from './pages/OrderDetail2Page.js';
import ProductReturnFormPage from './pages/ProductReturnFormPage.js';

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

const TabProductReturn = createMaterialTopTabNavigator(
  {
    รับคืน: 
    {
      screen: ProductReturnListPage,
      params:{tabIndex:0},    
      
    },
    ส่งแล้ว: 
    {
      screen: ProductReturnListPage, 
      params:{tabIndex:1},  
               
    },
    เสร็จ: 
    {
      screen: ProductReturnListPage, 
      params:{tabIndex:2},  
               
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
  Login: 
  {
    screen: LoginPage,
    navigationOptions: ({navigation})=> ({
      headerShown: false,     
    }),
  },  
  MainMenu: 
  {
    screen: MainMenuPage,
    navigationOptions: {
      headerLeft: ()=>null,
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
            navigation.state.params.edit && navigation.state.params.savedOrSynced?navigation.state.params.refresh(navigation.state.params.product):null;
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
      headerLeft:()=> <HeaderBackButton tintColor="#FFFFFF" onPress={navigation.state.params.handleGoBack} />,   
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
  ForgotPassword: 
  {
    screen: ForgotPasswordPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'ลืมรหัสผ่าน?',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },
  EmailTemplate: 
  {
    screen: EmailTemplatePage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Email Template',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },  
  ResetPassword: 
  {
    screen: ResetPasswordPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'ตั้งค่ารหัสผ่านใหม่',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },  
  ResetPasswordExpired: 
  {
    screen: ResetPasswordExpiredPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'ตั้งค่ารหัสผ่านใหม่ หมดอายุแล้ว',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },      
    }),
  },  
  UserManagement: 
  {
    screen: UserManagementPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'จัดการผู้ใช้',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },
      headerRight: ()=><Button buttonStyle={styles.headerRightButton}
                              titleStyle={{fontFamily: fonts.primaryBold}}
                              title={"New"}
                              onPress={navigation.state.params.handleNew} 
                            />                              
    }),
  }, 
  UserAdd: 
  {
    screen: UserAddPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: navigation.state.params.edit?'ผู้ใช้':'เพิ่มผู้ใช้',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {
            navigation.state.params.savedOrSynced?navigation.state.params.refresh():null;
            navigation.goBack(null);}} />,
      headerRight: ()=><View style={{display:'flex',flexDirection:'row',alignItem:'center',justifyContent:'center',width:110,}}>
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
  MyProfile: 
  {
    screen: MyProfilePage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'ข้อมูลของฉัน',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },                      
    }),
  },   
  StockSharingList: 
  {
    screen: StockSharingListPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Stock sharing',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },       
      headerRight: ()=>   
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
                                           
    }),
  }, 
  OrderGroupList: 
  {
    screen: OrderGroupListPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Order Delivery Recheck',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },       
      headerRight: ()=>   
                        <View style={{width:55,alignItem:'center',justifyContent:'center' }}>
                        <Button buttonStyle={styles.headerRightButton}
                          titleStyle={{fontFamily: fonts.primaryBold}}
                          title={"Add"}
                          onPress={navigation.state.params.handleAdd} 
                        />
                        </View>
                                           
    }),
  },
  OrderNoScan: 
  {
    screen: OrderNoScanPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Scan Order No.',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
            onPress={navigation.state.params.handleFinish}
          />,       
      headerRight: ()=>   
                  <View style={{width:59,alignItem:'center',justifyContent:'center' }}>
                  {
                    navigation.state.params.animating?
                    <ActivityIndicator animating size='small' style={{marginRight:padding.sm}}/>:                            
                    <Button buttonStyle={styles.headerRightButton}
                      titleStyle={{fontFamily: fonts.primaryBold}}
                      title={"Finish"}
                      onPress={navigation.state.params.handleFinish} 
                    />
                  }
                  </View>
    }),
  }, 
  OrderDetail: 
  {
    screen: OrderDetailPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'รายละเอียดคำสั่งซื้อ',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },   
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {
            navigation.state.params.edit?null:
            navigation.state.params.resetSkuDetected();
            navigation.goBack(null);}} />,   
      headerRight: ()=>   
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
    }),
  },  
  LargeImage: 
  {
    screen: LargeImagePage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Image',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      }, 
      headerRight: ()=>   
                        <View style={{width:66,alignItem:'center',justifyContent:'center' }}>
                        {
                          navigation.state.params.allowDelete?                          
                          <Button buttonStyle={styles.headerRightButton}
                            titleStyle={{fontFamily: fonts.primaryBold}}
                            title={"Delete"}
                            onPress={navigation.state.params.handleDelete} 
                          />
                          :
                          null
                        }
                        </View>              
    }),
  },
  OrderDetailList: 
  {
    screen: OrderDetailListPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: navigation.state.params.pageTitle,//'รายการคำสั่งซื้อ',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      }, 
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {
            navigation.state.params.hilightGroup(navigation.state.params.orderDeliveryGroupID,navigation.state.params.checked);
            navigation.goBack(null);}} />,                 
    }),
  }, 
  ProductReturnList: 
  {
    screen: ProductReturnListPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Product Return',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },                                           
    }),
  },  
  OrderNoScan2: 
  {
    screen: OrderNoScan2Page,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'Scan Order No.',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      }, 
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {   
            // console.log("orderUpdated test:"+navigation.getParam('orderUpdated'));     
            // navigation.getParam('orderUpdated')?navigation.getParam('handleNewForm'):null;
            navigation.goBack(null);}} />,       
      headerRight: ()=>   
                  <View style={{width:90,alignItem:'flex-end',justifyContent:'flex-end' }}>
                    <Button buttonStyle={styles.headerRightButton}
                      titleStyle={{fontFamily: fonts.primaryBold}}
                      title={"NewForm"}
                      onPress={navigation.getParam('handleNewForm')} 
                    />
                  </View>
    }),
  }, 
  OrderDetail2: 
  {
    screen: OrderDetail2Page,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'รายละเอียดสินค้าคืน',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },   
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {
            navigation.state.params.edit || navigation.state.params.newForm?null:
            navigation.state.params.resetSkuDetected();
            navigation.goBack(null);}} />,   
      headerRight: ()=>   
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
    }),
  }, 
  TabProductReturn: {
    screen: TabProductReturn,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'สินค้าคืน',   
      headerRight: ()=>   
                  <View style={{width:90,alignItem:'flex-end',justifyContent:'flex-end' }}>
                    <Button buttonStyle={styles.headerRightButton}
                      titleStyle={{fontFamily: fonts.primaryBold}}
                      title={"Add"}
                      onPress={()=>navigation.dangerouslyGetParent().navigate("OrderNoScan2",{modifiedUser:navigation.getParam('modifiedUser')})} 
                    />
                  </View>    
    }),
    
  },
  ProductReturnForm: 
  {
    screen: ProductReturnFormPage,
    navigationOptions: ({navigation})=> ({
      headerStyle: {
        backgroundColor: colors.fourthiary,
      },
      headerTintColor: '#FFFFFF',
      title: 'กรอกสินค้าคืน',
      headerTitleStyle: {
        fontFamily: "Sarabun-SemiBold",
        fontSize: 18,
      },    
      headerLeft: () => <HeaderBackButton tintColor="#FFFFFF"
          onPress={() => {        
            navigation.getParam('orderUpdated')?navigation.getParam('setOrderUpdated'):null;
            navigation.goBack(null);}} />,        
      headerRight: ()=>   
                        <View style={{width:55,alignItem:'center',justifyContent:'center' }}>
                        {                                                  
                          <Button buttonStyle={styles.headerRightButton}
                            titleStyle={{fontFamily: fonts.primaryBold}}
                            title={"Next"}
                            onPress={navigation.state.params.handleNext} 
                          />
                        }
                        </View>
    }),
  }, 
},
);
export default createAppContainer(App);


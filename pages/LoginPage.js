// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, ScrollView, ActivityIndicator, Platform, AsyncStorage} from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions, settings} from './../styles/base.js'
import DeviceInfo from 'react-native-device-info';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";


export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: settings.storeName,
      // storeName: 'MINIMALIST',
      apiPath: settings.apiPath, //'https://minimalist.co.th/saim/', 
      // apiPath: 'http://jummum.co/saim/',  
      rememberMeText: '❒  จำฉันไว้ในระบบ',  
      alertVisible: false,  
      token:'',//test
    };

    this.handleSetControl();//uncomment
    this.configurePushNotifications();
    
       
  }



  onUsernameChanged = (text) => 
  {
    this.setState({username:text});
  }

  onPasswordChanged = (text) => 
  {
    this.setState({password:text});
  }

  onHideUnderlay = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatus: true });
  }

  onHideUnderlayRememberMe = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatusRememberMe: false });
  }

  onShowUnderlayRememberMe = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatusRememberMe: true });
  }

  onHideUnderlayForgotPassword = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatusForgotPassword: false });
  }

  onShowUnderlayForgotPassword = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatusForgotPassword: true });
  }

  getDeviceInfo = () =>
  {
    var brand = DeviceInfo.getBrand();
    var buildNumber = DeviceInfo.getBuildNumber();
    var carrier = "";
    DeviceInfo.getCarrier().then(carrierData => {
      // "SOFTBANK"
      carrier = carrierData;
    });
    var deviceId = DeviceInfo.getDeviceId();
    var deviceToken = "";
    DeviceInfo.getDeviceToken().then(deviceTokenData => {
      // iOS: "a2Jqsd0kanz..."
      deviceToken = deviceTokenData;
    });
    var systemVersion = DeviceInfo.getSystemVersion();
    var userAgent = "";
    DeviceInfo.getUserAgent().then(userAgentData => {
      // iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143"
      // tvOS: not available
      // Android: ?
      // Windows: ?
      userAgent = userAgentData;
    });

    var deviceInfo = brand+";"+deviceId+";"+buildNumber+";"+";"+systemVersion+";"+buildNumber+";"+carrier+";"+userAgent+";"+deviceToken;
    return deviceInfo;
  }

  configurePushNotifications = () => {
    console.log("configurePushNotifications");
   const that = this;
   PushNotification.configure({
      onRegister: function(token) {
        // alert(token.token)

        that.setState({token:token.token});
        console.log("token:"+token.token);
        // that.sendTokenTOServer(token.token) 

        if(that.state.loginFlag)
        {
          that.loginProcess();
        }
      },
      largeIcon: "ic_launcher",
      smallIcon: "ic_notification",
   });
  }

  login = () => 
  {
    

    // var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    // // connectBrotherPrinter.testLog(
    // //   'jill',
    // //   'icon'
    // // );

    // connectBrotherPrinter.testCallBack((error, text) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log(text);
    //     // this.setState({printerStatus:text});
    //   }
    // });

    // return;


    if(this.state.token != '')
    {
      console.log("token has value:"+this.state.token);
      this.loginProcess();
    }
    else
    {
      console.log("token empty");
      this.setState({loginFlag:true});
    }
  }

  loginProcess = () =>
  {
    console.log("token before login insert:"+this.state.token);
    console.log("login");    
    this.setState({loading: true});
//     fetch('http://minimalist.co.th/saimtest/testredirect.php',
//     {
//       method: 'POST',
//       headers: {
//                   'Accept': 'application/json',
//                   'Content-Type': 'application/json',
//                 },
//       body: JSON.stringify({  
//         username: this.state.username,
//         password: this.state.password,
//         deviceInfo: this.getDeviceInfo(),            
//         token:this.state.token,
//         storeName: this.state.storeName,
//         modifiedUser: this.state.username,
//         modifiedDate: new Date().toLocaleString(),
//         platForm: Platform.OS,
//       })
//     })
//     .then((response) => {console.log("object test:"+response._bodyInit._data.__collector)})
//     // .then((responseData) =>{
      
//     //   this.setState({loading: false});
//     //   if(responseData.success == true)
//     //   {        
//     //     this.setState({alertStatus:0});
//     //     console.log("testUsername:"+responseData.user.Username);
//     //     // this.showAlertMessage(responseData.user.Username);
//     //   }
      
//     // }).done();

// return;
  console.log("url test;"+this.state.apiPath+'SAIMLoginInsert.php');

    fetch(this.state.apiPath+'SAIMLoginInsert.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.username,
        password: this.state.password,
        deviceInfo: this.getDeviceInfo(),            
        token:this.state.token,
        storeName: this.state.storeName,
        modifiedUser: this.state.username,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      console.log("responseData.success:"+responseData.success);
      
      this.setState({loading: false});
      if(responseData.success == true)
      {        
        //keep rememberMe, username, password
        if(Platform.OS == 'ios')
        {          
          if(this.state.rememberMe)
          {
            this.setUserDefault(this.state.username, this.state.password, this.state.rememberMe);
          }
          else
          {
            this.setUserDefault('', '', this.state.rememberMe);            
          }
        }
        else
        {
          if(this.state.rememberMe)
          {
            ToastExample.savePreferenceUsername(this.state.username);
            ToastExample.savePreferencePassword(this.state.password);
            ToastExample.savePreferenceRememberMe(this.state.rememberMe);  
          }
          else
          {
            ToastExample.savePreferenceUsername('');
            ToastExample.savePreferencePassword('');
            ToastExample.savePreferenceRememberMe(this.state.rememberMe);  
          }
        }
        

        this.setState({modifiedUser:responseData.user.Username});

        //go to mainMenuPage
        this.props.navigation.navigate('MainMenu',
        {
          'apiPath': this.state.apiPath,
          'storeName': this.state.storeName,
          'modifiedUser': responseData.user.Username,            
          setControl: this.handleSetControl,    
        });
      }
      else
      {
        // error message        
        console.log(responseData.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(responseData.message);
      }
    }).done();
  }

  setUserDefault = (username,password,rememberMe) => 
  {
    this.setUsername(username);
    this.setPassword(password);
    this.setRememberMe(rememberMe);    
  }

  getUserDefault = () => 
  {
    this.getUsername();
    this.getPassword();
    this.getRememberMe();    
  }

  handleSetControl = () => 
  {
    if(Platform.OS == 'ios')
    {          
      this.getUserDefault();
    }
    else
    {      
      ToastExample.getPreferenceUsername((username) => {
        this.setState({username:username});
      });

      ToastExample.getPreferencePassword((password) => {      
        this.setState({password:password});      
      });

      ToastExample.getPreferenceRememberMe((rememberMe) => {
        this.setState({rememberMe:rememberMe},()=>
        {
          if(this.state.rememberMe)
          {
            this.setState({rememberMeText:"✓  จำฉันไว้ในระบบ"});
            this.login();
          }
          else
          {
            this.setState({rememberMeText:"❒  จำฉันไว้ในระบบ"}); 
          }
        });
      }); 
    }
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  rememberMe = () => 
  {
    this.setState({rememberMe:!this.state.rememberMe},()=>
      {
        if(this.state.rememberMe)
        {
          this.setState({rememberMeText:"✓  จำฉันไว้ในระบบ"});
          console.log('rememberMe true');
        }
        else
        {
          this.setState({rememberMeText:"❒  จำฉันไว้ในระบบ"}); 
          console.log('rememberMe false');
        }
      }
    );
  }

  forgotPassword = () => 
  {
    console.log("forgotPassword");

    //go to mainMenuPage
    this.props.navigation.navigate('ForgotPassword',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.username, 
      setControl: this.handleSetControl, 
    });
  }

  setUsername = async (username) => {
    try {
      await AsyncStorage.setItem(
        'username',
        username
      );        
    } catch (error) {
      // Error saving data
    }
  };

  setPassword = async (password) => {
    try {
      await AsyncStorage.setItem(
        'password',
        password
      );        
    } catch (error) {
      // Error saving data
    }
  };

  setRememberMe = async (rememberMe) => {
    try {
      await AsyncStorage.setItem(
        'rememberMe',
        JSON.stringify(rememberMe)
      );        
    } catch (error) {
      // Error saving data
    }
  };

  getUsername = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        // We have data!!
          this.setState({username:value});            
      }
      else
      {
        this.setState({username:''});
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  getPassword = async () => {
    try {
      const value = await AsyncStorage.getItem('password');
      if (value !== null) {
        // We have data!!
          this.setState({password:value});            
      }
      else
      {
        this.setState({password:''});
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  getRememberMe = async () => {
    try {
      const value = await AsyncStorage.getItem('rememberMe');
      if (value !== null) {
        // We have data!!
        
        this.setState({rememberMe:JSON.parse(value)},()=>
        {
          if(this.state.rememberMe)
          {
            this.setState({rememberMeText:"✓  จำฉันไว้ในระบบ"});
            this.login();
          }
          else
          {
            this.setState({rememberMeText:"❒  จำฉันไว้ในระบบ"}); 
          }
        });      
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  render() {
    return (
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
        <View style={{flex:1,backgroundColor:'black'}}>
          <View style={{height:dimensions.fullHeight*0.33,alignItems:'center',justifyContent:'flex-end'}}>
            <Image source={require('./../assets/images/rala-music-logo-white.png')}  style={styles.logo}/>
          </View>
          <View style={{height:dimensions.fullHeight*0.33,justifyContent:'center'}}>
            <View style={{}}>
              <TextInput style={styles.value} value={this.state.username} placeholder=' Username' onChangeText={(text) => {this.onUsernameChanged(text)}}/>  
              <TextInput style={styles.value} value={this.state.password} placeholder=' Password' onChangeText={(text) => {this.onPasswordChanged(text)}} secureTextEntry={true} />  
              <View style={{justifyContent: 'center',marginTop:20}}>
                  <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
                    onHideUnderlay={()=>this.onHideUnderlay()}
                    onShowUnderlay={()=>this.onShowUnderlay()}                                        
                    onPress={()=>{this.login()}} >  
                      <View style={{flex:1,justifyContent:'center'}}>
                        <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                          <View style={{width:30}}>                    
                          </View>       
                          <Text style={
                            this.state.pressStatus
                              ? styles.textPress
                              : styles.text
                            }>Log in
                          </Text> 
                          <View style={{width:30}}>
                            {this.state.loading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                          </View>
                        </View>
                      </View>
                  </TouchableHighlight>                                                  
              </View>
              <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',marginLeft:padding.xxl,marginRight:padding.xxl}}>
                <View style={{marginTop:10}}>
                  <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.rememberMeButton} 
                    onHideUnderlay={()=>this.onHideUnderlayRememberMe()}
                    onShowUnderlay={()=>this.onShowUnderlayRememberMe()}                                        
                    onPress={()=>{this.rememberMe()}} >         
                      <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-start'}}>                    
                        <Text style={
                          this.state.pressStatusRememberMe
                            ? styles.textPressRememberMe
                            : styles.textRememberMe
                          }>{this.state.rememberMeText}
                        </Text>                                   
                      </View>
                  </TouchableHighlight>                                                  
                </View>

                <View style={{marginTop:10}}>
                  <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.rememberMeButton} 
                    onHideUnderlay={()=>this.onHideUnderlayForgotPassword()}
                    onShowUnderlay={()=>this.onShowUnderlayForgotPassword()}                                        
                    onPress={()=>{this.forgotPassword()}} >         
                      <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-start'}}>                    
                        <Text style={
                          this.state.pressStatusForgotPassword
                            ? styles.textPressForgotPassword
                            : styles.textForgotPassword
                          }>ลืมรหัสผ่าน?
                        </Text>                                   
                      </View>
                  </TouchableHighlight>                                                  
                </View>
              </View>
            </View>
          </View>

          <Dialog
            visible={this.state.alertVisible}
            width={0.8}
            footer={
              <DialogFooter style={styles.dialogFooter}>                       
                <DialogButton
                  text="OK"
                  style={styles.okButton}
                  textStyle={styles.okButtonText}
                  onPress={() => {this.setState({ alertVisible: false })}}
                />
              </DialogFooter>
            }
            onTouchOutside={() => {
              this.setState({ alertVisible: false });
            }}          
          >
            <DialogContent>
              {
                <View style={{alignItems:'center',justifyContent:'center',paddingTop:20}}>
                  <Text style={this.state.alertStatus?styles.textSuccess:styles.textFail}>{this.state.alertMessage}</Text>
                </View>            
              }
            </DialogContent>
          </Dialog> 
        </View>
      </ScrollView>
    );
  }
}
                      
const styles = StyleSheet.create({  
  logo: 
  {
    alignItems:'center',
    marginBottom:20,   
    aspectRatio:4,       
  },  
  value: 
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xxl*2,    
    height: 44,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: padding.xxl,
    marginTop: 10,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  button: 
  {
    marginLeft:padding.xxl,
    width: dimensions.fullWidth - padding.xxl*2,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,      
  },
  rememberMeButton: 
  {     
    height:30,      
  },
  text: 
  {   
    fontFamily: fonts.primaryBold,
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.white,    
  },
  textPress: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.primary,    
  },
  textRememberMe: 
  {   
    fontFamily: fonts.primaryBold,   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.white,
    textAlignVertical: 'center'
  },
  textPressRememberMe: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.black,
    textAlignVertical: 'center'
  },
  textForgotPassword: 
  {   
    fontFamily: fonts.primaryBold,  
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.white,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
  },
  textPressForgotPassword: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.black,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
  },
  activityIndicator:
  {    
    justifyContent: 'center',
    alignItems:'center'
  },
  okButton:
  {
    paddingTop:10,    
    height:44,  
  },
  cancelButton:
  {
    paddingTop:10,    
    height:44,  
  },
  okButtonText:
  {
    color:colors.primary,
    fontSize:fonts.md,
  },
  cancelButtonText:
  {
    color:colors.primary,
    fontSize:fonts.md,
  },
  dialogFooter:
  {
    height:44,  
  },
  textFail:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md,
    paddingTop:padding.xl
  },
  textSuccess:
  {
    color:colors.secondary,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
});

// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, ScrollView, ActivityIndicator} from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import DeviceInfo from 'react-native-device-info';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import ToastExample from './../javaModule/ToastExample';


export default class ForgotPasswordPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {      
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,  
      modifiedUser: this.props.navigation.state.params.modifiedUser,   
      alertVisible: false,      
    };
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
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

  submit = () => 
  {
    console.log("submit");
    console.log(this.state.apiPath + 'SAIMForgotPasswordInsert.php');
    this.setState({loading: true});
    fetch(this.state.apiPath + 'SAIMForgotPasswordInsert.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        email: this.state.email,
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
      if(responseData.success === true)
      {        
        console.log(responseData.message);
        this.setState({alertStatus:1});
        this.setState({goBack:true},()=>{this.showAlertMessage(responseData.message);});        
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

  onEmailChanged = (text) => 
  {
    this.setState({email:text});
  }

  closeDialog = () => 
  {
    this.setState({ alertVisible: false });
    if(this.state.goBack)
    {
        //save preference
        if(Platform.OS == 'ios')
        {
          this.setUserDefault('','',false);   
        }
        else
        {
          ToastExample.savePreferenceUsername("");
          ToastExample.savePreferencePassword("");
          ToastExample.savePreferenceRememberMe(false);    
        }
        

        //go back to login page and clear control
        this.props.navigation.state.params.setControl();
        this.props.navigation.goBack();
    }    
  }

  setUserDefault = (username,password,rememberMe) => 
  {
    this.setUsername(username);
    this.setPassword(password);
    this.setRememberMe(rememberMe);    
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

  render() {
    return (
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
        <View style={{backgroundColor:colors.white,height:dimensions.fullHeight*0.33,justifyContent:'flex-end'}}>
          <Text style={styles.title}>กรุณาใส่อีเมลสำหรับส่งการตั้งค่ารหัสผ่านใหม่ไปให้ หากไม่พบกรุณาตรวจสอบที่อีเมลขยะของคุณ</Text>
          <TextInput style={styles.value} value={this.state.email} placeholder=' Email' onChangeText={(text) => {this.onEmailChanged(text)}}/>  
          <View style={{justifyContent: 'center',marginTop:20}}>
            <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
              onHideUnderlay={()=>this.onHideUnderlay()}
              onShowUnderlay={()=>this.onShowUnderlay()}                                        
              onPress={()=>{this.submit()}} > 
                <View style={{flex:1,justifyContent:'center'}}> 
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    <View style={{width:30}}>                    
                    </View>       
                    <Text style={
                      this.state.pressStatus
                        ? styles.textPress
                        : styles.text
                      }>Submit
                    </Text> 
                    <View style={{width:30}}>
                      {this.state.loading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                    </View>
                  </View>
                </View>
            </TouchableHighlight>                                                  
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
                  onPress={() => {this.closeDialog()}}
                />
              </DialogFooter>
            }
            onTouchOutside={() => {
              this.closeDialog()
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
  title: 
  {        
    marginLeft: padding.xxl,
    marginRight: padding.xxl,
    marginBottom: padding.lg,
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    textAlign: 'left',
    color: colors.secondary,
  },
  value: 
  {
    marginLeft: padding.xxl,
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xxl*2,    
    height: 44,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
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
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.white,    
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.primary,    
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
  dialogFooter:
  {
    height:44,  
  },
  okButton:
  {
    paddingTop:10,    
    height:44,  
  },
  okButtonText:
  {
    color:colors.primary,
    fontSize:fonts.md,
  },
  
});

// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, ScrollView, ActivityIndicator} from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';



export default class ResetPasswordPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {      
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,  
      modifiedUser: this.props.navigation.state.params.modifiedUser,   
      alertVisible: false,
    };
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

  resetPassword = () => 
  {
    this.setState({loading: true});
    fetch(this.state.apiPath + 'SAIMResetPassword.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        newPassword: this.state.newPassword,
        newPasswordAgain: this.state.newPasswordAgain,        
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
        console.log(responseData.message);
        this.setState({alertStatus:1});
        this.showAlertMessage(responseData.message);
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

  onNewPasswordChanged = (text) => 
  {
    this.setState({newPassword:text});
  }

  onNewPasswordAgainChanged = (text) => 
  {
    this.setState({newPasswordAgain:text});
  }

  recommendStrongPassword = () =>
  {
    var newPassword = this.state.newPassword;
    if (!(/(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(newPassword))) 
    {      
      var message = "**รหัสผ่านที่คุณตั้งมีความปลอดภัยระดับต่ำ**\nรหัสผ่านที่แนะนำควรมีอักษรตัวเล็ก อักษรตัวใหญ่ ตัวเลขหรืออักขระพิเศษ และมีความยาวขั้นต่ำ 8 ตัว";
      this.setState({alertStatus:0});
      this.showAlertMessage(message);
    }    
  }

  showAlertMessage = text => {
    // Alert.alert("",text);
    alert(text);
    this.setState({ alertMessage: text, alertVisible: true });
  };

  render() {
    return (
      <View style={styles.outerView}>
        <View style={{backgroundColor:'black',height:64,alignItems:'center',justifyContent:'center'}}>
          <Image source={require('./../assets/images/rala-music-logo-white.png')}  style={styles.logo}/>          
        </View>
        <View style={{margin:20}}>
          <View style={{alignItems:'center'}}>
            <Text style={styles.title}>ตั้งค่ารหัสผ่านใหม่</Text>
          </View>
          <Text style={styles.content}>รหัสผ่านใหม่:</Text>
          <TextInput style={styles.value} value={this.state.newPassword} placeholder=' ' onChangeText={(text) => {this.onNewPasswordChanged(text)}} onBlur={() => this.recommendStrongPassword() }/>  
          <Text style={styles.content}>รหัสผ่านใหม่ (อีกครั้งหนึ่ง):</Text>
          <TextInput style={styles.value} value={this.state.newPasswordAgain} placeholder=' ' onChangeText={(text) => {this.onNewPasswordAgainChanged(text)}}/>  
          <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
            onHideUnderlay={()=>this.onHideUnderlay()}
            onShowUnderlay={()=>this.onShowUnderlay()}                                        
            onPress={()=>{this.resetPassword()}} >  
              <Text style={
                this.state.pressStatus
                  ? styles.textPress
                  : styles.text
                }>ตั้งค่ารหัสผ่านใหม่
              </Text> 
          </TouchableHighlight> 

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
      </View>
    );
  }
}
                      
const styles = StyleSheet.create({  
  logo: 
  {
    alignItems:'center',    
    height:44,
    // borderWidth:1,
    // borderColor:'white',         
  },
  title: 
  {            
    fontFamily: fonts.primaryBold,
    fontSize: fonts.xl,
    textAlign: 'left',
    color: 'black',
  },
  content: 
  {            
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    textAlign: 'left',
    color: 'black',
    marginTop: 20,
  },
  value: 
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xl*2,    
    height: 44,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    // marginLeft: padding.xl,
    // marginTop: 10,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  button: 
  {
    marginTop:30,
    marginBottom:20,    
    width: dimensions.fullWidth - padding.xl*2,    
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
    margin: 7,
    color: colors.white,
    textAlignVertical: 'center'
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: fonts.lg,
    textAlign: "center",
    margin: 7,
    color: colors.primary,
    textAlignVertical: 'center'
  },
  outerView: 
  {
    marginBottom:20,    
    borderWidth: 1,
    borderRadius: 6,      
  },
});
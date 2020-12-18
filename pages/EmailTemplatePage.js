// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, ScrollView, ActivityIndicator} from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import DeviceInfo from 'react-native-device-info';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';


export default class EmailTemplatePage extends React.Component {
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

  }

  render() {
    return (
      <View style={styles.outerView}>
        <View style={{backgroundColor:'black',height:64,alignItems:'center',justifyContent:'center'}}>
          <Image source={require('./../assets/images/rala-music-logo-white.png')}  style={styles.logo}/>          
        </View>
        <View style={{margin:20}}>
          <Text style={styles.title}>Hello Jinglejill,</Text>
          <Text style={styles.content}>คุณต้องการตั้งรหัสผ่านใหม่ใช่หรือเปล่า กดที่ปุ่มด้านล่างนี้ จะพาคุณไปหน้าจอสำหรับตั้งค่ารหัสผ่านใหม่</Text>
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
  },
  button: 
  {
    marginTop:20,
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

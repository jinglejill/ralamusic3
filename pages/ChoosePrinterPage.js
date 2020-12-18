// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';


export default class ChoosePrinterPage extends React.Component {
  constructor(props) {
    super(props);
    var data =  [];
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      model: this.props.navigation.state.params.model,
      data: data,
      loading: true,
      alertVisible: false,
      alertMessage:'',
      alertStatus:0,  
    };
  }

  componentDidMount ()
  {
    console.log("ChoosePrinterPage componendDidMount");
    
    if(Platform.OS == 'ios')
    {
      var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
      connectBrotherPrinter.startSearchWiFiPrinter((error, printerList) => {
        if (error) {
          console.error(error);
          this.showAlertMessage(error);
        } else {
          console.log("ios device list:"+JSON.stringify(printerList));
          this.setState({data:printerList,loading:false});
        }
      });

      this.getIpAddress();
    }
    else
    {
      ToastExample.getPrinterList((printerList) => {
        console.log(JSON.stringify(printerList));
        this.setState({data:printerList,loading:false});
      });  
    }    
  }

  chooseIpAddress = (ipAddress) => 
  {
    if(Platform.OS == 'ios')
    {
      this.setIpAddress(ipAddress);
    }
    else
    {
      ToastExample.savePreferenceIpAddress(ipAddress);
    }
    
    this.props.navigation.goBack();
    this.props.navigation.state.params.onSelect({ ipAddress: ipAddress });
  }

  setIpAddress = (ipAddress) => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.setIPAddress(ipAddress);
  };

  onIPAddressChanged = (text) => 
  {
    this.setState({ipAddress:text});
  }

  onHideUnderlay = () => 
  {
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    this.setState({ pressStatus: true });
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  getIpAddress = () => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getIPAddress((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({ipAddress:text});         
      }
    });
  };

  render() {
    return (
      <View style={{flex:1}}>
        {this.state.loading && <View style = {{paddingTop:padding.lg}}><ActivityIndicator animating size='large' /></View>}
        <View style={{display:'flex',flexDirection:'row',alignItems:'flex-start',marginTop:padding.lg}}>
          <TextInput style={styles.value} value={this.state.ipAddress} placeholder=' IP Address' onChangeText={(text) => {this.onIPAddressChanged(text)}}/>
          <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
            onHideUnderlay={()=>this.onHideUnderlay()}
            onShowUnderlay={()=>this.onShowUnderlay()}                                        
            onPress={()=>{this.chooseIpAddress(this.state.ipAddress)}} >  
              <View style={{flex:1,justifyContent:'center'}}>
                <Text style={
                  this.state.pressStatus
                    ? styles.textPress
                    : styles.text
                  }>Set
                </Text> 
              </View>
          </TouchableHighlight>   
        </View>        
        {!this.state.loading &&         
        <FlatList          
          data={this.state.data}
          renderItem={({ item }) => ( 
              <TouchableHighlight 
                underlayColor={'white'} activeOpacity={1} onPress={()=>{this.chooseIpAddress(item.ipAddress)}} >                                                             
                <View style={{height:64}}>                
                  <Text style={styles.title}>{item.model}</Text>                    
                  <Text style={styles.subTitle}>{item.ipAddress}</Text>                                    
                  <View style={styles.separator}/>
                </View>
              </TouchableHighlight> 

          )}          
          keyExtractor={(item, index) => index}          
        />
        }
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
    );
  }
}
                      
const styles = StyleSheet.create({
  title:
  {
    paddingLeft:padding.xl,  
    fontFamily: "Sarabun-Light", 
    fontSize: fonts.lg,
    color:colors.secondary,
  },
  subTitle:
  {
    paddingLeft:padding.xl,  
    fontFamily: "Sarabun-Light", 
    fontSize: fonts.md,
    color:colors.tertiary,
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    left:padding.xl,
    // marginTop:padding.lg,
  }, 
  chooseOptions:
  {
    fontFamily:fonts.primaryBold,
    paddingRight:padding.xl,
    color:colors.tertiary
  },
  value: 
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xl*2 - 64 - padding.lg,    
    height: 44,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: padding.xl,
    // marginTop: 10,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  button: 
  {
    marginLeft:padding.lg,
    width: 64,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,      
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
  dialogFooter:
  {
    height:44,  
  },
  textSuccess:
  {
    color:colors.secondary,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
  textFail:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
});
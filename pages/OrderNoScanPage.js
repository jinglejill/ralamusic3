// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import { RNCamera } from 'react-native-camera';
import InputSpinner from "react-native-input-spinner";
import SoundPlayer from 'react-native-sound-player';
import SegmentedControl from '@react-native-community/segmented-control';


export default class OrderNoScanPage extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath, 
      modifiedUser: this.props.navigation.state.params.modifiedUser,     
      orderDeliveryGroupID: this.props.navigation.state.params.orderDeliveryGroupID,     
      alertStatus: true,
      status: "Scanning for QR Code",    
      alertVisible:false,
      selectedIndex:0,
      channel:1,
    };
  }

  componentDidMount()
  {    
    this.props.navigation.setParams({ handleFinish: this.sendNoti });
    this.props.navigation.setParams({ animating: false });
    this.handleRefresh();
    console.log('test scanin page');
  }

  handleRefresh = () => 
  {
    console.log('handleRefresh');
    this.setState({loadingAccess:true});
    
    fetch(this.state.apiPath + 'SAIMUserMenuAllowGet.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,   
        menuCode: 'ORDER_GROUP_LIST',   
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      console.log("responseData.success:"+responseData.success);
      
      this.setState({loading: false});
      if(responseData.success === true && responseData.allow)
      {
        this.setState({loadingAccess:false,menuAllow:true});
        this.fetchData();
      }
      else
      {
        // error message    
        this.setState({loadingAccess:false,menuAllow:false});    
        console.log(responseData.message);
        if(responseData.message != '')
        {
          this.setState({alertStatus:0});
          this.showAlertMessage(responseData.message);
        }        
      }
    }).done();
  }

  sendNoti = () =>
  {
    console.log("sendNoti");
    const url =  this.state.apiPath + 'SAIMOrderDeliveryGroupPush.php';    
    this.props.navigation.setParams({ animating: true });

    
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({             
        orderDeliveryGroupID:this.state.orderDeliveryGroupID,                  
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      this.props.navigation.setParams({ animating: false });
      if(res.success)
      {
        console.log("push success");
        //go back
        this.props.navigation.state.params.refresh();
        this.props.navigation.goBack(null);
      }
    }); 
  }

  fetchData = () => 
  {

  }

  onHideUnderlay = () => 
  {    
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {   
    this.setState({ pressStatus: true });
  }

  startStopCamera = () => 
  {    
    this.setState({skuDetected:false});
  }

  // cleanNumber = (number) => 
  // {
  //   console.log("cleanNumber:"+number);
  //   const cleanNumber = number.replace(/[^0-9]/g, "");
  //   this.setState({quantity:cleanNumber})
  // }

  onQuantityChanged = (text) => 
  {
    if (/^\d+$/.test(text)) 
    {            
      this.setState({quantity:text});
    }   
  }

  barcodeDetected(barcode)
  {
    var orderNo = barcode.data;    
    console.log("orderNo detected:"+orderNo);   

    
    const url =  this.state.apiPath + 'SAIMOrderDeliveryGet2.php';
    this.setState({ loading: true });

    console.log("fetch data -> loading:true");
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({     
        edit:false,  
        channel:this.state.channel,          
        orderNo:orderNo, 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      console.log("order detail:"+JSON.stringify(res));

      this.setState({          
        order:res.Order,          
        // error: res.error || null,
        loading: false,          
      });

      if(!res.success)
      {        
        console.log(res.message);
        this.setState({alertStatus:0, status:res.message,skuDetected:false});
      }
      else
      {
        console.log("order found");
        this.setState({alertStatus:true,status:'Scanning for QR Code'});
        this.props.navigation.navigate('OrderDetail',
        {
          'channel':this.state.channel,
          'order':res.Order,
          'orderNo': orderNo,  
          'orderDeliveryGroupID': this.state.orderDeliveryGroupID,
          'edit': false,
          'apiPath': this.state.apiPath,
          'storeName': this.state.storeName,
          'modifiedUser': this.state.modifiedUser, 
          resetSkuDetected: this.resetSkuDetected,
        });  
      }
    }); 


    
  }

  resetSkuDetected = () => 
  {
    console.log("reset skuDetected");
    this.setState({skuDetected:false});
  }

  playBeepSound = () =>
  {
    try 
    {
      // play the file tone.mp3
      SoundPlayer.playSoundFile('beep', 'mp3')
      // or play from url
      // SoundPlayer.playUrl('https://example.com/music.mp3')
    } 
    catch (e)
    {
      console.log(`cannot play the sound file`, e)
    }
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  render() {
    if(this.state.loadingAccess)
    {
      return(<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><ActivityIndicator animating size='small' /></View>);
    }
    if(!this.state.loadingAccess && !this.state.menuAllow)
    {
      return (<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><Text style={styles.menuAllow}>จำกัดการเข้าใช้</Text></View>);
    }
    return (      
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>       
        <View style={{flex:1}}>          
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}

            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              // console.log("onGoogleVisionBarcodesDetected");
              if(!this.state.skuDetected)
              { 
                var foundQR = false;               
                this.setState({skuDetected:true});
                for(var i=0; i<barcodes.length; i++)
                {
                  if(barcodes[i].type == "UNKNOWN_FORMAT")
                  {
                    continue;
                  }
                  else
                  {
                    foundQR = true;
                    this.playBeepSound();
                    this.barcodeDetected(barcodes[i]);
                    break;
                  }
                }

                if(!foundQR)
                {
                  this.setState({skuDetected:false});                              
                }                
              }                                
            }}
            captureAudio={false}
          >
            
          </RNCamera>                                    
        </View> 
        
        <View style={styles.bottomView}>   

          <View style={{flex:1,borderWidth:3,borderColor:this.state.loading?colors.primary:'transparent',alignItems:'center',justifyContent:'flex-end'}}>            
            <View tyle={{flex:1,width:dimensions.fullWidth,borderWidth:1,borderColor:'red'}}>              
              <Text style={{color:'red'}}>                                                                                    </Text>
              <SegmentedControl
               values={['Lazada', 'Shopee','JD']}
               selectedIndex={this.state.selectedIndex}
               onChange={(event) => {
                 this.setState({
                  selectedIndex: event.nativeEvent.selectedSegmentIndex
                  ,channel:event.nativeEvent.selectedSegmentIndex+1
                  ,alertStatus:true
                  ,status:'Scanning for QR Code'
                });
               }}
               tintColor={colors.primary}
               backgroundColor='white'
               fontStyle={{color:colors.primary,fontSize:14,fontFamily:fonts.primary}}
               activeFontStyle={{color:'white',fontSize:14,fontFamily:fonts.primary}}
              />
            </View>
          </View>

          <View style={[{display:'flex',flexDirection:'row'},styles.viewStatus]}>            
            <Text style={this.state.alertStatus?styles.status:styles.statusFail}>{this.state.status}</Text>             
          </View>
          <View style={[{display:'flex',flexDirection:'row'},styles.viewSpace]}>
            
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
      </ScrollView>
    )
  }
}
                      
const styles = StyleSheet.create({
  menuAllow:
  {
    paddingLeft:padding.xl,  
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.secondary,    
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
  preview: {
    flex: 1,
    alignItems: 'center',   
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },  
  bottomView:
  {
    position: 'absolute',
    bottom: 0, 
    height:dimensions.fullHeight-54-20,     
  }, 
  viewStatus:
  {
    width:dimensions.fullWidth,        
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:colors.separator,    
  },
  viewSpace:
  {
    height:24,
    backgroundColor:colors.separator,    
  },
  status:
  {
    fontFamily:fonts.primary,
    fontSize:fonts.md,
    color:colors.secondary, 
    paddingLeft:padding.xl,   
  },
  statusFail:
  {
    fontFamily:fonts.primary,
    fontSize:fonts.md,
    color:colors.error, 
    paddingLeft:padding.xl,   
    textAlign:'center',
  },
  statusBold:
  {
    fontFamily:fonts.primaryBold,
    fontSize:fonts.md,
    color:colors.secondary,
    backgroundColor:colors.separator,    
    paddingRight:padding.xl,
  },
  button: 
  {
    width: dimensions.fullWidth,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,    
  },  
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: colors.white,    
  }, 
  textPress: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: colors.primary,    
  },   
});

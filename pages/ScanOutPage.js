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


export default class ScanOutPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,    
      modifiedUser: this.props.navigation.state.params.modifiedUser,        
      startStopText: "Start !",
      alertStatus: true,
      status: "Scanning for QR Code",
      statusBold: "",
      visible:true,
      quantity:"1",
      scanQuantity:0,
      previousScanSku:"",
      image:"",
    };
  }

  componentDidMount()
  {    
    this.handleRefresh();
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
        menuCode: 'PRODUCT_SCAN_OUT',   
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
    //add to product
    //show status(show quantity add)
    //show image + sku    
  
    var sku = barcode.data;    
    console.log("sku detected:"+sku);    
    this.setState({loading:true});
    const url =  this.state.apiPath + 'SAIMProductScanOutUpdate2.php';    
    
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        sku:sku, 
        quantity:this.state.quantity,
        storeName: this.state.storeName,
        modifiedUser: this.state.username,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      if(res.success == true)
      {
        var scanQuantity = res.quantityOut;         
        if(this.state.previousScanSku == res.sku)
        {
          scanQuantity = parseInt(this.state.scanQuantity) + parseInt(res.quantityOut);        
        }
        else
        {
          this.setState({previousScanSku:res.sku});
        }    
        this.setState({
          // item: res.product,
          // error: res.error || null,
          loading: false,          
          scanQuantity: scanQuantity,    
          alertStatus:true,      
          status: res.sku + ": ",
          statusBold: "-"+scanQuantity,
          image: res.mainImage,          
        });
      }
      else
      {
        var status = res.message;
        
        this.setState({
          loading: false, 
          scanQuantity:0,         
          alertStatus:false,
          status:status,
          statusBold:"",
          image:"",
          previousScanSku:"",          
        });
      }      
    })
    .catch(error => {
      this.setState({ error, loading: false });
    });
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
              // console.log(barcodes);              
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
            {this.state.image != "" &&
              <View style={{marginBottom:padding.sm,width:dimensions.fullWidth,paddingLeft:padding.xl}}>
                <Image source={{uri:this.state.image}} style={{width:60,height:60}}/>
              </View>
            }
            <InputSpinner   
              height={44}                                          
              min={0}
              step={1}  
              color={colors.primary}  
              rounded={false}
              showBorder={true}
              style={{backgroundColor: 'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center',width:dimensions.fullWidth - padding.xl*2,height:30}}
              inputStyle={{fontFamily: fonts.primary,fontSize: 14,color:colors.white}}
              buttonStyle={{height:44,width:70,fontSize:16,fontFamily:fonts.primaryBold}}                                                                   
              value={this.state.quantity}
              onChange={text => {this.onQuantityChanged(text);}}
            />
          </View>
          <View style={[{display:'flex',flexDirection:'row'},styles.viewStatus]}>
            <Text style={this.state.alertStatus?styles.status:styles.statusFail}>{this.state.status}</Text> 
            <Text style={styles.statusBold}>{this.state.statusBold}</Text> 
          </View>
          <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
            onHideUnderlay={()=>this.onHideUnderlay()}
            onShowUnderlay={()=>this.onShowUnderlay()}                                        
            onPress={()=>{this.startStopCamera()}} >  
              <View style={{flex:1,justifyContent:'center'}}>          
                <Text style={this.state.pressStatus?styles.textPress:styles.text}>{this.state.startStopText}
                </Text>               
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
  quantity: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    marginBottom: padding.sm,       
    width: dimensions.fullWidth - padding.xl*2,    
    height: 30,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlign:'center',
    textAlignVertical: 'center',    
  },  
  viewStatus:
  {
    width:dimensions.fullWidth,        
    alignItems:'center',
    justifyContent:'center',
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

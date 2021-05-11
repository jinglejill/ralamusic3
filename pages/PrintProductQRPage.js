// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, Keyboard, PermissionsAndroid,FlatList, ScrollView, AsyncStorage } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ViewShot from "react-native-view-shot";
import ToastExample from './../javaModule/ToastExample';
import InputSpinner from "react-native-input-spinner";
import { NativeModules } from 'react-native';


export default class PrintProductQRPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("print quantity:"+this.props.navigation.state.params.quantity);
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      alertVisible: false,
      alertMessage:'',
      alertStatus:0,      
      brand:this.props.navigation.state.params.brand,
      sku:this.props.navigation.state.params.sku,
      quantity:this.props.navigation.state.params.quantity,
      fileName:"",
      printerStatus:"...",
      printing:0
    };
  }

  componentDidMount () 
  {
    this.props.navigation.setParams({ handleSetupPrinter: this.setupPrinter });    
    this.getPrinterStatus();    
  }

  getPrinterStatus () 
  {
    if(Platform.OS == 'ios')
    {
      this.getPrinterStatusIOS();
    }
    else
    { 
      ToastExample.getPrinterStatus((msg) => {
        console.log(msg);
        this.setState({printerStatus:msg});
      });
    }    
  }

  getPrinterStatusIOS = async() =>
  {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getPrinterStatusIOSCallback((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        if(text == '')
        {
          this.setState({printerStatus:'Connected'});
        }
        else
        {
          this.setState({printerStatus:text});  
        }        
      }
    });
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
  

  printProductQR = async () => 
  {
    console.log("filename: "+this.state.fileName);
    // if(Platform.OS == 'ios')
    // {
    //   var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    //   connectBrotherPrinter.testLog(
    //     this.state.fileName,
    //     'icon'
    //   );
    //   return;
    // }
    



    console.log('printProductQR');
    
    //validate
    if(!this.state.imageLoaded)
    {
      this.setState({alertStatus:0},()=>{this.showAlertMessage("รูป QR Code ยังโหลดไม่เสร็จ");});      
      return;
    }

    if(parseInt(this.state.quantity)<1)
    {
      this.setState({alertStatus:0},()=>{this.showAlertMessage("กรุณาระบุจำนวนที่ต้องการพิมพ์");});      
      return;
    }



    //ask for permission
    if(Platform.OS == 'ios')
    {
      var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
      connectBrotherPrinter.printImage(this.state.fileName,parseInt(this.state.quantity),(error, text) => {
        if (error) {
          console.error(error);
          this.setState({alertStatus:0},()=>{this.showAlertMessage(error);});      
        } else {
          console.log(text);
          var alertStatus = 0;
          // if(text == 'Printing...')
          // {
          //   alertStatus = 1;
          // }
          if(text != '')
          {
            this.setState({alertStatus:alertStatus},()=>{this.showAlertMessage(text);});      
          }          
          this.setState({printing:this.state.printing-1});      

        }
      });
    }
    else
    {
      const grantedRead = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      const grantedWrite = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);      

      if (grantedRead === PermissionsAndroid.RESULTS.GRANTED && grantedWrite === PermissionsAndroid.RESULTS.GRANTED) 
      {
        console.log("You can use the camera");
        this.setState({printing:this.state.printing+1});
        console.log(this.state.printing);

        ToastExample.print(this.state.fileName,parseInt(this.state.quantity),(success,msg)=>{
          console.log('finish printing');
          this.setState({printing:this.state.printing-1});      
        });
      } 
      else 
      {
        console.log("Camera permission denied");
      }
    }

  }

  handleImageLoaded = () => {
    setTimeout(()=>{
      this.refs.viewShot.capture().then(uri => {
      console.log("do something with ", uri);
      var fileName;
      if(Platform.OS == 'ios')
      {
        fileName =  uri;
        console.log("fileName:"+fileName);
      }
      else
      {
        fileName =  uri.substring(7,uri.length);
        console.log("fileName:"+fileName);
      }
      
      this.setState({uri:uri,fileName:fileName,imageLoaded:true});

      //enable print button

      })
    },1000);
    
  };

  setupPrinter = () =>
  {
    console.log("setup Printer");
    this.props.navigation.navigate('PrinterSetting',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'username': this.state.username,  
      onGoBack:()=>{this.getPrinterStatus()},      
    });    
  } 

  

  render() {
    console.log("render:"+this.state.quantity);
    return (      
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
          <Text style={styles.printerStatus}>Printer status: {this.state.printerStatus}</Text>                         
          <View style={{alignItems:'center'}}>             
            <ViewShot ref="viewShot" options={{ format: "jpg", quality: 0.9 }}>
              <View style={styles.viewShot}>                
                <View style={{width:100,height:100,alignItems:'center',justifyContent:'center'}}>
                  <Image
                    onLoad={this.handleImageLoaded.bind(this)}
                    source={{uri: 'http://api.qrserver.com/v1/create-qr-code/?size=100x100&data='+this.state.sku}}
                    style={styles.image}
                  />    
                </View>                              
                <View style={{width:200}}>
                  <Text style={[styles.label,{fontFamily:fonts.primaryBold, paddingTop:padding.md,marginRight:padding.lg}]}>{this.state.brand}</Text>              
                  <Text style={[styles.label,{marginRight:padding.lg}]}>{this.state.sku}</Text>              
                </View>
              </View>
            </ViewShot>   
            <InputSpinner    
              height={44}                                         
              min={0}
              step={1}  
              color={colors.primary}  
              rounded={false}
              showBorder={true}
              style={{backgroundColor:'white',alignItems:'center',justifyContent:'center',width:dimensions.fullWidth - padding.xl*2,height:44,}}
              inputStyle={{color:colors.tertiary}}
              buttonStyle={{height:44,width:70,fontSize:16,fontFamily:fonts.primaryBold}}                                                                   
              value={this.state.quantity}
              onChange={text => {this.setState({quantity:text})}}
            />                       
            <View style={{display:'flex',flexDirection:'row',justifyContent: 'center',alignItems:'center'}}>              
              <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button}
                onHideUnderlay={()=>this.onHideUnderlay()}
                onShowUnderlay={()=>this.onShowUnderlay()}                                        
                onPress={()=>{this.printProductQR()}} >   
                  <View style={{flex:1,justifyContent:'center'}}>      
                    <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                      <View style={{width:30}}></View>
                      <Text style={
                        this.state.pressStatus
                          ? styles.textPress
                          : styles.text
                        }>Print
                      </Text>  
                      <View style={{width:30}}>             
                        {this.state.printing > 0 && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                      </View>
                    </View>
                  </View>
              </TouchableHighlight>                           
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
    );
  }
}
                      
const styles = StyleSheet.create({
  container:
  {
    flex:1,
    height:dimensions.fullHeight,
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
  quantity: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',       
    marginBottom: padding.sm,      
    width: dimensions.fullWidth - padding.xl*2,    
    height: 44,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center',
    textAlign:'center'
  },
  label:
  {
    fontFamily: fonts.primary, 
    fontSize: fonts.sm,
    color:'#000000'    
  }, 
  image: 
  {
    width:80,
    height:80,        
  },
  button: 
  {    
    width: dimensions.fullWidth - padding.xl*2,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,  
    marginTop: padding.sm,    
  },  
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: "#ffffff",    
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: "#6EC417",    
  },
  activityIndicator:
  {
    marginLeft:padding.sm,
    marginRight:padding.sm,    
  },
  printerStatus:
  {
    textAlign:'right',
    width:dimensions.fullWidth,
    paddingRight:padding.md,  
    fontFamily: fonts.primary, 
    fontSize: fonts.md,
    color:colors.secondary    
  },
  viewShot:
  {
    display:'flex',
    flexDirection:'row',
    backgroundColor:'white',
    marginTop:Platform.OS == 'ios'?null:padding.md,
    marginBottom:Platform.OS == 'ios'?null:padding.md,
    marginLeft:Platform.OS == 'ios'?null:padding.xl,
    marginRight:Platform.OS == 'ios'?null:padding.xl
  }
});
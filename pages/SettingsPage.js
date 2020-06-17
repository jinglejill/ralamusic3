// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, ScrollView, Keyboard } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'

export default class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      alertVisible: false,
      alertMessage:'',
      alertStatus:0,
      loading:false,
      skus:'',
    };
  }

  syncMarketplaceDataToApp = () => 
  { 
    //validate       
    if(this.state.skus.trim() == "")
    {
      this.setState({alertStatus:0},()=>{this.showAlertMessage("กรุณาใส่ Sku");});
      return;
    }    
    //loading
    this.setState({loading:true});


    //clean data
    skus = this.state.skus.split(";");
    for (i = 0; i < skus.length; i++)
    {
      skus[i] = skus[i].trim();            
    }
    //start sync
    fetch(this.state.apiPath + 'SAIMMarketPlaceDataToAppSync.php',
    {      
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        skus: skus,        
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
      this.setState({loading:false});
      if(responseData.success == true)
      {
        this.setState({alertStatus:1},()=>{this.showAlertMessage(responseData.message);});
        
      }
      else
      {
        //error message                
        this.setState({alertStatus:0},()=>{this.showAlertMessage(responseData.message);});
      }
    }).done();
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  onHideUnderlay = () => 
  {
    console.log(" button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    console.log(" button press true");
    this.setState({ pressStatus: true });
  }

  containerTouched(event) {
    this.refs.textInput.blur();
    return false;
  }
  render() {
    return (
      
        <View style={styles.container} onStartShouldSetResponder={this.containerTouched.bind(this)}>        
          <View style={{marginTop:20}}>
            <Text style={styles.title}>Sync marketplace sku เข้าแอป</Text>          
            <TextInput style={styles.skus} ref='textInput' value={this.state.skus} placeholder=' Ex. Fender-Mustang-LT50;Fender-Turbo-Tune-String-Winder' multiline onChangeText={text => {this.setState({skus:text})}}/>                  
            <View style={{justifyContent: 'center'}}>
              <TouchableHighlight underlayColor={'white'} activeOpacity={1} style={
                this.state.pressStatus
                  ? styles.buttonPress
                  : styles.button
                } 
                onHideUnderlay={()=>this.onHideUnderlay()}
                onShowUnderlay={()=>this.onShowUnderlay()}                                        
                onPress={()=>{this.syncMarketplaceDataToApp()}} >         
                  <Text style={
                    this.state.pressStatus
                      ? styles.textPress
                      : styles.text
                    }>Sync
                  </Text>               
              </TouchableHighlight>                                    
              {this.state.loading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
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
    fontSize:18,
  },
  dialogFooter:
  {
    height:44,  
  },
  textSuccess:
  {
    color:colors.secondary,textAlign:'center', fontFamily:fonts.primary, fontSize:fonts.md
  },
  textFail:
  {
    color:colors.error,textAlign:'center', fontFamily:fonts.primary, fontSize:fonts.md
  },
  skus: {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left', 
    marginLeft: padding.xl,   
    marginTop: padding.sm, 
    marginBottom: padding.sm,      
    width: dimensions.fullWidth - padding.xl*2,    
    height: 120,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'top'
  },
  title:
  {
    paddingLeft:padding.xl,  
    fontFamily: "Sarabun-Light", 
    fontSize: fonts.lg,
    color:colors.secondary    
  },
  image: 
  {
    width:70,
    height:70,    
    marginLeft:20,
    borderRadius:35
  },
  button: 
  {
    marginLeft:padding.xl,
    width: dimensions.fullWidth - padding.xl*2,    
    height:44,
    borderColor: '#B6E18B',
    backgroundColor:'#B6E18B',
    borderWidth: 1,
    borderRadius: 6,      
  },
  buttonPress: 
  {
    marginLeft:padding.xl,
    width: dimensions.fullWidth - padding.xl*2,    
    height:44,
    borderColor: "#B6E18B",
    borderWidth: 1,
    borderRadius: 6
  }, 
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    margin: 7,
    color: "#ffffff",
    textAlignVertical: 'center'
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    margin: 7,
    color: "#6EC417",
    textAlignVertical: 'center'
  },
  activityIndicator:
  {
    top: 0,
    bottom: 0,
    position: 'absolute',    
    right: dimensions.fullWidth/2-50,    
    justifyContent: 'center'
  }
});
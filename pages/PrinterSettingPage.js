// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList, BackHandler } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';


export default class PrinterSettingPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    var data =  [
                  {name:"Model", page:"ChooseModel"},
                  {name:"Printer", page:"ChoosePrinter"},
                  {name:"Paper size", page:"ChoosePaperSize"},
                  {name:"Orientation", page:"ChooseOrientation"},
                  {name:"Auto cut", page:"ChooseAutoCut"},
                  {name:"Cut at end", page:"ChooseCutAtEnd"},
                ];
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      data: data,
    };
  }


  componentDidMount()
  {
    this.props.navigation.setParams({ handleGoBack: this.goBack });    

    if(Platform.OS == 'ios')
    {
      console.log('get and set model');
      this.getModel();
      console.log('get and set ipAddress');
      this.getIpAddress();
      this.getPaperSize();
      this.getOrientation();
      this.getAutoCut();
      console.log('get and set cutAtEnd');
      this.getCutAtEnd();
      console.log('end of cutAtEnd');
    }
    else
    {
      ToastExample.getPreferenceModel((model) => {
        this.setState({model:model})
      });

      ToastExample.getPreferenceIpAddress((ipAddress) => {
        this.setState({ipAddress:ipAddress})
      });

      ToastExample.getPreferencePaperSize((paperSize) => {
        this.setState({paperSize:paperSize})
      });

      ToastExample.getPreferenceOrientation((orientation) => {
        this.setState({orientation:orientation})
      });

      ToastExample.getPreferenceAutoCut((autoCut) => {
        this.setState({autoCut:autoCut})
      });

      ToastExample.getPreferenceCutAtEnd((cutAtEnd) => {
        this.setState({cutAtEnd:cutAtEnd})
      });
    }
    
  }

  goBack = () => 
  {
    this.props.navigation.goBack();
    this.props.navigation.state.params.onGoBack();
  }

  onSelect = (item) => {
    this.setState(item);
  };

  goToChooseOptionPage = (page) => 
  {
    if(page == 'ChoosePrinter' && this.state.model == '')
    {
      this.showAlertMessage("กรุณาเลือก Model");
      return;
    }

    if(page == 'ChoosePaperSize' && this.state.model == '')
    {
      this.showAlertMessage("กรุณาเลือก Model");
      return;
    }

    this.props.navigation.navigate(page,
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'username': this.state.username,  
      model:this.state.model,      
      onSelect: this.onSelect,      
    });   
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
      this.goBack();
      return true;
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  getModel = () => 
  {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getModel((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({model:text});         
      }
    });
  };

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

  getPaperSize = () => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getPaperSize((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({paperSize:text});         
      }
    });
  };

  getOrientation = () => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getOrientation((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({orientation:text});         
      }
    });
  };

  getAutoCut = () => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getAutoCut((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({autoCut:text});         
      }
    });
  };

  getCutAtEnd = () => {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.getCutAtEnd((error, text) => {
      if (error) {
        console.error(error);
      } else {
        console.log(text);
        this.setState({cutAtEnd:text});         
      }
    });
  };

  render() {
    return (
      <View>
        <FlatList          
          data={this.state.data}
          renderItem={({ item }) => ( 
            
              <TouchableHighlight 
                underlayColor={'white'} activeOpacity={1} onPress={()=>{this.goToChooseOptionPage(item.page)}} >                                                             
                <View>
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',height: 44}}>
                    <Text style={styles.title}>{item.name}</Text>                    
                    <View style={{flex:1,alignItems:'flex-end'}}>
                      <Text style={styles.chooseOptions}>
                        {(item.name == 'Model')?this.state.model:
                        (item.name == 'Paper size')?this.state.paperSize:
                        (item.name == 'Printer')?this.state.ipAddress:
                        (item.name == 'Orientation')?this.state.orientation:
                        (item.name == 'Auto cut')?this.state.autoCut:
                        this.state.cutAtEnd}  >
                        </Text>
                    </View>
                  </View>
                  <View style={styles.separator}/>
                </View>
              </TouchableHighlight> 

          )}          
          keyExtractor={(item, index) => index}          
        />
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
                <Text style={styles.text}>{this.state.alertMessage}</Text>
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
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.secondary,    
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    left:padding.xl,    
  }, 
  chooseOptions:
  {
    fontFamily:fonts.primaryBold,
    paddingRight:padding.xl,
    color:colors.tertiary
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
  text:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:14
  },
});

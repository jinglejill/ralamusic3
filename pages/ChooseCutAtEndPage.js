// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';

export default class ChooseCutAtEndPage extends React.Component {
  constructor(props) {
    super(props);
    var data =  [
                  {name:"YES"},
                  {name:"NO"},                  
                ];
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      data: data,
    };
  }

  componentDidMount () 
  {
    // console.log("ChooseModelPage componendDidMount");
  }

  ChooseCutAtEnd = (cutAtEnd) => 
  {
    if(Platform.OS == 'ios')
    {
      this.setCutAtEnd(cutAtEnd);
    }
    else
    {
      ToastExample.savePreferenceCutAtEnd(cutAtEnd);
    }
    
    
    this.props.navigation.goBack();
    this.props.navigation.state.params.onSelect({ cutAtEnd: cutAtEnd });
  }

  setCutAtEnd = (cutAtEnd) => 
  {
    var connectBrotherPrinter = NativeModules.ConnectBrotherPrinter;
    connectBrotherPrinter.setCutAtEnd(cutAtEnd);
  };

  render() {
    return (
      <View>
        <FlatList          
          data={this.state.data}
          renderItem={({ item }) => ( 
            
              <TouchableHighlight 
                underlayColor={'white'} activeOpacity={1} onPress={()=>{this.ChooseCutAtEnd(item.name)}} >                                                             
                <View>
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',height: 44,}}>
                    <Text style={styles.title}>{item.name}</Text>                    
                  </View>
                  <View style={styles.separator}/>
                </View>
              </TouchableHighlight> 

          )}          
          keyExtractor={(item, index) => index}          
        />
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
  }
});
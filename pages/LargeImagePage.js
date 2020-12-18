// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';

export default class LargeImagePage extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      imageUrl: this.props.navigation.state.params.imageUrl,  
      allowDelete: this.props.navigation.state.params.allowDelete,        
      deleteIndex: this.props.navigation.state.params.deleteIndex,        
    };    
  }

  componentDidMount () 
  {
    this.props.navigation.setParams({ allowDelete: this.state.allowDelete });
    this.props.navigation.setParams({ handleDelete: this.deleteImage });
    this.props.navigation.setParams({ animating: false });
    Image.getSize(this.state.imageUrl, (width, height) => {this.setState({width:width, height:height})});
    console.log("width:"+this.state.width);
    console.log("height:"+this.state.height);
  }

  deleteImage = () =>
  {
    this.props.navigation.state.params.deleteImageIndex(this.state.deleteIndex);    
    this.props.navigation.goBack(null);
  }

  render() 
  {  
    return (
      <View style={{flex:1,alignItems:'center'}}>
        <Image
          source={this.state.imageUrl != ''?{uri: this.state.imageUrl}:require('./../assets/images/noImage.jpg')}
          style={styles.image}
        />
      </View>
    );
  }
}
                      
const styles = StyleSheet.create({
  image:
  {    
    flex: 1,
    width: dimensions.fullWidth,
    height: null,
    resizeMode: 'contain'
  },  
});
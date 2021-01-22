// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList, PermissionsAndroid} from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import { NativeModules } from 'react-native';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import CameraRoll from "@react-native-community/cameraroll";
import RNFetchBlob from 'rn-fetch-blob';


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
      loading: false,
      showImageSaved: false,
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

  // saveImage = () => 
  // {
  //   console.log("image url:"+this.state.imageUrl);
  //   CameraRoll.save(this.state.imageUrl);
  //   console.log("save image");
    
  // }

  getPermissionAndroid = async () => 
  {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Image Download Permission',
          message: 'Your permission is required to save images to your device',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      Alert.alert(
        'Save remote Image',
        'Grant Me Permission to save Image',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } catch (err) {
      Alert.alert(
        'Save remote Image',
        'Failed to save Image: ' + err.message,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    }
  }

  handleDownload = async () => 
  {
    if (Platform.OS === 'android') {
      const granted = await this.getPermissionAndroid();
      if (!granted) {
        return;
      }
    }

    this.setState({loading:true});
    RNFetchBlob.config({
      fileCache: true,
      appendExt: 'jpg',
    })
      .fetch('GET', this.state.imageUrl)
      .then(res => {
        
        CameraRoll.save(res.data, 'photo')
          .then(res => 
          {
            // this.setState({loading:false});
            //show alert image saved.
            console.log("save image");
            this.setState({loading:false,showImageSaved:true,imageSavedTimeout:setTimeout(()=>{this.setState({showImageSaved:false})},1000)});
            console.log(res);
          })
          .catch(err => console.log(err))
      })
      .catch(error => console.log(error));
  };


  render() 
  {  
    return (
      <View style={{flex:1,alignItems:'center'}}>
        

        <ReactNativeZoomableView
          maxZoom={1.5}
          minZoom={0.5}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true}          
          style={{
            padding: 0,
            backgroundColor: 'transparent',
          }}
        >
          <Image
            source={this.state.imageUrl != ''?{uri: this.state.imageUrl}:require('./../assets/images/noImage.jpg')}
            style={styles.image}
          />
        </ReactNativeZoomableView>

        <View style={{ flex: 1,alignSelf:'flex-end',paddingRight:padding.xl,position: 'absolute',bottom: 0, }}>  
          <TouchableHighlight 
                underlayColor={'transparent'} activeOpacity={1}                                         
                onPress={()=>{this.handleDownload()}} > 
            <Image
              source={require('./../assets/images/saveImage.png')}
              style={styles.icon}              
            />
          </TouchableHighlight>
          <View style={styles.viewSpace}>            
          </View>
        </View> 

        {
          this.state.loading &&
          <View style={{position: 'absolute',width:dimensions.fullWidth,height:dimensions.fullHeight-84,alignItems:'center',justifyContent:'center'}}>
            <View style={{width:100,height:100,backgroundColor:'black',opacity:0.8,borderRadius: 15,alignItems:'center',justifyContent:'center'}}>
              <ActivityIndicator animating size='small' color='white'/>
            </View>
          </View>
        }  
        {
          this.state.showImageSaved &&
          <View style={{position: 'absolute',width:dimensions.fullWidth,height:dimensions.fullHeight-84,alignItems:'center',justifyContent:'center'}}>
            <View style={{width:100,height:100,backgroundColor:'black',opacity:0.8,borderRadius: 15,alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'white'}}>Saved.</Text>
            </View>
          </View>
        }       
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
  viewSpace:
  {    
    height:24,
  }, 
  icon:
  {
    width:25,
    height:25,
  }
});
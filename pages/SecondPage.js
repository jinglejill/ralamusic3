// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions } from 'react-native';
//import all the components we are going to use.
export default class SecondPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,      
      search: '',
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      visible: false,
      alertVisible: false,
      alertMessage:'',
      quantityEditing:0,
      sellerSkuEditing:''
    };
  }

  onEditorInitialized = () => 
  {
    console.log("onEditorInitialized callback");
  }

  render() {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <Text style={styles.noData}>ไม่มีข้อมูล</Text>            
      </View>
    );
  }
}
                      
const styles = StyleSheet.create({
  searchBarContainer: {height:48},
  searchBarInputContainer: {height:30},
  searchBarInput: 
  {
    // fontFamily: "Sarabun-Light",
    fontSize:16,
  },
  separator: {width:Dimensions.get('window').width-2*20,height:1,backgroundColor:"#e0e0e0",left:20,marginTop:10}, 
  image: {width:70,height:70,marginTop:10,marginLeft:8,borderRadius:10},
  imageIcon: {width:30,height:30,borderRadius:20},
  channelView: 
  {
    marginLeft:10,
    marginTop:10,
    marginRight:15,
    alignItems:'center',
  },
  noData: 
  {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    color: '#005A50',
  },
  name: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'left',
    color: '#005A50',
    paddingTop: 10,
    paddingLeft: 10,    
    width: Dimensions.get('window').width - 2*8 - 70,
  },
  sku: {
    fontFamily: "Sarabun-LightItalic",
    fontSize: 13,
    textAlign: 'left',
    color: '#727272',
    paddingTop: 2,
    paddingLeft: 10,
    // paddingRight: 10, 
    width: Dimensions.get('window').width - 8 - 16 - 70 - 84,
    // borderWidth: 1,
  },
  quantityView: 
  {
    marginLeft:16,
    marginRight:16,
    width:84,
    // borderWidth: 1,
  },
  quantity: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#005A50',
    textDecorationLine: 'underline'
  },
  quantityLabel: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#727272',
  },
  buttonQuantity:
  {
    width:30,
  }, 
  spinner:
  {
    marginTop:44,
    marginBottom:24,
       
  },
  spinnerButton:
  {
    backgroundColor:'#6EC417',
    opacity:0.5
  },
  spinnerInput:
  {
    borderColor: '#6EC417',
  },
  okButton:
  {
    paddingTop:10,    
    height:44,  
  },
  cancelButton:
  {
    paddingTop:10,    
    height:44,  
  },
  okButtonText:
  {
    color:'#6EC417',
    fontSize:18,
  },
  cancelButtonText:
  {
    color:'#6EC417',
    fontSize:18,
  },
  dialogFooter:
  {
    height:44,  
  },
  text:
  {
    color:'#f04048',textAlign:'center', fontFamily:'Sarabun-Light', fontSize:14
  },
  textZero: {   
      fontFamily: "Sarabun-SemiBold",   
      fontSize: 16,
      textAlign: "center",
      margin: 12,
      color: "#ffffff",
      // borderWidth: 1
  },
  textZeroPress: {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    margin: 12,
    color: "#6EC417",
    // borderWidth: 1
  },  
  buttonZero: {
      height:44,
      borderColor: '#6EC417',
      backgroundColor:'#6EC417',
      opacity:0.5,
      borderWidth: 1,
      borderRadius: 6,      
  },
  buttonZeroPress: {
      height:44,
      borderColor: "#6EC417",
      opacity:0.5,
      borderWidth: 1,
      borderRadius: 6
  },  
});
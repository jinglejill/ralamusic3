// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, ScrollView} from 'react-native';
// import { WebView } from 'react-native-webview';
import {RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'

export default class ProductAddPage extends React.Component {
  constructor(props) {
    super(props);

    item = {
      MainImage:"",
      Name:"",
      Sku:"",
      Quantity:"",
      Price:"",
      AnimatingLazada:0,
      AnimatingShopee:0,
      AnimatingJd:0,
    };
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,      
      sku:this.props.navigation.state.params.sku,  
      item:item,        
    };
  }
  
  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.saveProduct });
  }

  currencyFormat = (num) => 
  {
    return '฿' + (+num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  onEditorInitialized = () => 
  {
    console.log("onEditorInitialized callback");
  }

  addImage = () => 
  {
    console.log("add image");
  }

  onHideUnderlay = () => 
  {
    console.log("button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    console.log("button press true");
    this.setState({ pressStatus: true });
  }

  saveProduct = () => 
  {
    console.log("save product");
  }

  render() {
    return (
      <ScrollView>
        <View style={{flex:1}}>
          <View style={styles.viewValue}>        
            <Text style={styles.title}>ชื่อแบรนด์ *</Text>
            <TextInput style={styles.value} value={this.state.brand} placeholder=' Ex. Fender' onChangeText={text => {this.setState({brand:text})}}/>  
          </View>        
          <View style={styles.viewValue}>        
            <Text style={styles.title}>Sku *</Text>
            <TextInput style={styles.value} value={this.state.sku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={text => {this.setState({sku:text})}}/>  
          </View> 
          <View style={{display:'flex',flexDirection:'row'}}>
            <View style={styles.viewValue}>        
              <Text style={styles.title}>ราคาขาย</Text>
              <TextInput style={styles.valueHalf} value={this.state.price} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({price:text})}}/>  
            </View>
            <View style={styles.viewValue}>        
              <Text style={styles.title}>ราคาทุน</Text>
              <TextInput style={styles.valueHalf} value={this.state.cost} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({cost:text})}}/>  
            </View>
          </View>
          <View style={styles.viewValue}>        
            <Text style={styles.title}>หมายเหตุ</Text>
            <TextInput style={styles.valueMultiline} value={this.state.remark} placeholder=' ' multiline onChangeText={text => {this.setState({remark:text})}}/>  
          </View> 
          <View style={styles.viewValue}>        
            <Text style={styles.title}>ชื่อสินค้า</Text>
            <TextInput style={styles.value} value={this.state.name} placeholder=' ' onChangeText={text => {this.setState({name:text})}}/>  
          </View> 
          <View style={styles.viewValue}>        
            <Text style={styles.title}>จำนวน</Text>
            <TextInput style={styles.value} value={this.state.quantity} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({quantity:text})}}/>  
          </View>
          <View style={styles.viewValue}>        
            <View style={{display:'flex', flexDirection:'row'}}>
              <Text style={styles.title}>รูป</Text>          
              <TouchableHighlight underlayColor={'white'} activeOpacity={1} style={
                this.state.pressStatus
                  ? styles.buttonPress
                  : styles.button
                } 
                onHideUnderlay={()=>this.onHideUnderlay()}
                onShowUnderlay={()=>this.onShowUnderlay()}                                        
                onPress={()=>{this.addImage()}} >         
                  <Text style={
                    this.state.pressStatus
                      ? styles.textPress
                      : styles.text
                    }>+
                  </Text>               
              </TouchableHighlight>                                                            
            </View>
            <View style={{'display':'flex','flexDirection':'row',flexWrap:'wrap',marginTop:padding.sm,marginBottom:padding.xl}}>
              <Image
                source={this.state.item.MainImage == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.MainImage}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image2 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image2}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image3 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image3}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image4 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image4}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image5 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image5}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image6 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image6}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image7 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image7}}
                style={styles.imageProduct}
              />
              <Image
                source={this.state.item.Image8 == ""?require('./../assets/images/blank.gif'):{uri: this.state.item.Image8}}
                style={styles.imageProduct}
              />
            </View>          
          </View>       
        </View>
      </ScrollView>
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
  priceLabel: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#727272',
  },
  price: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#005A50',
  },
  priceView: 
  {
    marginTop:16,
    marginLeft:16,
    marginRight:16,
    width:84,
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
    color:colors.secondary, 
    textAlign:'center', 
    fontFamily:'Sarabun-SemiBold', 
    fontSize:14
  },
  imageProduct: 
  {
    height:60,
    width:60,
    margin:6,
    borderWidth:1,
    borderColor:'#CCCCCC',
  },
  viewValue:
  {
    marginTop:padding.xl,
    marginLeft:padding.xl,
  },
  title: 
  {        
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
  },
  value: {
    fontFamily: "Sarabun-LightItalic",
    fontSize: 14,
    textAlign: 'left',     
    marginTop: padding.sm,         
    width: dimensions.fullWidth - padding.xl*2,    
    height: 30,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  valueHalf: {
    fontFamily: "Sarabun-LightItalic",
    fontSize: 14,
    textAlign: 'left',     
    marginTop: padding.sm,         
    width: (dimensions.fullWidth - padding.xl*3)/2,    
    height: 30,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  valueMultiline: {
    fontFamily: "Sarabun-LightItalic",
    fontSize: 14,
    textAlign: 'left',     
    marginTop: padding.sm,         
    width: dimensions.fullWidth - padding.xl*2,    
    height: 55,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  button: 
  {
    marginLeft:padding.lg,
    width: 30,    
    height:24,
    borderColor: '#B6E18B',
    backgroundColor:'#B6E18B',
    borderWidth: 1,
    borderRadius: 6,      
  },
  buttonPress: 
  {
    marginLeft:padding.lg,
    width: 30,    
    height:24,
    borderColor: "#B6E18B",
    borderWidth: 1,
    borderRadius: 6
  }, 
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    paddingTop:0,
    paddingBottom:0,
    marginTop:0,
    color: "#ffffff",
    textAlignVertical: 'center',
    lineHeight:Platform.OS=='ios'?null:24,
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    paddingTop:0,
    paddingBottom:0,
    color: "#6EC417",
    textAlignVertical: 'center',
    lineHeight:Platform.OS=='ios'?null:24,
  },
});
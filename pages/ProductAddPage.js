// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, ScrollView} from 'react-native';
// import { WebView } from 'react-native-webview';
import {RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';

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

  onHideUnderlayPrint = () => 
  {
    console.log("button print press false");
    this.setState({ pressPrintStatus: false });
  }

  onShowUnderlayPrint = () => 
  {
    console.log("button print press true");
    this.setState({ pressPrintStatus: true });
  }

  saveProduct = () => 
  {
    console.log("save product");
  }

  showProductQR = () => 
  {
    console.log("show product qr");
    ToastExample.show('Awesome', ToastExample.LONG);
  }

  render() {
    return (
      <ScrollView>
        <View style={{flex:1}}>
          <View style={styles.viewField}>        
            <Text style={styles.title}>ชื่อแบรนด์ *</Text>
            <TextInput style={styles.value} value={this.state.brand} placeholder=' Ex. Fender' onChangeText={text => {this.setState({brand:text})}}/>  
          </View>        
          <View style={styles.viewField}>        
            <Text style={styles.title}>Sku *</Text>
            <TextInput style={styles.value} value={this.state.sku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={text => {this.setState({sku:text})}}/>  
          </View>
          <View style={styles.viewField}>        
            <Text style={styles.title}>จำนวน</Text>
            <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <TextInput style={styles.valueQuantity} value={this.state.quantity} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({quantity:text})}}/>                
              <TouchableHighlight underlayColor={'white'} activeOpacity={1} style={
                this.state.pressPrintStatus
                  ? styles.buttonPrintPress
                  : styles.buttonPrint
                } 
                onHideUnderlay={()=>this.onHideUnderlayPrint()}
                onShowUnderlay={()=>this.onShowUnderlayPrint()}                                        
                onPress={()=>{this.showProductQR()}} >         
                  <Text style={
                    this.state.pressPrintStatus
                      ? styles.textPrintPress
                      : styles.textPrint
                    }>Print QR
                  </Text>               
              </TouchableHighlight>
            </View>
          </View> 
          <View style={{display:'flex',flexDirection:'row'}}>
            <View style={styles.viewField}>        
              <Text style={styles.title}>ราคาขาย</Text>
              <TextInput style={styles.valueHalf} value={this.state.price} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({price:text})}}/>  
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>ราคาทุน</Text>
              <TextInput style={styles.valueHalf} value={this.state.cost} keyboardType = 'number-pad' placeholder=' ' onChangeText={text => {this.setState({cost:text})}}/>  
            </View>
          </View>
          <View style={styles.viewField}>        
            <Text style={styles.title}>หมายเหตุ</Text>
            <TextInput style={styles.valueMultiline} value={this.state.remark} placeholder=' ' multiline onChangeText={text => {this.setState({remark:text})}}/>  
          </View> 
          <View style={styles.viewField}>        
            <Text style={styles.title}>ชื่อสินค้า</Text>
            <TextInput style={styles.value} value={this.state.name} placeholder=' ' onChangeText={text => {this.setState({name:text})}}/>  
          </View>           
          <View style={styles.viewField}>        
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
  imageProduct: 
  {
    height:60,
    width:60,
    margin:6,
    borderWidth:1,
    borderColor:'#CCCCCC',
  },
  viewField:
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
    fontFamily: fonts.primary,
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
    fontFamily: fonts.primary,
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
    fontFamily: fonts.primary,
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
  valueQuantity: {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    marginTop: padding.sm,         
    width: dimensions.fullWidth - padding.xl*2 - 100 - padding.lg,    
    height: 30,
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
  buttonPrint: 
  {
    marginLeft:padding.lg,
    width: 100,    
    height:24,
    borderColor: '#B6E18B',
    backgroundColor:'#B6E18B',
    borderWidth: 1,
    borderRadius: 6,      
  },
  buttonPrintPress: 
  {
    marginLeft:padding.lg,
    width: 100,    
    height:24,
    borderColor: "#B6E18B",
    borderWidth: 1,
    borderRadius: 6
  }, 
  textPrint: 
  {   
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    textAlign: "center",
    paddingTop:0,
    paddingBottom:0,
    marginTop:0,
    color: "#ffffff",
    textAlignVertical: 'center',
    lineHeight:Platform.OS=='ios'?null:24,
  },
  textPrintPress: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    textAlign: "center",
    paddingTop:0,
    paddingBottom:0,
    color: "#6EC417",
    textAlignVertical: 'center',
    lineHeight:Platform.OS=='ios'?null:24,
  },
});
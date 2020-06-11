// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView} from 'react-native';
// import { WebView } from 'react-native-webview';
import {RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
//import all the components we are going to use.



export default class ProductDetailPage extends React.Component {
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
      loading: true,
      item:item,        
    };
  }
  
  componentDidMount() {
    this.makeRemoteRequest();
  }

  makeRemoteRequest = () => {
    console.log("makeRemoteRequest get product detail");
    const url =  this.state.apiPath + 'SAIMProductDetailGet.php';
    this.setState({ loading: true });

    fetch(url,
      {
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({                 
          sku:this.state.sku, 
          storeName: this.state.storeName,
          modifiedUser: this.state.username,
          modifiedDate: new Date().toLocaleString(),
          platForm: Platform.OS,
        })
      })
      .then(res => res.json())
      .then(res => {
        this.setState({
          item: res.product,
          error: res.error || null,
          loading: false,
        });

        console.log("item:"+JSON.stringify(this.state.item));
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  currencyFormat = (num) => 
  {
    return '฿' + (+num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  onEditorInitialized = () => 
  {
    console.log("onEditorInitialized callback");
  }

  render() {
    return (
      <View style={{ flex: 1}}>
        {this.state.loading && <ActivityIndicator animating size='large' />}
        {!this.state.loading && 
        (
        <View style={{flex:1}}>
          <View style={{display:'flex',flexDirection:'row'}}>        
            <Image
              source={this.state.item.MainImage==''?require('./../assets/images/noImage.jpg'):{uri: this.state.item.MainImage}}
              style={styles.image}
            />
            <View style={{ flex: 1}}>
              <TouchableHighlight 
                underlayColor={'white'} activeOpacity={1}                                         
                >         
                  <Text style={styles.name}>{this.state.item.Name}</Text>   
              </TouchableHighlight>                  
              <View style={{display:'flex',flexDirection:'row',paddingTop:10}}> 
                {
                  Platform.OS === 'ios'?(<TextInput style={styles.sku} editable={false} value={this.state.item.Sku} multiline />)
                  :(<Text style={styles.sku} selectable>{this.state.item.Sku}</Text>)
                }                    
                <View style={[{ flex: 1,alignItems:'flex-end'},styles.quantityView]}>  
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    {this.state.item.Animating == 1 && <ActivityIndicator size="small" animating={true} />}
                    <Text style={styles.quantityLabel}> qty:</Text>              
                    <TouchableHighlight style={styles.buttonQuantity} underlayColor='transparent' onPress={()=>{this.showEditQuantityDialog(this.state.item.Sku,this.state.item.Quantity)}} >         
                      <Text style={styles.quantity}>{this.state.item.Quantity}</Text>              
                    </TouchableHighlight>
                  </View>
                </View>  
              </View>
              <View style={{display:'flex',flexDirection:'row'}}>   
                <View style={styles.channelView}>                      
                  {this.state.item.AnimatingLazada == 0 && <TouchableHighlight 
                    underlayColor={'white'} activeOpacity={1}                       
                    onHideUnderlay={()=>this.onHideUnderlayButtonChannel(this.state.item.Sku,1)}
                    onShowUnderlay={()=>this.onShowUnderlayButtonChannel(this.state.item.Sku,1)}
                    onPress={()=>{this.state.item.LazadaExist==1?this.syncQuantityChannel(this.state.item.Sku,this.state.item.Quantity,1):null}} >         
                      <Image source={this.state.item.LazadaExist==1?require('./../assets/images/lazadaIcon.png'):require('./../assets/images/lazadaIconGray.png')}  style={styles.imageIcon}/>
                  </TouchableHighlight>
                  }
                  {this.state.item.AnimatingLazada == 1 && <ActivityIndicator size="small" animating={true}/>}
                </View>
                <View style={styles.channelView}>
                  {this.state.item.AnimatingShopee == 0 && <TouchableHighlight 
                    underlayColor={'white'} activeOpacity={1}                       
                    onHideUnderlay={()=>this.onHideUnderlayButtonChannel(this.state.item.Sku,2)}
                    onShowUnderlay={()=>this.onShowUnderlayButtonChannel(this.state.item.Sku,2)}
                    onPress={()=>{this.state.item.ShopeeExist==1?this.syncQuantityChannel(this.state.item.Sku,this.state.item.Quantity,2):null}} >         
                      <Image source={this.state.item.ShopeeExist==1?require('./../assets/images/shopeeIcon.png'):require('./../assets/images/shopeeIconGray.png')}  style={styles.imageIcon}/>
                  </TouchableHighlight>
                  }
                  {this.state.item.AnimatingShopee == 1 && <ActivityIndicator size="small" animating={true}/>}
                </View>
                <View style={styles.channelView}>
                  {this.state.item.AnimatingJd == 0 && <TouchableHighlight 
                    underlayColor={'white'} activeOpacity={1}                       
                    onHideUnderlay={()=>this.onHideUnderlayButtonChannel(this.state.item.Sku,3)}
                    onShowUnderlay={()=>this.onShowUnderlayButtonChannel(this.state.item.Sku,3)}
                    onPress={()=>{this.state.item.JdExist==1?this.syncQuantityChannel(this.state.item.Sku,this.state.item.Quantity,3):null}} >         
                      <Image source={this.state.item.JdExist==1?require('./../assets/images/jdIcon.png'):require('./../assets/images/jdIconGray.png')}  style={styles.imageIcon}/>
                  </TouchableHighlight>
                  }
                  {this.state.item.AnimatingJd == 1 && <ActivityIndicator size="small" animating={true}/>}
                </View>
                <View style={[{ flex: 1,alignItems:'flex-end'},styles.priceView]}> 
                  <View style={{display:'flex', flexDirection:'row'}}> 
                    <Text style={styles.priceLabel}>Price:</Text>
                    <Text style={styles.price}>  {this.currencyFormat(this.state.item.Price)}</Text>
                  </View>
                </View>                                            
              </View>          
            </View>          
          </View>
          <View style={styles.separator}/>
          <View style={{'display':'flex','flexDirection':'row',flexWrap:'wrap',marginLeft:8,marginTop:6}}>
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
          <View style={{marginTop:10}}>
            <View style={{display:'flex', flexDirection:'row',marginBottom:3}}>
              <Text style={styles.title}>Package weight (kg):</Text>
              <Text style={styles.value}>  {this.state.item.PackageWeight}</Text>
            </View> 
            <View style={{display:'flex', flexDirection:'row',marginBottom:3}}>
              <Text style={styles.title}>Package dimension (cm):</Text>
              <Text style={styles.value}>  {this.state.item.PackageWidth} * {this.state.item.PackageHeight} * {this.state.item.PackageLength}</Text>
            </View>    
          </View>
          
        </View>
        )}        
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
  imageProduct: 
  {
    height:60,
    width:60,
    margin:6,
    borderWidth:1,
    borderColor:'#CCCCCC',
  },
  title: 
  {
    marginLeft: 14,
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#727272',
  },
  value: {
    fontFamily: "Sarabun-Light",
    fontSize: 14,
    textAlign: 'right',
    color: '#005A50',
  },
});
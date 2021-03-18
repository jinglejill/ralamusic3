// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, ScrollView, ActivityIndicator, TouchableOpacity} from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions, settings} from './../styles/base.js'
import DeviceInfo from 'react-native-device-info';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import ToastExample from './../javaModule/ToastExample';


export default class ProductReturnFormPage extends React.Component {
  controller = new AbortController();
  constructor(props) {
    super(props);

    this.state = {            
      modifiedUser: this.props.navigation.state.params.modifiedUser,   
      alertVisible: false,   
      seed: 1,
      search: '', 
      data:[],  
      productName:'',
      productSelected:null,
    };
  }

  componentDidMount()
  {    
    this.props.navigation.setParams({ handleNext: this.goToOrderDetail2 });
    // this.props.navigation.setParams({ setOrderUpdated: this.setOrderUpdated });
    this.handleRefresh();
  }

  handleRefresh = () => 
  {
    console.log('handleRefresh');
    this.setState({loadingAccess:true});
    
    fetch(settings.apiPath + 'SAIMUserMenuAllowGet.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,   
        menuCode: 'PRODUCT_RETURN_LIST',   
        storeName: settings.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      console.log("responseData.success:"+responseData.success);
      
      this.setState({loading: false});
      if(responseData.success === true && responseData.allow)
      {
        this.setState({loadingAccess:false,menuAllow:true});
        // this.fetchData();
      }
      else
      {
        // error message    
        this.setState({loadingAccess:false,menuAllow:false});    
        console.log(responseData.message);
        if(responseData.message != '')
        {
          this.setState({alertStatus:0});
          this.showAlertMessage(responseData.message);
        }        
      }
    }).done();
  }

  // setOrderUpdated = () => 
  // {
  //   // this.props.navigation.refresh();
  //   this.updateOrder();
  // }

  // updateOrder = () => 
  // {
  //   this.props.navigation.setParams({ orderUpdated: true });
  // }

  goToOrderDetail2 = () =>
  {
    //validate
    if(this.state.productName == '' && this.state.productSelected == null)
    {
      this.showAlertMessage("กรุณาระบุชื่อสินค้า");
      return;
    }

    if(!this.state.chooseMarketplaceFirst && !this.state.chooseMarketplaceSecond && !this.state.chooseMarketplaceThird && !this.state.chooseMarketplaceFourth && !this.state.chooseMarketplaceFifth)
    {
      this.showAlertMessage("กรุณาเลือกช่องทางขาย");
      return;
    }

    this.props.navigation.navigate('OrderDetail2',
    {        
      newForm: true,
      productName: this.state.productName,
      productSelected: this.state.productSelected,
      channel: this.state.channel,
      // updateOrder: this.updateOrder,
      'modifiedUser': this.state.modifiedUser,        
    });  
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  chooseMarketPlace = (option) =>
  {
    console.log("chooseMarketPlace option: "+option);
    // if(option == 0)
    // {
    //   this.setState({chooseMarketplaceFirst:false});
    //   this.setState({chooseMarketplaceSecond:false});
    //   this.setState({chooseMarketplaceThird:false});
    //   this.setState({chooseMarketplaceFourth:false});
    //   this.setState({chooseMarketplaceFifth:false});
    // }
    // else 
    if(option == 1)
    {
      this.setState({chooseMarketplaceFirst:true});
      this.setState({chooseMarketplaceSecond:false});
      this.setState({chooseMarketplaceThird:false});
      this.setState({chooseMarketplaceFourth:false});
      this.setState({chooseMarketplaceFifth:false});      
    }
    else if(option == 2)
    {
      this.setState({chooseMarketplaceFirst:false});
      this.setState({chooseMarketplaceSecond:true});
      this.setState({chooseMarketplaceThird:false});
      this.setState({chooseMarketplaceFourth:false});
      this.setState({chooseMarketplaceFifth:false});  
    }
    else if(option == 3)
    {
      this.setState({chooseMarketplaceFirst:false});
      this.setState({chooseMarketplaceSecond:false});
      this.setState({chooseMarketplaceThird:true});
      this.setState({chooseMarketplaceFourth:false});
      this.setState({chooseMarketplaceFifth:false});  
    }
    else if(option == 4)
    {
      this.setState({chooseMarketplaceFirst:false});
      this.setState({chooseMarketplaceSecond:false});
      this.setState({chooseMarketplaceThird:false});
      this.setState({chooseMarketplaceFourth:true});
      this.setState({chooseMarketplaceFifth:false});  
    }
    else if(option == 5)
    {
      this.setState({chooseMarketplaceFirst:false});
      this.setState({chooseMarketplaceSecond:false});
      this.setState({chooseMarketplaceThird:false});
      this.setState({chooseMarketplaceFourth:false});
      this.setState({chooseMarketplaceFifth:true});  
    }

    this.setState({channel:option});
    // let order = this.state.order;
    // order.Channel = option;
    // console.log("this.state.order.Channel:"+this.state.order.Channel);
  }

  setProductName = (productName) =>
  {
    this.setState({productName:productName,productSelected:null,search:productName});
    this.search();
    // let order = this.state.order;
    // order.ProductName = productName;
  }

  search = () => 
  {
    console.log("perform search");        
    this.controller.abort();    
    this.controller = new AbortController();      
    this.setState({page:1,data:[]},()=>this.makeRemoteRequest());
  }

  makeRemoteRequest = () => 
  { 
    console.log("makeRemoteRequest page:"+this.state.page+", searchText:"+this.state.search);      
    const { page, seed, search } = this.state;
    const url = settings.apiPath + 'SAIMMainProductWithAccImageGetList.php?seed='+seed;          
    
    console.log("new form url:"+url);
    this.setState({loading:true},()=>{console.log("loading:"+this.state.loading);});
    
    
    fetch(url,
    {
      signal: this.controller.signal,
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        page:1,
        limit:10,
        searchText:search, 
        outOfStock:false,
        storeName: settings.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        data: res.products,
        error: res.error || null,
        loading: false,
        refreshing: false
      });
      console.log("loading:"+this.state.loading);
      console.log("data:"+JSON.stringify(this.state.data));
    })
    .catch(error => 
    {
      if(error.name != 'AbortError')
      {
        this.setState({ error, loading: false });
        console.log("loading:"+this.state.loading);
      }      
    });    
  };

  formatPrice = (num) => 
  {
    return '฿ ' + (+num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  chooseProduct = (item) =>
  {
    console.log("chooseProduct");
    this.setState({productSelected:item,data:[],productName:'',search:''});
  }

  clearSearch = () =>
  {
    console.log("clearSearch");
    this.setState({productSelected:null,data:[],search:''});
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
        <View style={{flex:1}}>
          <View style={[styles.viewField,{marginBottom:padding.lg}]}>                      
            <Text style={styles.title}>ชื่อสินค้า</Text>            
            <TextInput style={[styles.value]} value={this.state.productName} placeholder=' ' onChangeText={text => {this.setProductName(text)}} onSubmitEditing={()=>{this.search()}}/>                                  
            {this.state.loading && (
              <View
                style={{
                  paddingTop: padding.lg,
                  borderTopWidth: 1,
                  borderColor: '#CED0CE'
                }}
              >
                <ActivityIndicator animating size='small' />
              </View>
            )}
            
            {this.state.data.length > 0 && (
              <View style={{flex:1}}>
                <View style={{height:6,marginRight:30}}>
                </View>
                
                <View style={[styles.box,{width:dimensions.fullWidth-2*padding.xl-6}]}>               
                  <FlatList
                  extraData={this.state.refresh}
                  data={this.state.data}
                  renderItem={({ item }) => (   
                    <View style={{ flex: 1}}>
                      <TouchableHighlight 
                        underlayColor={'transparent'} activeOpacity={1}                                         
                        onPress={()=>{this.chooseProduct(item)}} > 

                        <View style={{display:'flex',flexDirection:'row'}}>
                          <Image
                            source={item.MainImage != ''?{uri: item.MainImage}:require('./../assets/images/noImage.jpg')}
                            style={styles.image}
                          />
                          <View style={{ flex: 1}}>                  
                            <Text style={styles.name}>{item.Name}</Text>   
                            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}> 
                              {
                                Platform.OS === 'ios'?(<TextInput style={styles.sku} editable={false} value={item.Sku} multiline />)
                                :(<Text style={styles.sku} selectable>{item.Sku}</Text>)
                              }                                                
                            </View>
                                                      
                          </View>
                        </View>  
                      </TouchableHighlight>  
                      <View style={styles.separator}/>               
                    </View>
                    
                  )}              
                  ListFooterComponent={this.renderFooter}
                  keyExtractor={(item, index) => index}                                      
                  removeClippedSubviews={false}
                  keyboardShouldPersistTaps='always'
                  />
                </View>

                <View style={{right:0,position:'absolute',elevation:6}}>
                  <TouchableHighlight 
                    underlayColor={'transparent'} activeOpacity={1}                                         
                    onPress={()=>{this.clearSearch()}} >
                    <Image
                      source={require('./../assets/images/deleteRed.png')}
                      style={styles.deleteImageButton}
                    />
                  </TouchableHighlight>
                </View>
              </View>
            )}
            {this.state.productSelected != null && (
              <View style={{ flex: 1}}>
                <TouchableHighlight 
                  underlayColor={'transparent'} activeOpacity={1}                                         
                > 

                  <View style={{display:'flex',flexDirection:'row'}}>
                    <Image
                      source={this.state.productSelected.MainImage != ''?{uri: this.state.productSelected.MainImage}:require('./../assets/images/noImage.jpg')}
                      style={styles.image}
                    />
                    <View style={{ flex: 1}}>                  
                      <Text style={styles.name}>{this.state.productSelected.Name}</Text>   
                      <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}> 
                        {
                          Platform.OS === 'ios'?(<TextInput style={styles.sku} editable={false} value={this.state.productSelected.Sku} multiline />)
                          :(<Text style={styles.sku} selectable>{this.state.productSelected.Sku}</Text>)
                        }                                                
                      </View>
                                                
                    </View>
                  </View>  
                </TouchableHighlight>  
                
              </View>
            )}
          </View>

          <View style={[styles.viewField,{marginBottom:padding.lg}]}>                      
            <Text style={styles.title}>ช่องทางขาย</Text>
            <TouchableOpacity onPress={()=>{this.chooseMarketPlace(1)}} >
              <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{color:this.state.chooseMarketplaceFirst?colors.secondary:"#CCCCCC",fontSize:24}}>{this.state.chooseMarketplaceFirst?"●":"○"} </Text>
                <Image
                  source={require('./../assets/images/lazadaIcon.png')}
                  style={styles.imageIconSmall}
                /> 
                <Text style={styles.radioText}>Lazada</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.chooseMarketPlace(2)}} >
              <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{color:this.state.chooseMarketplaceSecond?colors.secondary:"#CCCCCC",fontSize:24}}>{this.state.chooseMarketplaceSecond?"●":"○"} </Text>
                <Image
                  source={require('./../assets/images/shopeeIcon.png')}
                  style={styles.imageIconSmall}
                /> 
                <Text style={styles.radioText}>Shopee</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.chooseMarketPlace(3)}} >
              <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{color:this.state.chooseMarketplaceThird?colors.secondary:"#CCCCCC",fontSize:24}}>{this.state.chooseMarketplaceThird?"●":"○"} </Text>                
                <Image
                  source={require('./../assets/images/jdIcon.png')}
                  style={styles.imageIconSmall}
                />
                <Text style={styles.radioText}>JD Central</Text>                 
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.chooseMarketPlace(4)}} >
              <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{color:this.state.chooseMarketplaceFourth?colors.secondary:"#CCCCCC",fontSize:24}}>{this.state.chooseMarketplaceFourth?"●":"○"} </Text>
                <Image
                  source={require('./../assets/images/thisshopIcon.png')}
                  style={styles.imageIconSmall}
                /> 
                <Text style={styles.radioText}>Thisshop</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{this.chooseMarketPlace(5)}} >
              <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                <Text style={{color:this.state.chooseMarketplaceFifth?colors.secondary:"#CCCCCC",fontSize:24}}>{this.state.chooseMarketplaceFifth?"●":"○"} </Text>
                <Text style={styles.radioText}>อื่นๆ</Text>
              </View>
            </TouchableOpacity>
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
      </ScrollView>
    );
  }
}
                      
const styles = StyleSheet.create({  
  title: 
  {        
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
  },
  value: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
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
  button: 
  {
    marginLeft:padding.xxl,
    width: dimensions.fullWidth - padding.xxl*2,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,      
  },
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.white,    
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: fonts.lg,
    textAlign: "center",    
    color: colors.primary,    
  },
  textFail:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md,
    paddingTop:padding.xl
  },
  textSuccess:
  {
    color:colors.secondary,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
  dialogFooter:
  {
    height:44,  
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
  viewField:
  {
    marginTop:padding.lg,
    marginLeft:padding.xl,
    marginRight:padding.xl,  
  },
  radioText:
  {
    color:colors.secondary,
    fontFamily:fonts.primaryBold,
    fontSize:fonts.md
  },
  image: 
  {
    width:70,
    height:70,
    marginTop:padding.md,
    marginLeft:8,
    borderRadius:10
  },
  imageIcon: 
  {
    width:16,
    height:16,
    borderRadius:8
  },
  channelView: 
  {
    marginLeft:10,
    justifyContent:'center',    
  },
  name: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
    paddingTop: 2,
    paddingLeft: 10,    
    paddingRight: 0,
    flex:1,
    // width: Dimensions.get('window').width - 2*8 - 70,
  },
  sku: 
  {    
    fontFamily: fonts.primaryItalic,
    fontSize: 13,
    textAlign: 'left',
    color: colors.tertiary, 
    paddingTop:0,   
    paddingLeft: 10,    
    width: Dimensions.get('window').width - 8 - 16 - 70 - 84,    
  },
  quantityView: 
  {    
    marginLeft:16,
    marginRight:16,
    width:84,    
  },
  quantity: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'right',
    color: colors.secondary,
    textDecorationLine: 'underline',
    width: 30,
  },
  labelQuantity: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'right',    
    color: colors.tertiary,
  },
  buttonQuantity:
  {
    width:60,
    // borderWidth:1,
  }, 
  price: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'right',    
    color: colors.tertiary,    
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    // left:20,
    marginTop:padding.md,
  },
  deleteImageButton:
  {
    width:30,
    height:30,   
    // top:0,      
    // right:0, 
    // alignItems:'flex-end',
    // justifyContent:'flex-end',
    // position:'absolute'   
  },
  imageIconSmall: 
  {
    width:20,
    height:20,
    borderRadius:7,
    // marginLeft:7,
    marginRight:7
  },
  box:
  {
    // marginTop:padding.sm,
    // marginLeft:padding.xl,
    // width:60,
    // height:60,  
    backgroundColor:'white',    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
});

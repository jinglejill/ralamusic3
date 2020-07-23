// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, TouchableOpacity} from 'react-native';
import { List, ListItem, SearchBar } from "react-native-elements";
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import InputSpinner from "react-native-input-spinner";
import SegmentedControlTab from "react-native-segmented-control-tab";
import {colors, fonts, padding, dimensions} from './../styles/base.js';
//import all the components we are going to use.

export default class ProductListPage extends React.Component 
{
  controller = new AbortController();
  constructor(props) {
    super(props);

    this.onEndReachedCalledDuringMomentum = true;
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
      skuEditing:'',
      typingTimeout: 0,
      selectedIndex: 0,
      increaseLabel:'เพิ่ม',
      quantityCurrent:0,
      quantityTotal:0,
      outOfStock: this.props.navigation.getParam('outOfStock',false),         
    };
  }

  componentDidMount() 
  {  
    this.props.navigation.addListener('didFocus', this.onScreenFocus);    
    if(!this.state.outOfStock)
    {
      this.makeRemoteRequest();
    }  

  }

  onScreenFocus = () => {
    // Screen was focused, our on focus logic goes here
    if(this.state.data.length == 0)
    {
      this.makeRemoteRequest();      
    }    
    // else
    // {
    //   this.handleRefresh()
    // }

  }

  makeRemoteRequest = () => 
  { 
    console.log("makeRemoteRequest page:"+this.state.page+", searchText:"+this.state.search);      
    const { page, seed, search } = this.state;
    const url = this.state.apiPath + 'SAIMMainProductGetList2.php?seed='+seed;          
    
    this.setState({loading:true});
    console.log("loading:"+this.state.loading);
    
    fetch(url,
    {
      signal: this.controller.signal,
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        page:page,
        limit:10,
        searchText:search, 
        outOfStock:this.state.outOfStock,
        storeName: this.state.storeName,
        modifiedUser: this.state.username,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        data: page === 1 ? res.products : [...this.state.data, ...res.products],
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

  handleLoadMore = () => {
    console.log("handleLoadMore");
    console.log("onEndReachedCalledDuringMomentum:"+this.onEndReachedCalledDuringMomentum);
    if (!this.onEndReachedCalledDuringMomentum)
    { 
      this.setState(
        {
          page: this.state.page + 1
        },
        () => {
          this.makeRemoteRequest();
        }
      );
      this.onEndReachedCalledDuringMomentum = true; 
    } 
  };

  handleRefresh = () => {
    console.log('handleRefresh');
    this.setState(
      {
        page: 1,
        seed: this.state.seed + 1,
        refreshing: true
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  };

  renderFooter = () => 
  {
    if (!this.state.loading) 
    {
      return null; 
    }
    
    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: '#CED0CE'
        }}
      >
        <ActivityIndicator animating size='large' />
      </View>
    );
  };

  updateSearch = (search) => 
  {    
    console.log("search changed");
    this.setState({search:search});
  };

  search = () => 
  {
    console.log("perform search");        
    this.controller.abort();    
    this.controller = new AbortController();      
    this.setState({page:1,data:[]},()=>this.makeRemoteRequest());
  }

  showEditQuantityDialog = (sku, quantity) => 
  {    
    console.log("showEditQuantityDialog quantity:"+quantity);
    this.setState({visible:true, quantityCurrent:quantity, quantityTotal:quantity, quantityEditing:'', skuEditing:sku,selectedIndex:0,increaseLabel:'เพิ่ม'});
  }

  updateQuantity = () => 
  {      
    var sku = this.state.skuEditing;
    console.log("updateQuantity sku:"+sku);

    var quantity = this.state.quantityEditing;
    // if(quantity == '')
    // {
    //   this.setState({alertStatus:false});
    //   this.showAlertMessage("กรุณาใส่จำนวนที่ต้องการ"+this.state.increaseLabel);
    //   console.log("quantity empty");
    //   return;
    // }

    this.setState({visible:false});

    //set indicator animating
    this.state.data.map((product)=>{      
        if(product.Sku == sku)
        {
          product.Animating = true;
        }  
    });

    var url = this.state.selectedIndex?'SAIMProductScanOutUpdate.php':'SAIMProductScanInUpdate.php';

    //db updateQuantity
    fetch(this.state.apiPath + url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        sku: sku,
        quantity: quantity,
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
      if(responseData.success == true)
      {
      }
      else
      {
        //error message        
        console.log(responseData.message);
        this.setState({alertStatus:false});
        this.showAlertMessage(responseData.message);
      }


      this.state.data.map((product)=>{      
          if(product.Sku == responseData.sku)
          {
            console.log("set animating false;"+responseData.sku+";"+responseData.quantity);            
            product.Quantity = responseData.quantity;
            product.Animating = false;
          }
      });
      this.setState((state)=>({refresh:!this.state.refresh}));
    }).done();

  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  onHideUnderlay = () => 
  {
    console.log("zero button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    console.log("zero button press true");
    this.setState({ pressStatus: true });
  }

  goToDetailPage = (sku) => 
  {
    console.log("sku:"+sku);
    // return;
    this.props.navigation.navigate('ProductAdd',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'username': this.state.username,  
      'sku': sku,  
      'edit': true,
      refresh: this.handleRefresh,      
    });
  }

  containerTouched(event) 
  {
    this.refs.textInput.blur();
    return false;
  }

  handleIndexChange = index => {
    var increaseLabel;
    if(index == 0)
    {
      increaseLabel = 'เพิ่ม';
    }
    else
    {
      increaseLabel = 'ลด';
    }

    this.setState(
      {
        ...this.state,
        selectedIndex: index,
        increaseLabel: increaseLabel,
      },()=>
      {
        this.calculateQuantityTotal();
      }
    );
  };

  onQuantityChanged = (text) => 
  {
    console.log("quantityChanged: "+ text);
    if (/^\d+$/.test(text)) 
    {       
      this.setState({quantityEditing:text},
        ()=>{this.calculateQuantityTotal()}
      );
    }    
  }

  calculateQuantityTotal = () => 
  {
    var text = this.state.quantityEditing;
    if(text === '')
    {
      text = 0;
    }

    var quantityTotal;    
    if(this.state.selectedIndex == 0)
    {
      quantityTotal = parseInt(this.state.quantityCurrent)+parseInt(text);
    }     
    else
    {
      quantityTotal = parseInt(this.state.quantityCurrent)-parseInt(text);
      if(quantityTotal < 0)
      {
        quantityTotal = 0;
      }
    }
    this.setState({quantityTotal:quantityTotal}) 
  }

  formatPrice = (num) => 
  {
    return '฿ ' + (+num).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  setZero = () => 
  {
    this.handleIndexChange(1);
    this.onQuantityChanged(this.state.quantityCurrent);
  }  

  render() {
    const { search } = this.state;
    return (
      <View style={{flex:1}} onStartShouldSetResponder={this.containerTouched.bind(this)}>        
        <FlatList
          extraData={this.state.refresh}
          data={this.state.data}
          renderItem={({ item }) => (   
            <View style={{ flex: 1}}>
              <TouchableHighlight 
                underlayColor={'transparent'} activeOpacity={1}                                         
                onPress={()=>{this.goToDetailPage(item.Sku)}} > 

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
                      <View style={[{ flex: 1,alignItems:'flex-end',alignSelf:'flex-start'},styles.quantityView]}>  
                        <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                          {item.Animating == 1 && <ActivityIndicator size="small" animating={true} />}
                          <TouchableHighlight style={styles.buttonQuantity} underlayColor='transparent' onPress={()=>{this.showEditQuantityDialog(item.Sku,item.Quantity)}} >
                            <View style={{display:'flex',flexDirection:'row'}}>
                              <Text style={[styles.labelQuantity]}> qty:</Text>
                              <Text style={styles.quantity}>{item.Quantity}</Text>
                            </View>
                          </TouchableHighlight>
                        </View>
                      </View>  
                    </View>
                    <View style={{display:'flex',flexDirection:'row'}}>   
                      <View style={styles.channelView}>                      
                        <Image source={item.LazadaExist==1?require('./../assets/images/lazadaIcon.png'):require('./../assets/images/lazadaIconGray.png')}  style={styles.imageIcon}/>
                      </View>
                      <View style={styles.channelView}>
                        <Image source={item.ShopeeExist==1?require('./../assets/images/shopeeIcon.png'):require('./../assets/images/shopeeIconGray.png')}  style={styles.imageIcon}/>
                      </View>
                      <View style={styles.channelView}>
                        <Image source={item.JdExist==1?require('./../assets/images/jdIcon.png'):require('./../assets/images/jdIconGray.png')}  style={styles.imageIcon}/>
                      </View>  
                      <View style={styles.channelView}>
                        <Image source={item.WebExist==1?require('./../assets/images/webIcon.png'):require('./../assets/images/webIconGray.png')}  style={styles.imageIcon}/>
                      </View>  
                      <View style={[{flex:1,alignItems:'flex-end'},styles.quantityView]}>
                        <TouchableHighlight underlayColor='transparent' onPress={()=>{this.showEditQuantityDialog(item.Sku,item.Quantity)}} >
                          <Text style={styles.price}>{this.formatPrice(item.SpecialPrice)}</Text>
                        </TouchableHighlight>
                      </View>                                          
                    </View>                           
                  </View>
                </View>  
              </TouchableHighlight>  
              <View style={styles.separator}/>
            </View>
            
          )}
          ListHeaderComponent={(<SearchBar ref='textInput' placeholder="Type Here..." onSubmitEditing={()=>{this.search()}} lightTheme containerStyle={styles.searchBarContainer} inputContainerStyle={styles.searchBarInputContainer} inputStyle={styles.searchBarInput} onChangeText={(text)=>this.updateSearch(text)}
            value={search}/>)}
          ListFooterComponent={this.renderFooter}
          keyExtractor={(item, index) => index}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }} 
          removeClippedSubviews={false}
          keyboardShouldPersistTaps='always'
        />
        
        <Dialog
          visible={this.state.visible}
          width={0.8}
          footer={
            <DialogFooter style={styles.dialogFooter}>
              <DialogButton
                text="CANCEL"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                onPress={() => {this.setState({ visible: false })}}
              />
              <DialogButton
                text="OK"
                style={styles.okButton}
                textStyle={styles.okButtonText}
                onPress={() => {this.updateQuantity()}}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ visible: false });
          }}          
        >
          <DialogContent>
            {
              <View style={{alignItems:'center',justifyContent:'center'}}>
                <View style={{marginTop:padding.xl+padding.lg,height:44,width:260,alignItems:'center',justifyContent:'center'}}>
                  <SegmentedControlTab   
                    tabStyle={{borderColor:colors.primary}}   
                    tabTextStyle={styles.tabTextStyle}            
                    activeTabStyle={{backgroundColor:colors.primary}}                                   
                    values={["เพิ่ม", "ลด"]}
                    selectedIndex={this.state.selectedIndex}
                    onTabPress={this.handleIndexChange}
                  />
                </View> 
                <View style={{display:'flex',flexDirection:'row',marginTop:padding.lg,width:260}}>
                  <View style={{width:110}}>
                    <View style={{height:44,alignItems:'flex-start',justifyContent:'center'}}>
                      <Text style={styles.labelQuantity}> ปัจจุบัน</Text>
                    </View>                    
                    <View style={{height:54,alignItems:'flex-start',justifyContent:'center'}}>
                      <Text style={this.state.selectedIndex == 0?styles.labelQuantityBoldIncrease:styles.labelQuantityBoldDecrease}> {this.state.increaseLabel}</Text>
                    </View>
                    <View style={{height:44,alignItems:'flex-start',justifyContent:'center'}}>
                      <Text style={styles.labelQuantity}> ทั้งหมด</Text>                      
                    </View>
                  </View>
                  <View style={{flex:1,alignItems:'center',justifyContent:'center',width:150}}>
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',height:44}}>
                      <Text style={styles.labelQuantity}>{this.state.quantityCurrent}</Text>
                    </View>
                    <View style={{alignItems:'center',justifyContent:'center',height:54}} onLayout={(event) => {
                      var {x, y, width, height} = event.nativeEvent.layout;
                      console.log("width:"+width);
                    }}>
                      <InputSpinner                                                                      
                        min={0}
                        step={1}  
                        color={colors.primary}  
                        showBorder={true}
                        rounded={false}
                        style={{alignItems:'center',justifyContent:'center'}}
                        inputStyle={{color:colors.tertiary,height:44}}                        
                        buttonStyle={{width:44,height:44,fontSize:16,fontFamily:fonts.primaryBold}}                            
                        value={this.state.quantityEditing}
                        onChange={(text) => {this.onQuantityChanged(text)}}
                      />                      
                    </View>
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',width:150,height:44}}>
                      <View style={{position:'absolute',left:0}}>
                        <TouchableOpacity style={{borderRadius:3,width:44,height:44,backgroundColor:colors.primary}} onPress={() => {this.setZero()}}>
                          <Text style={[styles.textZero]}>
                            0
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.labelQuantity}>{this.state.quantityTotal}</Text>
                    </View>
                  </View>
                </View>                 
              </View>            
            }
          </DialogContent>
        </Dialog>

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
  tabTextStyle:
  {
    color:colors.primary,
    fontFamily:fonts.primaryBold,
  },
  searchBarContainer: 
  {
    height:48
  },
  searchBarInputContainer: 
  {
    height:30
  },
  searchBarInput: 
  {
    // fontFamily: "Sarabun-Light",
    fontSize:16,
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    left:20,
    marginTop:padding.md,
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
  name: {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
    paddingTop: 2,
    paddingLeft: 10,    
    width: Dimensions.get('window').width - 2*8 - 70,
  },
  sku: 
  {    
    fontFamily: "Sarabun-LightItalic",
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
  labelQuantityBoldIncrease: 
  {
    fontFamily: fonts.primaryBold,
    fontSize: 14,
    textAlign: 'right',    
    color: colors.tertiary,
  },
  labelQuantityBoldDecrease: 
  {
    fontFamily: fonts.primaryBold,
    fontSize: 14,
    textAlign: 'right',    
    color: colors.error,
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
  value: 
  {
    fontFamily: fonts.primary,
    fontSize: fonts.md,
    textAlign: 'left',     
    width: 80,    
    height: 30,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlign:'right',
    textAlignVertical: 'center'
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
    color:colors.primary,
    fontSize:18,
  },
  cancelButtonText:
  {
    color:colors.primary,
    fontSize:18,
  },
  dialogFooter:
  {
    height:44,  
  },  
  textZero: {   
    fontFamily: fonts.primaryBold,
    fontSize: 16,
    textAlign: 'center',
    height:44,
    textAlignVertical:'center',    
    color: colors.white,      
  },
  textZeroPress: {  
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    textAlign: 'center',    
    color: colors.primary,    
  },    
  textFail:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primary, 
    fontSize:fonts.md,
    paddingTop:padding.xl
  },
  textSuccess:
  {
    color:colors.secondary,
    textAlign:'center', 
    fontFamily:fonts.primary, 
    fontSize:fonts.md
  }, 
});
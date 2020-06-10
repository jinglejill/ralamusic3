// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView} from 'react-native';
import { List, ListItem, SearchBar } from "react-native-elements";
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import InputSpinner from "react-native-input-spinner";
//import all the components we are going to use.

export default class FirstPage extends React.Component 
{
  constructor(props) {
    super(props);
    this.onEndReachedCalledDuringMomentum = true;
    this.state = {
      storeName: 'RALAMUSIC',
      // storeName: 'MINIMALIST',
      apiPath: 'https://minimalist.co.th/saim/',
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
      typingTimeout: 0
    };
  }

  componentDidMount() {
    this.makeRemoteRequest();
  }

  makeRemoteRequest = () => {
    console.log("makeRemoteRequest page:"+this.state.page+", searchText:"+this.state.search);
    const { page, seed, search } = this.state;
    const url =  this.state.apiPath + 'SAIMMainProductGetList.php?seed='+seed;
    this.setState({ loading: true });

    fetch(url,
      {
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({                 
          page:page,
          limit:20,
          searchText:search, 
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

        console.log("data:"+JSON.stringify(this.state.data));
      })
      .catch(error => {
        this.setState({ error, loading: false });
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

  renderFooter = () => {
    if (!this.state.loading) return null;

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


    // console.log("search remote");
    // if (this.state.typingTimeout) {
    //  clearTimeout(this.state.typingTimeout);
    // }


    // this.setState({
    //      page: 1,
    //      search:search,  
    //      typingTimeout: setTimeout( () => {
    //           this.setState({refreshing:true})              
    //          this.makeRemoteRequest();
    //        }, 500)
    //   });  
  };

  search = () => 
  {
    console.log("perform search");
    this.setState({page:1,refreshing:true},this.makeRemoteRequest());
  }

  showEditQuantityDialog = (sku, quantity) => 
  {
    console.log("showEditQuantityDialog quantity:"+quantity);
    this.setState({visible:true, quantityEditing:quantity, skuEditing:sku});
  }

  syncQuantityChannel = (sku,quantity,channel) => 
  {
    return;
    console.log("syncQuantityChannel");
    //set indicator animating
    this.state.data.map((product)=>{      
        if(product.Sku == sku)
        {
          if(channel == 1)
          {
            product.AnimatingLazada = true;  
          }
          else if(channel == 2)
          {
            product.AnimatingShopee = true;  
          }
          else if(channel == 3)
          {
            product.AnimatingJd = true;  
          }
        }  
    });

    // return;
    //db updateQuantity
    fetch(this.state.apiPath + 'SAIMMarketPlaceProductQuantityUpdate.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        sku: sku,
        quantity: quantity,
        channel: channel,
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
        console.log(responseData.channelName+" sku:"+responseData.sku+"\r\nบันทึกไม่สำเร็จ");
        this.showAlertMessage(responseData.channelName+" sku:"+responseData.sku+"\r\nบันทึกไม่สำเร็จ");
      }


      this.state.data.map((product)=>{      
        if(product.Sku == responseData.sku)
        {
          console.log("set animating false;"+channel+";"+responseData.sku+";"+responseData.quantity);
          if(channel == 1)
          {
            product.AnimatingLazada = false;  
            product.PressStatusLazada = false;
          }
          else if(channel == 2)
          {
            product.AnimatingShopee = false;  
            product.PressStatusShopee = false;
          }
          else if(channel == 3)
          {
            product.AnimatingJd = false;  
            product.PressStatusJd = false;
          }                      
        }
      });
      this.setState((state)=>({refresh:!this.state.refresh}));
    }).done();
  }

  updateQuantity = () => 
  {
    this.setState({visible:false});
    
    sku = this.state.skuEditing;
    console.log("updateQuantity sku:"+sku);

    quantityEditing = this.state.quantityEditing;
    console.log("updateQuantity:"+quantityEditing);


    //set indicator animating
    this.state.data.map((product)=>{      
        if(product.Sku == sku)
        {
          product.Animating = true;
        }  
    });

    

    //db updateQuantity
    fetch(this.state.apiPath + 'SAIMMainProductQuantityUpdate2.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        sku: sku,
        quantity: quantityEditing,
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

  quantityChanged = (text,sku) => 
  {
    console.log("quantityChanged: "+ text + ", sku: " + sku);
    products = [];
    this.state.data.map((product)=>{      
      
        if(product.Sku == sku)
        {
          product.Quantity = text;
          products.push(product);
        }
        else
        {
          products.push(product);  
        }        
      
    });
    this.setState({data:products});
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

  onHideUnderlayButtonChannel = (sku,channel) =>
  {
    console.log("icon tap press false");
    //set indicator animating
    this.state.data.map((product)=>{      
        if(product.Sku == sku)
        {
          if(channel == 1)
          {
            product.PressStatusLazada = false;            
          }
          else if(channel == 2)
          {
            product.PressStatusShopee = false;            
          }
          else if(channel == 3)
          {
            product.PressStatusJd = false;            
          }
        }  
    });
    this.setState((state)=>({refresh:!this.state.refresh}));
  }

  onShowUnderlayButtonChannel = (sku,channel) =>
  {
    console.log("icon tap press true");
    //set indicator animating
    this.state.data.map((product)=>{   
      if(product.Sku == sku)
      {
        if(channel == 1)
        {
          product.PressStatusLazada = true;            
        }
        else if(channel == 2)
        {
          product.PressStatusShopee = true;            
        }
        else if(channel == 3)
        {
          product.PressStatusJd = true;            
        } 
      }   
        
    });
    this.setState((state)=>({refresh:!this.state.refresh}));
  }

  goToDetailPage = (sku) => 
  {
    console.log("sku:"+sku);
    return;
    this.props.navigation.navigate('ProductDetail',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'username': this.state.username,  
      'sku': sku,  
      // onGoBack:()=>this.loadMenu()
    });
  }

  render() {
    const { search } = this.state;
    return (
      <View style={{flex:1,height:Dimensions.get('window').height}}>        
        <FlatList
          extraData={this.state.refresh}
          data={this.state.data}
          renderItem={({ item }) => (   
            <View style={{ flex: 1}}>
              <View style={{display:'flex',flexDirection:'row'}}>
                <Image
                  source={{uri: item.MainImage}}
                  style={styles.image}
                />
                <View style={{ flex: 1}}>
                  <TouchableHighlight 
                    underlayColor={'white'} activeOpacity={1}                                         
                    onPress={()=>{this.goToDetailPage(item.Sku)}} >         
                      <Text style={styles.name}>{item.Name}</Text>   
                  </TouchableHighlight>                  
                  <View style={{display:'flex',flexDirection:'row',paddingTop:6}}> 
                    {
                      Platform.OS === 'ios'?(<TextInput style={styles.sku} editable={false} value={item.Sku} multiline />)
                      :(<Text style={styles.sku} selectable>{item.Sku}</Text>)
                    }                    
                    <View style={[{ flex: 1,alignItems:'flex-end'},styles.quantityView]}>  
                      <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                        {item.Animating == 1 && <ActivityIndicator size="small" animating={true} />}
                        <Text style={styles.quantityLabel}> qty:</Text>              
                        <TouchableHighlight style={styles.buttonQuantity} underlayColor='transparent' onPress={()=>{this.showEditQuantityDialog(item.Sku,item.Quantity)}} >         
                          <Text style={styles.quantity}>{item.Quantity}</Text>              
                        </TouchableHighlight>
                      </View>
                    </View>  
                  </View>
                  <View style={{display:'flex',flexDirection:'row'}}>   
                    <View style={styles.channelView}>                      
                      {item.AnimatingLazada == 0 && <TouchableHighlight 
                        underlayColor={'transparent'} activeOpacity={1}                       
                        onHideUnderlay={()=>this.onHideUnderlayButtonChannel(item.Sku,1)}
                        onShowUnderlay={()=>this.onShowUnderlayButtonChannel(item.Sku,1)}
                        onPress={()=>{item.LazadaExist==1?this.syncQuantityChannel(item.Sku,item.Quantity,1):null}} >         
                          <Image source={item.LazadaExist==1?require('./../assets/images/lazadaIcon.png'):require('./../assets/images/lazadaIconGray.png')}  style={styles.imageIcon}/>
                      </TouchableHighlight>
                      }
                      {item.AnimatingLazada == 1 && <ActivityIndicator size="small" animating={true} color='#0d0a94'/>}
                    </View>
                    <View style={styles.channelView}>
                      {item.AnimatingShopee == 0 && <TouchableHighlight 
                        underlayColor={'transparent'} activeOpacity={1}                       
                        onHideUnderlay={()=>this.onHideUnderlayButtonChannel(item.Sku,2)}
                        onShowUnderlay={()=>this.onShowUnderlayButtonChannel(item.Sku,2)}
                        onPress={()=>{item.ShopeeExist==1?this.syncQuantityChannel(item.Sku,item.Quantity,2):null}} >         
                          <Image source={item.ShopeeExist==1?require('./../assets/images/shopeeIcon.png'):require('./../assets/images/shopeeIconGray.png')}  style={styles.imageIcon}/>
                      </TouchableHighlight>
                      }
                      {item.AnimatingShopee == 1 && <ActivityIndicator size="small" animating={true} color='#ea501f'/>}
                    </View>
                    <View style={styles.channelView}>
                      {item.AnimatingJd == 0 && <TouchableHighlight 
                        underlayColor={'transparent'} activeOpacity={1}                       
                        onHideUnderlay={()=>this.onHideUnderlayButtonChannel(item.Sku,3)}
                        onShowUnderlay={()=>this.onShowUnderlayButtonChannel(item.Sku,3)}
                        onPress={()=>{item.JdExist==1?this.syncQuantityChannel(item.Sku,item.Quantity,3):null}} >         
                          <Image source={item.JdExist==1?require('./../assets/images/jdIcon.png'):require('./../assets/images/jdIconGray.png')}  style={styles.imageIcon}/>
                      </TouchableHighlight>
                      }
                      {item.AnimatingJd == 1 && <ActivityIndicator size="small" animating={true} color='#df2524'/>}
                    </View>                                            
                  </View>          
                </View>
              </View>    
              <View style={styles.separator}/>
            </View>
            
          )}
          ListHeaderComponent={(<SearchBar placeholder="Type Here..." onSubmitEditing={()=>{this.search()}} lightTheme containerStyle={styles.searchBarContainer} inputContainerStyle={styles.searchBarInputContainer} inputStyle={styles.searchBarInput} onChangeText={(text)=>this.updateSearch(text)}
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
                <InputSpinner
                  min={0}
                  step={1}
                  rounded={false}
                  showBorder={true}
                  color={'#6EC417'}
                  colorPress={'white'}
                  style={styles.spinner}
                  buttonStyle={styles.spinnerButton}
                  inputStyle={styles.spinnerInput}                  
                  value={this.state.quantityEditing}
                  onChange={(num) => {
                    console.log(num);
                    this.setState({quantityEditing:num});
                  }}
                />  
                <View>
                  <TouchableHighlight underlayColor={'white'} activeOpacity={1} style={
                    this.state.pressStatus
                      ? styles.buttonZeroPress
                      : styles.buttonZero
                    } 
                    onHideUnderlay={()=>this.onHideUnderlay()}
                    onShowUnderlay={()=>this.onShowUnderlay()}
                    onPress={()=>{this.setState({quantityEditing:0})}} >         
                    <Text style={
                      this.state.pressStatus
                        ? styles.textZeroPress
                        : styles.textZero
                      }>ตั้งค่า 0</Text>              
                  </TouchableHighlight>
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
  searchBarContainer: {height:48},
  searchBarInputContainer: {height:30},
  searchBarInput: 
  {
    // fontFamily: "Sarabun-Light",
    fontSize:16,
  },
  separator: {width:Dimensions.get('window').width-2*20,height:1,backgroundColor:"#e0e0e0",left:20,marginTop:10}, 
  image: {width:70,height:70,marginTop:10,marginLeft:8,borderRadius:10},
  imageIcon: {width:25,height:25,borderRadius:15},
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
    backgroundColor:'#B6E18B',
    // opacity:0.5
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
      borderColor: '#B6E18B',
      backgroundColor:'#B6E18B',
      // opacity:0.5,
      borderWidth: 1,
      borderRadius: 6,      
  },
  buttonZeroPress: {
      height:44,
      borderColor: "#B6E18B",
      // opacity:0.5,
      borderWidth: 1,
      borderRadius: 6
  },  
});
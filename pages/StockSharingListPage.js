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

export default class StockSharingListPage extends React.Component 
{
  controller = new AbortController();
  constructor(props) {
    super(props);

    this.onEndReachedCalledDuringMomentum = true;
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,  
      modifiedUser: this.props.navigation.state.params.modifiedUser,
      sku: this.props.navigation.state.params.sku,       
      skuImage: this.props.navigation.state.params.skuImage,       
      search: this.props.navigation.state.params.searchTextFromProductListPage,
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
    console.log("sku:"+this.state.sku);
  }

  componentDidMount()
  {            
    this.props.navigation.addListener('didFocus', this.onScreenFocus);    
    this.props.navigation.setParams({ handleSave: this.saveData });
    this.makeRemoteRequest(); 
  }

  onScreenFocus = () => 
  {
    // Screen was focused, our on focus logic goes here
    if(this.state.data.length == 0)
    {
      this.makeRemoteRequest();      
    }    
  }

  makeRemoteRequest = () => 
  { 
    console.log("makeRemoteRequest page:"+this.state.page+", searchText:"+this.state.search);   

    this.setState({loading:true});
    const { page, seed, search } = this.state;
    const url = this.state.apiPath + 'SAIMStockSharingGetList3.php?seed='+seed;          
      
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
        sku:this.state.sku,
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {      
      res.products.map((product)=>
      {
        if(product.Sku == this.state.sku)
        {
          product.StockSharing = 1;
          console.log("self share");
        }
      });
      

      var previousData = res.products.slice();
      this.setState({previousData:previousData});


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

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  containerTouched(event) 
  {
    this.refs.textInput.blur();
    return false;
  }

  toggleSelect = (sku,stockSharing) => 
  {
    console.log("sku,stockSharing:["+sku+","+stockSharing+"]");
    if(stockSharing == 1 && sku == this.state.sku)
    {
      return;
    }
    if(stockSharing != 2)
    {
      var skuStockSharing;
      this.state.data.map((product)=>
      {
        if(sku == product.Sku)
        {
          if(product.StockSharing == 0)
          {
            product.StockSharing = 1;
            product.Edit = true;
          }
          else if(product.StockSharing == 1)
          {
            product.StockSharing = 0;
            product.Edit = true;
          }          
          skuStockSharing = product.StockSharing;
        }
      });
      this.setState((state)=>({refresh:!this.state.refresh}));
      this.setState({edited:true});

      // //insert StockSharing
      // const url = this.state.apiPath + 'SAIMStockSharingInsert.php';          
      
      // console.log("before insert");
      // fetch(url,
      // {
      //   // signal: this.controller.signal,
      //   method: 'POST',
      //   headers: {
      //               'Accept': 'application/json',
      //               'Content-Type': 'application/json',
      //             },
      //   body: JSON.stringify({                 
      //     sku:this.state.sku,
      //     shareSku:sku,
      //     stockSharing:skuStockSharing,
      //     storeName: this.state.storeName,
      //     modifiedUser: this.state.modifiedUser,
      //     modifiedDate: new Date().toLocaleString(),
      //     platForm: Platform.OS,
      //   })
      // })
      // .then(responseData => responseData.json())
      // .then(responseData => {

      //   if(responseData.success == false)      
      //   {
      //     // error message        
      //     console.log(responseData.message);
      //     this.setState({alertStatus:0});
      //     this.showAlertMessage(responseData.message);

      //     this.state.data.map((product)=>
      //     {
      //       if(product.Sku == responseData.sku)
      //       {
      //         product.StockSharing = responseData.stockSharing;
      //       }
      //     });
      //     this.setState((state)=>({refresh:!this.state.refresh}));
      //   }
      // })
      // .catch(error => 
      // {
      //   if(error.name != 'AbortError')
      //   {
      //     this.setState({ error, loading: false });
      //     console.log("error:"+error);
      //   }      
      // }); 
      // console.log("after insert");
    }
  }

  saveData = () =>
  {    
    this.props.navigation.setParams({ animating: true });
    var dataEdit = this.state.data.filter((product)=>
      {
        return product.Edit == true;
      });

    //insert StockSharingList
    const url = this.state.apiPath + 'SAIMStockSharingInsertList.php';
    fetch(url,
    {
      // signal: this.controller.signal,
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        stockSharingList:dataEdit,            
        sku:this.state.sku,
        
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(responseData => responseData.json())
    .then(responseData => {

      this.props.navigation.setParams({ animating: false });
      if(responseData.success == false)      
      {
        // error message        
        console.log(responseData.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(responseData.message);

        var data = rpreviousData.slice(); 
        this.setState({data:data});
      }
      else
      {        
        this.props.navigation.goBack();
        if(this.state.edited)
        {
          this.props.navigation.state.params.refresh()
        }
        else
        {
          console.log("not refresh");
        }
      }
    })
    
    console.log("after insert");
  }

  render() {
    const { search } = this.state;
    return (
      <View style={{flex:1}} onStartShouldSetResponder={this.containerTouched.bind(this)}>  
        <View style={{display:'flex',flexDirection:'row',backgroundColor:colors.self}}>
          <Image
            source={this.state.skuImage != ''?{uri: this.state.skuImage}:require('./../assets/images/noImage.jpg')}
            style={styles.image}
          />              
          <View style={{ flex: 1}}>                                        
            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}> 
              {
                Platform.OS === 'ios'?(<TextInput style={styles.sku} editable={false} value={this.state.sku} multiline />)
                :(<Text style={styles.sku} selectable>{this.state.sku}</Text>)
              }                                      
            </View>                                               
          </View>
        </View> 
            
        <FlatList
          extraData={this.state.refresh}
          data={this.state.data}
          renderItem={({ item }) => (   
            <View style={{ flex: 1, backgroundColor:item.StockSharing==0?'transparent':item.StockSharing==2?colors.disabled:item.Sku==this.state.sku?colors.self:colors.hilight}}>
              <TouchableHighlight 
                underlayColor={'transparent'} activeOpacity={1}                                         
                onPress={()=>{this.toggleSelect(item.Sku,item.StockSharing)}} > 

                <View style={{display:'flex',flexDirection:'row'}}>
                  <Image
                    source={item.MainImage != ''?{uri: item.MainImage}:require('./../assets/images/noImage.jpg')}
                    style={styles.image}
                  />
                  <View style={{ flex: 1}}>                                        
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
  menuAllow:
  {
    paddingLeft:padding.xl,  
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.secondary,    
  },
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
  name: 
  {
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
    fontFamily: fonts.primaryItalic,
    fontSize: fonts.lg,
    textAlign: 'left',
    color: colors.tertiary, 
    paddingTop:0,   
    paddingLeft: 10,    
    width: Dimensions.get('window').width - 8 - 10 - 70,    
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
    fontSize:fonts.md,
  },
  cancelButtonText:
  {
    color:colors.primary,
    fontSize:fonts.md,
  },
  dialogFooter:
  {
    height:44,  
  },  
  button:
  {
    borderRadius:3,
    width:44,
    height:44,
    backgroundColor:colors.primary
  },
  textZero: 
  {   
    fontFamily: fonts.primaryBold,
    fontSize: 16,    
    height:44,
    textAlign: 'center',
    textAlignVertical:'center',    
    color: colors.white,      
  },
  textZeroPress: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    height:44,
    textAlign: 'center',  
    textAlignVertical:'center',  
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
});
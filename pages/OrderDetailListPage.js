// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, ScrollView, TouchableOpacity, BackHandler} from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import { List, ListItem, SearchBar } from "react-native-elements";
import ImagePicker from 'react-native-image-crop-picker';
import {DragSortableView} from 'react-native-drag-sort';
import * as Animatable from 'react-native-animatable';
import Autocomplete from 'react-native-autocomplete-input';
import InputSpinner from "react-native-input-spinner";


//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'; 


export default class OrderDetailListPage extends React.Component {
  
  controller = new AbortController();
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    var imageList = [
      {Id:1,Image:"",Base64:"",Type:""},
      {Id:2,Image:"",Base64:"",Type:""},
      {Id:3,Image:"",Base64:"",Type:""},
      {Id:4,Image:"",Base64:"",Type:""},
      {Id:5,Image:"",Base64:"",Type:""},
      {Id:6,Image:"",Base64:"",Type:""},
      {Id:7,Image:"",Base64:"",Type:""},
      {Id:8,Image:"",Base64:"",Type:""},
    ];


    var items = [];
    
    var order = {
      OrderNo:"",
      OrderDate:"", 
      Items:items,     
      Images:imageList,       
    };

    this.onEndReachedCalledDuringMomentum = true;
    
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,    
      modifiedUser: this.props.navigation.state.params.modifiedUser, 
      orderNo: this.props.navigation.state.params.orderNo,
      orderDeliveryGroupID: this.props.navigation.state.params.orderDeliveryGroupID,
      page: 1,
      seed: 1,
      search:"",
      refreshing: false,
      loading: true,
      data:[],
    };
  }
  
  componentDidMount()
  {              
    this.handleRefresh2();    
    this.props.navigation.setParams({ pageTitle: 'รายการคำสั่งซื้อ #'+this.state.orderDeliveryGroupID });
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
      // this.goBack();
      this.props.navigation.state.params.hilightGroup(this.props.navigation.state.params.orderDeliveryGroupID,this.props.navigation.state.params.checked);
      this.props.navigation.goBack(null);
      return true;
  }

  handleRefresh2 = () => 
  {
    console.log('handleRefresh2');
    this.setState({loadingAccess:true});
    
    fetch(this.state.apiPath + 'SAIMUserMenuAllowGet.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,   
        menuCode: 'ORDER_GROUP_LIST',   
        storeName: this.state.storeName,
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
        this.fetchData();
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

  fetchData = () => 
  {
    console.log("fetchData order detail list");
    this.setState({loading:true});
    const { page, seed, search } = this.state;
    const url =  this.state.apiPath + 'SAIMOrderDeliveryGetList3.php?seed='+seed;     
        
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
        orderDeliveryGroupID:this.state.orderDeliveryGroupID, 
        searchText: this.state.search,
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {      
      


      //input width and height
      for(var i=0; i < res.OrderDeliveryList.length; i++)
      {
        for(var j=0; j < res.OrderDeliveryList[i].Images.length; j++)
        {
          let image = res.OrderDeliveryList[i].Images[j];  
          image.Width = 0;
          image.Height = 0;        
          Image.getSize(image.Image, (width, height) => 
            {
              image.Width = width;
              image.Height = height;
              this.setState((state)=>({refresh:!this.state.refresh}));
            }
          );          
        }
      }
      
      this.setState({
        data: page === 1 ? res.OrderDeliveryList : [...this.state.data, ...res.OrderDeliveryList],              
        error: res.error || null,
        loading: false,
        refreshing: false
      }); 

      console.log('listtest orderDeliveryGroupID:'+res.OrderDeliveryGroup.OrderDeliveryGroupID+', checked:'+res.OrderDeliveryGroup.Checked);
      this.props.navigation.setParams({ orderDeliveryGroupID: res.OrderDeliveryGroup.OrderDeliveryGroupID, checked: res.OrderDeliveryGroup.Checked });         
    })
    .catch(error => {
      this.setState({ error, loading: false });
    }); 
  }

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
          this.fetchData();
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
        this.fetchData();
      }
    );
  };

  onEditorInitialized = () => 
  {
    console.log("onEditorInitialized callback");
  }

  rearrangeImage = () =>//timeout or done button pressed
  {
    this.setState({enableImageSort:false,buttonText:"+"});
      
    //move not blank images to front
    var newImageList = [];
    for(var i=0; i<this.state.item.Image.length; i++)
    {   
      if(this.state.item.Image[i].Image != '')
      {
        newImageList.push(this.state.item.Image[i]);
      }
    }

    var emptyImageList = [];
    for(var i=0; i<(8-newImageList.length); i++)
    {
      emptyImageList.push({Id:i,Image:''});
    }

    newImageList.push(...emptyImageList);
    for(var i=0; i<newImageList.length; i++)
    {
      newImageList[i].Id = i+1;
    }

    var item = this.state.item;
    item.Image = newImageList;
    this.setState({item:item});

    console.log(JSON.stringify(this.state.item.Image));
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

  onHideUnderlayStockSharing = () => 
  {
    
    this.setState({ pressStatusStockSharing: false });
  }

  onShowUnderlayStockSharing = () => 
  {
    
    this.setState({ pressStatusStockSharing: true });
  }

  onHideUnderlayPrint = () => 
  {
    console.log("button print press false");
    this.setState({ printPressStatus: false });
  }

  onShowUnderlayPrint = () => 
  {
    console.log("button print press true");
    this.setState({ printPressStatus: true });
  }

  onHideUnderlayDelete = () => 
  {
    this.setState({ deletePressStatus: false });
  }

  onShowUnderlayDelete = () => 
  {
    this.setState({ deletePressStatus: true });
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  setPreviousItem = () => 
  {
    var previousItem = this.state.previousItem;
    var item = this.state.item;

    for (const [key, value] of Object.entries(previousItem)) 
    {
      if(key == 'Image')
      {
        var previousImageList = previousItem[key];
        var imageList = item[key];
        for(var i=0; i<imageList.length; i++)
        {
          previousImageList[i].Image = imageList[i].Image;
          previousImageList[i].Base64 = imageList[i].Base64;
          previousImageList[i].Type = imageList[i].Type;
        }
      }
      else if(key == 'MapSku')
      {
        var previousMapSku = previousItem[key];
        var mapSku = item[key];
        previousMapSku.LazadaSku = mapSku.LazadaSku;
        previousMapSku.ShopeeSku = mapSku.ShopeeSku;
        previousMapSku.JdSku = mapSku.JdSku;
        previousMapSku.WebSku = mapSku.WebSku;
      }
      else
      {
        previousItem[key] = item[key];
      }
    }        

    this.setState({previousItem:previousItem,printEnabled:true});
  }

  newForm = () => 
  {
    //check if user wants to save current item
    var previousItem = this.state.previousItem;
    var item = this.state.item;
    
    for (const [key, value] of Object.entries(previousItem)) 
    {
      if(key == 'Image')
      {
        var previousImageList = previousItem[key];
        var imageList = item[key];
        for(var i=0; i<imageList.length; i++)
        {
          if((previousImageList[i].Image != imageList[i].Image) || 
            (previousImageList[i].Base64 != imageList[i].Base64) || 
            (previousImageList[i].Type != imageList[i].Type)) 
          {
            this.setState({clearFormVisible:true});
            return;              
          }
        }
      }
      else if(key == 'MapSku')
      {
        var previousMapSku = previousItem[key];
        var mapSku = item[key];
        if((previousMapSku.LazadaSku != mapSku.LazadaSku) || 
            (previousMapSku.ShopeeSku != mapSku.ShopeeSku) || 
            (previousMapSku.JdSku != mapSku.JdSku) ||
            (previousMapSku.WebSku != mapSku.WebSku)
            ) 
        {
          this.setState({clearFormVisible:true});
          return;              
        }
      }
      else
      {
        if(previousItem[key] != item[key])
        {            
          this.setState({clearFormVisible:true});
          return;    
        }
      }
    }  


    //clear form
    this.clearForm();
  }

  clearForm = () => 
  {
    var previousItem = this.state.previousItem;
    var item = this.state.item;

    for (const [key, value] of Object.entries(previousItem)) 
    {
      if(key == 'Image')
      {
        var previousImageList = previousItem[key];
        var imageList = item[key];
        for(var i=0; i<imageList.length; i++)
        {
          previousImageList[i].Image = "";
          previousImageList[i].Base64 = "";
          previousImageList[i].Type = "";
          imageList[i].Image = "";
          imageList[i].Base64 = "";
          imageList[i].Type = "";
        }
      }
      else if(key == 'MapSku')
      {
        var previousMapSku = previousItem[key];
        var mapSku = item[key];
        previousMapSku.LazadaSku = "";
        previousMapSku.ShopeeSku = "";
        previousMapSku.JdSku = "";
        previousMapSku.WebSku = "";
        
        mapSku.LazadaSku = "";
        mapSku.ShopeeSku = "";
        mapSku.JdSku = "";
        mapSku.WebSku = "";        
      }
      else
      {
        previousItem[key] = "";
        item[key] = "";
      }
    }        

    this.setState({previousItem:previousItem,item:item,printEnabled:false});
  }

  onStartShouldSetResponder = (evt,index) => 
  {
    console.log("onStartShouldSetResponder:"+index);  
     
    this.setState({imageIndex:index});
    this.setState({longPressTimeout:setTimeout(()=>
      {
        if(!this.imageEmpty())
        {

          this.setState({enableImageSort:true,buttonText:"Done",imageSortTimeout:setTimeout(()=>
            {
              this.rearrangeImage();
            },30000)
          });  
        }        
      },1000)});

    console.log("onStartShouldSetResponder return true");
    return true;
  }

  onResponderRelease = () =>
  {
    if(this.state.longPressTimeout)
    {
      clearTimeout(this.state.longPressTimeout);        
      // this.setState({resizeImageVisible:true});

      this.enlargeImage(null,this.state.order.Images[this.state.imageIndex-1].Image);

      console.log("show resize popup");     
    }
  }

  deleteImage = () => 
  {
    var imageList = this.state.order.Images;

    var newImageList = [];
    for(var i=0; i<imageList.length; i++)
    {
      if(i != this.state.deleteIndex)
      {
        newImageList.push(imageList[i]);
      }
    }

    newImageList.push({Id:0,Image:''});

    //reorder Id
    for(var i=0; i<newImageList.length; i++)
    {
      newImageList[i].Id = i+1;
    }

    var order = this.state.order;
    order.Images = newImageList;

    this.setState({order:order,deleteVisible:false});
  }

  confirmDeleteProduct = () => 
  {
    this.setState({deleteProductVisible:true});
  }

  handleImageLoaded = () => {
    console.log("handleImageLoaded");
    
  };

  enlargeImage = (imageUrl,image) => 
  {
    console.log("imageUrl:"+imageUrl);
    this.props.navigation.navigate('LargeImage',
    {
      imageUrl: imageUrl,
      image:image,
      
      'modifiedUser': this.state.modifiedUser,        
    });  
  }

  goToOrderDetail = (orderNo,orderDeliveryID) =>
  {
    console.log("orderNo:"+orderNo+", orderDeliveryID:"+orderDeliveryID);
    this.props.navigation.navigate('OrderDetail',
    {
      orderNo: orderNo,
      orderDeliveryID: orderDeliveryID,
      edit: true,
      refresh: this.deleteAndRefresh,
      updateOrder: this.updateOrder,
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,        
    });  
  }

  deleteAndRefresh = (orderDeliveryID) => 
  {
    this.setState({data: this.state.data.filter((orderDelivery) => { 
        return orderDelivery.OrderDeliveryID !== orderDeliveryID 
    })});    
  }

  updateOrder = (order) =>
  {    
    console.log("images length:"+order.Images.length);
    this.state.data.map((orderDelivery)=>
    {
      if(orderDelivery.OrderNo == order.OrderNo)
      {
        orderDelivery.Images = order.Images;


        //input width and height
        for(var j=0; j < orderDelivery.Images.length; j++)
        {
          let image = orderDelivery.Images[j];  
          image.Width = 0;
          image.Height = 0;        
          Image.getSize(image.Image, (width, height) => 
            {
              image.Width = width;
              image.Height = height;
              this.setState((state)=>({refresh:!this.state.refresh}));
            }
          );          
        }
      }
    });
    this.setState((state)=>({refresh:!this.state.refresh}));
  }

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
    this.setState({page:1,data:[]},()=>this.fetchData());
  }

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

  render() {
    // console.log("data:"+JSON.stringify(this.state.data));
    const { search } = this.state;
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    if(this.state.loadingAccess)
    {
      return(<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><ActivityIndicator animating size='small' /></View>);
    }
    if(!this.state.loadingAccess && !this.state.menuAllow)
    {
      return (<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><Text style={styles.menuAllow}>จำกัดการเข้าใช้</Text></View>);
    }
    return (
      <FlatList 
        extraData={this.state.refresh}               
        data={this.state.data}
        renderItem={({ item }) => (   
          <TouchableHighlight 
            underlayColor={'transparent'} activeOpacity={1}
            onPress={()=>{this.goToOrderDetail(item.OrderNo, item.OrderDeliveryID)}} > 
            <View style={{flex:1}}>   
              <View style={{display:'flex',flexDirection:'row'}}> 
                <Text style={styles.title2}>Order no. {item.OrderNo}</Text>
                <View style={{flex: 1,alignItems:'flex-end',justifyContent:'center',paddingRight:16}}>
                  <Image
                    source={item.Channel == 1?require('./../assets/images/lazadaIcon.png'):item.Channel == 2?require('./../assets/images/shopeeIcon.png'):item.Channel == 3?require('./../assets/images/jdIcon.png'):null}
                    style={styles.imageIconSmall}
                    /> 
                </View>
              </View>
              <Text style={styles.title3}>Date {item.OrderDate}</Text>
              <FlatList                      
                data={item.Items}
                renderItem={({ item }) => (   
                  <View style={{ flex: 1 }}>
                    <View style={{display:'flex',flexDirection:'row'}}>
                      <Image
                        source={item.Image != ''?{uri: item.Image}:require('./../assets/images/noImage.jpg')}
                        style={styles.imageSku}
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
                              <View style={{display:'flex',flexDirection:'row'}}>
                                <Text style={[styles.labelQuantity]}> qty:</Text>
                                <Text style={styles.quantity}>{item.Quantity}</Text>
                              </View>
                            </View>
                          </View>  
                        </View>

                        <View style={styles.accessories}>
                          {item.AccImages.length > 0?<Text style={styles.accessoriesLabel}>Accessories</Text>:null}
                          <DragSortableView
                            dataSource={item.AccImages}
                            parentWidth={dimensions.fullWidth-8-70-10-8}
                            childrenWidth= {72}
                            childrenHeight={72}
                            keyExtractor={(item,index)=> item.Id}
                            onDataChange = {(data)=>{                                    
                              {         
                                console.log("onDataChange");                                
                              }
                            }}
                            onClickItem={(data,item,index)=>
                              {      
                                console.log("on onClickItem");                                          
                              }
                            }
                            renderItem={(itemAcc,index)=>
                              <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={()=>{this.goToOrderDetail(item.OrderNo, item.OrderDeliveryID)}} > 
                                <View style={styles.imageView}>
                                  <Image
                                    source={itemAcc.ImageUrl == ""?require('./../assets/images/blank.gif'):{uri: itemAcc.ImageUrl}}
                                    style={styles.imageAccessories}
                                  />
                                </View>
                              </TouchableHighlight>                                     
                            }
                          />                        
                        </View>                                                 
                      </View> 
                    </View> 
                    <View style={styles.separator}/>
                  </View>                
                )}            
                listKey={(item, index) => "sub"+index}            
                removeClippedSubviews={false}
                keyboardShouldPersistTaps='always'
              />
              <FlatList              
                data={item.Images}
                renderItem={({ item }) => (   
                  <View style={[{flex:1}]}>
                    <Image
                      source={item.Image != ''?{uri: item.Image}:require('./../assets/images/noImage.jpg')}
                      style={[item.Width == 0?null:{width:dimensions.fullWidth,height:item.Height/item.Width*dimensions.fullWidth}]}
                    />
                    <View style={{height:padding.sm}}>
                    </View>
                  </View>

                )}              
                listKey={(item, index) => "image"+index}              
                removeClippedSubviews={false}
                keyboardShouldPersistTaps='always'
              />
              <View style={styles.separator}/>
            </View>
          </TouchableHighlight>

          
        )}  
        ListHeaderComponent={(
          <SearchBar ref='textInput' placeholder="Type Here..." 
          onSubmitEditing={()=>{this.search()}} lightTheme containerStyle={styles.searchBarContainer} 
          inputContainerStyle={styles.searchBarInputContainer} inputStyle={styles.searchBarInput} 
          onChangeText={(text)=>this.updateSearch(text)}
          value={search}/>)}      
        listKey={(item, index) => "main"+index}        
        removeClippedSubviews={false}
        keyboardShouldPersistTaps='always'



        ListFooterComponent={this.renderFooter}        
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }} 
        
      />
         
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
  title: 
  {        
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
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
  imageSku: 
  {
    width:70,
    height:70,
    marginTop:padding.md,
    marginLeft:8,
    borderRadius:10
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
  }, 
  accessoriesLabel: 
  {
    fontFamily: fonts.primaryItalic,
    fontSize: fonts.sm,
    color: colors.secondary,
  },
  title2:
  {
    paddingLeft: padding.xl,
    fontFamily: fonts.primaryBold,
    fontSize: fonts.lg,
    color: colors.secondary,
  },
  title3:
  {
    paddingLeft: padding.xl,
    fontFamily: fonts.primaryItalic,
    fontSize: fonts.lg,
    color: colors.secondary,
  },
  separator: 
  {
    width:dimensions.fullWidth-8-70-10-20,
    height:1,
    backgroundColor:colors.separator,
    left:8+70+10,
    marginTop:padding.sm,
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
  imageIconSmall: 
  {
    width:15,
    height:15,
    borderRadius:7
  },
  image:
  {    
    flex: 1,
    width: dimensions.fullWidth,
    height: dimensions.fullWidth,
    resizeMode: 'contain'    
  }, 
  imageView:
  {
    width:66,
    height:66,
  },
  imageAccessories: 
  {
    width:60,
    height:60,
    marginTop:6, 
    // borderWidth:1,
    // borderColor:'#CCCCCC',     
  },
  accessories:
  {
    marginLeft:10,
    width:dimensions.fullWidth-8-70-10-8,//dimensions.fullWidth,    
  },
});

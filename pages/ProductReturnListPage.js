// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, TouchableOpacity} from 'react-native';
import { List, ListItem, SearchBar } from "react-native-elements";
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import InputSpinner from "react-native-input-spinner";
import SegmentedControlTab from "react-native-segmented-control-tab";
import {colors, fonts, padding, dimensions} from './../styles/base.js';
import CalendarPicker from 'react-native-calendar-picker';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

//import all the components we are going to use.

export default class ProductReturnListPage extends React.Component 
{
  controller = new AbortController();
  constructor(props) {
    super(props);

    this.onEndReachedCalledDuringMomentum = true;
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,  
      modifiedUser: this.props.navigation.state.params.modifiedUser,
      
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,      
      refreshing: false,
      visible: false,
      alertVisible: false,
      alertMessage:'',      
      toDeleteOrderDeliveryID:0,
      typingTimeout: 0,
      tabIndex: this.props.navigation.getParam('tabIndex'),          
      
    };
    this.props.navigation.setParams({ modifiedUser: this.props.navigation.state.params.modifiedUser });
    console.log("tabIndex:"+this.state.tabIndex);
    
    this.swipeRowRef = {};
  }

  componentDidMount()
  {               
    this.props.navigation.addListener('didFocus', this.onScreenFocus);
    this.props.navigation.setParams({ handleAdd: this.addData });   
    this.handleRefresh2();

    // this.setHeaderOptions();
  }

  onScreenFocus = () => 
  {
    console.log("onScreenFocus");
    // Screen was focused, our on focus logic goes here
    // if(this.state.data.length == 0)
    {
      this.makeRemoteRequest();      
    }    
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
        menuCode: 'PRODUCT_RETURN_LIST',   
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
        this.makeRemoteRequest();
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

  makeRemoteRequest = () => 
  { 
    console.log("makeRemoteRequest page:"+this.state.page+", searchText:"+this.state.search);   

    this.setState({loading:true});
    const { page, seed, search } = this.state;
    const url = this.state.apiPath + 'SAIMProductReturnGetList.php?seed='+seed;          
          
    fetch(url,
    {
      signal: this.controller.signal,
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({    
        status:this.state.tabIndex,             
        page:page,
        limit:20,
        searchText:search, 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {      
      this.setState({
        data: page === 1 ? res.productReturnList : [...this.state.data, ...res.productReturnList],
        error: res.error || null,
        loading: false,
        refreshing: false
      });
      
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
    // console.log("onEndReachedCalledDuringMomentum:"+this.onEndReachedCalledDuringMomentum);
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

 

  addData = () =>
  {    
    console.log("add click");
    this.props.navigation.navigate('OrderNoScan2',
    {      
      refreshList: this.makeRemoteRequest,
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,              
    });    
  }

  hilightGroup = (productReturnID,checked) =>
  {
    
    console.log('productReturnID:'+productReturnID+', checked:'+checked);
    if(checked == 1)
    {
      this.state.data.map((productReturn)=>{      
        if(productReturn.productReturnID == productReturnID)
        {                
          productReturn.Checked = checked;
        }
      });
      this.setState((state)=>({refresh:!this.state.refresh}));
    }
  }

  goToDetail = (productReturnID) => 
  {
    this.props.navigation.navigate('OrderDetail2',
    {
      productReturnID:productReturnID,
      edit: true,
      refresh: this.deleteAndRefresh,
      // updateOrder: this.updateOrder,
      
      'modifiedUser': this.state.modifiedUser, 
      'hilightGroup': this.hilightGroup, 
    });  
  }

  deleteAndRefresh = (productReturnID) => 
  {
    this.setState({data: this.state.data.filter((productReturn) => { 
        return productReturn.ProductReturnID !== productReturnID 
    })});    
  }

  // updateOrder = (order) =>
  // {    
  //   // console.log("images length:"+order.Images.length);
  //   this.state.data.map((productReturn)=>
  //   {
      
  //     if(productReturn.ProductReturnID == order.ProductReturnID)
  //     {
  //       console.log("productReturn.Status: "+ productReturn.Status);
  //       console.log("order.Status: "+order.Status);
  //       productReturn.NextStep = order.NextStep;
  //       productReturn.ProductClaim = order.ProductClaim;
  //       productReturn.Status = order.Status;
  //       console.log("found update");
  //     }
  //   });
  //   this.setState({data: this.state.data.filter((productReturn) => { 
  //       return productReturn.Status == this.state.tabIndex 
  //   })});

  //   this.setState((state)=>({refresh:!this.state.refresh}));
  // }

  onDateChange = (dateFromCal) =>
  {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    console.log("date:"+dateFromCal.toString());
    var strDate = dateFromCal.toString();
    var strMonth = strDate.substr(4,3);
    var month = 0;
    var date = strDate.substr(8,2);
    var year = strDate.substr(11,4);

    for(var i=0; i<12; i++)
    {
      if(months[i].substr(0,3)==strMonth)
      {
        month = i+1;
        break;
      }
    }
    
    var selectedDate = year+"-"+this.pad(month,2)+"-"+date;
    
    this.setState({
      selectedStartDate: dateFromCal,
      showCalendar:false,
      search:selectedDate,
    },()=>{this.makeRemoteRequest()});

  }

  pad = (num, size) => 
  {
    var s = "0" + num;
    return s.substr(s.length-size);
  }

  deleteGroup = (orderDeliveryGroupID) =>
  {
    this.setState({loading:true,deleteVisible:false});    
    const url = this.state.apiPath + 'SAIMOrderDeliveryGroupDelete.php';          
      
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        orderDeliveryGroupID:orderDeliveryGroupID,
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {      
      if(res.success == true)
      {
        //remove from List
        this.swipeRowRef[orderDeliveryGroupID].closeRow();
        this.setState({data: this.state.data.filter((orderDeliveryGroup) => { 
            return orderDeliveryGroup.OrderDeliveryGroupID !== orderDeliveryGroupID 
        }),loading:false});        
      }
      else
      {
        // error message        
        console.log(res.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(res.message);
      }
    }).done();
    
  }

  setSwipeRowRef = (ref,orderDeliveryGroupID) => 
  {
    this.swipeRowRef[orderDeliveryGroupID] = ref;
  }

  confirmDeleteGroup = (orderDeliveryGroupID) => 
  {
    this.setState({loading:true});    
    const url = this.state.apiPath + 'saimorderdeliverygroupconfirmdelete.php';          
      
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        orderDeliveryGroupID:orderDeliveryGroupID,
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {      
      if(res.success == true)
      {
        //remove from List
        this.swipeRowRef[orderDeliveryGroupID].closeRow();
        this.setState({data: this.state.data.filter((orderDeliveryGroup) => { 
            return orderDeliveryGroup.OrderDeliveryGroupID !== orderDeliveryGroupID 
        }),loading:false});        
      }
      else
      {
        // error message        
        console.log(JSON.stringify(res));
        this.setState({toDeleteOrderDeliveryID:orderDeliveryGroupID,deleteVisible:true,confirmDeleteText:res.message});        
      }
    }).done();

    
  }

  render() {
    const { selectedStartDate } = this.state;
    const startDate = selectedStartDate ? selectedStartDate.toString() : '';
    const { search } = this.state;
    if(this.state.loadingAccess)
    {
      return(<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><ActivityIndicator animating size='small' /></View>);
    }
    if(!this.state.loadingAccess && !this.state.menuAllow)
    {
      return (<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><Text style={styles.menuAllow}>จำกัดการเข้าใช้</Text></View>);
    }
    return (
      <View style={{flex:1}} onStartShouldSetResponder={this.containerTouched.bind(this)}> 
        <FlatList   
          extraData={this.state.refresh}
          ItemSeparatorComponent={
            
            (({ highlighted }) => (
              <View
                style={[
                  styles.separator,
                  highlighted && { marginLeft: 0 }
                ]}
              />
            ))
          }       
          data={this.state.data}
          renderItem={({ item }) => 
            <View style={styles.standaloneRowFront}>
              <View style={{ flex: 1, backgroundColor:item.Status == 0 && item.NextStep == 0?'white':(item.Status == 0 && item.NextStep == 1?colors.hilight:(item.Status == 0 && item.NextStep == 2?colors.self:(item.Status == 1 && item.ProductClaim == 2?colors.self:(item.Status == 2 && item.ProductClaim == 2?colors.hilight:'white'))))}}>
                <TouchableHighlight
                  underlayColor={'transparent'} activeOpacity={1} style={{height:40}}
                  onPress={()=>{this.goToDetail(item.ProductReturnID)}} >
                  <View style={{display:'flex',flexDirection:'row',height:40,alignItems:'center'}}>
                    <Text style={styles.title2}>#{item.ProductReturnID}</Text>                        
                    <View style={{flex: 1,alignItems:'flex-end'}}>
                      <Text style={styles.title3}>{item.ReturnDate}</Text>
                    </View>
                  </View>
                </TouchableHighlight>
                
              </View>
            </View>
            }

          
          ListHeaderComponent={(
            <View style={{flex:1}}>
              <View style={{display:'flex', flexDirection:'row'}}>
                <SearchBar ref='textInput' placeholder="Type Here..." onSubmitEditing={()=>{this.search()}} lightTheme containerStyle={styles.searchBarContainer} inputContainerStyle={styles.searchBarInputContainer} inputStyle={styles.searchBarInput} onChangeText={(text)=>this.updateSearch(text)}
                  value={search}/>
                <TouchableHighlight style={styles.buttonCalendar} underlayColor='#e1e8ee' onPress={()=>{this.setState({showCalendar:!this.state.showCalendar})}} >
                  <View style={{flex:1}}>
                    <Image source={require('./../assets/images/calendarIcon.png')}  style={styles.imageCalendar}/>
                  </View>
                </TouchableHighlight>              
              </View> 
              {
                this.state.showCalendar?
                <View style={{flex:1,backgroundColor:'white'}}>
                  <CalendarPicker
                    onDateChange={this.onDateChange}
                  />
                </View>
                :null 
              }
            </View>
            )}
          ListFooterComponent={this.renderFooter}
          keyExtractor={(item, index) => index}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={0.1}
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

        <Dialog
          visible={this.state.deleteVisible}
          width={0.8}
          footer=
          {
            <DialogFooter style={styles.dialogFooter}>
              <DialogButton
                text="NO"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                onPress={() => {this.setState({ deleteVisible: false })}}
              />
              <DialogButton
                text="YES"
                style={styles.okButton}
                textStyle={styles.okButtonText}
                onPress={() => {this.deleteGroup(this.state.toDeleteOrderDeliveryID)}}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ deleteVisible: false });
          }}          
        >
          <DialogContent>
            {
              <View style={{alignItems:'center',justifyContent:'center'}}>
                <Text style={styles.textFail}>{this.state.confirmDeleteText}</Text>
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
    height:48,
    width:dimensions.fullWidth-48,
    borderBottomColor:'transparent',
  },
  searchBarInputContainer: 
  {
    height:30,    
  },
  searchBarInput: 
  {
    fontSize:16,
  },
  buttonCalendar:
  {
    alignItems:'center',
    justifyContent:'center',
    width:48,
    height:48,
    backgroundColor:'#e1e8ee',
  },
  imageCalendar:
  {
    marginTop:9,
    width:30,
    height:30,  
  }, 
  separator: 
  {
    height:1,
    
    // width:dimensions.fullWidth-2*padding.xl,    
    // backgroundColor:colors.separator,
    // left:padding.xl,
    // marginTop:padding.md,
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
    // width:60,
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
  standaloneRowFront: 
  {
    backgroundColor: 'white',
  },
  standaloneRowBack: 
  {
    flex: 1,
    alignItems:'flex-end',    
  },
  title2:
  {
    paddingLeft: padding.xl,
    fontFamily: fonts.primaryItalic,
    fontSize: fonts.md,
    color: colors.secondary,
    // width:100,
    paddingLeft:padding.xl
  },
  title3:
  {
    paddingRight: padding.xl,
    fontFamily: fonts.primary,
    fontSize: fonts.md,
    color: colors.secondary,    
    textAlign:'right',
  },
  title4:
  {
    // paddingLeft: padding.xl,
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    color: colors.tertiary,    
  },
});

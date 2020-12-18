// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, FlatList, ActivityIndicator, Dimensions, StyleSheet, Image, TouchableHighlight, TextInput, Platform, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import ImagePicker from 'react-native-image-crop-picker';
import {DragSortableView} from 'react-native-drag-sort';
import * as Animatable from 'react-native-animatable';
import Autocomplete from 'react-native-autocomplete-input';
import InputSpinner from "react-native-input-spinner";
// MyCustomComponent = Animatable.createAnimatableComponent(MyCustomComponent);
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'; 


export default class OrderDetailPage extends React.Component {
  constructor(props) {
    super(props);
    var mapSku = 
    {
      LazadaSku:"",
      ShopeeSku:"",
      JdSku:"",
      WebSku:""
    };
    var item = {
      Brand:"",
      Name:"",
      Sku:"",
      Quantity:"",
      Price:"", 
      Cost:"",
      Remark:"",     
      Image:imageList, 
      AnimatingLazada:false,
      AnimatingShopee:false,
      AnimatingJd:false,   
      AnimatingWeb:false,  
      MapSku:mapSku, 
    };

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


    // var previousImageList = [
    //   {Id:1,Image:"",Base64:"",Type:""},
    //   {Id:2,Image:"",Base64:"",Type:""},
    //   {Id:3,Image:"",Base64:"",Type:""},
    //   {Id:4,Image:"",Base64:"",Type:""},
    //   {Id:5,Image:"",Base64:"",Type:""},
    //   {Id:6,Image:"",Base64:"",Type:""},
    //   {Id:7,Image:"",Base64:"",Type:""},
    //   {Id:8,Image:"",Base64:"",Type:""},
    // ];
    var previousMapSku = 
    {
      LazadaSku:"",
      ShopeeSku:"",
      JdSku:"",
      WebSku:""
    }
    // var previousItem = {
    //   Brand:"",
    //   Name:"",
    //   Sku:"",
    //   Quantity:"",
    //   Price:"",     
    //   Cost:"",
    //   Remark:"", 
    //   Image:previousImageList, 
    //   AnimatingLazada:false,
    //   AnimatingShopee:false,
    //   AnimatingJd:false,      
    //   AnimatingWeb:false,  
    //   MapSku:previousMapSku,     
    // };

    var edit = false;
    var loading = false;
    var sku = "";    
    if(this.props.navigation.state.params.edit)
    {
      edit = true;
      loading = true;
    }

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,    
      modifiedUser: this.props.navigation.state.params.modifiedUser, 
      channel: this.props.navigation.state.params.channel,
      orderNo: this.props.navigation.state.params.orderNo,
      orderDeliveryID: this.props.navigation.state.params.orderDeliveryID,
      orderDeliveryGroupID: this.props.navigation.state.params.orderDeliveryGroupID,
      edit: this.props.navigation.state.params.edit,
      order: this.props.navigation.state.params.edit?order:this.props.navigation.state.params.order,
      // order:order,
      item:item,    
      searchTextFromProductListPage: this.props.navigation.state.params.searchTextFromProductListPage,  
      edit: edit, 
      loading: loading,
      // previousItem:previousItem,
      
      addImageVisible:false, 
      buttonText:"+",
      longPressTimeout:0,
      imageSortTimeout:0,      
      data:[],
    };
    // console.log("order:"+this.state.order);
  }
  
  componentDidMount()
  {    
    this.props.navigation.setParams({ handleSave: this.saveOrder });
    this.props.navigation.setParams({ animating: false });
    this.props.navigation.setParams({ savedOrSynced: false });
    this.props.navigation.setParams({ edit: true });
    if(!this.state.edit)
    {
      this.props.navigation.setParams({ edit: false });
      this.props.navigation.setParams({ handleNew: this.newForm });  
    }
    
    this.handleRefresh();
  }

  handleRefresh = () => 
  {
    console.log('handleRefresh');
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
    if(this.state.edit)
    {
      const url =  this.state.apiPath + 'SAIMOrderDeliveryGet.php';
      this.setState({ loading: true });

      console.log("fetch data -> loading:true");
      fetch(url,
      {
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({     
          edit:this.state.edit,            
          orderNo:this.state.orderNo, 
          storeName: this.state.storeName,
          modifiedUser: this.state.modifiedUser,
          modifiedDate: new Date().toLocaleString(),
          platForm: Platform.OS,
        })
      })
      .then(res => res.json())
      .then(res => {
        if(res.success)
        {
          var previousImageList = [
            {Id:1,Image:"",Base64:"",Type:""},
            {Id:2,Image:"",Base64:"",Type:""},
            {Id:3,Image:"",Base64:"",Type:""},
            {Id:4,Image:"",Base64:"",Type:""},
            {Id:5,Image:"",Base64:"",Type:""},
            {Id:6,Image:"",Base64:"",Type:""},
            {Id:7,Image:"",Base64:"",Type:""},
            {Id:8,Image:"",Base64:"",Type:""},
          ];
          for(var i=0; i<previousImageList.length; i++)
          {
            previousImageList[i].Image = res.Order.Images[i].Image;
            previousImageList[i].Base64 = res.Order.Images[i].Base64;
            previousImageList[i].Type = res.Order.Images[i].Type;
          }
                    
          this.setState({          
            order:res.Order,          
            error: res.error || null,
            loading: false,  
            previousImageList:previousImageList,        
          });
        }        
      }); 
    }    
  }

  onEditorInitialized = () => 
  {
    console.log("onEditorInitialized callback");
  }

  rearrangeImage = () =>//timeout or done button pressed
  {
    console.log("rearrangeImage");
    this.setState({enableImageSort:false,buttonText:"+"});
      
    //move not blank images to front
    var newImageList = [];
    for(var i=0; i<this.state.order.Images.length; i++)
    {   
      if(this.state.order.Images[i].Image != '')
      {
        newImageList.push(this.state.order.Images[i]);
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

    var order = this.state.order;
    order.Image = newImageList;
    this.setState({order:order});

  }

  addOrDone = () =>
  {

    if(this.state.enableImageSort)
    {
      this.rearrangeImage();
    }
    else
    {
      this.addImage();
    }
  }

  addImage = () => 
  {    
    console.log("add image");
    // console.log("add image order:"+JSON.stringify(this.state.order));
    {
      if(this.state.order.Images[7].Image == "")
      {
        console.log("image index 7 empty");      
        this.setState({addImageVisible:true});
      }
      else
      {
        console.log("สามารถใส่รูปได้สูงสุด 8 รูป");       
      }  
    }    
  }

  chooseFromGallery = () => 
  {
    ImagePicker.openPicker({
      includeBase64: true,
      // width: 300,
      // height: 300,
      // cropping: true
      // multiple: true
    }).then(image => {
      console.log(image);

      this.setImage(image);
    });
  }

  useCamera = () => 
  {
    ImagePicker.openCamera({
      includeBase64: true,
      width: 720,
      height: 1280,
      // cropping: true,
    }).then(image => {
      console.log(image);

      this.setImage(image);
    });
  }

  setImage = (image) => 
  {    
    var order = this.state.order;
    var imageList = this.state.order.Images;
    for(var i=0; i<8; i++)
    {
      if(imageList[i].Image == "")
      {
        imageList[i].Image = image.path;
        imageList[i].Base64 = image.data;
        imageList[i].Type = image.mime.split("/")[1];
        console.log("imagePath:"+imageList[i].Image);
        break;
      }
    }
    
    order.Images = imageList;
    this.setState({order:order,addImageVisible:false}) 
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

  saveOrder = () => 
  {
    console.log("save order");    
    if(!this.state.edit)
    {
      if(this.state.order.Images[0].Image == "")
      {
        this.props.navigation.state.params.resetSkuDetected();
        this.props.navigation.goBack(null);   
        return;
      }
    }
    else
    {
      var changeData = false;
      for(var i=0; i<this.state.order.Images.length; i++)
      {
        if(this.state.order.Images[i].Image != this.state.previousImageList[i].Image)         
        {
          changeData = true;
          break;
        }
      }
      if(!changeData)
      {
        this.props.navigation.goBack(null);   
        return;
      }
    }

    
    this.props.navigation.setParams({ animating: true });
    fetch(this.state.apiPath + 'SAIMOrderDeliveryInsert.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        channel: this.state.channel,
        order: this.state.order,    
        edit: this.state.edit,                
        orderDeliveryGroupID: this.state.orderDeliveryGroupID,  
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      this.props.navigation.setParams({ animating: false });
      if(responseData.success == true)
      {                
        this.state.edit?null:this.props.navigation.state.params.resetSkuDetected();
        this.state.edit?this.props.navigation.state.params.updateOrder(responseData.order):null;        
        console.log("image length:"+responseData.order.Images.length);
        this.props.navigation.goBack(null);        
      }
      else
      {
        // error message        
        console.log(responseData.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(responseData.message);
      }
    }).done();
  }

  imageEmpty = () => 
  {
    var imageList = this.state.order.Images;
    if(imageList[0].Image == '')
    {
      return true;
    }
    return false;
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
      console.log("imageIndex:"+this.state.imageIndex); 
      console.log("this.state.order.Images.count:"+this.state.order.Images.length);
      if(this.state.order.Images[this.state.imageIndex-1].Image != '')
      {
        this.enlargeImage(this.state.order.Images[this.state.imageIndex-1].Image,true,this.state.imageIndex-1);  
      }           

      console.log("show resize popup");     
    }
  }

  deleteImageIndex = (imageIndex) =>
  {
    console.log('deleteImageIndex:'+imageIndex);
    this.setState({deleteIndex:imageIndex},()=>{this.deleteImage();});    
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

  confirmDeleteOrder = () => 
  {
    this.setState({deleteOrderVisible:true});
  }

  deleteOrder = () => 
  {
    this.setState({deleteOrderVisible:false,deleteLoading:true});
    fetch(this.state.apiPath + 'SAIMOrderDeliveryDelete.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        orderDeliveryID: this.state.orderDeliveryID,
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      
      this.setState({deleteLoading:false});
      if(responseData.success == true)
      {        
        this.props.navigation.state.params.refresh(this.state.orderDeliveryID);    
        this.props.navigation.goBack();
      }
      else
      {
        // error message        
        console.log(responseData.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(responseData.message);
      }
    }).done();
  }

  handleImageLoaded = () => {
    console.log("handleImageLoaded");    
  };

  enlargeImage = (imageUrl,allowDelete,imageIndex) => 
  {
    console.log("imageUrl:"+imageUrl);
    this.props.navigation.navigate('LargeImage',
    {
      imageUrl: imageUrl,   
      allowDelete: allowDelete, 
      deleteIndex: imageIndex,
      deleteImageIndex: this.deleteImageIndex,
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,        
    });  
  }

  render() {
    // console.log("order detail page:"+JSON.stringify(this.state.order));
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
      <ScrollView scrollEnabled={!this.state.enableImageSort}>
        {this.state.loading && 
          (<View style={{marginTop:padding.lg}}>
            <ActivityIndicator animating size='large' />
          </View>)
        }
        {!this.state.loading && 
        (
          <View style={{flex:1}}>  
            <View style={{display:'flex',flexDirection:'row'}}> 
              <Text style={styles.title2}>Order no. {this.state.order.OrderNo}</Text>
              <View style={{flex: 1,alignItems:'flex-end',justifyContent:'center',paddingRight:16}}>
                <Image
                  source={this.state.order.Channel == 1?require('./../assets/images/lazadaIcon.png'):this.state.order.Channel == 2?require('./../assets/images/shopeeIcon.png'):this.state.order.Channel == 3?require('./../assets/images/jdIcon.png'):null}
                  style={styles.imageIconSmall}
                  /> 
              </View>
            </View>
            <Text style={styles.title3}>Date {this.state.order.OrderDate}</Text>
            <FlatList            
            data={this.state.order.Items}
            renderItem={({ item }) => (   
              <View style={{ flex: 1}}>
                <TouchableHighlight 
                  underlayColor={'transparent'} activeOpacity={1}                                         
                  onPress={()=>{this.enlargeImage(item.Image,false,-1)}} > 

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
                    </View>
                  </View>  
                </TouchableHighlight>  
                <View style={styles.separator}/>
              </View>
              
            )}            
            keyExtractor={(item, index) => index}            
            removeClippedSubviews={false}
            keyboardShouldPersistTaps='always'
            />


            <View style={[styles.viewField,{marginBottom:padding.xl}]}>        
              <View style={{display:'flex', flexDirection:'row'}}>
                <Text style={styles.title}>รูป</Text>          
                <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={[styles.button,this.state.enableImageSort?{width:60}:{width:30}]} 
                  onHideUnderlay={()=>this.onHideUnderlay()}
                  onShowUnderlay={()=>this.onShowUnderlay()}                                        
                  onPress={()=>{this.addOrDone()}} >  
                    <View style={{flex:1,justifyContent:'center'}}>       
                      <Text style={
                        this.state.pressStatus
                          ? styles.textPress
                          : styles.text
                        }>{this.state.buttonText}
                      </Text>    
                    </View>           
                </TouchableHighlight>                                                                    
              </View>
              <View style={{marginTop:padding.sm}}>
                <DragSortableView
                  dataSource={this.state.order.Images}
                  parentWidth={dimensions.fullWidth-2*padding.xl}
                  childrenWidth= {72}
                  childrenHeight={72}
                  keyExtractor={(item,index)=> item.Id}
                  onDataChange = {(data)=>{                                    
                    {         
                      console.log("onDataChange");             
                      var order = this.state.order;                                                
                      order.Images = data;
                      if(this.state.imageSortTimeout)
                      {
                        clearTimeout(this.state.imageSortTimeout);  
                      }
                      this.setState({order: order,imageSortTimeout:setTimeout(()=>
                        {
                          this.rearrangeImage();
                        },30000)
                      })                      
                    }
                  }}
                  onClickItem={(data,item,index)=>
                    {      
                      console.log("on onClickItem");            
                      if(this.state.imageSortTimeout)
                      {
                        clearTimeout(this.state.imageSortTimeout);  
                      }
                      this.setState({imageSortTimeout:setTimeout(()=>
                        {
                          this.rearrangeImage();
                        },30000)
                      });

                      if(item.Image != "")
                      {
                        if(this.state.enableImageSort)
                        {
                          this.setState({deleteIndex:index,deleteVisible:true});
                          console.log("show delete dialog");
                        }
                        else
                        {
                          console.log("show action dialog");
                        }
                        
                      }
                      else
                      {
                        console.log("item.Image empty");
                      }
                    }
                  }
                  renderItem={(item,index)=>
                    this.state.enableImageSort?
                    ( 
                      <Animatable.View animation="swing" iterationCount="infinite">
                        <View 
                          style={styles.imageView}                          
                        >
                          <Image 
                            ref={'image'+item.Id}
                            onLoad={this.handleImageLoaded.bind(this)}
                            source={item.Image == ""?require('./../assets/images/blank.gif'):{uri: item.Image}} 
                            style={styles.image}
                          />  
                          {item.Image != '' && (<Image
                            source={require('./../assets/images/delete.png')}
                            style={styles.deleteImageButton}
                            />)
                          }                    
                        </View>
                      </Animatable.View>                  
                    )
                    :
                    (
                      <View
                        style={styles.imageView}
                        onStartShouldSetResponder = {(evt,index)=>this.onStartShouldSetResponder(evt,item.Id)}
                        onResponderRelease = {this.onResponderRelease}
                      >
                        <Image
                              source={item.Image == ""?require('./../assets/images/blank.gif'):{uri: item.Image}}
                              style={styles.image}
                        />
                        {
                          item.Resizing && (<View style={{position:'absolute',top:6+20,left:20}}><ActivityIndicator size="small" animating={true} color='white'/></View>)
                        }
                          
                      </View>                  
                    )
                  }
                />
              </View> 
            </View>
            {this.state.edit && (<View style={[styles.viewField,{marginBottom:padding.xl}]}>
              <TouchableHighlight underlayColor={colors.error} activeOpacity={1} style={styles.deleteButton}
                onHideUnderlay={()=>this.onHideUnderlayDelete()}
                onShowUnderlay={()=>this.onShowUnderlayDelete()}
                onPress={()=>{this.confirmDeleteOrder()}} 
              >
                <View style={{flex:1,justifyContent:'center'}}>
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    <View style={{width:30}}>                    
                    </View>
                    <Text style={
                      this.state.deletePressStatus
                        ? styles.deleteTextPress
                        : styles.deleteText
                      }>Delete
                    </Text>
                    <View style={{width:30}}>
                      {this.state.deleteLoading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            </View>)}
            <Dialog
              visible={this.state.addImageVisible}
              width={0.8}            
              onTouchOutside={() => {
                this.setState({ addImageVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.useCamera()}>
                      <View>
                        <Image source={require('./../assets/images/camera.png')}  style={styles.icon}/>
                        <Text style={styles.iconName}>Camera</Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.chooseFromGallery()}>
                      <View>
                        <Image source={require('./../assets/images/gallery.png')}  style={styles.icon}/>
                        <Text style={styles.iconName}>Gallery</Text>
                      </View>
                    </TouchableHighlight>
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
                    onPress={() => {this.deleteImage()}}
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
                    <Text style={styles.textFail}>ยืนยันลบรูปภาพใช่หรือไม่</Text>
                  </View>            
                }
              </DialogContent>
            </Dialog>

            <Dialog
              visible={this.state.resizeImageVisible}
              width={0.8}
              footer=
              {
                <DialogFooter style={styles.dialogFooter}>
                  <DialogButton
                    text="NO"
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={() => {this.setState({ resizeImageVisible: false })}}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {this.resizeImage()}}
                  />
                </DialogFooter>
              }
              onTouchOutside={() => {
                this.setState({ resizeImageVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.textFail}>ยืนยันลดขนาดรูปภาพใช่หรือไม่</Text>
                  </View>            
                }
              </DialogContent>
            </Dialog>

            <Dialog
              visible={this.state.deleteOrderVisible}
              width={0.8}
              footer=
              {
                <DialogFooter style={styles.dialogFooter}>
                  <DialogButton
                    text="NO"
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={() => {this.setState({ deleteOrderVisible: false })}}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {this.deleteOrder()}}
                  />
                </DialogFooter>
              }
              onTouchOutside={() => {
                this.setState({ deleteOrderVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.textFail}>ยืนยันลบออเดอร์นี้ใช่หรือไม่</Text>
                  </View>            
                }
              </DialogContent>
            </Dialog>

            <Dialog
              visible={this.state.clearFormVisible}
              width={0.8}
              footer=
              {
                <DialogFooter style={styles.dialogFooter}>
                  <DialogButton
                    text="NO"
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={() => {
                      this.clearForm();
                      this.setState({ clearFormVisible: false });
                    }}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {
                      this.saveProduct();
                      this.setState({clearForm:true,clearFormVisible: false});
                    }}
                  />
                </DialogFooter>
              }
              onTouchOutside={() => {
                this.setState({ clearFormVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.textFail}>รายการสินค้ามีการเปลี่ยนแปลง คุณต้องการบันทึกก่อนหรือไม่</Text>
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
        )}
      </ScrollView>
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
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,       
  },    
  viewField:
  {
    marginTop:padding.lg,
    marginLeft:padding.xl,
    marginRight:padding.xl,  
  },
  title: 
  {        
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.secondary,
  },
  subtitle: 
  {        
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',
    color: colors.black,
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
  valueHalf: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
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
  valueMultiline: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xl*2,    
    height: 60,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'top'
  },
  skuValue: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    width: dimensions.fullWidth - padding.xl*2 - 31,    
    height: 30,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  spinnerView:
  {
    width: (dimensions.fullWidth - padding.xl*3)/2,
    alignItems:'center',
    justifyContent:'center',   
  },
  valueQuantity: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
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
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,  
    justifyContent: 'center',    
  }, 
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: colors.white,    
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: colors.primary,    
  },
  textStockSharing: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: colors.white,    
  },
  textPressStockSharing: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: colors.primary,    
  },
  deleteButton: 
  {    
    width: dimensions.fullWidth - 2*padding.xl,    
    height:30,
    borderColor: colors.error,
    backgroundColor:colors.error,
    borderWidth: 1,
    borderRadius: 6,      
  }, 
  deleteText: 
  {       
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",    
  },
  deleteTextPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: "#f0111c",    
  },
  buttonPrint: 
  {
    marginLeft:padding.xl,
    width: (dimensions.fullWidth - padding.xl*3)/2,    
    height:30,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,  
    justifyContent: 'center',    
  },
  textPrint: 
  {   
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    textAlign: "center",    
    color: colors.white,
  },
  textPrintPress: 
  {  
    fontFamily: fonts.primaryBold,   
    fontSize: 16,
    textAlign: "center",
    color: colors.primary,    
  },
  imageStockSharing:
  {
    width:50,
    height:50,
    margin:5,
  },
  imageView:
  {
    width:66,
    height:66,
  },
  image: 
  {
    width:60,
    height:60,
    marginTop:6, 
    borderWidth:1,
    borderColor:'#CCCCCC',     
  },
  icon: 
  {
    width:60,
    height:60,   
    marginTop:40,  
    marginLeft:40,  
    marginRight:40,    
  },
  iconName:
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    color: colors.primary,
    textAlign: 'center',
    paddingTop: padding.lg
  },
  deleteImageButton:
  {
    width:12,
    height:12,   
    top:0,      
    right:0, 
    position:'absolute'   
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
  channelView: 
  {
    marginLeft:10,
    marginRight:15,
    alignItems:'center',
    justifyContent:'center',
  }, 
  channelSkuView: 
  {
    marginLeft:padding.md,
    marginRight:padding.md,
    alignItems:'center',
    justifyContent:'center',
  }, 
  imageIcon: 
  {
    width:30,
    height:30,
    borderRadius:20
  },
  imageIconSmall: 
  {
    width:15,
    height:15,
    borderRadius:7
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
    // textDecorationLine: 'underline',
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
});
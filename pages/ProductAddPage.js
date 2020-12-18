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


export default class ProductAddPage extends React.Component {
  constructor(props) {
    super(props);
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
    var previousMapSku = 
    {
      LazadaSku:"",
      ShopeeSku:"",
      JdSku:"",
      WebSku:""
    }
    var previousItem = {
      Brand:"",
      Name:"",
      Sku:"",
      Quantity:"",
      Price:"",     
      Cost:"",
      Remark:"", 
      Image:previousImageList, 
      AnimatingLazada:false,
      AnimatingShopee:false,
      AnimatingJd:false,      
      AnimatingWeb:false,  
      MapSku:previousMapSku,     
    };

    var edit = false;
    var loading = false;
    var sku = "";    
    if(this.props.navigation.state.params.edit)
    {
      edit = true;
      loading = true;
      sku = this.props.navigation.state.params.sku;
    }

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,    
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      searchTextFromProductListPage: this.props.navigation.state.params.searchTextFromProductListPage,  
      edit: edit, 
      loading: loading,
      sku: sku,      
      item:item,    
      previousItem:previousItem,
      printEnabled:false,
      addImageVisible:false, 
      buttonText:"+",
      longPressTimeout:0,
      imageSortTimeout:0,
      brands:[],
    };

    console.log("searchTextFromProductListPage:"+this.state.searchTextFromProductListPage);
  }
  
  componentDidMount()
  {    
    this.props.navigation.setParams({ handleSave: this.saveProduct });
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
        menuCode: 'PRODUCT_ADD',   
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
    console.log("fetchData product detail");
    if(this.state.edit)
    {      
      const url =  this.state.apiPath + 'SAIMMainProductDetailGet3.php';
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
          sku:this.state.sku, 
          storeName: this.state.storeName,
          modifiedUser: this.state.modifiedUser,
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
          printEnabled: true,
        });

        console.log("item:"+JSON.stringify(this.state.item));
      })
      .catch(error => {
        this.setState({ error, loading: false });
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

    // console.log(JSON.stringify(this.state.item.Image));
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
    if(this.state.item.Image[7].Image == "")
    {
      console.log("image index 7 empty");      
      this.setState({addImageVisible:true});
    }
    else
    {
      console.log("สามารถใส่รูปได้สูงสุด 8 รูป");       
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
      height: 720,
      // height: 1280,
      // cropping: true,
    }).then(image => {
      console.log(image);

      this.setImage(image);
    });
  }

  setImage = (image) => 
  {
    var item = this.state.item;
    var imageList = item.Image;
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
    
    item.Image = imageList;
    this.setState({item:item,addImageVisible:false}) 
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

  saveProduct = () => 
  {
    console.log("save product");    
    this.props.navigation.setParams({ animating: true });

    var insert = false;
    if(!this.state.edit)
    {
      var previousItem = this.state.previousItem;
      var item = this.state.item;
      insert = true;
      if(previousItem.Sku == item.Sku)
      {
        insert = false;
      }  
    }

        

    fetch(this.state.apiPath + 'SAIMMainProductInsert2.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        item: this.state.item,    
        insert: insert,    
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
      this.props.navigation.setParams({ animating: false });
      if(responseData.success == true)
      {
        //case update 
        if(responseData.product)
        {
          var item = this.state.item;
          console.log("WebSku:"+responseData.product.WebExist);
          item.LazadaExist = responseData.product.LazadaExist;
          item.ShopeeExist = responseData.product.ShopeeExist;
          item.JdExist = responseData.product.JdExist;
          item.WebExist = responseData.product.WebExist;
          this.setState({item:item});
        }
        else
        {
          console.log("responseData.product is null");
        }

        //set previous item
        this.setPreviousItem();

        if(this.state.clearForm)
        {
          this.clearForm();
          this.setState({clearForm:false});
        }

        this.props.navigation.setParams({ savedOrSynced: true });
        this.props.navigation.setParams({ product: this.state.item });
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

  showProductQR = () => 
  {
    console.log("show product qr");

    //validate
    if(this.state.item.Brand == '' || this.state.item.Sku == '')
    {
      this.setState({alertStatus:false});
      this.showAlertMessage('กรุณาใส่ชื่อแบรนด์ และ Sku');
      return;
    }

    console.log("quantity:"+this.state.item.Quantity);
    this.props.navigation.navigate('PrintProductQR',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,  
      'brand': this.state.item.Brand,
      'sku': this.state.item.Sku,
      'quantity': this.state.item.Quantity,
      
    });    
  }

  imageEmpty = () => 
  {
    var imageList = this.state.item.Image;
    if(imageList[0].Image == '')
    {
      return true;
    }
    return false;
  }

  onStartShouldSetResponder = (evt,index) => 
  {
    console.log("onStartShouldSetResponder:"+index);
    // if(this.state.enableImageSort)
    // {
    //   return false;
    // }    
     
    this.setState({imageIndex:index});
    this.setState({longPressTimeout:setTimeout(()=>
      {
        if(!this.imageEmpty())
        {

          this.setState({enableImageSort:true,buttonText:"Done",imageSortTimeout:setTimeout(()=>
            {
              // this.addImage();              
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
      console.log("show resize popup");     
    }
  }

  resizeImage = () => 
  {
    var item = this.state.item;    
    var imageList = this.state.item.Image;        
    imageList[this.state.imageIndex-1].Resizing = true;
    item.Image = imageList;
    this.setState({item:item,resizeImageVisible:false});

    const url =  this.state.apiPath + 'SAIMMainProductImageResizeUpdate.php';
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        sku:this.state.sku, 
        index:this.state.imageIndex, 
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
        //set image with new path  
        var item = this.state.item;    
        var imageList = this.state.item.Image;        
        imageList[this.state.imageIndex-1].Image = res.imageUrl;
        imageList[this.state.imageIndex-1].Resizing = false;
        item.Image = imageList;
        this.setState({item:item});
      }
      else
      {
        // error message        
        console.log(res.message);
        this.setState({alertStatus:0});
        this.showAlertMessage(res.message);
      }
    })
    .done();
  }

  deleteImage = () => 
  {
    var imageList = this.state.item.Image;

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

    var item = this.state.item;
    item.Image = newImageList;

    this.setState({item:item,deleteVisible:false});
  }

  onBrandChanged = (text) => 
  {
    var item = this.state.item;
    item.Brand = text;
    this.setState({item:item});

    console.log("state.item.Brand:"+this.state.item.Brand);
    console.log("state.previousItem.Brand:"+this.state.previousItem.Brand);


    //fetch to show for autocomplete
    if(text.trim() === '')
    {
      this.setState({brands:[],hideResults:true});
      return;
    }
    const url =  this.state.apiPath + 'SAIMBrandSearchGetList.php';
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        searchText:this.state.item.Brand, 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      var hideResults = true;
      if(res.brands.length > 0)
      {
        hideResults = false;
      }
      this.setState({
        brands: res.brands,
        hideResults: hideResults,
        error: res.error || null,        
      });

      console.log("brands:"+JSON.stringify(this.state.brands));
    })
    .catch(error => {
      this.setState({ error,hideResults:true });
    });

  }

  onSelectAutoCompleteList = (brand) => 
  {
    console.log("onSelectAutoCompleteList:"+brand);
    var item = this.state.item;
    item.Brand = brand;
    this.setState({item:item,hideResults:true});
  }

  onSkuChanged = (text) => 
  {
    var item = this.state.item;
    item.Sku = text;
    this.setState({item:item});
  }

  onLazadaSkuChanged = (text) => 
  {
    var item = this.state.item;
    item.MapSku.LazadaSku = text;
    this.setState({item:item});
  }

  onShopeeSkuChanged = (text) => 
  {
    var item = this.state.item;
    item.MapSku.ShopeeSku = text;
    this.setState({item:item});
  }

  onJdSkuChanged = (text) => 
  {
    var item = this.state.item;
    item.MapSku.JdSku = text;
    this.setState({item:item});
  }

  onWebSkuChanged = (text) => 
  {
    var item = this.state.item;
    item.MapSku.WebSku = text;
    this.setState({item:item});
  }

  onQuantityChanged = (text) => 
  {
    if (/^\d+$/.test(text)) {      
      var item = this.state.item;
      item.Quantity = text;
      this.setState({item:item});
      console.log("quantity changed:"+this.state.item.Quantity);
    }    
  }

  onPriceChanged = (text) => 
  {
    var item = this.state.item;
    item.Price = text.replace(/[^(((\d)+(\.)\d)|((\d)+))]/g,'_').split("_")[0];
    this.setState({item:item});     
  }

  onCostChanged = (text) => 
  {
    var item = this.state.item;
    item.Cost = text.replace(/[^(((\d)+(\.)\d)|((\d)+))]/g,'_').split("_")[0];
    this.setState({item:item});
  }

  onRemarkChanged = (text) => 
  {
    var item = this.state.item;
    item.Remark = text;
    this.setState({item:item});
  }

  onNameChanged = (text) => 
  {
    var item = this.state.item;
    item.Name = text;
    this.setState({item:item});
  }

  confirmDeleteProduct = () => 
  {
    this.setState({deleteProductVisible:true});
  }

  deleteProduct = () => 
  {
    this.setState({deleteProductVisible:false,deleteLoading:true});
    fetch(this.state.apiPath + 'SAIMMainProductDelete2.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        sku: this.state.sku,
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
      
      this.setState({deleteLoading:false});
      if(responseData.success == true)
      {
        var item = this.state.item;
        item.Deleted = true;
        this.setState({item:item},()=>
          {
            this.props.navigation.state.params.refresh(this.state.item);    
            this.props.navigation.goBack();
          });        
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

  updateMarketplaceProduct = (marketplace) => 
  {
    return; //ไม่ให้ update    
    if(marketplace == 1)
    {
      //update field จากแอป
      var insert = false;
      this.setState({AnimatingLazada:true});
      
      fetch(this.state.apiPath + 'SAIMLazadaProductInsert2.php',
      {
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({  
          sku: this.state.item.Sku,    
          insert: insert,    
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
        this.setState({AnimatingLazada:false});

        
        if(responseData.success == true)
        {
          
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
    else if(marketplace == 2)
    {
      //update field ด้วย lazada (เหมือนของ insert)
      var insert = false;
      this.setState({AnimatingShopee:true});
      
      fetch(this.state.apiPath + 'SAIMShopeeProductInsert2.php',
      {
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({  
          sku: this.state.item.Sku,    
          insert: insert,    
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
        this.setState({AnimatingShopee:false});

        
        if(responseData.success == true)
        {
          
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
    else if(marketplace == 3)
    {
      //update field ด้วย lazada (เหมือนของ insert)
    }
  }

  insertMarketplaceProduct = (marketplace) => 
  {
    var item = this.state.item;
    var imageList = this.state.item.Image;
    for(var i=0; i<imageList.count; i++)
    {
      if(imageList[i].Resizing)
      {
        this.setState({alertStatus:false});
        this.showAlertMessage("ไม่สามารถเพิ่มสินค้าตอนนี้ ให้ลดขนาดภาพเสริ็จสิ้นก่อน");
        return;
      }
    }



    if(marketplace == 1)
    {
      this.setState({alertStatus:false});
      this.showAlertMessage("ไม่สามารถเพิ่มสินค้าใน Lazada\nให้เพิ่มในแพลตฟอร์มของ Lazada");
    }
    else if(marketplace == 2)
    {
      if(!this.state.item.LazadaExist)
      {
        this.setState({alertStatus:false});
        this.showAlertMessage("ไม่สามารถเพิ่มสินค้านี้ใน Shopee\nให้เพิ่มสินค้านี้ในแพลตฟอร์ม Lazada ก่อน");
      }
      else
      {
        var insert = true;
        this.setState({AnimatingShopee:true});
        fetch(this.state.apiPath + 'SAIMShopeeProductInsert2.php',
        {
          method: 'POST',
          headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
          body: JSON.stringify({  
            sku: this.state.item.Sku,    
            insert: insert,    
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
          this.setState({AnimatingShopee:false});

          
          if(responseData.success == true)
          {
            var item = this.state.item;
            item.ShopeeExist = 1;
            this.props.navigation.setParams({ savedOrSynced: true });
            this.props.navigation.setParams({ product: this.state.item });
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
    }
    else if(marketplace == 3)
    {
      if(!this.state.item.LazadaExist)
      {
        this.setState({alertStatus:false});
        this.showAlertMessage("ไม่สามารถเพิ่มสินค้านี้ใน JD\nให้เพิ่มสินค้านี้ในแพลตฟอร์ม Lazada ก่อน");
      }
      else
      {
        var insert = true;
        this.setState({AnimatingJd:true});
        fetch(this.state.apiPath + 'SAIMJdProductInsert.php',
        {
          method: 'POST',
          headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
          body: JSON.stringify({  
            sku: this.state.item.Sku,    
            insert: insert,    
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
          this.setState({AnimatingJd:false});

          
          if(responseData.success == true)
          {
            var item = this.state.item;
            item.JdExist = 1;
            this.props.navigation.setParams({ savedOrSynced: true });
            this.props.navigation.setParams({ product: this.state.item });
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
    }
    else if(marketplace == 4)
    {
      if(!this.state.item.LazadaExist)
      {
        this.setState({alertStatus:false});
        this.showAlertMessage("ไม่สามารถเพิ่มสินค้านี้ใน Web\nให้เพิ่มสินค้านี้ในแพลตฟอร์ม Lazada ก่อน");
      }
      else
      {
        var insert = true;
        this.setState({AnimatingWeb:true});
        fetch(this.state.apiPath + 'SAIMWebProductInsert.php',
        {
          method: 'POST',
          headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
          body: JSON.stringify({  
            sku: this.state.item.Sku,    
            insert: insert,    
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
          this.setState({AnimatingWeb:false});

          
          if(responseData.success == true)
          {
            var item = this.state.item;
            item.WebExist = 1;
            this.props.navigation.setParams({ savedOrSynced: true });
            this.props.navigation.setParams({ product: this.state.item });
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
    }
  }

  editStockSharing = () =>
  {
    this.props.navigation.navigate('StockSharingList',
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,        
      'sku': this.state.item.Sku,  
      skuImage: this.state.item.Image[0].Image,
      searchTextFromProductListPage:this.state.searchTextFromProductListPage,
      refresh: this.fetchData,         
    });  
  }

  render() {
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
            <View style={[styles.viewField,{height:55}]}>        
              <Text style={styles.title}>ชื่อแบรนด์ *</Text>              
              <View style={{flex:1}}>
                <Autocomplete
                  hideResults={this.state.hideResults}
                  autoCapitalize="none"
                  autoCorrect={false}
                  listStyle={{marginLeft:0,marginRight:0}}
                  inputContainerStyle={{borderWidth:0}}
                  containerStyle={styles.autocompleteContainer}                  
                  data={this.state.brands.length === 1 && comp(this.state.item.Brand, this.state.brands[0].Brand) ? [] : this.state.brands}
                  defaultValue={this.state.item.Brand}
                  onChangeText={(text) => {this.onBrandChanged(text)}}
                  placeholder=" Ex. Fender"
                  keyExtractor={(item) => item.Brand}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {this.onSelectAutoCompleteList(item.Brand)}}>
                      <Text style={[styles.title,{color:colors.tertiary}]}>
                        {item.Brand}
                      </Text>
                    </TouchableOpacity>
                  )}
                  renderTextInput = {()=>(<TextInput style={styles.value} value={this.state.item.Brand} placeholder=' Ex. Fender' onChangeText={(text) => {this.onBrandChanged(text)}}/>)  }
                />
              </View> 
            </View>        
            <View style={styles.viewField}>        
              <Text style={styles.title}>Sku *</Text>
              <TextInput style={styles.value} value={this.state.item.Sku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={(text) => {this.onSkuChanged(text)}}/>  
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>จำนวน</Text>
              <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <View style={styles.spinnerView}>
                  <InputSpinner
                    min={0}
                    step={1}
                    color={colors.primary}
                    
                    
                    inputStyle={{color:colors.tertiary}}
                    buttonStyle={{height:30,fontSize:16,fontFamily:fonts.primaryBold}}                                                                   
                    style={{backgroundColor:'white',height:30,width: (dimensions.fullWidth - padding.xl*3)/2,alignItems:'center',justifyContent:'center'}}
                    
                    
                    rounded={false}
                    showBorder={true}
                    value={this.state.item.Quantity}
                    onChange={(text) => {this.onQuantityChanged(text)}}
                  /> 
                </View>              
                <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.buttonPrint} disabled={!this.state.printEnabled}
                  onHideUnderlay={()=>this.onHideUnderlayPrint()}
                  onShowUnderlay={()=>this.onShowUnderlayPrint()}                                        
                  onPress={()=>{this.showProductQR()}} >    
                    <View style={{flex:1,justifyContent:'center'}}>     
                      <Text style={
                        this.state.printPressStatus
                          ? styles.textPrintPress
                          : styles.textPrint
                        }>Print QR
                      </Text>  
                    </View>             
                </TouchableHighlight>
              </View>
            </View> 
            {
              this.state.edit && (<View style={[styles.viewField]}>  
                <Text style={styles.title}>สถานะสินค้าใน Marketplace</Text>      
                <View style={{display:'flex',flexDirection:'row'}}>   
                  <View style={styles.channelView}>                      
                    {!this.state.AnimatingLazada && <TouchableHighlight 
                      underlayColor={'transparent'} activeOpacity={1}                                           
                      onPress={()=>{this.state.item.LazadaExist==1?this.updateMarketplaceProduct(1):null}} >         
                        <Image source={this.state.item.LazadaExist==1?require('./../assets/images/lazadaIcon.png'):require('./../assets/images/lazadaIconGray.png')}  style={styles.imageIcon}/>
                    </TouchableHighlight>
                    }
                    {this.state.AnimatingLazada && <ActivityIndicator size="small" animating={true} color='#0d0a94'/>}
                  </View>
                  <View style={styles.channelView}>
                    {!this.state.AnimatingShopee && <TouchableHighlight 
                      underlayColor={'transparent'} activeOpacity={1}                                           
                      onPress={()=>{this.state.item.ShopeeExist==1?this.updateMarketplaceProduct(2):this.insertMarketplaceProduct(2)}} >         
                        <Image source={this.state.item.ShopeeExist==1?require('./../assets/images/shopeeIcon.png'):require('./../assets/images/shopeeIconGray.png')}  style={styles.imageIcon}/>
                    </TouchableHighlight>
                    }
                    {this.state.AnimatingShopee && <ActivityIndicator size="small" animating={true} color='#ea501f'/>}
                  </View>
                  <View style={styles.channelView}>
                    {!this.state.AnimatingJd && <TouchableHighlight 
                      underlayColor={'transparent'} activeOpacity={1}                                          
                      onPress={()=>{this.state.item.JdExist==1?this.updateMarketplaceProduct(3):this.insertMarketplaceProduct(3)}} >         
                        <Image source={this.state.item.JdExist==1?require('./../assets/images/jdIcon.png'):require('./../assets/images/jdIconGray.png')}  style={styles.imageIcon}/>
                    </TouchableHighlight>
                    }
                    {this.state.AnimatingJd && <ActivityIndicator size="small" animating={true} color='#df2524'/>}
                  </View>
                  <View style={styles.channelView}>
                    {!this.state.AnimatingWeb && <TouchableHighlight 
                      underlayColor={'transparent'} activeOpacity={1}                                          
                      onPress={()=>{this.state.item.WebExist==1?this.updateMarketplaceProduct(4):this.insertMarketplaceProduct(4)}} >         
                        <Image source={this.state.item.WebExist==1?require('./../assets/images/webIcon.png'):require('./../assets/images/webIconGray.png')}  style={styles.imageIcon}/>
                    </TouchableHighlight>
                    }
                    {this.state.AnimatingWeb && <ActivityIndicator size="small" animating={true} color={colors.primary}/>}
                  </View>                                            
                </View>
              </View>
            )}
            {
              this.state.edit && (<View style={[styles.viewField]}>  
                <Text style={styles.title}>Marketplace sku</Text>      
                <View style={{display:'flex',flexDirection:'row'}}>   
                  <View style={styles.channelSkuView}>                      
                    <Image source={require('./../assets/images/lazadaIcon.png')} style={styles.imageIconSmall}/>
                  </View>
                  <TextInput style={styles.skuValue} value={this.state.item.MapSku.LazadaSku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={(text) => {this.onLazadaSkuChanged(text)}}/>                                            
                </View>
                <View style={{display:'flex',flexDirection:'row'}}>   
                  <View style={styles.channelSkuView}>                      
                    <Image source={require('./../assets/images/shopeeIcon.png')} style={styles.imageIconSmall}/>
                  </View>
                  <TextInput style={styles.skuValue} value={this.state.item.MapSku.ShopeeSku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={(text) => {this.onShopeeSkuChanged(text)}}/>                                            
                </View>
                <View style={{display:'flex',flexDirection:'row'}}>   
                  <View style={styles.channelSkuView}>                      
                    <Image source={require('./../assets/images/jdIcon.png')} style={styles.imageIconSmall}/>
                  </View>
                  <TextInput style={styles.skuValue} value={this.state.item.MapSku.JdSku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={(text) => {this.onJdSkuChanged(text)}}/>                                                              
                </View>
                <View style={{display:'flex',flexDirection:'row'}}>   
                  <View style={styles.channelSkuView}>                      
                    <Image source={require('./../assets/images/webIcon.png')} style={styles.imageIconSmall}/>
                  </View>
                  <TextInput style={styles.skuValue} value={this.state.item.MapSku.WebSku} placeholder=' Ex. Fender-Mustang-LT50' onChangeText={(text) => {this.onWebSkuChanged(text)}}/>                                            
                </View>
              </View>
            )}
            <View style={{display:'flex',flexDirection:'row'}}>
              <View style={styles.viewField}>        
                <Text style={styles.title}>ราคาขาย</Text>
                <TextInput style={styles.valueHalf} value={this.state.item.Price} keyboardType = 'decimal-pad' placeholder=' ' onChangeText={(text) => {this.onPriceChanged(text)}}/>                
              </View>
              <View style={[styles.viewField,{marginLeft:0}]}>        
                <Text style={styles.title}>ราคาทุน</Text>
                <TextInput style={styles.valueHalf} value={this.state.item.Cost} keyboardType = 'decimal-pad' placeholder=' ' onChangeText={(text) => {this.onCostChanged(text)}}/> 
              </View>
            </View>
            <View style={styles.viewField}>              
              <View style={{display:'flex', flexDirection:'row'}}>
                <Text style={styles.title}>Stock sharing</Text>          
                <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={[styles.button,{width:45}]} 
                  onHideUnderlay={()=>this.onHideUnderlayStockSharing()}
                  onShowUnderlay={()=>this.onShowUnderlayStockSharing()}                                        
                  onPress={()=>{this.editStockSharing()}} >  
                    <View style={{flex:1,justifyContent:'center'}}>       
                      <Text style={
                        this.state.pressStatusStockSharing
                          ? styles.textPressStockSharing
                          : styles.textStockSharing
                        }>Edit
                      </Text>    
                    </View>           
                </TouchableHighlight>                                                                    
              </View>
              {this.state.item.StockSharingList && (this.state.item.StockSharingList.length == 0) && <Text style={styles.subtitle}>-</Text>}
              {this.state.item.StockSharingList && (this.state.item.StockSharingList.length > 0) && <FlatList          
                data={this.state.item.StockSharingList}
                renderItem={({ item }) => ( 
                  <View style={{display:'flex',flexDirection:'row'}}>
                    <Image
                      source={{uri: item.MainImage}}
                      style={styles.imageStockSharing}
                    />
                    <Text style={[styles.subtitle]}>{item.Sku}</Text>
                  </View>
                )}          
                keyExtractor={(item, index) => index}          
              />}
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>หมายเหตุ</Text>
              <TextInput style={styles.valueMultiline} value={this.state.item.Remark} placeholder=' ' multiline onChangeText={(text) => {this.onRemarkChanged(text)}}/>                
            </View> 
            <View style={styles.viewField}>        
              <Text style={styles.title}>ชื่อสินค้า</Text>
              <TextInput style={styles.valueMultiline} value={this.state.item.Name} placeholder=' ' multiline onChangeText={(text) => {this.onNameChanged(text)}}/>                
            </View>           
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
                  dataSource={this.state.item.Image}
                  parentWidth={dimensions.fullWidth-2*padding.xl}
                  childrenWidth= {72}
                  childrenHeight={72}
                  keyExtractor={(item,index)=> item.Id}
                  onDataChange = {(data)=>{                                    
                    {                      
                      var item = this.state.item;                                                
                      item.Image = data;
                      if(this.state.imageSortTimeout)
                      {
                        clearTimeout(this.state.imageSortTimeout);  
                      }
                      this.setState({item: item,imageSortTimeout:setTimeout(()=>
                        {
                          // this.addImage();
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
                          // this.addImage();
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
                onPress={()=>{this.confirmDeleteProduct()}} 
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
              visible={this.state.deleteProductVisible}
              width={0.8}
              footer=
              {
                <DialogFooter style={styles.dialogFooter}>
                  <DialogButton
                    text="NO"
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={() => {this.setState({ deleteProductVisible: false })}}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {this.deleteProduct()}}
                  />
                </DialogFooter>
              }
              onTouchOutside={() => {
                this.setState({ deleteProductVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.textFail}>ยืนยันลบสินค้าใช่หรือไม่</Text>
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
});
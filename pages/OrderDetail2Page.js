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
import {colors, fonts, padding, dimensions, settings} from './../styles/base.js'; 
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image'


let statusList = [
        {label: 'รับคืน', value: 0, selected: true},
        {label: 'ส่งแล้ว', value: 1, selected: false},
        {label: 'เสร็จ', value: 2, selected: false},
    ];

export default class OrderDetail2Page extends React.Component {
  

  constructor(props) 
  {
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


    var previousMapSku = 
    {
      LazadaSku:"",
      ShopeeSku:"",
      JdSku:"",
      WebSku:""
    }


    var edit = false;
    var loading = false;
    var sku = "";    
    if(this.props.navigation.state.params.edit)
    {
      edit = true;
      loading = true;
    }

    console.log("order test before:"+JSON.stringify(order));
    var newForm = this.props.navigation.state.params.newForm;
    var productName = this.props.navigation.state.params.productName;
    var productSelected = this.props.navigation.state.params.productSelected;
    var channel = this.props.navigation.state.params.channel;
    if(newForm)
    {
      order['Items'] = [{
        Name:productName == ''?productSelected.Name:productName,
        Sku:productName == ''?productSelected.Sku:'',
        Quantity:1,
        Image:productName == ''?productSelected.MainImage:'',
        AccImages:productName == ''?productSelected.AccImages:[],
      }];
      order['Channel'] = channel;
    }

    console.log("order test newForm:"+JSON.stringify(order));

    this.state = {
      
      modifiedUser: this.props.navigation.state.params.modifiedUser, 
      channel: this.props.navigation.state.params.channel,
      orderNo: edit?null:this.props.navigation.state.params.orderNo,
      productReturnID: edit?this.props.navigation.state.params.productReturnID:null,
      edit: this.props.navigation.state.params.edit,
      order: this.props.navigation.state.params.edit || newForm?order:this.props.navigation.state.params.order,
      
      newForm: this.props.navigation.state.params.newForm,
      
      loading: loading,
      
      addImageVisible:false, 
      buttonText:"+",
      longPressTimeout:0,
      imageSortTimeout:0,      
      data:[],
      defectReason:'',
      customerAddress:'',
      customerAddressImage:'',
      chooseFirst:false,
      chooseSecond:false,
      chooseNextStepFirst:false,
      chooseNextStepSecond:false,
      chooseProductClaimFirst:false,
      chooseProductClaimSecond:false,
      status:0,

      nextStepProcess:false,      
    };


    this.setStatus(0); 
  }
  
  componentDidMount()
  {    
    this.props.navigation.setParams({ handleSave: this.saveProductReturn });
    this.props.navigation.setParams({ animating: false });
    this.props.navigation.setParams({ savedOrSynced: false });
    this.props.navigation.setParams({ edit: true });
    this.props.navigation.setParams({ newForm: this.state.newForm });
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
    console.log("fetchData OrderDetail");
    if(this.state.edit)
    {
      const url =  settings.apiPath + 'SAIMProductReturnGet.php';
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
          productReturnID:this.state.productReturnID, 
          storeName: settings.storeName,
          modifiedUser: this.state.modifiedUser,
          modifiedDate: new Date().toLocaleString(),
          platForm: Platform.OS,
        })
      })
      .then(res => res.json())
      .then(res => {
        console.log("orderdetail get1 : "+JSON.stringify(res));
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

          this.chooseProductCondition(res.Order.Condition);
          this.setDefectReason(res.Order.DefectReason);
          this.chooseNextStep(res.Order.NextStep);
          this.chooseProductClaim(res.Order.ProductClaim);
          this.setClaimAt(res.Order.ClaimAt);
          this.setClaimNote(res.Order.ClaimNote);
          this.setCustomerAddress(res.Order.CustomerAddress);
          this.setCustomerAddressImage(res.Order.CustomerAddressImage);
          this.setClaimStaffName(res.Order.ClaimStaffName);
          this.setClaimStaffImage(res.Order.ClaimStaffImage);
          this.setClaimDate(res.Order.ClaimDate);
          this.setProductBack(res.Order.ProductBack);
          this.setStatus(res.Order.Status);   

          console.log("order test:"+JSON.stringify(res.Order));
          if(res.Order.Status == 0 && res.Order.NextStep == 0)
          {
            this.setState({nextStepProcess:true},()=>console.log("nextStepProcess:"+this.state.nextStepProcess));
          }
          console.log("nextStepProcess:"+this.state.nextStepProcess);
          this.setState({  
            previousOrder:JSON.parse(JSON.stringify(res.Order)), 
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
      this.addImage("productReturn");
    }
  }

  addImage = (type) => 
  {    
    console.log("add image");
    if(type == "productReturn")
    {
      if(this.state.order.Images[7].Image == "")
      {
        console.log("image index 7 empty");      
        this.setState({addImageVisible:true,type:type});
      }
      else
      {
        console.log("สามารถใส่รูปได้สูงสุด 8 รูป");       
      }  
    }
    else if(type == "customerAddress")
    {
      console.log("this.state.CustomerAddressImage: "+this.state.customerAddressImage);
      if(this.state.customerAddressImage == "")
      {
        console.log("CustomerAddressImage empty");      
        this.setState({addImageVisible:true,type:type});
      }
      else
      {
        //enlarge image
        console.log("enlarge image");   
        this.setState({type:type});    
        this.enlargeImage(this.state.customerAddressImage,true,0);  
      }  
    }
    else if(type == "claimStaff")
    {
      console.log("this.state.claimStaff: "+this.state.claimStaff);
      if(this.state.claimStaffImage == "")
      {
        console.log("claimStaffImage empty");      
        this.setState({addImageVisible:true,type:type});
      }
      else
      {
        //enlarge image
        console.log("enlarge image");   
        this.setState({type:type});    
        this.enlargeImage(this.state.claimStaffImage,true,0);  
      }  
    }
  }


  chooseFromGallery = () => 
  {
    ImagePicker.openPicker({
      includeBase64: true,
      compressImageQuality: 0.8 
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
      compressImageQuality: 0.8
      // cropping: true,
    }).then(image => {
      console.log(image);

      this.setImage(image);
    });
  }

  setImage = (image) => 
  {    
    var type = this.state.type;
    // console.log("setImage type:"+type);
    if(type == "productReturn")
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
          // console.log("imagePath:"+imageList[i].Image);
          break;
        }
      }
      
      order.Images = imageList;
      this.setState({order:order,addImageVisible:false}) 
    }
    else if(type == "customerAddress")
    {
      console.log("image.path: "+image.path);
      var order = this.state.order;
      
      order.CustomerAddressImage = image.path;
      order.CustomerAddressImageBase64 = image.data;
      order.CustomerAddressImageType = image.mime.split("/")[1];
      this.setState({order:order,addImageVisible:false,customerAddressImage:image.path});
    }
    else if(type == "claimStaff")
    {
      console.log("image.path: "+image.path);
      var order = this.state.order;
      
      order.ClaimStaffImage = image.path;
      order.ClaimStaffImageBase64 = image.data;
      order.ClaimStaffImageType = image.mime.split("/")[1];
      this.setState({order:order,addImageVisible:false,claimStaffImage:image.path});
    }

    
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

  onHideUnderlaySave = () => 
  {
    this.setState({ savePressStatus: false });
  }

  onShowUnderlaySave = () => 
  {
    this.setState({ savePressStatus: true });
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  saveProductReturn = () => 
  {
    console.log("save order");  
    // if(this.state.edit && this.state.order.Status == 0)
    // {
    //   if(!this.state.chooseNextStepFirst && !this.state.chooseNextStepSecond)
    //   {
    //     this.showAlertMessage("กรุณาเลือกขั้นตอนถัดไป");
    //     return;
    //   } 
    // }

    


    if(!this.state.edit)
    {
      if(this.state.order.Images[0].Image == "")
      {
        this.showAlertMessage("กรุณาใส่รูปภาพสินค้าคืน");
        return;
      }

      if(!this.state.chooseFirst && !this.state.chooseSecond)
      {
        this.showAlertMessage("กรุณาเลือกสภาพสินค้าคืน");
        return;
      }

      console.log("this.state.order.Condition:"+this.state.order.Condition);
      if(this.state.order.Condition == 1 && this.state.defectReason == '')
      {
        this.showAlertMessage("กรุณาระบุความเสียหาย");
        return;
      }
    }
    else
    {
      var changeImage = false;
      for(var i=0; i<this.state.order.Images.length; i++)
      {
        if(this.state.order.Images[i].Image != this.state.previousImageList[i].Image)         
        {
          changeImage = true;
          break;
        }
      }

      
      // if(this.state.order.Condition != this.state.previousOrder.Condition || 
      //   this.state.order.DefectReason != this.state.previousOrder.DefectReason || 
      //   this.state.order.NextStep != this.state.previousOrder.NextStep || 
      //   this.state.order.ProductClaim != this.state.previousOrder.ProductClaim || 
      //   this.state.order.ClaimAt != this.state.previousOrder.ClaimAt || 
      //   this.state.order.ClaimNote != this.state.previousOrder.ClaimNote || 
      //   this.state.order.CustomerAddress != this.state.previousOrder.CustomerAddress || 
      //   this.state.order.CustomerAddressImage != this.state.previousOrder.CustomerAddressImage || 
      //   this.state.order.Status != this.state.previousOrder.Status)
      // {
      //   changeData = true;
      // }

      // if(this.state.status == 0 && !this.state.nextStepProcess && this.state.order.NextStep != 0)
      // {
      //   changeData = true;
      // }

      // if(this.state.status == 1 && this.state.order.ProductClaim != 0)
      // {
      //   changeData = true; 
      // }
      // console.log("changeData: "+changeData);

      // if(!changeData)
      // {
      //   this.props.navigation.state.params.resetSkuDetected();
      //   this.props.navigation.goBack(null);   
      //   return;
      // }
      var nextStepProcess;
      var productClaimChange = false;
      if(!changeImage && (this.state.order.Condition == this.state.previousOrder.Condition) && (this.state.order.DefectReason == this.state.previousOrder.DefectReason) && (this.state.order.CustomerAddress == this.state.previousOrder.CustomerAddress) && (this.state.order.CustomerAddressImage == this.state.previousOrder.CustomerAddressImage))
      {
        if(this.state.status == 0 && !this.state.chooseNextStepFirst && !this.state.chooseNextStepSecond)
        {
          this.showAlertMessage("กรุณาเลือกขั้นตอนถัดไป");
          return;
        }

        if(this.state.status == 0 && this.state.chooseNextStepSecond && !this.state.chooseProductClaimFirst && !this.state.chooseProductClaimSecond)
        {
          this.showAlertMessage("กรุณาเลือกประเภทการคืนสินค้าเคลม");
          return;
        }


        if((this.state.order.NextStep == this.state.previousOrder.NextStep) && (this.state.order.ClaimAt == this.state.previousOrder.ClaimAt) && (this.state.order.ClaimNote == this.state.previousOrder.ClaimNote))
        {
          // if(this.state.status == 0 && !this.state.nextStepProcess && this.state.chooseNextStepSecond && !this.state.chooseProductClaimFirst && !this.state.chooseProductClaimSecond)
          // {
          //   this.showAlertMessage("กรุณาเลือกประเภทการคืนสินค้าเคลม");
          //   return;
          // }

          if(this.state.status == 0 && !this.state.nextStepProcess && this.state.chooseNextStepSecond && this.state.claimStaffName == "" && this.state.claimStaffImage == "")
          {
            this.showAlertMessage("กรุณาระบุผู้รับของเคลม");
            return;
          }
        }
        else
        {
          console.log("set nextStepProcess to true");
          this.setState({nextStepProcess:true});
          nextStepProcess = true;
        }


        if((this.state.order.ProductClaim == this.state.previousOrder.ProductClaim) && (this.state.order.ClaimStaffName == this.state.previousOrder.ClaimStaffName) && (this.state.order.ClaimStaffImage == this.state.previousOrder.ClaimStaffImage))
        {

        }
        else
        {
          productClaimChange = true;
        }

        // if(this.state.status == 0 && this.state.customerAddress == "" && this.state.customerAddressImage == "")
        // {
        //   this.showAlertMessage("กรุณาระบุชื่อ-ที่อยู่ลูกค้า");
        //   return;
        // }


        
      }
      else
      {
        if(this.state.order.Images.length == 0)
        {
          this.showAlertMessage("กรุณาใส่รูปภาพสินค้าคืน");
          return; 
        }  
      }            
    }


    
    this.props.navigation.setParams({ animating: true });
    this.setState({saveLoading:true});
    fetch(settings.apiPath + 'SAIMProductReturnInsert.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        productReturnID:this.state.productReturnID,
        channel: this.state.channel,
        order: this.state.order,    
        edit: this.state.edit,           
        returnDate: new Date().toLocaleString(),
        condition: this.state.chooseFirst?0:1,
        defectReason: this.state.defectReason,
        nextStep: !this.state.chooseNextStepFirst && !this.state.chooseNextStepSecond?0:(this.state.chooseNextStepFirst?1:2),
        productClaim: !this.state.chooseProductClaimFirst && !this.state.chooseProductClaimSecond?0:(this.state.chooseProductClaimFirst?1:2),
        productClaimChange: productClaimChange,
        claimAt: this.state.claimAt,
        claimNote: this.state.claimNote,
        customerAddress: this.state.customerAddress,
        customerAddressImage: this.state.customerAddressImage,
        customerAddressImageBase64: this.state.order.CustomerAddressImageBase64,
        customerAddressImageType: this.state.order.CustomerAddressImageType,
        claimStaffName: this.state.claimStaffName,
        claimStaffImage: this.state.claimStaffImage,
        claimStaffImageBase64: this.state.order.ClaimStaffImageBase64,
        claimStaffImageType: this.state.order.ClaimStaffImageType,
        claimDate: this.state.claimDate,
        productBack: this.state.productBack,
        status:this.state.status,  
        nextStepProcess:nextStepProcess?nextStepProcess:this.state.nextStepProcess,  
        
        storeName: settings.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      this.props.navigation.setParams({ animating: false });
      this.setState({saveLoading:false});
      if(responseData.success == true)
      {                
        this.state.edit || this.state.newForm?null:this.props.navigation.state.params.resetSkuDetected();
        // this.state.edit?this.props.navigation.state.params.updateOrder(responseData.order):null;   
        console.log("order saved:"+JSON.stringify(responseData.order));     
        // console.log("image length:"+responseData.order.Images.length);
        if(this.state.newForm)
        {
          // this.props.navigation.state.params.updateOrder();
          this.props.navigation.pop(2);

        }
        else if(!this.state.edit)
        {
          // this.props.navigation.state.params.updateOrder();
          this.props.navigation.goBack(null); 
        }
        else
        {
          this.props.navigation.goBack(null);          
        }        
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
        this.setState({type:'productReturn'});
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
    var type = this.state.type;
    if(type == "productReturn")
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
    else if(type == "customerAddress")
    {
      let order = this.state.order;
      order.CustomerAddressImage = "";
      order.CustomerAddressImageBase64 = "";
      order.CustomerAddressImageType = "";
      this.setState({customerAddressImage:""});
    }
    else if(type == "claimStaff")
    {
      let order = this.state.order;
      order.ClaimStaffImage = "";
      order.ClaimStaffImageBase64 = "";
      order.ClaimStaffImageType = "";
      this.setState({claimStaffImage:""});
    }

  }

  confirmDeleteOrder = () => 
  {
    this.setState({deleteOrderVisible:true});
  }

  deleteOrder = () => 
  {
    this.setState({deleteOrderVisible:false,deleteLoading:true});
    fetch(settings.apiPath + 'SAIMProductReturnDelete.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        productReturnID: this.state.productReturnID,
        storeName: settings.storeName,
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
        // this.props.navigation.state.params.refresh(this.state.orderDeliveryID);    
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
      
      'modifiedUser': this.state.modifiedUser,        
    });  
  }

  chooseProductCondition = (condition) =>
  {
    console.log("condition: "+condition);
    if(condition == 0)
    {
      this.setState({chooseFirst:true});
      this.setState({chooseSecond:false});
      this.setState({defectReason:''});
      let order = this.state.order;
      order.Condition = 0;
      order.DefectReason = '';
    }
    else
    {
      this.setState({chooseFirst:false});
      this.setState({chooseSecond:true});
      let order = this.state.order;
      order.Condition = 1;
    }
    console.log("this.state.order.Condition:"+this.state.order.Condition);
  }

  setDefectReason = (defectReason) =>
  {
    console.log("setDefectReason:"+defectReason);
    this.setState({defectReason:defectReason});
    
    let order = this.state.order;
    order.DefectReason = defectReason;
  }

  chooseNextStep = (option) =>
  {
    console.log("option: "+option);
    if(option == 0)
    {
      this.setState({chooseNextStepFirst:false});
      this.setState({chooseNextStepSecond:false});
    }
    else if(option == 1)
    {
      this.setState({chooseNextStepFirst:true});
      this.setState({chooseNextStepSecond:false});
      this.setState({claimAt:''});
      this.setState({claimNote:''});
      let order = this.state.order;
      order.NextStep = 1;
      order.ClaimAt = '';
      order.ClaimNote = '';
    }
    else
    {
      this.setState({chooseNextStepFirst:false});
      this.setState({chooseNextStepSecond:true});
      let order = this.state.order;
      order.NextStep = 2;
    }
    console.log("this.state.order.NextStep:"+this.state.order.NextStep);
  }

  chooseProductClaim = (option) =>
  {
    console.log("chooseProductClaim option: "+option);
    if(option == 0)
    {
      this.setState({chooseProductClaimFirst:false});
      this.setState({chooseProductClaimSecond:false});
    }
    else if(option == 1)
    {
      this.setState({chooseProductClaimFirst:true});
      this.setState({chooseProductClaimSecond:false});
      let order = this.state.order;
      order.ProductClaim = 1;
    }
    else
    {
      this.setState({chooseProductClaimFirst:false});
      this.setState({chooseProductClaimSecond:true});
      let order = this.state.order;
      order.ProductClaim = 2;
    }    
  }

  setClaimAt = (text) =>
  {
    this.setState({claimAt:text});
    
    let order = this.state.order;
    order.ClaimAt = text;
  }

  setClaimNote = (text) =>
  {
    this.setState({claimNote:text});
    
    let order = this.state.order;
    order.ClaimNote = text;
  }

  setCustomerAddress = (customerAddress) =>
  {
    this.setState({customerAddress:customerAddress});
    
    let order = this.state.order;
    order.CustomerAddress = customerAddress;
  }

  setCustomerAddressImage = (imagePath) =>
  {
    console.log("setCustomerAddressImage imagePath:"+imagePath);
    this.setState({customerAddressImage:imagePath});
    let order = this.state.order;
    order.customerAddressImage = imagePath;
  }

  setClaimStaffName = (claimStaffName) =>
  {
    this.setState({claimStaffName:claimStaffName});
    
    let order = this.state.order;
    order.ClaimStaffName = claimStaffName;
  }

  setClaimStaffImage = (imagePath) =>
  {
    console.log("setClaimStaffImage imagePath:"+imagePath);
    this.setState({claimStaffImage:imagePath});
    let order = this.state.order;
    order.claimStaffImage = imagePath;
  }

  setClaimDate = (claimDate) =>
  {
    if(claimDate == '0000-00-00 00:00:00')
    {
      claimDate = this.getCurrentDate();          
    }
    
    this.setState({claimDate:claimDate});
    
    let order = this.state.order;
    order.ClaimDate = claimDate;
  }

  setProductBack = (value) =>
  {
    this.setState({productBack:value});
    
    let order = this.state.order;
    order.ProductBack = value;
  }

  setStatus = (status) =>
  {
    this.setState({status:status});
    console.log("setStatus:"+this.state.status);
    // let order = this.state.order;
    // order.Status = status;

    // statusList.map((item)=>
    // {
    //   if(item.value == status)
    //   {
    //     item.selected = true;
    //   }
    //   else
    //   {
    //     item.selected = false;
    //   }
    // })

    console.log("statusList:"+JSON.stringify(statusList));
  }

  getCurrentDate = () =>
  {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hour = String(today.getHours()).padStart(2,'0');
    var minute = String(today.getMinutes()).padStart(2,'0');

    today = mm + '/' + dd + '/' + yyyy;

    return yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + minute + ':00'; 
  }

  formatDate = (claimDate) => 
  {
    console.log('date js:'+new Date().toString());
    console.log('claimDate input:'+claimDate);
    claimDate = claimDate.replace(' ','T');
    claimDate = claimDate + '.000+07:00';
    console.log('claimDate:'+claimDate);


    var date = new Date(claimDate);

    var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var day = days[date.getDay()];
    var date2 = date.getDate();
    var month = months[date.getMonth()];
    var year = date.getFullYear();    

    var formatClaimDate = day + ' ' + date2 + ' ' + month + ' ' + year + ' / ' + this.formatAMPM(date);
    console.log('formatClaimDate:'+formatClaimDate);
    return formatClaimDate;
  }

  formatAMPM = (date) =>
  {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  setCurrentDate = () =>
  {
    if(this.state.status != 0)
    {
      return;
    }
    console.log(' setCurrentDate');
    var claimDate = this.getCurrentDate();              
    this.setState({claimDate:claimDate});    
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
            <View style={{display:'flex',flexDirection:'row'}}> 
              <Text style={styles.title2}>Order no. {this.state.order.OrderNo == ''?'-':this.state.order.OrderNo}</Text>
              <View style={{flex: 1,alignItems:'flex-end',justifyContent:'center',paddingRight:16}}>
                <Image
                  source={this.state.order.Channel == 1?require('./../assets/images/lazadaIcon.png'):this.state.order.Channel == 2?require('./../assets/images/shopeeIcon.png'):this.state.order.Channel == 3?require('./../assets/images/jdIcon.png'):this.state.order.Channel == 4?require('./../assets/images/thisshopIcon.png'):null}
                  style={styles.imageIconSmall}
                  /> 
              </View>
            </View>
            <Text style={styles.title3}>Date {this.state.order.OrderDate == ''?'-':this.state.order.OrderDate}</Text>
            <FlatList            
            data={this.state.order.Items}
            renderItem={({ item }) =>(   
              <View style={{ flex: 1}}>
                <TouchableHighlight 
                  underlayColor={'transparent'} activeOpacity={1}                                         
                  onPress={()=>{this.enlargeImage(item.Image,false,-1)}} > 

                  <View style={{display:'flex',flexDirection:'row'}}>
                    <FastImage
                      style={styles.imageSku}
                      source={{
                          uri: item.Image == ""?settings.apiPath+'images/noImage.jpg':item.Image,
                          priority: FastImage.priority.normal,
                      }}
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
                          renderItem={(item,index)=>
                            <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.enlargeImage(item.ImageUrl,false,-1)}>
                              <View style={styles.imageView}>
                                <Image
                                  source={item.ImageUrl == ""?require('./../assets/images/blank.gif'):{uri: item.ImageUrl}}
                                  style={[styles.image,{borderWidth:0}]}
                                />
                              </View>
                            </TouchableHighlight>                                     
                          }
                        />                        
                      </View>
                    </View>
                  </View>  
                </TouchableHighlight>  
                <View style={styles.separator}/>
              </View>
             
            )
          
        }            
            keyExtractor={(item, index) => index}            
            removeClippedSubviews={false}
            keyboardShouldPersistTaps='always'
            />


            <View style={[styles.viewField,{marginBottom:padding.lg}]}>        
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
                  renderItem={(item,index)=>{console.log("abc:"+item.Image.replace("/Images/","/ImagesNew/")); return (this.state.enableImageSort?
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
                        <FastImage
                          style={styles.image}
                          source={{
                              uri: item.Image == ""?settings.apiPath+'images/blank.gif':item.Image,
                              priority: FastImage.priority.normal,
                          }}
                        />
                        {
                          item.Resizing && (<View style={{position:'absolute',top:6+20,left:20}}><ActivityIndicator size="small" animating={true} color='white'/></View>)
                        }
                          
                      </View>    
                    )
                    )}
                  }
                />
              </View> 
            </View>


            <View style={[styles.viewField,{marginBottom:padding.lg}]}>                      
              <Text style={styles.title}>สภาพสินค้า</Text>
              <TouchableOpacity onPress={()=>{this.chooseProductCondition(0)}} >
                <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                  <Text style={[styles.radioButton,{color:this.state.chooseFirst?colors.secondary:"#CCCCCC"}]}>{this.state.chooseFirst?"●":"○"} </Text>
                  <Text style={styles.radioText}>สภาพดี</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{this.chooseProductCondition(1)}} >
                <View style={{flex:1,display:'flex',flexDirection:'row',alignItems:'center'}}>
                  <Text style={[styles.radioButton,{color:this.state.chooseSecond?colors.secondary:"#CCCCCC"}]}>{this.state.chooseSecond?"●":"○"} </Text>                  
                  <Text style={styles.radioText}>เสียหาย</Text>                  
                  {this.state.chooseSecond && (
                    <TextInput style={{flex:1,marginLeft:padding.sm,marginRight:0,borderBottomWidth:1,borderColor:'#CCCCCC',padding:2}} value={this.state.defectReason} placeholder=' ระบุ' onChangeText={text => {this.setDefectReason(text)}}/>                                  
                  )}
                </View>
              </TouchableOpacity>
            </View>


            <View style={[styles.viewField,{marginTop:0 ,marginBottom:padding.lg}]}>                      
              <Text style={styles.title}>ชื่อ-ที่อยู่ลูกค้า</Text>
              <TextInput style={styles.textInputMulti} value={this.state.customerAddress} placeholder=' ' multiline onChangeText={text => {this.setCustomerAddress(text)}}/>
              <Text style={styles.title}>แนบรูปภาพ</Text>
              <View style = {{width:60,height:60}}>
                <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.addImage('customerAddress')}>
                  <View style={styles.box}>                                         
                    <FastImage
                      style={styles.imageCustomerAddress}
                      source={{
                          uri: this.state.customerAddressImage == ""?settings.apiPath+'images/add.png':this.state.customerAddressImage,
                          priority: FastImage.priority.normal,
                      }}
                    />
                  </View>
                </TouchableHighlight>             
              </View> 
            </View>


            {this.state.edit && 
              (
                <View style={[styles.viewField,{marginBottom:padding.lg}]}>   
                  <View style={{height:1,backgroundColor:colors.separator,margin:padding.lg}}>
                  </View>                   
                  <Text style={styles.title}>ขั้นตอนถัดไป</Text>
                  <TouchableOpacity onPress={()=>{this.chooseNextStep(1)}} >
                    <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                      <Text style={[styles.radioButton,{color:this.state.chooseNextStepFirst?colors.secondary:"#CCCCCC"}]}>{this.state.chooseNextStepFirst?"●":"○"} </Text>
                      <Text style={styles.radioText}>คืนเข้าร้าน</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.chooseNextStep(2)}} >
                    <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                      <Text style={[styles.radioButton,{color:this.state.chooseNextStepSecond?colors.secondary:"#CCCCCC"}]}>{this.state.chooseNextStepSecond?"●":"○"} </Text>
                      <Text style={styles.radioText}>เคลม</Text>
                    </View>
                    {this.state.chooseNextStepSecond && (
                      <View style={{flex:1}}>
                        <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                          <Text style={[styles.title,{paddingLeft:padding.xl}]}>ส่งบริษัท</Text> 
                          <TextInput style={{flex:1,marginLeft:padding.sm,marginRight:0,borderBottomWidth:1,borderColor:'#CCCCCC',padding:2}} value={this.state.claimAt} placeholder=' ระบุ' onChangeText={text => {this.setClaimAt(text)}}/>                                                   
                        </View>
                        <Text style={[styles.title,{paddingLeft:padding.xl}]}>หมายเหตุ</Text>                                          
                        <TextInput style={[styles.textInputMulti,{marginLeft:padding.xl,height:40}]} value={this.state.claimNote} placeholder=' ' multiline onChangeText={text => {this.setClaimNote(text)}}/> 

                        <View style={[styles.viewField]}>
                          <TouchableOpacity onPress={()=>{this.chooseProductClaim(1)}} >
                            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                              <Text style={[styles.radioButton,{color:this.state.chooseProductClaimFirst?colors.secondary:"#CCCCCC"}]}>{this.state.chooseProductClaimFirst?"●":"○"} </Text>
                              <Text style={styles.radioText}>เคลมคืนเข้าร้าน</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={()=>{this.chooseProductClaim(2)}} >
                            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                              <Text style={[styles.radioButton,{color:this.state.chooseProductClaimSecond?colors.secondary:"#CCCCCC"}]}>{this.state.chooseProductClaimSecond?"●":"○"} </Text>
                              <Text style={styles.radioText}>เคลมคืนลูกค้า</Text>
                            </View>
                          </TouchableOpacity>  
                        </View>                                                       
                      </View>
                    )}
                    
                    
                  </TouchableOpacity>
                </View>
              )
            }


            {this.state.edit && !this.state.nextStepProcess && this.state.chooseNextStepSecond &&  
              (
                <View style={[styles.viewField,{marginBottom:padding.lg}]}> 
                  <View style={{height:1,backgroundColor:colors.separator,margin:padding.lg}}>
                  </View>    

                  <Text style={styles.title}>ผู้รับของเคลม</Text>
                  <TextInput style={styles.textInputMulti} value={this.state.claimStaffName} placeholder=' ' onChangeText={text => {this.setClaimStaffName(text)}}/>
                  <Text style={styles.title}>แนบรูปภาพ</Text>
                  <View style = {{width:60,height:60}}>
                    <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.addImage('claimStaff')}>
                      <View style={[styles.box,{marginBottom:padding.sm}]}>
                        <FastImage
                          style={styles.imageCustomerAddress}
                          source={{
                              uri: this.state.claimStaffImage == ""?settings.apiPath+'images/add.png':this.state.claimStaffImage,
                              priority: FastImage.priority.normal,
                          }}
                        />
                      </View>
                    </TouchableHighlight>
                  </View>
                  <View style={{height:padding.lg}}>
                  </View>
                  <Text style={styles.title}>วันที่รับของเคลม</Text>
                  <View style={{display:'flex',flexDirection:'row'}}>
                    <Text style={styles.radioText}>{this.formatDate(this.state.claimDate)}  </Text>
                    {
                      this.state.status == 0 && (
                        <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.setCurrentDate()}>                      
                        <View style={{flex:1}}>
                          <Image source={require('./../assets/images/time.png')} style={styles.timeIcon}/>                                         
                        </View>                      
                      </TouchableHighlight>)
                    }
                    
                  </View>
                </View>
              )
            }


            {this.state.status != 2 && (
              <View style={[styles.viewField,{marginBottom:padding.xl}]}>
                <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.saveButton}
                  onHideUnderlay={()=>this.onHideUnderlaySave()}
                  onShowUnderlay={()=>this.onShowUnderlaySave()}
                  onPress={()=>{this.saveProductReturn()}} 
                >
                  <View style={{flex:1,justifyContent:'center'}}>
                    <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                      <View style={{width:30}}>                    
                      </View>
                      <Text style={
                        this.state.savePressStatus
                          ? styles.saveTextPress
                          : styles.saveText
                        }>{!this.state.edit || this.state.newForm?"Save":this.state.status == 0 && this.state.nextStepProcess?"Save":this.state.status == 0 && this.state.order.NextStep == 1?"รับทราบ":this.state.status == 0 && this.state.order.NextStep == 2?"ส่งเคลม":this.state.status == 1 && this.state.order.ProductClaim == 0?"Save":this.state.status == 1 && this.state.order.ProductClaim == 1?"รับสินค้าจาก Vendor เข้าร้าน":this.state.status == 1 && this.state.order.ProductClaim == 2 && this.state.order.ProductBack == 0?"รับสินค้าจาก Vendor เพื่อนำส่งลูกค้า":this.state.status == 1 && this.state.order.ProductClaim == 2 && this.state.order.ProductBack == 1?"ส่งสินค้าเคลมคืนลูกค้า":""}
                      </Text>
                      <View style={{width:30}}>
                        {this.state.saveLoading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            )}
                        

            {this.state.edit && (<View style={[styles.viewField,{marginTop:padding.xl+100,marginBottom:padding.xl}]}>
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
                    <Text style={styles.textFail}>ยืนยันลบสินค้าคืนนี้ใช่หรือไม่</Text>
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
  saveButton: 
  {    
    width: dimensions.fullWidth - 2*padding.xl,    
    height:30,
    borderColor: colors.primary,
    backgroundColor:colors.primary,
    borderWidth: 1,
    borderRadius: 6,      
  }, 
  saveText: 
  {       
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",    
  },
  saveTextPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",
    color: "#62c400",    
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
  separator: 
  {
    width:dimensions.fullWidth-8-70-10-20,
    height:1,
    backgroundColor:colors.separator,
    left:8+70+10,
    marginTop:padding.sm,
  }, 
  accessories:
  {
    marginLeft:10,
    width:dimensions.fullWidth-8-70-10-8,//dimensions.fullWidth,    
  },
  accessoriesLabel: 
  {
    fontFamily: fonts.primaryItalic,
    fontSize: fonts.sm,
    color: colors.secondary,
  },
  radioText:
  {
    color:colors.secondary,
    fontFamily:fonts.primaryBold,
    fontSize:fonts.md
  },
  textInputMulti: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left', 
    // marginLeft: padding.xl,         
    height: 80,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'top'
  },
  imageCustomerAddress: 
  {
    width:60,
    height:60,  
    // marginTop:20,  
    // marginBottom:20,  
    // marginLeft:40,  
    // marginRight:40,  
  },
  box:
  {
    // margin:10,
    marginTop:padding.sm,
    // marginLeft:padding.xl,
    width:60,
    height:60,  
    backgroundColor:'white',    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  radioButton:
  {
    fontSize:20,
  },
  timeIcon:
  {
    width:30,
    height:30,
    borderRadius:5
  }
});

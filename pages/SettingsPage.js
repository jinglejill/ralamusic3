// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, ScrollView, Keyboard,FlatList } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'

export default class SettingsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      alertVisible: false,
      alertMessage:'',
      alertStatus:0,
      loading:false,
      loadingStock:false,
      skus:'',
    };
  }

  menu = [
    { name : 'Sync Stock (LZ,JD)', image : require('./../assets/images/syncStock.png') },      
  ];

  componentDidMount()
  {    
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
        menuCode: 'SETTINGS',   
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

  }

  goToMenu = (menuID) => 
  {
    if(menuID == 1)
    {
      this.setState({loadingStock:true});
      console.log("SAIMMarketPlaceStockToAppSync3");
      //sync stock
      fetch(this.state.apiPath + 'SAIMMarketPlaceStockToAppSync3.php',
      {      
        method: 'POST',
        headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
        body: JSON.stringify({              
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
        this.setState({loadingStock:false});
        if(responseData.success == true)
        {
          this.setState({alertStatus:1},()=>{this.showAlertMessage(responseData.message);});
          
        }
        else
        {
          //error message                
          this.setState({alertStatus:0},()=>{this.showAlertMessage(responseData.message);});
        }
      }).done();
    }    
  }

  syncMarketplaceDataToApp = () => 
  { 
    //validate       
    if(this.state.skus.trim() == "")
    {
      this.setState({alertStatus:0},()=>{this.showAlertMessage("กรุณาใส่ Sku");});
      return;
    }    
    //loading
    this.setState({loading:true});


    //clean data
    skus = this.state.skus.split(";");
    for (i = 0; i < skus.length; i++)
    {
      skus[i] = skus[i].trim();            
    }
    //start sync
    fetch(this.state.apiPath + 'SAIMMarketPlaceDataToAppSync2.php',
    {      
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        skus: skus,        
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
      this.setState({loading:false});
      if(responseData.success == true)
      {
        this.setState({alertStatus:1},()=>{this.showAlertMessage(responseData.message);});
        
      }
      else
      {
        //error message                
        this.setState({alertStatus:0},()=>{this.showAlertMessage(responseData.message);});
      }
    }).done();
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  onHideUnderlay = () => 
  {
    console.log(" button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    console.log(" button press true");
    this.setState({ pressStatus: true });
  }


  render() {
    if(this.state.loadingAccess)
    {
      return(<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><ActivityIndicator animating size='small' /></View>);
    }
    if(!this.state.loadingAccess && !this.state.menuAllow)
    {
      return (<View style={{alignItems:'center',justifyContent:'center',height:dimensions.fullHeight-100}}><Text style={styles.menuAllow}>จำกัดการเข้าใช้</Text></View>);
    }
    return (        
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
          <View style={{marginTop:20}}>
            <Text style={styles.title}>Sync marketplace sku เข้าแอป</Text>          
            <TextInput style={styles.skus} value={this.state.skus} placeholder=' Ex. Fender-Mustang-LT50;Fender-Turbo-Tune-String-Winder' multiline onChangeText={text => {this.setState({skus:text})}}/>                  
            <View style={{justifyContent: 'center'}}>
              <TouchableHighlight underlayColor={colors.primary} activeOpacity={1} style={styles.button} 
                onHideUnderlay={()=>this.onHideUnderlay()}
                onShowUnderlay={()=>this.onShowUnderlay()}                                        
                onPress={()=>{this.syncMarketplaceDataToApp()}} >  
                  <View style={{flex:1,justifyContent:'center'}}>       
                    <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                      <View style={{width:30}}>                    
                      </View>
                      <Text style={
                        this.state.pressStatus
                          ? styles.textPress
                          : styles.text
                        }>Sync
                      </Text>               
                      <View style={{width:30}}>
                        {this.state.loading && <ActivityIndicator animating size='small' style={styles.activityIndicator}/>}
                      </View>
                    </View>
                  </View>
              </TouchableHighlight>                                                  
            </View>
          </View>
          <View style={styles.separator}/>
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <FlatList
              data={this.menu}
              renderItem={({item}) => (
                <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.goToMenu(1)}>
                  <View>
                    <View style={styles.box}>
                      <Image source={item.image}  style={styles.image}/> 
                      <View style={{height:45}}>                      
                        {!this.state.loadingStock && <Text style={styles.menuName}>{item.name}</Text>}
                        {this.state.loadingStock && <ActivityIndicator animating size='small' style={styles.activityIndicatorStock}/>}
                      </View>                   
                    </View>
                  </View>
                </TouchableHighlight>)}  
              keyExtractor={(item, index) => index}
              numColumns = {2}
            /> 
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
  container:
  {
    flex:1,
    height:dimensions.fullHeight,
    width:dimensions.fullWidth,
    // borderWidth:1
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
  dialogFooter:
  {
    height:44,  
  },
  textSuccess:
  {
    color:colors.secondary,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
  textFail:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:fonts.md
  },
  skus: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left', 
    marginLeft: padding.xl,   
    marginTop: padding.sm, 
    marginBottom: padding.sm,      
    width: dimensions.fullWidth - padding.xl*2,    
    height: 120,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'top'
  },
  title:
  {
    paddingLeft:padding.xl,  
    fontFamily: "Sarabun-Light", 
    fontSize: fonts.lg,
    color:colors.secondary    
  },
  image: 
  {
    width:70,
    height:70,    
    marginLeft:20,
    borderRadius:35
  },
  button: 
  {
    marginLeft:padding.xl,
    width: dimensions.fullWidth - padding.xl*2,    
    height:44,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderRadius: 6,      
  },  
  text: 
  {   
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: "#ffffff",    
  },
  textPress: 
  {  
    fontFamily: "Sarabun-SemiBold",   
    fontSize: 16,
    textAlign: "center",    
    color: "#6EC417",
  },
  activityIndicator:
  {    
    justifyContent: 'center',
    alignItems:'center'
  },
  activityIndicatorStock:
  {       
    justifyContent: 'center',
    alignItems:'center',
    paddingTop: padding.lg
  },  
  image: 
  {
    width:60,
    height:60,  
    marginTop:20,  
    marginLeft:40,  
    marginRight:40,  
  },
  menuName:
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    color: colors.primary,
    textAlign: 'center',
    paddingTop: padding.lg
  },
  box:
  {
    margin:10,
    backgroundColor:'white',    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,  
    elevation: 5
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    left:20,
    marginTop:padding.md,
  },
});
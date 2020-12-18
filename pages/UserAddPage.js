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
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js';


export default class UserAddPage extends React.Component {
  constructor(props) {
    super(props);

    var item = {
      Username:"",
      Password:"",
      PasswordAgain:"",
      Email:"",
      Active:false,
      RoleList:[]       
    };
    var previousItem = {
      Username:"",
      Password:"",
      PasswordAgain:"",
      Email:"",
      Active:false,
      RoleList:[]        
    };

    var edit = false;
    var loading = false;
    var username = "";    
    if(this.props.navigation.state.params.edit)
    {
      edit = true;
      loading = true;
      username = this.props.navigation.state.params.username;
    }

    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,    
      modifiedUser: this.props.navigation.state.params.modifiedUser,  
      edit: edit, 
      loading: loading,
      username: username,      
      
      item:item,    
      previousItem:previousItem,
    };
  }
  
  componentDidMount() 
  {
    console.log("componentDidMount");
    if(this.state.edit)
    {
      this.makeRemoteRequest();  
    }
    else
    {
      this.props.navigation.setParams({ handleNew: this.newForm });  
      this.getRoleList();      
    }

    this.props.navigation.setParams({ handleSave: this.saveUser });
    this.props.navigation.setParams({ animating: false });

    this.props.navigation.setParams({ savedOrSynced: false });
    
  }

  makeRemoteRequest = () => 
  {
    console.log("makeRemoteRequest get user detail");
    const url =  this.state.apiPath + 'SAIMUserDetailGet.php';
    this.setState({ loading: true });
    console.log("url:"+url);
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        username:this.state.username, 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      console.log("fetch result:"+res);
      var previousItem = this.state.previousItem;
      previousItem.RoleList = res.user.RoleList;
      this.setState({
        item: res.user,
        error: res.error || null,
        loading: false,
      });
      this.showActive();
      this.showRole();
      console.log("item:"+JSON.stringify(this.state.item));
    })
    .catch(error => {
      this.setState({ error, loading: false });
    });
  };

  getRoleList = () => 
  {
    const url =  this.state.apiPath + 'SAIMRoleGetList.php';
    fetch(url,
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({                 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {
      console.log("fetch result:"+res);
      var item = this.state.item;
      item.RoleList = res.roleList;
      var previousItem = this.state.previousItem;
      previousItem.RoleList = res.roleList;
      this.setState({
        item: item,
        error: res.error || null,
        loading: false,
      });
      this.showActive();
      this.showRole();
    })
    .catch(error => {
      this.setState({ error, loading: false });
    });
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

  saveUser = () => 
  {
    console.log("save user");    
    this.props.navigation.setParams({ animating: true });

    var insert = false;
    if(!this.state.edit)
    {
      var previousItem = this.state.previousItem;
      var item = this.state.item;
      insert = true;
      if(previousItem.Username == item.Username)
      {
        insert = false;
      }  
    }

        

    fetch(this.state.apiPath + 'SAIMUserInsert.php',
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
        //set previous item
        this.setPreviousItem();

        if(this.state.clearForm)
        {
          this.clearForm();
          this.setState({clearForm:false});
        }
        this.props.navigation.setParams({ savedOrSynced: true });
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
      if(key == 'RoleList')
      {
        var previousRoleList = previousItem[key];
        var roleList = item[key];
        for(var i=0; i<roleList.length; i++)
        {
          previousRoleList[i].Active = roleList[i].Active;          
        }
      }
      else
      {
        previousItem[key] = item[key];
      }
    }        

    this.setState({previousItem:previousItem});
  }

  newForm = () => 
  {
    //check if user wants to save current item
    var previousItem = this.state.previousItem;
    var item = this.state.item;
    
    for (const [key, value] of Object.entries(previousItem)) 
    {
      if(key == 'RoleList')
      {
        var previousRoleList = previousItem[key];
        var roleList = item[key];
        for(var i=0; i<roleList.length; i++)
        {
          if((previousRoleList[i].Active != roleList[i].Active)) 
          {
            this.setState({clearFormVisible:true});
            return;              
          }
        }
      }
      else
      {
        if(previousItem[key] != item[key])
        {          
          console.log("key not equal:" + key);  
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
      if(key == 'RoleList')
      {
        var previousRoleList = previousItem[key];
        var roleList = item[key];
        for(var i=0; i<roleList.length; i++)
        {
          previousRoleList[i].Active = false;          
          roleList[i].Active = false;
          
        }
      }
      else if(key == 'Active')
      {
        previousItem[key] = false;
        item[key] = false;
      }
      else
      {
        previousItem[key] = "";
        item[key] = "";
      }
    }        

    this.setState({previousItem:previousItem,item:item});
    this.showActive();
    this.showRole();
  }

  onUsernameChanged = (text) => 
  {
    var item = this.state.item;
    item.Username = text;
    this.setState({item:item});
  }

  onPasswordChanged = (text) => 
  {
    var item = this.state.item;
    item.Password = text;
    this.setState({item:item});
  }

  onPasswordAgainChanged = (text) => 
  {
    var item = this.state.item;
    item.PasswordAgain = text;
    this.setState({item:item});
  }

  onEmailChanged = (text) => 
  {
    var item = this.state.item;
    item.Email = text;
    this.setState({item:item});
  }

  onActiveChanged = (text) => 
  {
    var item = this.state.item;
    item.Active = text;
    this.setState({item:item});
  }

  onRoleListChanged = (text) => 
  {
    // var item = this.state.item;
    // item.Username = text;
    // this.setState({item:item});
  }

  confirmDeleteUser = () => 
  {
    this.setState({deleteUserVisible:true});
  }

  deleteUser = () => 
  {
    this.setState({deleteUserVisible:false,deleteLoading:true});
    fetch(this.state.apiPath + 'SAIMUserDelete.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.username,
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
        this.props.navigation.state.params.refresh();
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

  onHideUnderlayActive = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatusActive: false });
  }

  onShowUnderlayActive = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatusActive: true });
  }

  setActive = () => 
  {
    var item = this.state.item;
    item.Active = !this.state.item.Active;
    this.setState({item:item},this.showActive());
  }

  showActive = () =>
  {
    if(this.state.item.Active)
    {

      var item = this.state.item;
      item.ActiveText = "✓  active";
      this.setState({item:item});
    }
    else
    {
      var item = this.state.item;
      item.ActiveText = "❒  active";
      this.setState({item:item});          
    }
  }

  onHideUnderlayRole = (role) => 
  {
    // console.log(" button press false");
    // item.PressStatusRole = false;
    // this.setState({item:item});
    var item = this.state.item;
    item.RoleList.map((roleItem)=>
      {
        if(roleItem.RoleID == role.RoleID)
        {
          roleItem.PressStatusRole = false;
        }
      }
    );
    this.setState({refresh:!this.state.refresh});        
  }

  onShowUnderlayRole = (role) => 
  {
    // console.log(" button press true");
    // item.PressStatusRole = true;
    // this.setState({item:item});    
    var item = this.state.item;
    item.RoleList.map((roleItem)=>
      {
        if(roleItem.RoleID == role.RoleID)
        {
          roleItem.PressStatusRole = true;
        }
      }
    );
    this.setState({refresh:!this.state.refresh});    
  }

  setRole = (role) =>
  {
    // role.Active = !role.Active;    
    this.state.item.RoleList.map((roleItem)=>
      {
        if(roleItem.RoleID == role.RoleID)
        {
          console.log("role active:"+role.Active);
          roleItem.Active = !role.Active;
          console.log("roleItem active:"+roleItem.Active);
          this.showRole();
        }
      }
    );

    this.setState({refresh:!this.state.refresh});
  }

  showRole = ()=>
  {    
    this.state.item.RoleList.map((roleItem)=>
      {
        if(roleItem.Active == "1")
        {
          roleItem.Active = true;
          roleItem.RoleText = "✓  " + roleItem.Name
          console.log("show roleText:" + roleItem.RoleText);
        }
        else
        {
          roleItem.Active = false;
          roleItem.RoleText = "❒  " + roleItem.Name; 
          console.log("show roleText:" + roleItem.RoleText);
        }
      }
    );

    this.setState({refresh:!this.state.refresh});    
  }

  render() {
    const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
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
            <View style={styles.viewField}>        
              <Text style={styles.title}>Username *</Text>
              <TextInput style={styles.value} value={this.state.item.Username} placeholder=' ' onChangeText={(text) => {this.onUsernameChanged(text)}} editable={!this.state.edit}/>  
            </View>
            {!this.state.edit && (
              <View style={styles.viewField}>        
                <Text style={styles.title}>Password *</Text>
                <TextInput style={styles.value} value={this.state.item.Password} placeholder=' ' onChangeText={(text) => {this.onPasswordChanged(text)}}  secureTextEntry={true}/>  
              </View>
              )
            }
            {this.state.edit && (
              <View style={styles.viewField}>        
                <Text style={styles.title}>New password</Text>
                <TextInput style={styles.value} value={this.state.item.Password} placeholder=' ' onChangeText={(text) => {this.onPasswordChanged(text)}}  secureTextEntry={true}/>  
              </View>
              )
            }
            {!this.state.edit && (
              <View style={styles.viewField}>        
                <Text style={styles.title}>Confirm password *</Text>
                <TextInput style={styles.value} value={this.state.item.PasswordAgain} placeholder=' ' onChangeText={(text) => {this.onPasswordAgainChanged(text)}}  secureTextEntry={true}/>  
              </View>
              )
            }
            {this.state.edit && (
              <View style={styles.viewField}>        
                <Text style={styles.title}>Confirm new password</Text>
                <TextInput style={styles.value} value={this.state.item.PasswordAgain} placeholder=' ' onChangeText={(text) => {this.onPasswordAgainChanged(text)}}  secureTextEntry={true}/>  
              </View>
              )
            }
            <View style={styles.viewField}>        
              <Text style={styles.title}>Email *</Text>
              <TextInput style={styles.value} value={this.state.item.Email} placeholder=' ' onChangeText={(text) => {this.onEmailChanged(text)}}/>  
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Active</Text>
              <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.activeButton} 
                onHideUnderlay={()=>this.onHideUnderlayActive()}
                onShowUnderlay={()=>this.onShowUnderlayActive()}                                        
                onPress={()=>{this.setActive()}} >         
                  <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-start'}}>                    
                    <Text style={
                      this.state.pressStatusActive
                        ? styles.textPressActive
                        : styles.textActive
                      }>{this.state.item.ActiveText}
                    </Text>                                   
                  </View>
              </TouchableHighlight> 
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Role</Text>
              <FlatList          
                data={this.state.item.RoleList}
                renderItem={({ item }) => ( 
                  
                    <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.roleButton} 
                      onHideUnderlay={()=>this.onHideUnderlayRole(item)}
                      onShowUnderlay={()=>this.onShowUnderlayRole(item)}                                        
                      onPress={()=>{this.setRole(item)}} >         
                        <View style={{display:'flex',flexDirection:'row',justifyContent:'flex-start'}}>                    
                          <Text style={
                            item.PressStatusRole
                              ? styles.textPressRole
                              : styles.textRole
                            }>{item.RoleText}
                          </Text>                                   
                        </View>
                    </TouchableHighlight> 

                )}          
                keyExtractor={(item, index) => index}          
              />
            </View>
            
            
                   
            
            {this.state.edit && (<View style={[styles.viewField,{marginBottom:padding.xl}]}>
              <TouchableHighlight underlayColor={colors.error} activeOpacity={1} style={styles.deleteButton}
                onHideUnderlay={()=>this.onHideUnderlayDelete()}
                onShowUnderlay={()=>this.onShowUnderlayDelete()}
                onPress={()=>{this.confirmDeleteUser()}} 
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
              visible={this.state.deleteUserVisible}
              width={0.8}
              footer=
              {
                <DialogFooter style={styles.dialogFooter}>
                  <DialogButton
                    text="NO"
                    style={styles.cancelButton}
                    textStyle={styles.cancelButtonText}
                    onPress={() => {this.setState({ deleteUserVisible: false })}}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {this.deleteUser()}}
                  />
                </DialogFooter>
              }
              onTouchOutside={() => {
                this.setState({ deleteUserVisible: false });
              }}          
            >
              <DialogContent>
                {
                  <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text style={styles.textFail}>ยืนยันลบผู้ใช้ใช่หรือไม่</Text>
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
                      this.setState({clearFormVisible:false});
                    }}
                  />
                  <DialogButton
                    text="YES"
                    style={styles.okButton}
                    textStyle={styles.okButtonText}
                    onPress={() => {
                      this.saveUser();
                      this.setState({clearForm:true,clearFormVisible:false});
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
                    <Text style={styles.textFail}>รายละเอียดผู้ใช้มีการเปลี่ยนแปลง คุณต้องการบันทึกก่อนหรือไม่</Text>
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
  activeButton: 
  {     
    height:30,      
  },
  textActive: 
  {   
    fontFamily: fonts.primary,   
    fontSize: fonts.md,
    textAlign: "center",    
    color: colors.black,
    textAlignVertical: 'center'
  },
  textPressActive: 
  {  
    fontFamily: fonts.primary,   
    fontSize: fonts.md,
    textAlign: "center",    
    color: colors.white,
    textAlignVertical: 'center'
  },
  roleButton: 
  {     
    height:30,      
  },
  textRole: 
  {   
    fontFamily: fonts.primary, 
    fontSize: fonts.md,
    textAlign: "center",    
    color: colors.black,
    textAlignVertical: 'center'
  },
  textPressRole: 
  {  
    fontFamily: fonts.primary,   
    fontSize: fonts.md,
    textAlign: "center",    
    color: colors.white,
    textAlignVertical: 'center'
  },
});
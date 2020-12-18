// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList, ScrollView } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'


export default class MyProfilePage extends React.Component {
  constructor(props) {
    super(props);
    var item = {Username:'',RoleList:[]};
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath, 
      modifiedUser: this.props.navigation.state.params.modifiedUser,     
      loading: true,
      loadingPassword: false,
      loadingEmail: false,
      alertVisible:false,
      passwordFormVisible:false,      
      emailEdit:'',
      item:item, 
    };
  }

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
        menuCode: 'MY_PROFILE',   
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
        username:this.state.modifiedUser, 
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then(res => res.json())
    .then(res => {            
      this.setState({
        item: res.user,
        error: res.error || null,
        loading: false,
      });      
      console.log("item:"+JSON.stringify(this.state.item));
    })
    .catch(error => {
      this.setState({ error, loading: false });
    });
  }

  getRole = () => 
  {
    var role = '';
    var roleList = this.state.item.RoleList;
    for(var i=0; i<roleList.length; i++)
    {
      if(roleList[i].Active == '1')
      {
        if(role=='')
        {
          role = roleList[i].Name;
        }
        else
        {
          role += ", "+roleList[i].Name; 
        }  
      }
    }
    return role;
  }

  onHideUnderlay = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatus: false });
  }

  onShowUnderlay = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatus: true });
  }

  onHideUnderlayEmail = () => 
  {
    // console.log(" button press false");
    this.setState({ pressStatusEmail: false });
  }

  onShowUnderlayEmail = () => 
  {
    // console.log(" button press true");
    this.setState({ pressStatusEmail: true });
  }

  showPasswordForm = () => 
  {
    this.setState({passwordFormVisible:true, currentPassword:"", password:"", passwordAgain:""});
  }

  changePassword = () => 
  {
    this.setState({loadingPassword:true});
    fetch(this.state.apiPath + 'SAIMPasswordUpdate.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,
        currentPassword: this.state.currentPassword,
        password: this.state.password,
        passwordAgain: this.state.passwordAgain,
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
      
      this.setState({loadingPassword:false});


      if(responseData.success == true)
      {
        this.setState({passwordFormVisible:false});        
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

  showEmailForm = () => 
  {
    this.setState({emailFormVisible:true,emailEdit:this.state.item.Email});
  }

  changeEmail = () => 
  {
    this.setState({loadingEmail:true});
    fetch(this.state.apiPath + 'SAIMEmailUpdate.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,
        email: this.state.emailEdit,
        
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
      
      this.setState({loadingEmail:false});


      if(responseData.success == true)
      {
        var item = this.state.item;
        item.Email = responseData.email;
        this.setState({emailFormVisible:false,item:item});        
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

  onCurrentPasswordChanged = (text) =>
  {
    this.setState({currentPassword:text});
  }

  onPasswordChanged = (text) =>
  {
    this.setState({password:text});
  }

  onPasswordAgainChanged = (text) =>
  {
    this.setState({passwordAgain:text});
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  onEmailChanged = (text) =>
  {    
    this.setState({emailEdit:text});
  }

  render() 
  {
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
        {this.state.loading && 
          (<View style={{marginTop:padding.lg}}>
            <ActivityIndicator animating size='large' />
          </View>)
        }
        {!this.state.loading && (
          <View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Username</Text>
              <Text style={styles.value}>{this.state.item.Username}</Text>              
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Password</Text>
              <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.button} 
                onHideUnderlay={()=>this.onHideUnderlay()}
                onShowUnderlay={()=>this.onShowUnderlay()}                                        
                onPress={()=>{this.showPasswordForm()}} >    
                  <Text style={
                    this.state.pressStatus
                      ? styles.textPress
                      : styles.text
                    }>Change password</Text>                                           
              </TouchableHighlight>               
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Email</Text>
              <Text style={styles.value}>{this.state.item.Email}</Text>
              <TouchableHighlight underlayColor='transparent' activeOpacity={1} style={styles.button} 
                onHideUnderlay={()=>this.onHideUnderlayEmail()}
                onShowUnderlay={()=>this.onShowUnderlayEmail()}                                        
                onPress={()=>{this.showEmailForm()}} >    
                  <Text style={
                    this.state.pressStatusEmail
                      ? styles.textPressEmail
                      : styles.textEmail
                    }>Change email</Text>                                           
              </TouchableHighlight>               
            </View>
            <View style={styles.viewField}>        
              <Text style={styles.title}>Role</Text>
              <Text style={styles.value}>{this.getRole()}</Text>              
            </View>

                    
          </View>
        )}
        <Dialog
          visible={this.state.passwordFormVisible}
          width={0.8}
          footer=
          {
            <DialogFooter style={styles.dialogFooter}>
              <DialogButton
                text="CANCEL"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                onPress={() => {                  
                  this.setState({passwordFormVisible:false});
                }}
              />
              <DialogButton
                text="CHANGE PASSWORD"
                style={styles.okButton}
                textStyle={styles.okButtonText}
                onPress={() => {
                  this.changePassword();                  
                }}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ passwordFormVisible: false });
          }}          
        >
          <DialogContent>
            {
              <View style={{alignItems:'center',justifyContent:'center'}}>
                <View style={styles.viewField}>                          
                  <TextInput style={styles.valueInput} value={this.state.currentPassword} placeholder=' รหัสผ่านปัจจุบัน' onChangeText={(text) => {this.onCurrentPasswordChanged(text)}}  secureTextEntry={true}/>  
                </View>
                <View style={styles.viewField}>                          
                  <TextInput style={styles.valueInput} value={this.state.password} placeholder=' รหัสผ่านใหม่' onChangeText={(text) => {this.onPasswordChanged(text)}}  secureTextEntry={true}/>  
                </View>
                <View style={styles.viewField}>                          
                  <TextInput style={styles.valueInput} value={this.state.passwordAgain} placeholder=' รหัสผ่านใหม่ (อีกครั้งหนึ่ง)' onChangeText={(text) => {this.onPasswordAgainChanged(text)}}  secureTextEntry={true}/>  
                </View>
                {this.state.loadingPassword && 
                  (<View style={{marginTop:padding.xl}}>
                    <ActivityIndicator animating size='small' />
                  </View>)
                }
              </View>            
            }
          </DialogContent>
        </Dialog>

        <Dialog
          visible={this.state.emailFormVisible}
          width={0.8}
          footer=
          {
            <DialogFooter style={styles.dialogFooter}>
              <DialogButton
                text="CANCEL"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                onPress={() => {                  
                  this.setState({emailFormVisible:false});
                }}
              />
              <DialogButton
                text="CHANGE EMAIL"
                style={styles.okButton}
                textStyle={styles.okButtonText}
                onPress={() => {
                  this.changeEmail();                  
                }}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
            this.setState({ emailFormVisible: false });
          }}          
        >
          <DialogContent>
            {
              <View style={{alignItems:'center',justifyContent:'center'}}>
                <View style={styles.viewField}>                          
                  <TextInput style={styles.valueInput} value={this.state.emailEdit} placeholder=' Email' onChangeText={(text) => {this.onEmailChanged(text)}}/>  
                </View>                
                {this.state.loadingEmail && 
                  (<View style={{marginTop:padding.xl}}>
                    <ActivityIndicator animating size='small' />
                  </View>)
                }
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
  viewField:
  {
    marginTop:padding.xl,
    marginLeft:padding.xl,
    marginRight:padding.xl,  
  },
  title:
  { 
    fontFamily: fonts.primaryBold, 
    fontSize: fonts.lg,
    color:colors.secondary,
  },
  value:
  {    
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.tertiary,
  },
  valueInput: 
  {
    fontFamily: fonts.primary,
    fontSize: 14,
    textAlign: 'left',     
    width: dimensions.fullWidth*0.8 - padding.xl*2,    
    height: 30,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingTop:0,
    paddingBottom:0,    
    textAlignVertical: 'center'
  },
  separator: 
  {
    width:dimensions.fullWidth-2*20,
    height:1,
    backgroundColor:colors.separator,
    left:padding.xl,    
  }, 
  chooseOptions:
  {
    fontFamily:fonts.primaryBold,
    paddingRight:padding.xl,
    color:colors.tertiary
  },
  button: 
  {     
    height:30,      
  },
  text: 
  {   
    fontFamily: fonts.primary,   
    fontSize: fonts.lg,
    textAlign: "left",    
    color: colors.primary,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
  },
  textPress: 
  {  
    fontFamily: fonts.primary,   
    fontSize: fonts.lg,
    textAlign: "left",    
    color: colors.white,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
  },
  textEmail: 
  {   
    fontFamily: fonts.primary,   
    fontSize: fonts.lg,
    textAlign: "left",    
    color: colors.primary,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
  },
  textPressEmail: 
  {  
    fontFamily: fonts.primary,   
    fontSize: fonts.lg,
    textAlign: "left",    
    color: colors.white,
    textAlignVertical: 'center',
    textDecorationLine: 'underline'
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
});

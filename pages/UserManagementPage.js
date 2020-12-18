// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Image, TouchableHighlight, ActivityIndicator, Platform, FlatList, BackHandler } from 'react-native';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'


export default class UserManagementPage extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,
      modifiedUser: this.props.navigation.state.params.modifiedUser,
      data: [],
    };
  }


  componentDidMount()
  {
    this.props.navigation.setParams({ handleNew: this.newForm });
    this.handleRefresh();
  }

  newForm = () =>
  {
    console.log("new user form");
    this.props.navigation.navigate('UserAdd',
    {      
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,        
      'edit': false,
      refresh: this.handleRefresh,      
    });
  }

  showAlertMessage = (text) => 
  {
    this.setState({alertMessage:text,alertVisible:true});
  }

  editUser = (username) => 
  {
    console.log("editUser");
    this.props.navigation.navigate('UserAdd',
    {
      'username': username,
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'modifiedUser': this.state.modifiedUser,        
      'edit': true,
      refresh: this.handleRefresh,      
    });
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
        menuCode: 'USER_MANAGEMENT',   
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
    fetch(this.state.apiPath + 'SAIMUserGetList.php',
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
    .then((response) => response.json())
    .then((responseData) =>{
      console.log(responseData);
      console.log("responseData.success:"+responseData.success);
      
      this.setState({loading: false});
      if(responseData.success === true)
      {
        this.setState({data:responseData.userList});
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
      <View>
        <FlatList          
          data={this.state.data}
          renderItem={({ item }) => ( 
            
              <TouchableHighlight 
                underlayColor={'white'} activeOpacity={1} onPress={()=>{this.editUser(item.Username)}} >                                                             
                <View>
                  <View style={{display:'flex',flexDirection:'row',alignItems:'center',height: 44}}>
                    <Text style={styles.title}>{item.Username}</Text>
                                        
                    <View style={{flex:1,alignItems:'flex-end'}}>
                      <Text style={styles.subtitle}>{item.Role}</Text>
                    </View>
                  </View>
                  <View style={styles.separator}/>
                </View>
              </TouchableHighlight> 

          )}          
          keyExtractor={(item, index) => index}          
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
  menuAllow:
  {
    paddingLeft:padding.xl,  
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.secondary,    
  },
  title:
  {
    paddingLeft:padding.xl,  
    fontFamily: fonts.primary, 
    fontSize: fonts.lg,
    color:colors.secondary,    
  },
  subtitle:
  {
    paddingRight:padding.xl,  
    fontFamily: fonts.primaryItalic, 
    fontSize: fonts.md,
    color:colors.tertiary,    
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
  text:
  {
    color:colors.error,
    textAlign:'center', 
    fontFamily:fonts.primaryMedium, 
    fontSize:14
  },
});

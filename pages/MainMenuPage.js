// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image, AsyncStorage } from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'
import ToastExample from './../javaModule/ToastExample';
import CalendarPicker from 'react-native-calendar-picker';

export default class MainMenuPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = 
    {  
      menu: [],
      storeName: this.props.navigation.state.params.storeName,
      apiPath: this.props.navigation.state.params.apiPath,  
      modifiedUser: this.props.navigation.state.params.modifiedUser,    
    };
  }

  // menu = [
  //   { name : 'สินค้า', image : require('./../assets/images/product.png'), page : 'TabScreen' },  
  //   { name : 'เพิ่มสินค้า', image : require('./../assets/images/productAdd.png'), page : 'ProductAdd' },  
  //   { name : 'scan สินค้าเข้า', image : require('./../assets/images/scanIn.png'), page : 'ScanIn' },  
  //   { name : 'scan สินค้าออก', image : require('./../assets/images/scanOut.png'), page : 'ScanOut' },  
  //   { name : 'ตั้งค่า', image : require('./../assets/images/setting.png'), page : 'Settings' },
  //   { name : 'Log out', image : require('./../assets/images/logout.png'), page : 'Logout' },
  // ];

  componentDidMount()
  {    
    fetch(this.state.apiPath + 'SAIMMenuByUserGetList2.php',
    {
      method: 'POST',
      headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
      body: JSON.stringify({  
        username: this.state.modifiedUser,   
        storeName: this.state.storeName,
        modifiedUser: this.state.modifiedUser,
        modifiedDate: new Date().toLocaleString(),
        platForm: Platform.OS,
      })
    })
    .then((response) => response.json())
    .then((responseData) =>{
      // console.log(responseData);
      // console.log("responseData.success:"+responseData.success);
      
      this.setState({loading: false});
      if(responseData.success === true)
      {
        // console.log("menuList:"+JSON.stringify(responseData.menuList));
        this.setState({menu:responseData.menuList});
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

  setUserDefault = (username,password,rememberMe) => 
  {
    this.setUsername(username);
    this.setPassword(password);
    this.setRememberMe(rememberMe);    
  }

  goToMenu = (page) => 
  {
    if(page == 'Logout')
    {
      //save preference
      if(Platform.OS == 'ios')
      {
        this.setUserDefault('','',false);   
      }
      else
      {
        ToastExample.savePreferenceUsername("");
        ToastExample.savePreferencePassword("");
        ToastExample.savePreferenceRememberMe(false);  
      }
      

      //go back to login page and clear control
      this.props.navigation.state.params.setControl();
      this.props.navigation.goBack();
    }
    // else if(page == 'Settings')//test
    // {
    //   ToastExample.getPrinterStatus((msg) => {
    //     console.log(msg);
    //   });
    // }
    else
    {
      console.log("menu click:"+page);
      this.props.navigation.navigate(page,
      {
        'apiPath': this.state.apiPath,
        'storeName': this.state.storeName,
        'modifiedUser': this.state.modifiedUser,        
      });  
    }    
  }

  setUsername = async (username) => {
    try {
      await AsyncStorage.setItem(
        'username',
        username
      );        
    } catch (error) {
      // Error saving data      
    }
  };

  setPassword = async (password) => {
    try {
      await AsyncStorage.setItem(
        'password',
        password
      );        
    } catch (error) {
      // Error saving data
    }
  };

  setRememberMe = async (rememberMe) => {
    try {
      await AsyncStorage.setItem(
        'rememberMe',
        JSON.stringify(rememberMe)
      );        
    } catch (error) {
      // Error saving data
    }
  };

  render() {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'white'}}>
        <View style={{height:dimensions.fullWidth/3/2}}>
        </View>
        <FlatList
          data={this.state.menu}
          renderItem={({item}) => (
            <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.goToMenu(item.PageName)}>
              <View style={styles.box}>
                <Image source={{uri:item.ImagePath}}  style={styles.image}/>
                <Text style={styles.menuName}>{item.Name}</Text>
              </View>
            </TouchableHighlight>)}  
          keyExtractor={(item, index) => index}
          numColumns = {3}
        />          
      </View>
    );
  }
}
                      
const styles = StyleSheet.create({  
  image: 
  {
    width:dimensions.fullWidth/3/3,
    height:dimensions.fullWidth/3/3,      
    marginBottom:20,   
  },
  menuName:
  {
    fontFamily: fonts.primary,
    fontSize: fonts.lg,
    color: colors.primary,
    textAlign: 'center',
  },
  box:
  {
    width:dimensions.fullWidth/3-3*3,
    height:dimensions.fullWidth/3-3*3,
    alignItems:'center',
    justifyContent:'center',
    margin:3,
    backgroundColor:'white',     
    shadowRadius: 2,  


    // // ***android
    // shadowOpacity: 0.8,
    // elevation: 5,


    //***ios
    shadowOpacity: 0.2,
    shadowOffset: { height: 2, width: 2 },
    
  },
});

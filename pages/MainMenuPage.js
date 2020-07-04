// Setting screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, TextInput, StyleSheet, Dimensions, TouchableHighlight, FlatList, Image } from 'react-native';
//import all the components we are going to use.
import {colors, fonts, padding, dimensions} from './../styles/base.js'


export default class MainMenuPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      storeName: 'RALAMUSIC',
      // storeName: 'MINIMALIST',
      apiPath: 'https://minimalist.co.th/saim/',       
    };
  }

  menu = [
    { name : 'สินค้า', image : require('./../assets/images/product.png'), page : 'TabScreen' },  
    { name : 'เพิ่มสินค้า', image : require('./../assets/images/productAdd.png'), page : 'ProductAdd' },  
    { name : 'scan สินค้าเข้า', image : require('./../assets/images/scanIn.png'), page : 'ScanIn' },  
    { name : 'scan สินค้าออก', image : require('./../assets/images/scanOut.png'), page : 'ScanOut' },  
    { name : 'ตั้งค่า', image : require('./../assets/images/setting.png'), page : 'Settings' },
  ];

  goToMenu = (page) => 
  {
    this.props.navigation.navigate(page,
    {
      'apiPath': this.state.apiPath,
      'storeName': this.state.storeName,
      'username': this.state.username,        
      // onGoBack:()=>this.loadMenu()
    });
  }

  render() {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'white'}}>
        <View style={{height:20}}>
        </View>
        <FlatList
          data={this.menu}
          renderItem={({item}) => (
            <TouchableHighlight underlayColor={'transparent'} activeOpacity={1} onPress={ () => this.goToMenu(item.page)}>
              <View>
                <View style={styles.box}>
                  <Image source={item.image}  style={styles.image}/>
                  <Text style={styles.menuName}>{item.name}</Text>
                </View>
              </View>
            </TouchableHighlight>)}  
          keyExtractor={(item, index) => index}
          numColumns = {2}
        />          
      </View>
    );
  }
}
                      
const styles = StyleSheet.create({  
  image: 
  {
    width:60,
    height:60,  
    marginTop:20,  
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
});
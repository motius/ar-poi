'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroConstants,
} from 'react-viro';

export default class HelloLocation extends Component {
  
  constructor() {
    super();
    
    // Set initial state here
    this.state = {
      text : "Initializing AR...",
      googlePointX: 0,
      googlePointZ: 0,
      garchingPointX: 0,
      garchingPointZ: 0,
      manPointX: 0,
      manPointZ: 0,
      eastPointX: 0,
      eastPointZ: 0,
      westPointX: 0,
      westPointZ: 0,
      currentPosition: {lat: 48.179296, lon: 11.5945672}
    };
    
    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    this._latLongToMerc = this._latLongToMerc.bind(this);
    this._transformPointToAR = this._transformPointToAR.bind(this);
  }
  
  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        {/*<ViroText text={this.state.text} scale={[.2,2,.2]} position={[5, 0, -5]} style={styles.helloWorldTextStyle} />*/}
        {/*<ViroText text={this.state.text} scale={[.2,2,.2]} position={[5, 0, -5]} style={styles.helloWorldTextStyle} />*/}
        {/*<ViroText text={"Home"+this.state.northPointX.toFixed(4)+":"+this.state.northPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.northPointX, 0, this.state.northPointZ]} style={styles.helloWorldTextStyle} />*/}
        {/*<ViroText text={"Home"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ.toFixed(4)} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />*/}
        <ViroText text={"Garching"} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.garchingPointX, 0, this.state.garchingPointZ]} style={styles.helloWorldTextStyle}/>
        <ViroText text={"Google"} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.googlePointX, 0, this.state.googlePointZ]} style={styles.helloWorldTextStyle}/>
        <ViroText text={"Man"} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.manPointX, 0, this.state.manPointZ]} style={styles.helloWorldTextStyle}/>
        {/*<ViroText text={"Garching"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />*/}
      </ViroARScene>
    );
  }
  
  componentDidMount() {
    navigator.geolocation.setRNConfiguration({});
    navigator.geolocation.requestAuthorization();
    navigator.geolocation.watchPosition((position => {
      this._onPositionUpdated(position);
    }))
    // navigator.geolocation.getCurrentPosition((position => {
    //   console.log("" + position.coords.latitude + " - " + position.coords.longitude);
    // }), (error => {
    //   console.log(error.message);
    // }))
  }

  _onInitialized(state, reason) {
    if (state === ViroConstants.TRACKING_NORMAL) {
      this._updateLocation();
    } else if (state === ViroConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  _onPositionUpdated(position) {
    if (position) {
      const coords = position.coords;
      console.log(`[HL]: current position updated ${coords.latitude}, ${coords.longitude}`);
      this.setState({
        currentPosition: {lat: coords.latitude, lon: coords.longitude},
      })
    }
  }
  
  _adjustCloseObject(position) {
    let adjusted_position = position;
    if (position.x > 0 && position.x < 10) {
      adjusted_position.x = 10;
    } else if (position.x < 0 && position.x > -10) {
      adjusted_position.x = -10;
    }
    if (position.z > 0 && position.z < 10) {
      adjusted_position.z = 10;
    } else if (position.z < 0 && position.z > -10) {
      adjusted_position.z = -10;
    }
    return adjusted_position;
  }
  
  _updateLocation() {
    var googlePoint = this._transformPointToAR(48.1426744, 11.5407752, "Google");  //Google
    var manPoint = this._transformPointToAR(48.1795648,11.5949283, "Man"); //Man
    /*var eastPoint = this._transformPointToAR(48.1619194, 11.5764442);   //Home
    var westPoint = this._transformPointToAR(48.1387926, 11.5451971);*/   //Theresenwiese
    var garchingPoint = this._transformPointToAR(48.2681316, 11.6661422, "Garching");  //Gate Garching
    /*var northPoint = this._transformPointToAR(47.618574, -122.338475);
    var eastPoint = this._transformPointToAR(47.618534, -122.338061);
    var westPoint = this._transformPointToAR(47.618539, -122.338644);
    var southPoint = this._transformPointToAR(47.618210, -122.338455);*/
    var state = {};
    if (googlePoint.z < 0) {
      state.googlePointZ = -5;
    } else {
      state.googlePointZ = 5;
    }
    if (manPoint.z < 0) {
      state.manPointZ = -5;
    } else {
      state.manPointZ = 5;
    }
    if (garchingPoint.z < 0) {
      state.garchingPointZ = -5;
    } else {
      state.garchingPointZ = 5;
    }
    state.googlePointX = googlePoint.x % 4;
    state.garchingPointX = garchingPoint.x % 4;
    state.manPointX = manPoint.x % 4;
    state.text = "Hello Motees!";
    this.setState(state);
  }
  
  
  _pointDistance(referencePoint, objectPoint) {
    const R = 6371e3; // meters
    let f1 = (referencePoint.lat / 180.0 * Math.PI);
    let f2 = (objectPoint.lat / 180.0 * Math.PI);
    let delta_f = ((objectPoint.lat - referencePoint.lat) / 180.0 * Math.PI);
    let delta_l = ((objectPoint.lon - referencePoint.lon) / 180.0 * Math.PI);
  
    let a = Math.sin(delta_f/2) * Math.sin(delta_f/2) +
      Math.cos(f1) * Math.cos(f2) *
      Math.sin(delta_l/2) * Math.sin(delta_l/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  _latLongToMerc(lat_deg, lon_deg) {
    var lon_rad = (lon_deg / 180.0 * Math.PI);
    var lat_rad = (lat_deg / 180.0 * Math.PI);
    var sm_a = 6378137.0;
    var xmeters  = sm_a * lon_rad;
    var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad));
    return ({x:xmeters, y:ymeters});
  }
  
  _transformPointToAR(lat, lon, label) {
    let objPoint = this._latLongToMerc(lat, lon);
    let devicePoint = this._latLongToMerc(this.state.currentPosition.lat, this.state.currentPosition.lon);  // Motius HQ
    // 32 N 692864 5339484
    let tmp_dist = this._pointDistance(this.state.currentPosition, {lat, lon});
    
    // var devicePoint = this._latLongToMerc(47.618534, -122.338478);
    // console.log("objPointZ: " + objPoint.y + ", objPointX: " + objPoint.x);
    // latitude(north,south) maps to the z axis in AR
    // longitude(east, west) maps to the x axis in AR
    var objFinalPosZ = objPoint.y - devicePoint.y;
    var objFinalPosX = objPoint.x - devicePoint.x;
    //flip the z, as negative z(is in front of us which is north, pos z is behind(south).
    let finalPos = {x: objFinalPosX, y: 1, z: -objFinalPosZ};
    console.log(`[HL][${label}]: distance: ${tmp_dist}; final position: ${finalPos.x} ${finalPos.y} ${finalPos.z}`);
    return finalPos;
  }

}

var styles = StyleSheet.create({
    helloWorldTextStyle: {
        fontFamily: 'Arial',
        fontSize: 30,
        color: '#000000',
        textAlignVertical: 'center',
        textAlign: 'center',
    },
});

// ViroMaterials.createMaterials({
//   frontMaterial: {
//     diffuseColor: '#FFFFFF',
//   },
//   backMaterial: {
//     diffuseColor: '#FF0000',
//   },
//   sideMaterial: {
//     diffuseColor: '#0000FF',
//   },
// });

module.exports = HelloLocation;
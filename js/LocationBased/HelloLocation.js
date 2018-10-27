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
      POIx: 0,
      POIz: 0,
      currentPosition: {lat: 48.179296, lon: 11.5945672},
      isLocationFetched: false
    };
    
    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    this._latLongToMerc = this._latLongToMerc.bind(this);
    this._transformPointToAR = this._transformPointToAR.bind(this);
  }
  
  render() {
    let label = this.props.sceneNavigator.viroAppProps.label ? this.props.sceneNavigator.viroAppProps.label : "NO label";
    console.log("SAGAR", label);
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        { this.state.isLocationFetched ? 
          <ViroText text={label} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.POIx, 0, this.state.POIz]} style={styles.helloWorldTextStyle}/> :
          <ViroText text={"Fetching current location"} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[5, 0, -5]} style={styles.helloWorldTextStyle}/>
        }
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
        isLocationFetched: true
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
    let poi = this.props.sceneNavigator.viroAppProps.POIPosition;
    let poi_ar_coords = this._transformPointToAR(poi, "POI");
    let state = {};
    if (poi_ar_coords.z < 0) {
      state.POIz = -5;
    } else {
      state.POIz = 5;
    }
    state.POIx = poi_ar_coords.x % 4;
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
  
  _transformPointToAR(point, label) {
    let objPoint = this._latLongToMerc(point.lat, point.lon);
    let devicePoint = this._latLongToMerc(this.state.currentPosition.lat, this.state.currentPosition.lon);  // Motius HQ
    // 32 N 692864 5339484
    let tmp_dist = this._pointDistance(this.state.currentPosition, point);
    
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
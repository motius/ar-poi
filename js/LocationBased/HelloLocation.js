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
      currentPosition: {lat: 48.179296, lng: 11.5945672},
      isLocationFetched: false,
      message: "Fetching current location",
      distance: "Calculating.."
    };

    this.navigatorWatchID = null;
    
    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    this._latLngToMerc = this._latLngToMerc.bind(this);
    this._transformPointToAR = this._transformPointToAR.bind(this);
    this._onPositionFailed = this._onPositionFailed.bind(this);
    this._onPositionUpdated = this._onPositionUpdated.bind(this);
  }
  
  render() {
    let label = this.props.sceneNavigator.viroAppProps.label ? this.props.sceneNavigator.viroAppProps.label : "NO label";
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >
        { this.state.isLocationFetched ? 
          <ViroText text={label} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.POIx, 0, this.state.POIz]} style={styles.helloWorldTextStyle}/> :
          <ViroText text={this.state.message} scale={[1, 1, 1]} transformBehaviors={["billboard"]} position={[5, 0, -5]} style={styles.helloWorldTextStyle}/>
        }
        { this.state.isLocationFetched ? 
          <ViroText text={this.state.distance} scale={[1, 1, 1]} transformBehaviors={["billboard"]} position={[this.state.POIx, 1, this.state.POIz]} style={styles.helloWorldTextStyle}/> :
          <ViroText text={"Calculating.."} scale={[1, 1, 1]} transformBehaviors={["billboard"]} position={[5, 1, -5]} style={styles.helloWorldTextStyle}/>
        }
      </ViroARScene>
    );
  }
  
  componentDidMount() {
    navigator.geolocation.setRNConfiguration({});
    navigator.geolocation.requestAuthorization();
    this.navigatorWatchID = navigator.geolocation.watchPosition(this._onPositionUpdated, this._onPositionFailed);
  }

  componentWillUnmount() {
    if(this.navigatorWatchID != null) {
      navigator.geolocation.clearWatch(this.navigatorWatchID);
      this.navigatorWatchID = null;
    }
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
      this.setState({
        currentPosition: {lat: coords.latitude, lng: coords.longitude},
        isLocationFetched: true
      });
      console.log('SAGAR: Current position: ', JSON.stringify(this.state.currentPosition));
      console.log('SAGAR: POI position: ', JSON.stringify(this.props.sceneNavigator.viroAppProps.POIPosition));
    }
  }

  _onPositionFailed(error) {
    console.log('SAGAR:', JSON.stringify(error));
    this.setState({
        message: "Failed to fetch location",
        isLocationFetched: false
      });
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
    let delta_l = ((objectPoint.lng - referencePoint.lng) / 180.0 * Math.PI);
  
    let a = Math.sin(delta_f/2) * Math.sin(delta_f/2) +
      Math.cos(f1) * Math.cos(f2) *
      Math.sin(delta_l/2) * Math.sin(delta_l/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  _latLngToMerc(lat_deg, lng_deg) {
    var lng_rad = (lng_deg / 180.0 * Math.PI);
    var lat_rad = (lat_deg / 180.0 * Math.PI);
    var sm_a = 6378137.0;
    var xmeters  = sm_a * lng_rad;
    var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad));
    return ({x:xmeters, y:ymeters});
  }
  
  _transformPointToAR(point, label) {
    let objPoint = this._latLngToMerc(point.lat, point.lng);
    let devicePoint = this._latLngToMerc(this.state.currentPosition.lat, this.state.currentPosition.lng);  // Motius HQ
    // 32 N 692864 5339484
    let tmp_dist = this._pointDistance(this.state.currentPosition, point);
    tmp_dist = tmp_dist/1000;
    tmp_dist = tmp_dist.toFixed(2);
    console.log('SAGAR: Distance - ', tmp_dist);
    this.setState({
      distance: tmp_dist + "Kms"
    });
    var objFinalPosZ = objPoint.y - devicePoint.y;
    var objFinalPosX = objPoint.x - devicePoint.x;
    //flip the z, as negative z(is in front of us which is north, pos z is behind(south).
    let finalPos = {x: objFinalPosX, y: 1, z: -objFinalPosZ};
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
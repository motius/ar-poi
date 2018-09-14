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
            northPointX: 0,
            northPointZ: 0,
            southPointX: 0,
            southPointZ: 0,
            eastPointX: 0,
            eastPointZ: 0,
            westPointX: 0,
            westPointZ: 0,
          currentPosition: {lat: 48.2681316, lon: 11.6661422},
        };

        // bind 'this' to functions
        this._onInitialized = this._onInitialized.bind(this);
        this._latLongToMerc = this._latLongToMerc.bind(this);
        this._transformPointToAR = this._transformPointToAR.bind(this);
    }

    render() {
        return (
            <ViroARScene onTrackingUpdated={this._onInitialized} >
              <ViroText text={this.state.text} scale={[.2,2,.2]} position={[5, 0, -5]} style={styles.helloWorldTextStyle} />
                {/*<ViroText text={this.state.text} scale={[.2,2,.2]} position={[5, 0, -5]} style={styles.helloWorldTextStyle} />*/}
                {/*<ViroText text={"Home"+this.state.northPointX.toFixed(4)+":"+this.state.northPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.northPointX, 0, this.state.northPointZ]} style={styles.helloWorldTextStyle} />*/}
                {/*<ViroText text={"Home"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ.toFixed(4)} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />*/}
                <ViroText text="October fest" scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.westPointX, 0, this.state.westPointZ]} style={styles.helloWorldTextStyle} />
                <ViroText text={"Garching"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />
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
      this.setState({
        currentPosition: {lat: position.coords.latitude, lon: position.coords.longitude},
      })
    }
  }

    _updateLocation() {
        var northPoint = this._transformPointToAR(48.1619194, 11.5764442);  //Google
        /*var eastPoint = this._transformPointToAR(48.1619194, 11.5764442);   //Home
        var westPoint = this._transformPointToAR(48.1387926, 11.5451971);*/   //Theresenwiese
        var southPoint = this._transformPointToAR(48.2681316, 11.6661422);  //Gate Garching
        /*var northPoint = this._transformPointToAR(47.618574, -122.338475);
        var eastPoint = this._transformPointToAR(47.618534, -122.338061);
        var westPoint = this._transformPointToAR(47.618539, -122.338644);
        var southPoint = this._transformPointToAR(47.618210, -122.338455);*/
        var state = {};
        if (northPoint.z < 0) {
          state.northPointZ = -5;
        } else {
          state.northPointZ = 5;
        }
        if (southPoint.z < 0) {
          state.southPointZ = -5;
        } else {
          state.southPointZ = 5;
        }
        state.northPointX = northPoint.x % 4;
        state.southPointX = southPoint.x % 4;
        state.text = "Hello Motees!";
        this.setState(state);
    }

    _latLongToMerc(lat_deg, lon_deg) {
        var lon_rad = (lon_deg / 180.0 * Math.PI);
        var lat_rad = (lat_deg / 180.0 * Math.PI);
        var sm_a = 6378137.0;
        var xmeters  = sm_a * lon_rad;
        var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad));
        return ({x:xmeters, y:ymeters});
    }

    _transformPointToAR(lat, long) {
        var objPoint = this._latLongToMerc(lat, long);
        var devicePoint = this._latLongToMerc(48.1795381, 11.5604297);  // Motius HQ
        //var devicePoint = this._latLongToMerc(47.618534, -122.338478);
        console.log("objPointZ: " + objPoint.y + ", objPointX: " + objPoint.x)
        // latitude(north,south) maps to the z axis in AR
        // longitude(east, west) maps to the x axis in AR
        var objFinalPosZ = objPoint.y - devicePoint.y;
        var objFinalPosX = objPoint.x - devicePoint.x;
        //flip the z, as negative z(is in front of us which is north, pos z is behind(south).
        return ({x:objFinalPosX, z:-objFinalPosZ});
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
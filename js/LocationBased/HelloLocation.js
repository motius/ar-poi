'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
    ViroARScene,
    ViroText,
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
                <ViroText text={"Home"+this.state.northPointX.toFixed(4)+":"+this.state.northPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.northPointX, 0, this.state.northPointZ]} style={styles.helloWorldTextStyle} />
                {/*<ViroText text={"Home"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ.toFixed(4)} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />*/}
                {/*<ViroText text="October fest" scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.westPointX, 0, this.state.westPointZ]} style={styles.helloWorldTextStyle} />*/}
                <ViroText text={"Garching"+this.state.southPointX.toFixed(4)+":"+this.state.southPointZ} scale={[3, 3, 3]} transformBehaviors={["billboard"]} position={[this.state.southPointX, 0, this.state.southPointZ]} style={styles.helloWorldTextStyle} />
            </ViroARScene>
        );
    }

    _onInitialized() {
        var northPoint = this._transformPointToAR(48.1619194, 11.5764442);  //Google
        /*var eastPoint = this._transformPointToAR(48.1619194, 11.5764442);   //Home
        var westPoint = this._transformPointToAR(48.1387926, 11.5451971);*/   //Theresenwiese
        var southPoint = this._transformPointToAR(48.2681316, 11.6661422);  //Gate Garching
        /*var northPoint = this._transformPointToAR(47.618574, -122.338475);
        var eastPoint = this._transformPointToAR(47.618534, -122.338061);
        var westPoint = this._transformPointToAR(47.618539, -122.338644);
        var southPoint = this._transformPointToAR(47.618210, -122.338455);*/
        if (northPoint.z < 0) {
            this.setState({
                northPointZ: -5,
            });
        } else {
            this.setState({
                northPointZ: 5,
            });
        }
        if (southPoint.z < 0) {
            this.setState({
                southPointZ: -5,
            });
        } else {
            this.setState({
                southPointZ: 5,
            });
        }
        this.setState({
            northPointX: northPoint.x % 4,
            southPointX: southPoint.x % 4,
            text : "AR Init called."
        });
    }

    _latLongToMerc(lat_deg, lon_deg) {
        var lon_rad = (lon_deg / 180.0 * Math.PI)
        var lat_rad = (lat_deg / 180.0 * Math.PI)
        var sm_a = 6378137.0
        var xmeters  = sm_a * lon_rad
        var ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad))
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

module.exports = HelloLocation;
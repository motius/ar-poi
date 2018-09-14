'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
    ViroSceneNavigator,
    ViroScene,
    ViroARScene,
    ViroAmbientLight,
    Viro360Video,
    Viro360Image,
    ViroUtils,
    ViroPortal,
    ViroPortalScene,
    Viro3DObject,
} from 'react-viro';

var createReactClass = require('create-react-class');
var MainScene = createReactClass({

    render: function() {
        return (
            <ViroARScene>
                <ViroAmbientLight color="#ffffff" intensity={200}/>
                <ViroPortalScene passable={true} dragType="FixedDistance" onDrag={()=>{}}>
                    <ViroPortal position={[0, 0, -1]} scale={[.1, .1, .1]}>
                        <Viro3DObject source={require('./portal_res/portal_ship/portal_ship.vrx')}
                                      resources={[require('./portal_res/portal_ship/portal_ship_diffuse.png'),
                                          require('./portal_res/portal_ship/portal_ship_normal.png'),
                                          require('./portal_res/portal_ship/portal_ship_specular.png')]}
                                      type="VRX"/>
                    </ViroPortal>
                    {/*<Viro3DObject source={require('./Sommerhaus/Sommerhaus_new.obj')}
                                  resources={[require('./Sommerhaus/Sommerhaus_new.mtl'),
                                      require('./Sommerhaus/292_DIFFUSE.jpg'),
                                      require('./Sommerhaus/292_DISP.jpg'),
                                      require('./Sommerhaus/292_NORMAL.jpg'),
                                      require('./Sommerhaus/301_DIFFUSE.jpg'),
                                      require('./Sommerhaus/301_DISP.jpg'),
                                      require('./Sommerhaus/301_NORMAL.jpg'),
                                      require('./Sommerhaus/310_DIFFUSE.jpg'),
                                      require('./Sommerhaus/310_DISP.jpg'),
                                      require('./Sommerhaus/310_NORMAL.jpg'),
                                      require('./Sommerhaus/319_DIFFUSE.jpg'),
                                      require('./Sommerhaus/319_DISP.jpg'),
                                      require('./Sommerhaus/319_NORMAL.jpg')
                                  ]}
                                  type="OBJ"/>*/}
                    <Viro360Image source={require("./motius_garching/conf_room.JPG")} />
                </ViroPortalScene>
            </ViroARScene>
        );
    },
});

module.exports = MainScene;
/**
 * Copyright (c) 2017-present, Viro Media, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/*
    these helper methods are used from https://github.com/viromedia/ViroARSampleApp/blob/master/js/ARHitTestSample.js to be used
    in positioning the AR markers.
 */

'use strict';
import React,{
    View,
    Component
} from 'react';

import {
    ViroScene,
    Viro3DObject,
    ViroSpotLight,
    ViroSurface,
    ViroNode,
} from 'react-viro';

let key = 0; //temporary quickfix for key problem

const positioning_helpers = {

    //modified getModel
    _getModel() {
        return this.modelArray;
    },

    _addARModeltoScene(){

        let transformBehaviors = {};
        if (this.state.shouldBillboard) {
            transformBehaviors.transformBehaviors = this.state.shouldBillboard ? "billboardY" : [];
        }

        const pos = [0, 0, 0];
        const rot = [0, 0, 0];
        this.setState(prevState=>({
            markerPositions: [...prevState.markerPositions, pos],
            markerRotations: [...prevState.markerRotations, rot],
            modelArray : [...prevState.modelArray, (<ViroNode
                    {...transformBehaviors}
                    position={pos}
                    ref={component=> this.arNodeRefs.push(component) }
                    scale={[.2, .2, .2]}
                    rotation={rot}
                    key = {key++}>


                    <ViroSpotLight
                        innerAngle={5}
                        outerAngle={20}
                        direction={[0,-1,0]}
                        position={[0, 4, 0]}
                        color="#ffffff"
                        castsShadow={true}
                        shadowNearZ={.1}
                        shadowFarZ={6}
                        shadowOpacity={.9}/>

                    <Viro3DObject
                        position={[0, .5 , 0]}
                        source={this.props.arSceneNavigator.viroAppProps.objectSource}
                        type = "VRX" onLoadEnd={this._onLoadEnd} onLoadStart={this._onLoadStart} />

                    <ViroSurface
                        rotation={[-90, 0, 0]}
                        position={[0, -.001, 0]}
                        width={2.5} height={2.5}
                        arShadowReceiver={true}
                        ignoreEventHandling={true} />

                </ViroNode>
            )]
        }));


    },

    _onLoadStart() {
        this.setState({
            shouldBillboard : true,
        });
        this.props.arSceneNavigator.viroAppProps._onLoadStart();
    },

    _onLoadEnd() {
        this.arScene.getCameraOrientationAsync().then((orientation) => {
            this.arScene.performARHitTestWithRay(orientation.forward).then((results)=>{
                this._onArHitTestResults(orientation.position, orientation.forward, results);
            })
        });
        this.props.arSceneNavigator.viroAppProps._onLoadEnd();
    },

    _onArHitTestResults(position, forward, results) {
        // Default position is just 1.5 meters in front of the user.
        let newPosition = [forward[0] * 1.5, forward[1]* 1.5, forward[2]* 1.5];
        let hitResultPosition = undefined;

        // Filter the hit test results based on the position.
        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                let result = results[i];
                if (result.type == "ExistingPlaneUsingExtent") {
                    var distance = Math.sqrt(((result.transform.position[0] - position[0]) * (result.transform.position[0] - position[0])) + ((result.transform.position[1] - position[1]) * (result.transform.position[1] - position[1])) + ((result.transform.position[2] - position[2]) * (result.transform.position[2] - position[2])));
                    if(distance > .2 && distance < 10) {
                        // If we found a plane greater than .2 and less than 10 meters away then choose it!
                        hitResultPosition = result.transform.position;
                        break;
                    }
                } else if (result.type == "FeaturePoint" && !hitResultPosition) {
                    // If we haven't found a plane and this feature point is within range, then we'll use it
                    // as the initial display point.
                    var distance = this._distance(position, result.transform.position);
                    if (distance > .2  && distance < 10) {
                        hitResultPosition = result.transform.position;
                    }
                }
            }
        }

        if (hitResultPosition) {
            newPosition = hitResultPosition;
        }

        // Set the initial placement of the object using new position from the hit test.
        this._setInitialPlacement(newPosition);
    },

    _setInitialPlacement(position) {
        let temp = this.state.markerPositions;
        for (let i =0; i< position.length; i++){
            temp[temp.length-1][i] = position[i]
        }

        this.setState(prevState =>({
            //change last element in markerPositions
            markerPositions: temp
        }));
        setTimeout(this._updateInitialRotation, 200);
    },

    // Update the rotation of the object to face the user after it's positioned.
    _updateInitialRotation() {
        this.arNodeRefs[this.arNodeRefs.length-1].getTransformAsync().then((retDict)=>{
            let rotation = retDict.rotation;
            let absX = Math.abs(rotation[0]);
            let absZ = Math.abs(rotation[2]);

            let yRotation = (rotation[1]);

            // If the X and Z aren't 0, then adjust the y rotation.
            if (absX > 1 && absZ > 1) {
                yRotation = 180 - (yRotation);
            }

            this.setState(prevState=>({
                //change last element in markerPositions
                markerRotations: [...prevState.markerRotations.slice(0,-1), [0,yRotation,0]],
                shouldBillboard : false,
            }));
        });
    },

    // Calculate distance between two vectors
    _distance(vectorOne, vectorTwo) {
        var distance = Math.sqrt(((vectorTwo[0] - vectorOne[0]) * (vectorTwo[0] - vectorOne[0])) + ((vectorTwo[1] - vectorOne[1]) * (vectorTwo[1] - vectorOne[1])) + ((vectorTwo[2] - vectorOne[2]) * (vectorTwo[2] - vectorOne[2])));
        return distance;
    }
}

module.exports =  positioning_helpers;